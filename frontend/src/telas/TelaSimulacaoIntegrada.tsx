import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ServicoPlanner } from '../tipos';
import type { ResultadoSimulacao } from '../servicos/contratosConsultas';
import { Aviso, CabecalhoPagina, Estado, Indicador } from '../componentes/ElementosInterface';
import { lerCentavos } from '../utilitarios/valoresFinanceiros';
export function TelaSimulacaoIntegrada({ servico }: { servico: ServicoPlanner }) {
  const [percentual, setPercentual] = useState('');
  const [valor, setValor] = useState(''),
    [taxa, setTaxa] = useState(true),
    [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null),
    [ocupado, setOcupado] = useState(false);
  const consulta = useRef<AbortController | null>(null),
    sequencia = useRef(0);
  useEffect(
    () => () => {
      sequencia.current++;
      consulta.current?.abort();
    },
    [],
  );
  function invalidar() {
    sequencia.current++;
    consulta.current?.abort();
    setResultado(null);
    setErro('');
    setOcupado(false);
  }
  async function enviar(e: FormEvent) {
    e.preventDefault();
    const bruto = lerCentavos(valor);
    if (bruto === null) {
      setErro('Informe um valor positivo em reais, como 150,00.');
      return;
    }
    const normalizado = percentual.trim().replace(',', '.');
    const bps = normalizado === '' ? undefined : Math.round(Number(normalizado) * 100);
    if (bps !== undefined && (!/^\d{1,3}(\.\d{1,2})?$/.test(normalizado) || bps > 10000)) {
      setErro('Informe um percentual entre 0 e 100, com até duas casas decimais.'); return;
    }
    if (!servico.simular) return;
    consulta.current?.abort();
    const controle = new AbortController();
    consulta.current = controle;
    const id = ++sequencia.current;
    setResultado(null);
    setOcupado(true);
    setErro('');
    try {
      const r = await servico.simular({ bruto, incluirTaxa: taxa, ...(bps === undefined ? {} : {percentualHipoteticoBps:bps}) }, controle.signal);
      if (id === sequencia.current) setResultado(r);
    } catch (e) {
      if (id === sequencia.current && !controle.signal.aborted)
        setErro(e instanceof Error ? e.message : 'Simulação indisponível.');
    } finally {
      if (id === sequencia.current) setOcupado(false);
    }
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Simulação Split"
        descricao="Consulte a composição retornada pelo servidor, sem registrar uma venda."
      />
      <Aviso>
        O resultado é uma simulação. As regras e parcelas são informadas pelo serviço; não há
        alíquota oficial definida pela interface.
      </Aviso>
      {!servico.simular ? (
        <Estado
          titulo="Simulação ainda não conectada"
          descricao="O contrato precisa definir entrada, taxa e resposta desta consulta."
        />
      ) : (
        <section className="painel">
          <form className="formulario-vertical" onSubmit={enviar}>
            <label className="campo">
              <span>Valor bruto (R$)</span>
              <input
                required
                inputMode="decimal"
                value={valor}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-simulacao-api' : undefined}
                onChange={(e) => {
                  invalidar();
                  setValor(e.target.value);
                }}
              />
            </label>
            <label className="campo">
              <span>Percentual hipotético de tributo (%)</span>
              <input inputMode="decimal" value={percentual} onChange={e=>{invalidar();setPercentual(e.target.value);}} aria-describedby="nota-percentual" />
              <small id="nota-percentual">Opcional. Vazio usa a regra demonstrativa. Não altera regras de vendas nem representa alíquota oficial.</small>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={taxa}
                onChange={(e) => {
                  invalidar();
                  setTaxa(e.target.checked);
                }}
              />
              Solicitar inclusão da taxa
            </label>
            <button className="botao primario" disabled={ocupado}>
              {ocupado ? 'Consultando…' : 'Calcular simulação'}
            </button>
            {erro && (
              <p role="alert" className="erro" id="erro-simulacao-api">
                {erro}
              </p>
            )}
          </form>
        </section>
      )}
      {resultado && (
        <section aria-live="polite">
          <h2>Resultado para a entrada informada</h2>
          <p>{resultado.regra}</p>
          <div className="grade-indicadores">
            <Indicador titulo="BRUTO" valor={resultado.bruto} detalhe="Entrada consultada" />
            <Indicador titulo="TRIBUTO" valor={resultado.tributo} detalhe="Parcela do serviço" />
            <Indicador titulo="TAXA" valor={resultado.taxa} detalhe="Parcela do serviço" />
            <Indicador
              titulo="LÍQUIDO"
              valor={resultado.liquido}
              detalhe="Não incorporado ao caixa"
            />
          </div>
        </section>
      )}
    </>
  );
}
