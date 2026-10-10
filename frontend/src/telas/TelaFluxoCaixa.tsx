import { exportarRelatorio } from '../utilitarios/exportarRelatorio';
import { usePreferenciaSessao } from '../utilitarios/usePreferenciaSessao';
import type { BaseDemonstracao } from '../tipos';
import {
  Aviso,
  CabecalhoPagina,
  Direcao,
  Estado,
  Indicador,
} from '../componentes/ElementosInterface';
import { dataCurta, dentroPeriodo, moeda, resumir } from '../utilitarios/valoresFinanceiros';
export function TelaFluxoCaixa({
  base,
  permitirExportacao = true,
}: {
  base: BaseDemonstracao;
  permitirExportacao?: boolean;
}) {
  const [inicio, setInicio] = usePreferenciaSessao('caixa-inicio', '2026-10-01'),
    [fim, setFim] = usePreferenciaSessao('caixa-fim', '2026-10-09');
  const invalido = Boolean(inicio && fim && inicio > fim);
  const r = resumir(
    base.operacoes.filter((o) => dentroPeriodo(o.data, inicio, fim)),
    base.despesas.filter((d) => dentroPeriodo(d.data, inicio, fim)),
  );
  const anterior = resumir(
    base.operacoes.filter((o) => Boolean(inicio) && o.data.slice(0, 10) < inicio),
    base.despesas.filter((d) => Boolean(inicio) && d.data < inicio),
  ).saldo;
  const movimentos = [
    ...base.operacoes
      .filter((o) => o.status === 'concluida')
      .map((o) => ({
        id: o.id,
        data: o.data.slice(0, 10),
        descricao: `Venda ${o.id}`,
        valor: o.liquido,
        entrada: true,
      })),
    ...base.despesas.map((d) => ({ ...d, entrada: false })),
  ]
    .filter((m) => dentroPeriodo(m.data, inicio, fim))
    .sort((a, b) => b.data.localeCompare(a.data));
  return (
    <>
      <CabecalhoPagina
        titulo="Fluxo de Caixa"
        descricao="Entradas líquidas e despesas pagas, sem perder a origem dos valores."
      />
      <div className="painel filtros">
        <label className="campo">
          <span>Data inicial</span>
          <input type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label className="campo">
          <span>Data final</span>
          <input type="date" required value={fim} onChange={(e) => setFim(e.target.value)} />
        </label>
        <p className="nota">Saldo inicial geral do cenário: R$ 0,00.</p>
      </div>
      {invalido ? (
        <Estado
          titulo="Confira o período"
          descricao="A data final deve ser posterior ou igual à inicial."
        />
      ) : (
        <>
          <div className="grade-indicadores">
            <Indicador
              titulo="SALDO INICIAL"
              valor={anterior}
              detalhe="Movimentos anteriores ao período"
            />
            <Indicador
              titulo="ENTRADAS LÍQUIDAS"
              valor={r.liquido}
              detalhe="Operações concluídas"
              tom="verde"
            />
            <Indicador titulo="SAÍDAS PAGAS" valor={r.saidas} detalhe="Despesas no período" />
            <Indicador
              titulo="SALDO FINAL"
              valor={anterior + r.saldo}
              detalhe="Inicial + entradas − saídas"
              tom="azul"
            />
          </div>
          <section className="painel">
            <div className="titulo-painel">
              <h2>Movimentações realizadas</h2>
              <span>{movimentos.length} registros</span>
            </div>
            <button
              className="botao secundario"
              disabled={!movimentos.length || !permitirExportacao}
              onClick={() =>
                exportarRelatorio(
                  'caixa',
                  ['Modo', 'Descrição', 'Data', 'Tipo', 'Valor (centavos)'],
                  movimentos.map((m) => [
                    'SIMULADO',
                    m.descricao,
                    m.data,
                    m.entrada ? 'Entrada líquida' : 'Despesa paga',
                    m.valor,
                  ]),
                )
              }
            >
              Exportar movimentos filtrados
            </button>
            {movimentos.length ? (
              <div
                className="tabela-rolavel"
                tabIndex={0}
                role="region"
                aria-label="Movimentações realizadas"
              >
                <table>
                  <thead>
                    <tr>
                      <th>Movimentação</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th className="numero">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentos.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className="alinhado">
                            <Direcao entrada={m.entrada} />
                            {m.entrada ? (
                              <a className="link" href={`#/operacoes/${m.id}`}>
                                {m.descricao}
                              </a>
                            ) : (
                              m.descricao
                            )}
                          </div>
                        </td>
                        <td>{dataCurta(m.data)}</td>
                        <td>{m.entrada ? 'Entrada líquida' : 'Despesa paga'}</td>
                        <td className={`numero ${m.entrada ? 'texto-verde' : ''}`}>
                          {m.entrada ? '+' : '−'} {moeda(m.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Estado titulo="Nenhum movimento neste período" />
            )}
          </section>
        </>
      )}
      <Aviso>
        <strong>Projeção ainda não disponível.</strong> O cálculo do previsto depende da definição
        de saldo inicial, vencimentos e fórmula com o backend. Esta tela mostra apenas o realizado
        demonstrativo.
      </Aviso>
    </>
  );
}
