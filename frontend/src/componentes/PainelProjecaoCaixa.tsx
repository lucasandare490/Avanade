import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ServicoPlanner } from '../tipos';
import type { ProjecaoCaixa } from '../servicos/contratosConsultas';
import { Indicador } from './ElementosInterface';
import { lerCentavos } from '../utilitarios/valoresFinanceiros';
export function PainelProjecaoCaixa({ servico }: { servico: ServicoPlanner }) {
  const [ate, setAte] = useState(''),
    [entradas, setEntradas] = useState(''),
    [saidas, setSaidas] = useState('');
  const [resultado, setResultado] = useState<ProjecaoCaixa | null>(null),
    [erro, setErro] = useState(''),
    [ocupado, setOcupado] = useState(false);
  const pedido = useRef<AbortController | null>(null);
  useEffect(() => () => pedido.current?.abort(), []);
  function invalidar() {
    pedido.current?.abort();
    setResultado(null);
    setErro('');
    setOcupado(false);
  }
  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (ocupado) return;
    const valor = (s: string) => (/^0([,.]00)?$/.test(s.trim()) ? 0 : lerCentavos(s));
    const incomeCents = valor(entradas),
      expenseCents = valor(saidas);
    if (incomeCents === null || expenseCents === null) {
      setErro('Informe entradas e despesas previstas, incluindo zero quando não houver previsão.');
      return;
    }
    const controller = new AbortController();
    pedido.current = controller;
    setOcupado(true);
    setErro('');
    setResultado(null);
    try {
      const r = await servico.projetarCaixa!(
        { until: ate, incomeCents, expenseCents },
        controller.signal,
      );
      if (!controller.signal.aborted) setResultado(r);
    } catch (e) {
      if (!controller.signal.aborted)
        setErro(e instanceof Error ? e.message : 'Projeção indisponível.');
    } finally {
      if (!controller.signal.aborted) setOcupado(false);
    }
  }
  return (
    <section className="painel">
      <h2>Planejar o caixa</h2>
      <p>
        Informe um cenário futuro. O saldo de partida vem do servidor; as previsões não alteram o
        dinheiro disponível.
      </p>
      <form className="grade-formulario" onSubmit={enviar}>
        <label className="campo">
          <span>Planejar até</span>
          <input
            type="date"
            required
            value={ate}
            onChange={(e) => {
              invalidar();
              setAte(e.target.value);
            }}
          />
        </label>
        <label className="campo">
          <span>Entradas líquidas previstas (R$)</span>
          <input
            inputMode="decimal"
            required
            value={entradas}
            onChange={(e) => {
              invalidar();
              setEntradas(e.target.value);
            }}
          />
        </label>
        <label className="campo">
          <span>Despesas previstas (R$)</span>
          <input
            inputMode="decimal"
            required
            value={saidas}
            onChange={(e) => {
              invalidar();
              setSaidas(e.target.value);
            }}
          />
        </label>
        <button className="botao primario" disabled={ocupado}>
          {ocupado ? 'Calculando cenário…' : 'Calcular projeção'}
        </button>
      </form>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      {resultado && (
        <div aria-live="polite">
          <p>{resultado.assumption}</p>
          <p>
            Saldo de referência em {resultado.asOf}; horizonte até {resultado.until}.
          </p>
          <div className="grade-indicadores">
            <Indicador
              titulo="SALDO REALIZADO"
              valor={resultado.openingCents}
              detalhe="Origem: servidor"
            />
            <Indicador
              titulo="SALDO PROJETADO"
              valor={resultado.projectedCents}
              detalhe="Cenário, não saldo disponível"
            />
          </div>
          <h3>
            {resultado.attention === 'DEFICIT'
              ? 'Atenção: déficit previsto'
              : resultado.attention === 'SEM_MARGEM'
                ? 'Atenção: cenário sem reserva'
                : 'Cenário positivo'}
          </h3>
          <p>{resultado.explanation}</p>
          <small>Explicação demonstrativa por regras. Nenhuma garantia de resultado futuro.</small>
        </div>
      )}
    </section>
  );
}
