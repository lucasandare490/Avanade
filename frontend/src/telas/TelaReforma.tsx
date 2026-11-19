import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarClock, Calculator, FileSpreadsheet, HandCoins, Receipt } from 'lucide-react';
import { Aviso, CabecalhoPagina, Estado, Indicador, SeloSimulado } from '../componentes/ElementosInterface';
import {
  anteciparRecebiveis,
  caixaComPrazo,
  calcularPreco,
  COLUNAS_CONTADOR,
  linhasContador,
  type ResultadoAntecipacao,
  type ResultadoPreco,
  type ResumoReforma,
  type ServicoReforma,
} from '../servicos/reforma';
import type { ServicoCredito } from '../servicos/credito';
import { FalhaTransporte } from '../servicos/transporteApi';
import { exportarRelatorio } from '../utilitarios/exportarRelatorio';
import { lerCentavos, moeda } from '../utilitarios/valoresFinanceiros';

const porcentagem = (bp: number) => `${(bp / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const dataCurta = (iso: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${iso}T12:00:00`));
/** "26,5" -> 2650 pontos-base; aceita de 0 a 100 com até duas casas. */
export function lerPercentualBp(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d{1,3}(,\d{1,2})?$/.test(t)) return null;
  const [i, f = ''] = t.split(',');
  const bp = Number(i) * 100 + Number(f.padEnd(2, '0'));
  return bp <= 10_000 ? bp : null;
}
const lerCentavosOuZero = (t: string) => (t.trim() === '' ? 0 : lerCentavos(t));
const lerDias = (t: string) => (/^\d{1,3}$/.test(t.trim()) ? Number(t.trim()) : null);
const somarDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

/**
 * Reforma no caixa: o que mais o split payment muda para o comerciante, além do imposto retido.
 * Créditos de IBS/CBS das compras, preço de venda, prazo com fornecedores, antecipação de
 * recebíveis e o pacote para o contador. Os percentuais são informados pela pessoa.
 */
export function TelaReforma({ servico, credito, hoje }: { servico?: ServicoReforma; credito?: ServicoCredito; hoje: string }) {
  const [de, setDe] = useState(somarDias(hoje, -29));
  const [ate, setAte] = useState(hoje);
  const [resumo, setResumo] = useState<ResumoReforma | null>(null);
  const [erro, setErro] = useState('');
  const [semRecurso, setSemRecurso] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [faltaCaixa, setFaltaCaixa] = useState<number | null>(null);
  const [taxaCreditoBp, setTaxaCreditoBp] = useState<number | null>(null);
  const pedido = useRef<AbortController | null>(null);

  async function carregar(inicio = de, fim = ate) {
    if (!servico) return;
    if (!inicio || !fim || inicio > fim) {
      setErro('A data final deve ser igual ou posterior à inicial.');
      return;
    }
    pedido.current?.abort();
    const c = new AbortController();
    pedido.current = c;
    setCarregando(true);
    setErro('');
    try {
      const r = await servico.resumo(inicio, fim, c.signal);
      if (!c.signal.aborted) setResumo(r);
    } catch (e) {
      if (c.signal.aborted) return;
      if (e instanceof FalhaTransporte && e.codigo === 404) setSemRecurso(true);
      else setErro(e instanceof Error ? e.message : 'Não foi possível consultar os dados.');
    } finally {
      if (!c.signal.aborted) setCarregando(false);
    }
  }
  useEffect(() => {
    void carregar();
    // O capital de giro informa a falta de caixa e a menor taxa, para comparar.
    const c = new AbortController();
    credito
      ?.consultar(c.signal)
      .then((s) => {
        if (c.signal.aborted) return;
        setFaltaCaixa(s.diagnostico.falta30dCents);
        const taxas = s.parceiros.map((p) => p.taxaMensalBp).filter((t): t is number => typeof t === 'number');
        setTaxaCreditoBp(taxas.length ? Math.min(...taxas) : null);
      })
      .catch(() => undefined);
    return () => {
      pedido.current?.abort();
      c.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servico, credito]);

  if (!servico || semRecurso)
    return (
      <Estado
        titulo="Reforma no caixa indisponível"
        descricao={
          semRecurso
            ? 'O servidor ainda não foi atualizado com esta versão. Assim que a API for publicada, a tela funciona normalmente.'
            : 'Este recurso ainda não está ligado a este ambiente.'
        }
      />
    );

  return (
    <>
      <CabecalhoPagina
        titulo="Reforma no caixa"
        descricao="Créditos das compras, preço de venda, prazo com fornecedores, antecipação e o pacote do contador."
      />
      <Aviso>
        <SeloSimulado /> As alíquotas e taxas são as que você informa; o sistema não tem as alíquotas oficiais. Confirme
        os números com o seu contador. Nada aqui movimenta dinheiro.
      </Aviso>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}

      <section className="painel" aria-labelledby="titulo-creditos">
        <h2 id="titulo-creditos">
          <Receipt size={18} aria-hidden="true" /> Créditos de IBS/CBS das compras
        </h2>
        <form
          className="filtros"
          onSubmit={(e) => {
            e.preventDefault();
            void carregar();
          }}
        >
          <label className="campo">
            <span>Data inicial</span>
            <input type="date" value={de} max={ate} onChange={(e) => setDe(e.target.value)} required />
          </label>
          <label className="campo">
            <span>Data final</span>
            <input type="date" value={ate} min={de} onChange={(e) => setAte(e.target.value)} required />
          </label>
          <button className="botao secundario" disabled={carregando}>
            {carregando ? 'Consultando…' : 'Atualizar período'}
          </button>
        </form>
        {resumo ? (
          <>
            <div className="grade-indicadores">
              <Indicador titulo="IMPOSTO RETIDO NAS VENDAS" valor={resumo.impostoRetidoCents} detalhe={resumo.vendas === 1 ? '1 venda concluída' : `${resumo.vendas} vendas concluídas`} />
              <Indicador titulo="CRÉDITOS DAS COMPRAS" valor={resumo.creditoCents} detalhe={`${resumo.comprasComCredito} de ${resumo.compras} compras com crédito`} tom="verde" />
              <Indicador titulo="IMPOSTO LÍQUIDO" valor={resumo.impostoLiquidoCents} detalhe="Imposto retido menos os créditos" />
              <Indicador titulo="CRÉDITO ACUMULADO" valor={resumo.creditoAcumuladoCents} detalhe="Sobra para os próximos períodos" />
            </div>
            <p className="nota">
              Na Reforma, o IBS e a CBS pagos nas compras viram crédito e abatem o imposto das vendas. Esse dinheiro volta
              para o caixa. Informe o crédito da nota ao registrar a despesa, ou importe o XML da NF-e na tela Despesas.
            </p>
            {resumo.linhasCompras.length ? (
              <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Compras do período e créditos">
                <table>
                  <caption className="somente-leitor">Compras do período e créditos</caption>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Compra</th>
                      <th className="numero">Valor da compra</th>
                      <th className="numero">Crédito IBS/CBS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.linhasCompras.map((c) => (
                      <tr key={c.id}>
                        <td>{dataCurta(c.data)}</td>
                        <td>{c.descricao}</td>
                        <td className="numero">{moeda(c.valorCents)}</td>
                        <td className="numero">{c.creditoCents ? moeda(c.creditoCents) : 'Sem crédito'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhuma compra registrada no período.</p>
            )}
          </>
        ) : (
          !erro && <p role="status">Consultando o período…</p>
        )}
      </section>

      <PrecoVenda />
      <PrazoFornecedor comprasPeriodo={resumo} faltaCaixa={faltaCaixa} />
      <Antecipacao taxaCreditoBp={taxaCreditoBp} />

      <section className="painel" aria-labelledby="titulo-contador">
        <h2 id="titulo-contador">
          <FileSpreadsheet size={18} aria-hidden="true" /> Pacote do contador
        </h2>
        <p>
          Um arquivo CSV com o resumo do período, cada venda (bruto, IBS/CBS retido, taxa e líquido) e cada compra com o
          crédito de IBS/CBS. Abre no Excel ou em qualquer planilha e pode ser enviado ao contador.
        </p>
        <button
          className="botao primario"
          disabled={!resumo}
          onClick={() => resumo && exportarRelatorio(`pacote-contador-${resumo.de}-a-${resumo.ate}`, COLUNAS_CONTADOR, linhasContador(resumo))}
        >
          Baixar pacote do contador (CSV)
        </button>
        {resumo && (resumo.linhasVendas.length >= resumo.limiteLinhas || resumo.linhasCompras.length >= resumo.limiteLinhas) && (
          <p className="nota">{`O período tem mais de ${resumo.limiteLinhas} registros. Escolha um período menor para o arquivo trazer todos.`}</p>
        )}
      </section>
    </>
  );
}

function PrecoVenda() {
  const [campos, setCampos] = useState({ custo: '', credito: '', aliquota: '', taxa: '2', margem: '20', atual: '' });
  const [resultado, setResultado] = useState<ResultadoPreco | null>(null);
  const [erro, setErro] = useState('');
  const mudar = (k: keyof typeof campos) => (e: { target: { value: string } }) => setCampos((c) => ({ ...c, [k]: e.target.value }));
  function calcular(e: FormEvent) {
    e.preventDefault();
    const custo = lerCentavos(campos.custo),
      creditoCompra = lerCentavosOuZero(campos.credito),
      atual = campos.atual.trim() ? lerCentavos(campos.atual) : null,
      aliquota = lerPercentualBp(campos.aliquota),
      taxa = lerPercentualBp(campos.taxa),
      margem = lerPercentualBp(campos.margem);
    if (custo === null || creditoCompra === null || (campos.atual.trim() && atual === null)) {
      setResultado(null);
      setErro('Informe os valores em reais, com vírgula decimal.');
      return;
    }
    if (aliquota === null || taxa === null || margem === null) {
      setResultado(null);
      setErro('Informe os percentuais de 0 a 100, com vírgula decimal.');
      return;
    }
    const r = calcularPreco({ custoCents: custo, creditoCents: creditoCompra, aliquotaBp: aliquota, taxaBp: taxa, margemBp: margem, precoAtualCents: atual });
    if ('erro' in r) {
      setResultado(null);
      setErro(r.erro);
    } else {
      setErro('');
      setResultado(r);
    }
  }
  const campo = (k: keyof typeof campos, rotulo: string, obrigatorio = true) => (
    <label className="campo">
      <span>{rotulo}</span>
      <input inputMode="decimal" value={campos[k]} onChange={mudar(k)} required={obrigatorio} />
    </label>
  );
  return (
    <section className="painel" aria-labelledby="titulo-preco">
      <h2 id="titulo-preco">
        <Calculator size={18} aria-hidden="true" /> Preço de venda com a nova tributação
      </h2>
      <form onSubmit={calcular} className="grade-formulario">
        {campo('custo', 'Custo do produto (R$)')}
        {campo('credito', 'Crédito de IBS/CBS da compra (R$)', false)}
        {campo('aliquota', 'Alíquota de IBS/CBS (%)')}
        {campo('taxa', 'Taxa da maquininha (%)')}
        {campo('margem', 'Margem desejada (%)')}
        {campo('atual', 'Preço atual (R$)', false)}
        <button className="botao primario">Calcular preço</button>
      </form>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      {resultado && (
        <div role="status">
          <dl className="detalhes-credito">
            <dt>Preço sugerido ao cliente</dt>
            <dd>{moeda(resultado.precoFinalCents)}</dd>
            <dt>Preço sem o imposto</dt>
            <dd>{moeda(resultado.precoBaseCents)}</dd>
            <dt>IBS/CBS da venda</dt>
            <dd>{moeda(resultado.impostoCents)}</dd>
            <dt>Taxa da maquininha</dt>
            <dd>{moeda(resultado.taxaCents)}</dd>
            <dt>Custo depois do crédito</dt>
            <dd>{moeda(resultado.custoLiquidoCents)}</dd>
            <dt>Lucro por unidade</dt>
            <dd>{moeda(resultado.lucroCents)}</dd>
          </dl>
          {resultado.margemAtualBp !== null && resultado.diferencaCents !== null && (
            <p className="recomendacao-credito">
              {resultado.diferencaCents > 0
                ? `Com o preço atual, a margem fica em ${porcentagem(resultado.margemAtualBp)}. Para manter a margem desejada, o preço precisa subir ${moeda(resultado.diferencaCents)}.`
                : `O preço atual já cobre a margem desejada (margem de ${porcentagem(resultado.margemAtualBp)}).`}
            </p>
          )}
        </div>
      )}
      <p className="nota">
        Na Reforma, o IBS e a CBS são calculados sobre o preço sem o imposto (“por fora”). O crédito da compra reduz o seu
        custo, porque volta como abatimento do imposto.
      </p>
    </section>
  );
}

function PrazoFornecedor({ comprasPeriodo, faltaCaixa }: { comprasPeriodo: ResumoReforma | null; faltaCaixa: number | null }) {
  const sugestao = comprasPeriodo ? Math.round((comprasPeriodo.comprasCents * 30) / Math.max(1, (Date.parse(comprasPeriodo.ate) - Date.parse(comprasPeriodo.de)) / 86_400_000 + 1)) : 0;
  const [compras, setCompras] = useState('');
  const [atual, setAtual] = useState('0');
  const [novo, setNovo] = useState('30');
  const [resultado, setResultado] = useState<{ diasGanhos: number; caixaLiberadoCents: number } | null>(null);
  const [erro, setErro] = useState('');
  function calcular(e: FormEvent) {
    e.preventDefault();
    const c = lerCentavos(compras),
      a = lerDias(atual),
      n = lerDias(novo);
    const r = c === null || a === null || n === null ? null : caixaComPrazo(c, a, n);
    if (!r) {
      setResultado(null);
      setErro('Informe o valor das compras em reais e os prazos em dias, de 0 a 180.');
      return;
    }
    setErro('');
    setResultado(r);
  }
  return (
    <section className="painel" aria-labelledby="titulo-prazo">
      <h2 id="titulo-prazo">
        <CalendarClock size={18} aria-hidden="true" /> Prazo com fornecedores
      </h2>
      <form onSubmit={calcular} className="grade-formulario">
        <label className="campo">
          <span>Compras por mês com fornecedores (R$)</span>
          <input inputMode="decimal" value={compras} onChange={(e) => setCompras(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Prazo atual (dias)</span>
          <input inputMode="numeric" value={atual} onChange={(e) => setAtual(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Prazo negociado (dias)</span>
          <input inputMode="numeric" value={novo} onChange={(e) => setNovo(e.target.value)} required />
        </label>
        <button className="botao primario">Calcular efeito no caixa</button>
        {sugestao > 0 && (
          <button type="button" className="botao secundario" onClick={() => setCompras((sugestao / 100).toFixed(2).replace('.', ','))}>
            {`Usar as compras registradas (${moeda(sugestao)} por mês)`}
          </button>
        )}
      </form>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      {resultado && (
        <p role="status" className="recomendacao-credito">
          {resultado.diasGanhos > 0
            ? `Pagando ${resultado.diasGanhos} dias depois, ficam ${moeda(resultado.caixaLiberadoCents)} a mais no caixa, sem juros.`
            : resultado.diasGanhos < 0
              ? `Com um prazo menor, saem ${moeda(-resultado.caixaLiberadoCents)} do caixa mais cedo.`
              : 'O prazo não mudou, então o caixa também não muda.'}
          {resultado.diasGanhos > 0 && faltaCaixa !== null && faltaCaixa > 0 &&
            (resultado.caixaLiberadoCents >= faltaCaixa
              ? ` Isso cobre toda a falta de caixa prevista para 30 dias (${moeda(faltaCaixa)}), sem precisar de crédito.`
              : ` Isso cobre ${Math.round((resultado.caixaLiberadoCents / faltaCaixa) * 100)}% da falta de caixa prevista para 30 dias (${moeda(faltaCaixa)}).`)}
        </p>
      )}
      <p className="nota">
        Negociar prazo é a forma mais barata de recompor o capital de giro: o dinheiro fica no caixa por mais tempo e não
        há juros. Use este número na conversa com o fornecedor.
      </p>
    </section>
  );
}

function Antecipacao({ taxaCreditoBp }: { taxaCreditoBp: number | null }) {
  const [valor, setValor] = useState('');
  const [dias, setDias] = useState('30');
  const [taxa, setTaxa] = useState('2,5');
  const [resultado, setResultado] = useState<ResultadoAntecipacao | null>(null);
  const [erro, setErro] = useState('');
  function calcular(e: FormEvent) {
    e.preventDefault();
    const v = lerCentavos(valor),
      d = lerDias(dias),
      t = lerPercentualBp(taxa);
    const r = v === null || d === null || t === null ? null : anteciparRecebiveis(v, d, t);
    if (!r) {
      setResultado(null);
      setErro('Informe o valor em reais, os dias de 1 a 360 e a taxa ao mês de 0 a 20%.');
      return;
    }
    setErro('');
    setResultado(r);
  }
  return (
    <section className="painel" aria-labelledby="titulo-antecipacao">
      <h2 id="titulo-antecipacao">
        <HandCoins size={18} aria-hidden="true" /> Antecipação de recebíveis
      </h2>
      <form onSubmit={calcular} className="grade-formulario">
        <label className="campo">
          <span>Vendas no cartão a receber (R$)</span>
          <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Dias até receber</span>
          <input inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Taxa de antecipação ao mês (%)</span>
          <input inputMode="decimal" value={taxa} onChange={(e) => setTaxa(e.target.value)} required />
        </label>
        <button className="botao primario">Simular antecipação</button>
      </form>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      {resultado && (
        <div role="status">
          <dl className="detalhes-credito">
            <dt>Você recebe hoje</dt>
            <dd>{moeda(resultado.liquidoCents)}</dd>
            <dt>Desconto da antecipação</dt>
            <dd>{moeda(resultado.descontoCents)}</dd>
            <dt>Custo efetivo ao mês</dt>
            <dd>{porcentagem(resultado.custoMensalEfetivoBp)}</dd>
          </dl>
          {taxaCreditoBp !== null && (
            <p className="recomendacao-credito">
              {resultado.custoMensalEfetivoBp > taxaCreditoBp
                ? `O capital de giro do parceiro sai mais barato: ${porcentagem(taxaCreditoBp)} ao mês, contra ${porcentagem(resultado.custoMensalEfetivoBp)} da antecipação.`
                : `A antecipação sai mais barata que o capital de giro do parceiro (${porcentagem(taxaCreditoBp)} ao mês).`}
            </p>
          )}
        </div>
      )}
      <p className="nota">
        Antecipar é receber hoje as vendas no cartão que cairiam no futuro, pagando um desconto. Compare com o capital de
        giro antes de decidir. A antecipação é feita com a maquininha ou o banco que recebe as suas vendas.
      </p>
    </section>
  );
}
