import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Activity, FileText, History, Landmark, Scale, ShieldCheck, TrendingUp } from 'lucide-react';
import { Aviso, CabecalhoPagina, Estado, Indicador, SeloSimulado } from '../componentes/ElementosInterface';
import {
  MINIMO_CREDITO_CENTS,
  projetarSemanas,
  type ContratoCredito,
  type CotacaoQuitacao,
  type EventoCredito,
  type PropostaCredito,
  type ServicoCredito,
  type SituacaoCredito,
} from '../servicos/credito';
import { FalhaTransporte } from '../servicos/transporteApi';
import { lerCentavos, moeda } from '../utilitarios/valoresFinanceiros';

const porcentagem = (bp: number) => `${(bp / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const data = (iso: string) => {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('pt-BR').format(d);
};
const hojeLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const reaisParaCampo = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

const TEXTO_SITUACAO = {
  DESCAPITALIZADO: 'Falta capital de giro',
  ATENCAO: 'Caixa no limite',
  SAUDAVEL: 'Caixa saudável',
} as const;
const TEXTO_NIVEL = {
  SAUDAVEL: 'Comprometimento saudável',
  ATENCAO: 'Comprometimento em atenção',
  ALTO: 'Comprometimento alto',
  EXCESSIVO: 'Comprometimento excessivo',
  SEM_RENDA: 'Sem entradas para comparar',
} as const;
const TEXTO_STATUS = { ATIVO: 'Ativo', QUITADO: 'Quitado', CANCELADO: 'Cancelado' } as const;
const TEXTO_EVENTO: Record<string, string> = {
  CONSENTIMENTO_CONCEDIDO: 'Compartilhamento de dados autorizado',
  CONSENTIMENTO_REVOGADO: 'Compartilhamento de dados revogado',
  PROPOSTAS_GERADAS: 'Propostas simuladas',
  CONTRATADO: 'Capital de giro contratado',
  PARCELA_PAGA: 'Parcela paga',
  QUITADO: 'Contrato quitado',
  CANCELADO_ARREPENDIMENTO: 'Desistência dentro de 7 dias',
  WEBHOOK_INSTALLMENT_PAID: 'Pagamento confirmado pelo parceiro',
};

/**
 * Capital de giro dentro do app: diagnóstico da descapitalização, ofertas de
 * parceiros (fintech ou banco) comparadas pelo CET, crédito responsável,
 * contratação e gestão do contrato, sem o comerciante ir ao banco.
 */
export function TelaCapitalGiro({ servico }: { servico?: ServicoCredito }) {
  const [situacao, setSituacao] = useState<SituacaoCredito | null>(null);
  const [eventos, setEventos] = useState<EventoCredito[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [semRecurso, setSemRecurso] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [autorizo, setAutorizo] = useState(false);
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('6');
  const [ofertas, setOfertas] = useState<PropostaCredito[] | null>(null);
  const [recusadoPor, setRecusadoPor] = useState<string[]>([]);
  const [escolhida, setEscolhida] = useState<string>('');
  const [concordo, setConcordo] = useState(false);
  const [quitacoes, setQuitacoes] = useState<Record<string, CotacaoQuitacao>>({});
  const [resumo, setResumo] = useState<string>('');
  const pedido = useRef<AbortController | null>(null);
  const preenchido = useRef(false);

  async function carregar() {
    if (!servico) return;
    pedido.current?.abort();
    const c = new AbortController();
    pedido.current = c;
    try {
      const [s, ev] = await Promise.all([servico.consultar(c.signal), servico.eventos(c.signal).catch(() => [])]);
      if (c.signal.aborted) return;
      setSituacao(s);
      setEventos(ev);
      // Sugere o valor e as parcelas do diagnóstico na primeira vez.
      if (!preenchido.current && s.diagnostico.valorRecomendadoCents > 0) {
        preenchido.current = true;
        setValor(reaisParaCampo(s.diagnostico.valorRecomendadoCents));
        if (s.diagnostico.parcelasRecomendadas) setParcelas(String(s.diagnostico.parcelasRecomendadas));
      }
    } catch (e) {
      if (c.signal.aborted) return;
      if (e instanceof FalhaTransporte && e.codigo === 404) setSemRecurso(true);
      else setErro(e instanceof Error ? e.message : 'Não foi possível consultar os dados.');
    }
  }
  useEffect(() => {
    void carregar();
    return () => pedido.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servico]);

  async function executar(acao: () => Promise<void>) {
    if (ocupado) return;
    setOcupado(true);
    setErro('');
    setSucesso('');
    try {
      await acao();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível confirmar.');
    } finally {
      setOcupado(false);
    }
  }

  if (!servico || semRecurso)
    return (
      <Estado
        titulo="Capital de giro indisponível"
        descricao={
          semRecurso
            ? 'O servidor ainda não foi atualizado com o capital de giro. Assim que a API for publicada com esta versão, a tela funciona normalmente.'
            : 'Este recurso ainda não está ligado a este ambiente.'
        }
      />
    );
  if (!situacao)
    return erro ? (
      <Estado
        titulo="Consulta indisponível"
        descricao={erro}
        acao={
          <button className="botao primario" onClick={() => { setErro(''); void carregar(); }}>
            Tentar novamente
          </button>
        }
      />
    ) : (
      <Estado titulo="Consultando parceiro financeiro" carregando />
    );

  const { parceiros, diagnostico: d, consentimento, contratos, podeContratar } = situacao;
  const melhorLimite = Math.max(0, ...parceiros.map((p) => p.limiteCents));
  const simulado = parceiros.some((p) => p.modo === 'SIMULADO');
  const oferta = ofertas?.find((o) => o.id === escolhida) ?? null;
  const semanas = projetarSemanas(d, hojeLocal(), oferta);
  const extremo = Math.max(1, ...semanas.flatMap((s) => [Math.abs(s.semCreditoCents), Math.abs(s.comCreditoCents)]));

  function simular(e: FormEvent) {
    e.preventDefault();
    const centavos = lerCentavos(valor);
    if (centavos === null || centavos < MINIMO_CREDITO_CENTS || centavos > melhorLimite) {
      setErro(`Escolha um valor entre R$ 500,00 e ${moeda(melhorLimite)}.`);
      return;
    }
    void executar(async () => {
      setOfertas(null);
      setConcordo(false);
      const r = await servico!.simular(centavos, Number(parcelas));
      setOfertas(r.ofertas);
      setRecusadoPor(r.recusadoPor);
      setEscolhida(r.ofertas.find((o) => o.podeContratar)?.id ?? r.ofertas[0]?.id ?? '');
    });
  }

  function contratar(p: PropostaCredito) {
    void executar(async () => {
      const c: ContratoCredito = await servico!.contratar(p.id);
      setOfertas(null);
      setConcordo(false);
      setValor('');
      setSucesso(
        `Capital de giro contratado: ${moeda(c.valorCents)} em ${c.parcelas}x de ${moeda(c.parcelaCents)}. O valor entra na projeção do caixa e as parcelas aparecem como compromissos.`,
      );
      await carregar();
    });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Capital de giro"
        descricao="Simule e contrate crédito com o parceiro financeiro sem sair do app e sem ir ao banco."
      />
      {simulado && (
        <Aviso>
          <SeloSimulado /> Parceiro demonstrativo: nenhum dinheiro é movimentado. Quando houver uma fintech ou banco
          parceiro, é a instituição autorizada que analisa, aprova e libera o crédito.
        </Aviso>
      )}
      {sucesso && (
        <p role="status" className="aviso">
          {sucesso}
        </p>
      )}
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}

      {/* 1. Diagnóstico: liga o crédito ao problema central (descapitalização). */}
      <section className="painel" aria-labelledby="titulo-diagnostico">
        <h2 id="titulo-diagnostico">
          <Activity size={18} aria-hidden="true" /> Diagnóstico do capital de giro
        </h2>
        <p>
          <span className={`selo-situacao ${d.situacao.toLowerCase()}`}>{TEXTO_SITUACAO[d.situacao]}</span>
        </p>
        <div className="grade-indicadores">
          <Indicador titulo="IMPOSTO RETIDO POR MÊS" valor={d.impostoRetidoMensalCents} detalhe="Sai na hora da venda com o split" />
          <Indicador titulo="SALDO ATUAL" valor={d.saldoAtualCents} detalhe="Caixa realizado hoje" />
          <Indicador titulo="FALTA EM 30 DIAS" valor={d.falta30dCents} detalhe="Despesas previstas menos saldo e entradas" />
        </div>
        <dl className="detalhes-credito">
          <dt>Cobertura do caixa</dt>
          <dd>{d.coberturaDias === null ? 'Sem despesas registradas' : `${d.coberturaDias} dias de despesas`}</dd>
          <dt>Entradas líquidas por mês</dt>
          <dd>{moeda(d.entradaMensalCents)}</dd>
          <dt>Despesas por mês</dt>
          <dd>{moeda(d.despesaMensalCents)}</dd>
        </dl>
        <p className="nota">
          Antes do split payment, o imposto das vendas ficava no caixa até a data de recolhimento e ajudava a pagar as
          contas do mês. Agora ele sai na hora do pagamento. É esse dinheiro que pode faltar no capital de giro.
        </p>
        {d.valorRecomendadoCents > 0 ? (
          <p className="recomendacao-credito">
            Recomendação: {moeda(d.valorRecomendadoCents)}
            {d.parcelasRecomendadas ? ` em ${d.parcelasRecomendadas}x` : ''}, o suficiente para cobrir a falta prevista com
            parcelas que cabem nas entradas.
          </p>
        ) : (
          <p className="recomendacao-credito">
            O caixa cobre as despesas previstas para os próximos 30 dias. Não é preciso contratar crédito agora.
          </p>
        )}
      </section>

      {/* 2. Parceiros e limites. */}
      <section className="painel" aria-labelledby="titulo-parceiros">
        <h2 id="titulo-parceiros">
          <Landmark size={18} aria-hidden="true" /> Parceiros financeiros
        </h2>
        <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Parceiros financeiros e limites">
          <table>
            <caption className="somente-leitor">Parceiros financeiros e limites</caption>
            <thead>
              <tr>
                <th>Parceiro</th>
                <th className="numero">Limite disponível</th>
                <th className="numero">Taxa de juros</th>
                <th className="numero">CET estimado</th>
              </tr>
            </thead>
            <tbody>
              {parceiros.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.nome} {p.modo === 'SIMULADO' && <SeloSimulado />}
                  </td>
                  <td className="numero">{p.limiteCents > 0 ? moeda(p.limiteCents) : 'Sem limite agora'}</td>
                  <td className="numero">{p.taxaMensalBp !== undefined ? `${porcentagem(p.taxaMensalBp)} ao mês` : '—'}</td>
                  <td className="numero">{p.cetAnualBp !== undefined ? `${porcentagem(p.cetAnualBp)} ao ano` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {melhorLimite === 0 && <p className="nota">{parceiros[0]?.motivo}</p>}
      </section>

      {/* 3. Consentimento (LGPD / Open Finance). */}
      <section className="painel" aria-labelledby="titulo-dados">
        <h2 id="titulo-dados">
          <ShieldCheck size={18} aria-hidden="true" /> Compartilhamento de dados
        </h2>
        {consentimento ? (
          <>
            <p>
              Compartilhamento autorizado em {data(consentimento.concedidoEm)}. Os parceiros recebem só o total de
              entradas líquidas, despesas e número de vendas dos últimos 90 dias.
            </p>
            {podeContratar && (
              <button
                type="button"
                className="botao secundario"
                disabled={ocupado}
                onClick={() => void executar(async () => { await servico.revogar(); setOfertas(null); await carregar(); })}
              >
                Revogar autorização
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              Para oferecer crédito, os parceiros precisam conhecer o movimento da loja. Serão compartilhados apenas o
              total de entradas líquidas, o total de despesas e o número de vendas dos últimos 90 dias. Nenhum dado de
              clientes é compartilhado, e você pode revogar quando quiser.
            </p>
            {podeContratar ? (
              <>
                <label className="campo-check">
                  <input type="checkbox" checked={autorizo} onChange={(e) => setAutorizo(e.target.checked)} />
                  <span>Autorizo compartilhar esses dados com os parceiros financeiros</span>
                </label>
                <button
                  type="button"
                  className="botao primario"
                  disabled={!autorizo || ocupado}
                  onClick={() => void executar(async () => { await servico.consentir(); await carregar(); })}
                >
                  Autorizar compartilhamento
                </button>
              </>
            ) : (
              <p className="nota">Somente a pessoa gerente da loja pode autorizar o compartilhamento e contratar crédito.</p>
            )}
          </>
        )}
      </section>

      {/* 4. Simular e comparar ofertas. */}
      {consentimento && melhorLimite > 0 && (
        <section className="painel" aria-labelledby="titulo-simular">
          <h2 id="titulo-simular">
            <Scale size={18} aria-hidden="true" /> Comparar ofertas
          </h2>
          <form className="grade-formulario" onSubmit={simular}>
            <label className="campo">
              <span>Valor do crédito (R$)</span>
              <input inputMode="decimal" required value={valor} placeholder="Ex.: 1000,00" onChange={(e) => { setValor(e.target.value); setOfertas(null); }} />
            </label>
            <label className="campo">
              <span>Número de parcelas</span>
              <select value={parcelas} onChange={(e) => { setParcelas(e.target.value); setOfertas(null); }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </label>
            <button className="botao primario" disabled={ocupado}>
              {ocupado && !ofertas ? 'Consultando parceiro…' : 'Simular'}
            </button>
          </form>
          {ofertas && (
            <div aria-live="polite">
              {recusadoPor.length > 0 && <p className="nota">Sem oferta para este valor: {recusadoPor.join(', ')}.</p>}
              <fieldset className="lista-ofertas">
                <legend>Escolha a oferta</legend>
                {ofertas.map((o, i) => (
                  <label key={o.id} className={`oferta-credito ${escolhida === o.id ? 'escolhida' : ''}`}>
                    <input type="radio" name="oferta" value={o.id} checked={escolhida === o.id} onChange={() => { setEscolhida(o.id); setConcordo(false); }} />
                    <span className="oferta-titulo">
                      {o.parceiroNome} {i === 0 && <span className="selo-melhor">Menor CET</span>}
                    </span>
                    <span>
                      {o.parcelas}x de {moeda(o.parcelaCents)} · total {moeda(o.totalCents)}
                    </span>
                    <span>
                      Juros de {porcentagem(o.taxaMensalBp)} ao mês · CET de {porcentagem(o.cetAnualBp)} ao ano
                    </span>
                    <span className={`nivel-comprometimento ${o.nivel.toLowerCase()}`}>
                      {TEXTO_NIVEL[o.nivel]}
                      {o.comprometimentoBp !== null && ` · ${porcentagem(o.comprometimentoBp)} das entradas mensais`}
                    </span>
                  </label>
                ))}
              </fieldset>
              {oferta && (
                <div className="detalhe-oferta">
                  <div className="grade-indicadores">
                    <Indicador titulo="VALOR DA PARCELA" valor={oferta.parcelaCents} detalhe={`${oferta.parcelas}x mensais`} />
                    <Indicador titulo="TOTAL A PAGAR" valor={oferta.totalCents} detalhe="Soma de todas as parcelas" />
                    <Indicador titulo="JUROS" valor={oferta.jurosCents} detalhe="Total a pagar menos o valor recebido" />
                  </div>
                  <dl className="detalhes-credito">
                    <dt>Taxa de juros</dt>
                    <dd>{porcentagem(oferta.taxaMensalBp)} ao mês</dd>
                    <dt>CET estimado</dt>
                    <dd>{porcentagem(oferta.cetAnualBp)} ao ano</dd>
                    <dt>Primeira parcela</dt>
                    <dd>{data(oferta.primeiroVencimento)}</dd>
                    <dt>Proposta válida até</dt>
                    <dd>{data(oferta.validaAte)}</dd>
                  </dl>
                  {!oferta.podeContratar && (
                    <p role="alert" className="erro">
                      A parcela comprometeria mais da metade das entradas líquidas mensais da loja. Escolha um valor menor ou mais parcelas.
                    </p>
                  )}
                  {oferta.podeContratar && podeContratar && (
                    <>
                      <label className="campo-check">
                        <input type="checkbox" checked={concordo} onChange={(e) => setConcordo(e.target.checked)} />
                        <span>Li e concordo com o valor total, a taxa de juros e o CET</span>
                      </label>
                      <button type="button" className="botao primario" disabled={!concordo || ocupado} onClick={() => contratar(oferta)}>
                        Contratar capital de giro
                      </button>
                    </>
                  )}
                  {oferta.podeContratar && !podeContratar && (
                    <p className="nota">Somente a pessoa gerente da loja pode autorizar o compartilhamento e contratar crédito.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 5. Antes e depois do caixa. */}
      <section className="painel" aria-labelledby="titulo-antes-depois">
        <h2 id="titulo-antes-depois">
          <TrendingUp size={18} aria-hidden="true" /> Caixa nas próximas 12 semanas
        </h2>
        <p className="nota">
          {oferta
            ? 'Comparação do caixa estimado sem e com a oferta escolhida. Estimativa pela média dos últimos 90 dias, sem garantia.'
            : 'Caixa estimado pela média dos últimos 90 dias. Simule uma oferta para ver o caixa com o crédito.'}
        </p>
        <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Caixa estimado por semana">
          <table className="tabela-antes-depois">
            <caption className="somente-leitor">Caixa estimado por semana</caption>
            <thead>
              <tr>
                <th>Semana</th>
                <th className="numero">Sem crédito</th>
                {oferta && <th className="numero">Com crédito</th>}
                <th>
                  <span className="somente-leitor">Gráfico</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {semanas.map((s) => (
                <tr key={s.semana}>
                  <td>{data(s.inicio)}</td>
                  <td className={`numero ${s.semCreditoCents < 0 ? 'texto-vermelho' : ''}`}>{moeda(s.semCreditoCents)}</td>
                  {oferta && <td className={`numero ${s.comCreditoCents < 0 ? 'texto-vermelho' : ''}`}>{moeda(s.comCreditoCents)}</td>}
                  <td aria-hidden="true" className="barras-semana">
                    <span className={`barra sem ${s.semCreditoCents < 0 ? 'negativa' : ''}`} style={{ width: `${(Math.abs(s.semCreditoCents) / extremo) * 100}%` }} />
                    {oferta && <span className={`barra com ${s.comCreditoCents < 0 ? 'negativa' : ''}`} style={{ width: `${(Math.abs(s.comCreditoCents) / extremo) * 100}%` }} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Contratos. */}
      {contratos.length > 0 && (
        <section className="painel" aria-labelledby="titulo-contratos">
          <h2 id="titulo-contratos">
            <FileText size={18} aria-hidden="true" /> Contratos de capital de giro
          </h2>
          {contratos.map((c) => (
            <article key={c.id} className="contrato-credito" aria-label={`Contrato com ${c.parceiroNome}`}>
              <p>
                <strong>{moeda(c.valorCents)}</strong> com {c.parceiroNome} · {c.parcelas}x de {moeda(c.parcelaCents)} ·{' '}
                <span className={`status-contrato ${c.status.toLowerCase()}`}>{TEXTO_STATUS[c.status]}</span>{' '}
                {c.modo === 'SIMULADO' && <SeloSimulado />}
              </p>
              <div className="grade-indicadores">
                <Indicador titulo="JÁ PAGO" valor={c.pagoCents} detalhe="Parcelas pagas até agora" />
                <Indicador titulo="FALTA PAGAR" valor={c.restanteCents} detalhe="Parcelas que ainda vão vencer" />
              </div>
              {c.proximaParcela && (
                <p className={c.atrasada ? 'erro' : 'nota'}>
                  {c.atrasada ? 'Parcela em atraso' : 'Próxima parcela'}: {c.proximaParcela.numero} · {data(c.proximaParcela.vencimento)} ·{' '}
                  {moeda(c.proximaParcela.valorCents)}
                </p>
              )}
              {c.status === 'QUITADO' && c.quitacaoCents !== null && <p className="nota">Quitado antecipadamente por {moeda(c.quitacaoCents)}.</p>}
              {c.status === 'CANCELADO' && c.quitacaoCents !== null && <p className="nota">Desistência: devolvido {moeda(c.quitacaoCents)}, sem juros.</p>}
              {c.status === 'ATIVO' && podeContratar && (
                <div className="acoes-contrato">
                  {c.proximaParcela && c.modo === 'SIMULADO' && (
                    <button type="button" className="botao secundario" disabled={ocupado} onClick={() => void executar(async () => { await servico.pagarParcela(c.id, c.proximaParcela!.numero); setSucesso('Parcela registrada como paga.'); await carregar(); })}>
                      Registrar pagamento da próxima parcela
                    </button>
                  )}
                  <button type="button" className="botao secundario" disabled={ocupado} onClick={() => void executar(async () => { const q = await servico.cotarQuitacao(c.id); setQuitacoes((x) => ({ ...x, [c.id]: q })); })}>
                    Quitar antecipadamente
                  </button>
                  {c.podeDesistir && (
                    <button type="button" className="botao texto" disabled={ocupado} onClick={() => void executar(async () => { await servico.desistir(c.id); setSucesso('Desistência registrada. O valor recebido é devolvido sem juros.'); await carregar(); })}>
                      Desistir do contrato
                    </button>
                  )}
                </div>
              )}
              {c.podeDesistir && <p className="nota">Você pode desistir sem pagar juros até {data(c.desistenciaAte)}.</p>}
              {quitacoes[c.id] && c.status === 'ATIVO' && (
                <div className="quitacao-credito" aria-live="polite">
                  <dl className="detalhes-credito">
                    <dt>Parcelas restantes</dt>
                    <dd>{moeda(quitacoes[c.id].restanteCents)}</dd>
                    <dt>Valor para quitar hoje</dt>
                    <dd>{moeda(quitacoes[c.id].quitacaoCents)}</dd>
                    <dt>Desconto dos juros</dt>
                    <dd>{moeda(quitacoes[c.id].descontoCents)}</dd>
                  </dl>
                  <button type="button" className="botao primario" disabled={ocupado} onClick={() => void executar(async () => { await servico.quitar(c.id); setSucesso('Contrato quitado antecipadamente, com desconto dos juros futuros.'); await carregar(); })}>
                    Confirmar quitação
                  </button>
                </div>
              )}
              <button type="button" className="botao texto" onClick={() => setResumo(resumo === c.id ? '' : c.id)} aria-expanded={resumo === c.id}>
                Resumo do contrato
              </button>
              {resumo === c.id && (
                <div className="resumo-contrato">
                  <h3>Resumo do contrato de capital de giro</h3>
                  <dl className="detalhes-credito">
                    <dt>Parceiro</dt>
                    <dd>{c.parceiroNome}</dd>
                    <dt>Contratado em</dt>
                    <dd>{data(c.contratadoEm)}</dd>
                    <dt>Valor recebido</dt>
                    <dd>{moeda(c.valorCents)}</dd>
                    <dt>Parcelas</dt>
                    <dd>
                      {c.parcelas}x de {moeda(c.parcelaCents)}
                    </dd>
                    <dt>Total a pagar</dt>
                    <dd>{moeda(c.totalCents)}</dd>
                    <dt>Taxa de juros</dt>
                    <dd>{porcentagem(c.taxaMensalBp)} ao mês</dd>
                    <dt>CET estimado</dt>
                    <dd>{porcentagem(c.cetAnualBp)} ao ano</dd>
                    <dt>Desistência sem juros até</dt>
                    <dd>{data(c.desistenciaAte)}</dd>
                  </dl>
                  <p className="nota">Você pode quitar antes do prazo com desconto dos juros futuros.</p>
                  {c.modo === 'SIMULADO' && <p className="nota">Contrato simulado, sem valor legal.</p>}
                  <button type="button" className="botao secundario" onClick={() => window.print()}>
                    Imprimir resumo
                  </button>
                </div>
              )}
              <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Parcelas do contrato">
                <table>
                  <caption className="somente-leitor">Parcelas do contrato</caption>
                  <thead>
                    <tr>
                      <th>Parcela</th>
                      <th>Vencimento</th>
                      <th className="numero">Valor</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.cronograma.map((p) => (
                      <tr key={p.numero}>
                        <td>{p.numero}</td>
                        <td>{data(p.vencimento)}</td>
                        <td className="numero">{moeda(p.valorCents)}</td>
                        <td>{p.status === 'PAGA' ? 'Paga' : 'A vencer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* 7. Histórico auditável. */}
      {eventos.length > 0 && (
        <section className="painel" aria-labelledby="titulo-historico">
          <h2 id="titulo-historico">
            <History size={18} aria-hidden="true" /> Histórico do crédito
          </h2>
          <ol className="historico-credito">
            {eventos.slice(0, 20).map((e, i) => (
              <li key={`${e.em}-${i}`}>
                <time dateTime={e.em}>{data(e.em)}</time> {TEXTO_EVENTO[e.tipo] ?? 'Registro'}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
