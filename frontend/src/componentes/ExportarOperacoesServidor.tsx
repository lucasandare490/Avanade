import { useEffect, useRef, useState } from 'react';
import type { ConsultaOperacoes } from '../servicos/contratosConsultas';
import type { ServicoPlanner } from '../tipos';
import { exportarRelatorio } from '../utilitarios/exportarRelatorio';
export function ExportarOperacoesServidor({servico,consulta}: {servico: ServicoPlanner; consulta: ConsultaOperacoes}) {
  const [ocupado,setOcupado]=useState(false),[mensagem,setMensagem]=useState('');
  const atual=useRef<AbortController|null>(null);
  const filtro=JSON.stringify([consulta.busca,consulta.inicio,consulta.fim,consulta.status,consulta.meio]);
  useEffect(()=>{ atual.current?.abort();setOcupado(false);setMensagem('');return ()=>{atual.current?.abort();}; },[filtro]);
  const exportar=async()=>{
    if(atual.current && !atual.current.signal.aborted && ocupado) return;
    const pedido=new AbortController();atual.current=pedido;setOcupado(true);setMensagem('');
    try {
      const r=await servico.exportarOperacoes!(consulta,pedido.signal);
      if(pedido.signal.aborted) return;
      exportarRelatorio(`operacoes-${consulta.inicio}-${consulta.fim}`,r.colunas,r.linhas);
      setMensagem(`${r.total} operações exportadas. Valores em centavos BRL; documento sem valor fiscal.`);
    } catch(e) {if(!pedido.signal.aborted) setMensagem(e instanceof Error?e.message:'Exportação indisponível.');}
    finally {if(!pedido.signal.aborted) setOcupado(false);}
  };
  return <div><p className="nota">CSV de todo o filtro, até 2.000 operações. Selecione as duas datas. Valores em centavos BRL.</p>
    <button className="botao secundario" type="button" onClick={exportar} disabled={ocupado || !consulta.inicio || !consulta.fim || consulta.inicio>consulta.fim}>{ocupado?'Preparando arquivo…':'Exportar filtro completo (CSV)'}</button>
    <p role="status">{mensagem}</p></div>;
}
