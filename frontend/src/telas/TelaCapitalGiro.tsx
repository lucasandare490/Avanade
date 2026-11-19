import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';
import { Aviso, CabecalhoPagina, Estado, Indicador, SeloSimulado } from '../componentes/ElementosInterface';
import type { ContratoCredito, PropostaCredito, ServicoCredito, SituacaoCredito } from '../servicos/credito';
import { MINIMO_CREDITO_CENTS } from '../servicos/credito';
import { lerCentavos, moeda } from '../utilitarios/valoresFinanceiros';

const porcentagem = (bp: number) =>
  `${(bp / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const data = (iso: string) => {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('pt-BR').format(d);
};

/**
 * Capital de giro dentro do app: o comerciante autoriza o compartilhamento de
 * dados com o parceiro (fintech ou banco), simula e contrata sem ir ao banco.
 */
export function TelaCapitalGiro({ servico }: { servico?: ServicoCredito }) {
  const [situacao, setSituacao] = useState<SituacaoCredito | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [autorizo, setAutorizo] = useState(false);
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('6');
  const [proposta, setProposta] = useState<PropostaCredito | null>(null);
  const [concordo, setConcordo] = useState(false);
  const pedido = useRef<AbortController | null>(null);

  async function carregar() {
    if (!servico) return;
    pedido.current?.abort();
    const c = new AbortController();
    pedido.current = c;
    try {
      const s = await servico.consultar(c.signal);
      if (!c.signal.aborted) setSituacao(s);
    } catch (e) {
      if (!c.signal.aborted) setErro(e instanceof Error ? e.message : 'Não foi possível consultar os dados.');
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

  if (!servico)
    return <Estado titulo="Capital de giro indisponível" descricao="Este recurso ainda não está ligado a este ambiente." />;
  if (!situacao)
    return erro ? (
      <Estado titulo="Consulta indisponível" descricao={erro} acao={<button className="botao primario" onClick={() => { setErro(''); void carregar(); }}>Tentar novamente</button>} />
    ) : (
      <Estado titulo="Consultando parceiro financeiro" carregando />
    );

  const { parceiro, consentimento, contratos, podeContratar } = situacao;
  const limite = parceiro.limiteCents;

  function simular(e: FormEvent) {
    e.preventDefault();
    const centavos = lerCentavos(valor);
    if (centavos === null || centavos < MINIMO_CREDITO_CENTS || centavos > limite) {
      setErro(`Escolha um valor entre R$ 500,00 e ${moeda(limite)}.`);
      return;
    }
    void executar(async () => {
      setProposta(null);
      setConcordo(false);
      setProposta(await servico!.simular(centavos, Number(parcelas)));
    });
  }

  function contratar(p: PropostaCredito) {
    void executar(async () => {
      const contrato: ContratoCredito = await servico!.contratar(p.id);
      setProposta(null);
      setConcordo(false);
      setValor('');
      setSucesso(
        `Capital de giro contratado: ${moeda(contrato.valorCents)} em ${contrato.parcelas}x de ${moeda(contrato.parcelaCents)}. O valor entra na projeção do caixa e as parcelas aparecem como compromissos.`,
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
      {parceiro.modo === 'SIMULADO' && (
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

      <section className="painel">
        <h2>
          <Landmark size={18} aria-hidden="true" /> Parceiro financeiro
        </h2>
        <p>{parceiro.nome}</p>
        <div className="grade-indicadores">
          <Indicador titulo="LIMITE DISPONÍVEL" valor={limite} detalhe="Calculado pelo parceiro com os dados autorizados" />
          <Indicador titulo="ENTRADAS LÍQUIDAS EM 90 DIAS" valor={parceiro.fatos.entradasLiquidas90dCents} detalhe="Vendas depois do split" />
        </div>
        {parceiro.motivo && <p className="nota">{parceiro.motivo}</p>}
      </section>

      <section className="painel">
        <h2>
          <ShieldCheck size={18} aria-hidden="true" /> Compartilhamento de dados
        </h2>
        {consentimento ? (
          <>
            <p>
              Compartilhamento autorizado em {data(consentimento.concedidoEm)}. O parceiro recebe só o total de entradas
              líquidas, despesas e número de vendas dos últimos 90 dias.
            </p>
            {podeContratar && (
              <button type="button" className="botao secundario" disabled={ocupado} onClick={() => void executar(async () => { await servico.revogar(); setProposta(null); await carregar(); })}>
                Revogar autorização
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              Para oferecer crédito, o parceiro precisa conhecer o movimento da loja. Serão compartilhados apenas o total
              de entradas líquidas, o total de despesas e o número de vendas dos últimos 90 dias. Nenhum dado de clientes
              é compartilhado, e você pode revogar quando quiser.
            </p>
            {podeContratar ? (
              <>
                <label className="campo-check">
                  <input type="checkbox" checked={autorizo} onChange={(e) => setAutorizo(e.target.checked)} />
                  <span>Autorizo compartilhar esses dados com o parceiro financeiro</span>
                </label>
                <button type="button" className="botao primario" disabled={!autorizo || ocupado} onClick={() => void executar(async () => { await servico.consentir(); await carregar(); })}>
                  Autorizar compartilhamento
                </button>
              </>
            ) : (
              <p className="nota">Somente a pessoa gerente da loja pode autorizar o compartilhamento e contratar crédito.</p>
            )}
          </>
        )}
      </section>

      {consentimento && limite > 0 && (
        <section className="painel">
          <h2>Simular capital de giro</h2>
          <form className="grade-formulario" onSubmit={simular}>
            <label className="campo">
              <span>Valor do crédito (R$)</span>
              <input inputMode="decimal" required value={valor} placeholder="Ex.: 1000,00" onChange={(e) => { setValor(e.target.value); setProposta(null); }} />
            </label>
            <label className="campo">
              <span>Número de parcelas</span>
              <select value={parcelas} onChange={(e) => { setParcelas(e.target.value); setProposta(null); }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </label>
            <button className="botao primario" disabled={ocupado}>
              {ocupado && !proposta ? 'Consultando parceiro…' : 'Simular'}
            </button>
          </form>
          {proposta && (
            <div aria-live="polite">
              <div className="grade-indicadores">
                <Indicador titulo="VALOR DA PARCELA" valor={proposta.parcelaCents} detalhe={`${proposta.parcelas}x mensais`} />
                <Indicador titulo="TOTAL A PAGAR" valor={proposta.totalCents} detalhe="Soma de todas as parcelas" />
                <Indicador titulo="JUROS" valor={proposta.jurosCents} detalhe="Total a pagar menos o valor recebido" />
              </div>
              <dl className="detalhes-credito">
                <dt>Taxa de juros</dt>
                <dd>{porcentagem(proposta.taxaMensalBp)} ao mês</dd>
                <dt>CET estimado</dt>
                <dd>{porcentagem(proposta.cetAnualBp)} ao ano</dd>
                <dt>Primeira parcela</dt>
                <dd>{data(proposta.primeiroVencimento)}</dd>
                <dt>Proposta válida até</dt>
                <dd>{data(proposta.validaAte)}</dd>
              </dl>
              {podeContratar ? (
                <>
                  <label className="campo-check">
                    <input type="checkbox" checked={concordo} onChange={(e) => setConcordo(e.target.checked)} />
                    <span>Li e concordo com o valor total, a taxa de juros e o CET</span>
                  </label>
                  <button type="button" className="botao primario" disabled={!concordo || ocupado} onClick={() => contratar(proposta)}>
                    Contratar capital de giro
                  </button>
                </>
              ) : (
                <p className="nota">Somente a pessoa gerente da loja pode autorizar o compartilhamento e contratar crédito.</p>
              )}
            </div>
          )}
        </section>
      )}

      {contratos.length > 0 && (
        <section className="painel">
          <h2>Contratos de capital de giro</h2>
          {contratos.map((c) => (
            <div key={c.id} className="contrato-credito">
              <p>
                <strong>{moeda(c.valorCents)}</strong> em {c.parcelas}x de {moeda(c.parcelaCents)} · total {moeda(c.totalCents)} ·{' '}
                {c.modo === 'SIMULADO' ? <SeloSimulado /> : null}
              </p>
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
            </div>
          ))}
        </section>
      )}
    </>
  );
}
