import { useState } from 'react';
import type { ServicoPlanner } from '../tipos';
import { CabecalhoPagina, Estado, Indicador } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
/** Totais pertencem ao servidor, nunca à soma da página de histórico. */
export function TelaResumoIntegrado({
  servico,
  area,
}: {
  servico: ServicoPlanner;
  area: 'dashboard' | 'fluxo-caixa';
}) {
  const [inicio, setInicio] = useState(''),
    [fim, setFim] = useState('');
  const [periodo, setPeriodo] = useState<{ inicio: string; fim: string } | null>(null);
  const estado = useConsultaRemota(JSON.stringify([area, periodo]), async (sinal) => {
    if (!periodo) return null;
    if (!servico.consultarResumo)
      throw new Error('A consulta de totais ainda não foi configurada.');
    return servico.consultarResumo(area, periodo, sinal);
  });
  return (
    <>
      <CabecalhoPagina
        titulo={area === 'dashboard' ? 'Dashboard' : 'Fluxo de caixa'}
        descricao="Valores consolidados informados pelo serviço financeiro."
      />
      {!servico.consultarResumo ? (
        <Estado
          titulo="Resumo financeiro ainda não conectado"
          descricao="O contrato precisa informar os totais e a regra de reconhecimento do período."
        />
      ) : (
        <section className="painel">
          <form
            className="filtros"
            onSubmit={(e) => {
              e.preventDefault();
              if (inicio && fim && inicio <= fim) {
                if (periodo?.inicio === inicio && periodo.fim === fim) estado.recarregar();
                else setPeriodo({ inicio, fim });
              }
            }}
          >
            <label className="campo">
              <span>De</span>
              <input
                type="date"
                required
                value={inicio}
                onChange={(e) => {
                  setInicio(e.target.value);
                  setPeriodo(null);
                }}
              />
            </label>
            <label className="campo">
              <span>Até</span>
              <input
                type="date"
                required
                min={inicio || undefined}
                value={fim}
                onChange={(e) => {
                  setFim(e.target.value);
                  setPeriodo(null);
                }}
              />
            </label>
            <button className="botao primario" disabled={Boolean(periodo) && estado.carregando}>
              Consultar período
            </button>
          </form>
        </section>
      )}
      {periodo &&
        (estado.carregando ? (
          <Estado titulo="Consultando resumo" carregando />
        ) : estado.erro ? (
          <Estado
            titulo="Resumo indisponível"
            descricao={estado.erro}
            acao={
              <button className="botao secundario" onClick={estado.recarregar}>
                Tentar novamente
              </button>
            }
          />
        ) : (
          estado.dados && (
            <>
              <p role="status">
                Período {periodo.inicio} a {periodo.fim} · atualização{' '}
                {new Date(estado.dados.atualizadoEm).toLocaleString('pt-BR')}
              </p>
              {estado.dados.indicadores.length ? (
                <div className="grade-indicadores">
                  {estado.dados.indicadores.map((i) => (
                    <Indicador key={i.id} titulo={i.titulo} valor={i.valor} detalhe={i.descricao} />
                  ))}
                </div>
              ) : (
                <Estado titulo="Sem indicadores disponíveis neste período" />
              )}
            </>
          )
        ))}
    </>
  );
}
