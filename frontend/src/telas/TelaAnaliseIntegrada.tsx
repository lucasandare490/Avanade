import { useState } from 'react';
import { PainelTendencias } from '../componentes/PainelTendencias';
import type { ServicoPlanner } from '../tipos';
import { Aviso, CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
export function TelaAnaliseIntegrada({ servico }: { servico: ServicoPlanner }) {
  const [inicio, setInicio] = useState(''),
    [fim, setFim] = useState(''),
    [pedido, setPedido] = useState<{ inicio: string; fim: string } | null>(null);
  const consulta = useConsultaRemota(JSON.stringify(pedido), async (sinal) => {
    if (!pedido) return null;
    if (!servico.explicar) throw new Error('A explicação ainda não foi conectada ao servidor.');
    return servico.explicar(pedido, sinal);
  });
  const tendencias = useConsultaRemota(JSON.stringify(pedido), async (sinal) => {
    if (!pedido || !servico.consultarTendencias) return null;
    return servico.consultarTendencias(pedido, sinal);
  });
  const alterar = (acao: () => void) => {
    setPedido(null);
    acao();
  };
  return (
    <>
      <CabecalhoPagina
        titulo="Análise com IA"
        descricao="Explicação do período solicitado, sem alterar os registros financeiros."
      />
      <Aviso>
        Explicação demonstrativa baseada nos registros do período. Nenhuma ação financeira é
        executada.
      </Aviso>
      {!servico.explicar ? (
        <Estado
          titulo="Explicação ainda não conectada"
          descricao="Defina o contrato e o provedor antes de ativar esta capacidade."
        />
      ) : (
        <section className="painel">
          <form
            className="filtros"
            onSubmit={(e) => {
              e.preventDefault();
              if (inicio && fim && inicio <= fim) {
                if (pedido?.inicio === inicio && pedido.fim === fim) { consulta.recarregar(); tendencias.recarregar(); }
                else setPedido({ inicio, fim });
              }
            }}
          >
            <label className="campo">
              <span>Análise de</span>
              <input
                type="date"
                required
                value={inicio}
                onChange={(e) => alterar(() => setInicio(e.target.value))}
              />
            </label>
            <label className="campo">
              <span>Análise até</span>
              <input
                type="date"
                required
                min={inicio || undefined}
                value={fim}
                onChange={(e) => alterar(() => setFim(e.target.value))}
              />
            </label>
            <button className="botao primario" disabled={Boolean(pedido) && consulta.carregando}>
              Solicitar explicação
            </button>
          </form>
        </section>
      )}
      {pedido && servico.consultarTendencias && (
        tendencias.carregando ? <Estado titulo="Consultando tendências" carregando /> :
        tendencias.erro ? <Estado titulo="Comparação indisponível" descricao={tendencias.erro}
          acao={<button className="botao secundario" onClick={tendencias.recarregar}>Tentar comparação novamente</button>} /> :
        tendencias.dados ? <PainelTendencias comparacao={tendencias.dados} /> : null
      )}
      {pedido && !servico.consultarTendencias && !consulta.carregando && !consulta.erro && consulta.dados?.tendencias && (
        <PainelTendencias comparacao={consulta.dados.tendencias} />
      )}
      {pedido &&
        !servico.consultarTendencias &&
        !consulta.carregando &&
        !consulta.erro &&
        consulta.dados &&
        !consulta.dados.tendencias && (
          <Estado titulo="Comparações de tendências ainda não fornecidas pelo servidor" />
        )}
      {pedido &&
        (consulta.carregando ? (
          <Estado titulo="Preparando explicação" carregando />
        ) : consulta.erro ? (
          <Estado
            titulo="Explicação indisponível"
            descricao={consulta.erro}
            acao={
              <button className="botao secundario" onClick={consulta.recarregar}>
                Tentar novamente
              </button>
            }
          />
        ) : consulta.dados?.texto ? (
          <section className="painel">
            <h2>
              Período: {pedido.inicio} a {pedido.fim}
            </h2>
            <p className="texto-preservado">{consulta.dados.texto}</p>
            {consulta.dados.detalhes && <>
              <p><strong>{consulta.dados.detalhes.atencao === 'saldo-negativo' ? 'Atenção: saldo realizado negativo' : consulta.dados.detalhes.atencao === 'saldo-zero' ? 'Saldo realizado zerado' : 'Saldo realizado positivo'}</strong></p>
              <ul>{consulta.dados.detalhes.recomendacoes.map((item,i)=><li key={i}>{item}</li>)}</ul>
              {consulta.dados.detalhes.limitacoes.map((item,i)=><p className="nota" key={i}>{item}</p>)}
            </>}
            <p className="nota">
              Origem:{' '}
              {consulta.dados.origem === 'demonstrativa'
                ? 'provedor demonstrativo do servidor'
                : 'serviço de explicação'}
              . A explicação não executa ações financeiras.
            </p>
          </section>
        ) : (
          <Estado titulo="Dados insuficientes para explicar este período" />
        ))}
      <a className="botao secundario" href="#/fluxo-caixa">
        Continuar consultando o caixa
      </a>
    </>
  );
}
