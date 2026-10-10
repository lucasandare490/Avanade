import { descreverVariacao, type ComparacaoTendencias } from '../utilitarios/tendencias';
import { moeda } from '../utilitarios/valoresFinanceiros';
export function PainelTendencias({ comparacao }: { comparacao: ComparacaoTendencias }) {
  return (
    <section className="painel" aria-label="Comparação de tendências">
      <h2>Tendências do período</h2>
      <p>
        Comparação com {comparacao.anterior.inicio} a {comparacao.anterior.fim}, intervalo anterior
        de mesma duração.
      </p>
      <p className="nota">
        Comparação histórica, sem previsão. Aumento de despesas não significa melhora. Ausência de
        registros não é interpretada como zero.
      </p>
      <div
        style={{ overflowX: 'auto' }}
        tabIndex={0}
        role="region"
        aria-label="Indicadores comparados"
      >
        <table>
          <caption>Valores em reais e variação frente ao período anterior</caption>
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th scope="col">Anterior</th>
              <th scope="col">Selecionado</th>
              <th scope="col">Variação</th>
            </tr>
          </thead>
          <tbody>
            {comparacao.indicadores.map((i, indice) => (
              <tr key={indice}>
                <th scope="row">{i.titulo}</th>
                <td>{i.anterior === null ? 'Sem dados' : moeda(i.anterior)}</td>
                <td>{i.atual === null ? 'Sem dados' : moeda(i.atual)}</td>
                <td>{descreverVariacao(i.atual, i.anterior)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
