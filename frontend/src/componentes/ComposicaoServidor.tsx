import type { ServicoPlanner } from '../tipos';
import type { PeriodoConsulta } from '../servicos/contratosConsultas';
import { Estado, Indicador } from './ElementosInterface';
import { moeda } from '../utilitarios/valoresFinanceiros';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
export function ComposicaoServidor({servico, periodo, revisao}: {servico: ServicoPlanner; periodo: PeriodoConsulta; revisao: number}) {
  const consulta = useConsultaRemota(JSON.stringify([periodo,revisao]), sinal => servico.consultarComposicao!(periodo,sinal));
  if (consulta.carregando) return <Estado titulo="Consultando composição das vendas" carregando />;
  if (consulta.erro) return <Estado titulo="Composição indisponível" descricao={consulta.erro} acao={<button className="botao secundario" onClick={consulta.recarregar}>Repetir consulta da composição</button>} />;
  if (!consulta.dados) return null;
  const {totais,dias} = consulta.dados;
  return <section className="painel" aria-label="Composição das vendas concluídas">
    <h2>Composição das vendas concluídas</h2>
    <p>{totais.quantidade} vendas concluídas no período. Pagamentos e tributos demonstrativos.</p>
    <div className="grade-indicadores">{([['bruto','Valor bruto'],['tributo','Tributos'],['taxa','Taxas'],['liquido','Valor líquido']] as const).map(([chave,titulo]) => <Indicador key={chave} titulo={titulo} valor={totais[chave]} detalhe="Agregado do banco por data de conclusão." />)}</div>
    <div style={{overflowX:'auto'}} tabIndex={0} role="region" aria-label="Composição diária">
      <table><caption>Valores por dia de conclusão no fuso da loja</caption>
        <thead><tr><th scope="col">Data</th><th scope="col">Bruto</th><th scope="col">Tributos</th><th scope="col">Taxas</th><th scope="col">Líquido</th></tr></thead>
        <tbody>{dias.map(d => <tr key={d.data}><th scope="row">{d.data.split('-').reverse().join('/')}</th><td>{moeda(d.bruto)}</td><td>{moeda(d.tributo)}</td><td>{moeda(d.taxa)}</td><td>{moeda(d.liquido)}</td></tr>)}</tbody>
      </table>
    </div>
  </section>;
}
