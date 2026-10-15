import {useState,type FormEvent} from 'react';
import type {ServicoPlanner} from '../tipos';
import {useConsultaRemota} from '../utilitarios/useConsultaRemota';
export function PainelEstabelecimento({servico,atualizar}:{servico:ServicoPlanner;atualizar?:(nome:string)=>void}){
 const consulta=useConsultaRemota('perfil-loja',sinal=>servico.consultarLoja!(sinal));
 const [mensagem,setMensagem]=useState(''),[ocupado,setOcupado]=useState(false);
 async function salvar(e:FormEvent<HTMLFormElement>){e.preventDefault();if(ocupado)return;const nome=String(new FormData(e.currentTarget).get('nome')).trim();if(!nome){setMensagem('Informe o nome da loja.');return;}setOcupado(true);setMensagem('');
 try{const r=await servico.salvarNomeLoja!(nome);atualizar?.(r.nome);consulta.recarregar();setMensagem('Nome do estabelecimento atualizado.');}
 catch{setMensagem('Não foi possível confirmar a alteração. Consulte novamente os dados antes de repetir.');}
 finally{setOcupado(false);}}
 return <section className="painel"><h2>Dados do estabelecimento</h2>{consulta.carregando?<p role="status">Consultando estabelecimento…</p>:consulta.erro?<p role="alert">{consulta.erro}<button className="botao secundario" onClick={consulta.recarregar}>Consultar novamente</button></p>:consulta.dados&&<form key={consulta.dados.nome} className="formulario-vertical" onSubmit={salvar}><label className="campo"><span>Nome da loja</span><input name="nome" required maxLength={120} defaultValue={consulta.dados.nome} disabled={!consulta.dados.podeEditar||ocupado}/></label><p>Fuso de referência: {consulta.dados.fuso}. Alterar o nome não muda os registros financeiros.</p>{consulta.dados.podeEditar&&servico.salvarNomeLoja&&<button className="botao primario" disabled={ocupado}>{ocupado?'Salvando…':'Salvar nome da loja'}</button>}</form>}{mensagem&&<p role="status">{mensagem}</p>}</section>;
}
