import { useState } from 'react';
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
        O servidor deve buscar os dados de origem. Esta tela envia apenas o período, sem totais
        editáveis como fonte financeira.
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
                if (pedido?.inicio === inicio && pedido.fim === fim) consulta.recarregar();
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
