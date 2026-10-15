import {useState} from 'react';
import type {ServicoPlanner} from '../tipos';
import {CabecalhoPagina,Estado} from '../componentes/ElementosInterface';
import {useConsultaRemota} from '../utilitarios/useConsultaRemota';
import {exportarRelatorio} from '../utilitarios/exportarRelatorio';
type Pedido={tipo:'sales'|'expenses'|'taxes';inicio:string;fim:string};
export function TelaRelatoriosIntegrados({servico}:{servico:ServicoPlanner}){
 const [tipo,setTipo]=useState<Pedido['tipo']>('sales'),[inicio,setInicio]=useState(''),[fim,setFim]=useState(''),[pedido,setPedido]=useState<Pedido|null>(null);
 const [pagina,setPagina]=useState(1);
 const consulta=useConsultaRemota(JSON.stringify(pedido),sinal=>pedido&&servico.consultarRelatorio?servico.consultarRelatorio(pedido.tipo,pedido,sinal):Promise.resolve(null));
 function alterar(acao:()=>void){acao();setPedido(null);setPagina(1);}
 const dados=consulta.dados;
 return <><CabecalhoPagina titulo="Relatórios" descricao="Registros do estabelecimento no período selecionado. Valores monetários em centavos de real."/>
 <section className="painel"><form className="filtros" onSubmit={e=>{e.preventDefault();if(inicio&&fim&&inicio<=fim){setPedido({tipo,inicio,fim});setPagina(1);consulta.recarregar();}}}>
 <label className="campo"><span>Tipo de relatório</span><select value={tipo} onChange={e=>alterar(()=>setTipo(e.target.value as Pedido['tipo']))}><option value="sales">Vendas</option><option value="expenses">Despesas pagas</option><option value="taxes">Tributos e composição</option></select></label>
 <label className="campo"><span>Data inicial</span><input type="date" required value={inicio} onChange={e=>alterar(()=>setInicio(e.target.value))}/></label>
 <label className="campo"><span>Data final</span><input type="date" required min={inicio||undefined} value={fim} onChange={e=>alterar(()=>setFim(e.target.value))}/></label>
 <button className="botao primario" disabled={!!pedido&&consulta.carregando}>Consultar relatório</button></form>
 <p className="nota">Vendas usam a data de criação; despesas, a data de pagamento; tributos, a conclusão do split. O filtro segue o fuso da loja. Separação demonstrativa, sem comprovação de recolhimento fiscal.</p></section>
 {pedido&&(consulta.carregando?<Estado titulo="Preparando relatório" carregando/>:consulta.erro?<Estado titulo="Não foi possível gerar o relatório" descricao={consulta.erro} acao={<button className="botao secundario" onClick={consulta.recarregar}>Tentar novamente</button>}/>:dados&&<section className="painel"><p role="status">{dados.total} registros encontrados.</p>{dados.total>0?<><button className="botao secundario" onClick={()=>exportarRelatorio(`relatorio-${pedido.tipo}-${pedido.inicio}-${pedido.fim}`,dados.colunas,dados.linhas)}>Baixar relatório completo (CSV)</button><div className="tabela-rolavel" role="region" aria-label="Resultado do relatório" tabIndex={0}><table><thead><tr>{dados.colunas.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{dados.linhas.slice((pagina-1)*20,pagina*20).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div><nav aria-label="Páginas do relatório"><button className="botao secundario" disabled={pagina===1} onClick={()=>setPagina(p=>p-1)}>Anterior</button><span> Página {pagina} de {Math.ceil(dados.total/20)} </span><button className="botao secundario" disabled={pagina*20>=dados.total} onClick={()=>setPagina(p=>p+1)}>Próxima</button></nav></>:<p>Nenhum registro neste período.</p>}</section>)}
 </>;
}
