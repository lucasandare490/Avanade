import { useState } from 'react';
import { moeda } from '../utilitarios/valoresFinanceiros';
import { PainelProjecaoCaixa } from '../componentes/PainelProjecaoCaixa';
import { ComposicaoServidor } from '../componentes/ComposicaoServidor';
import type { ServicoPlanner } from '../tipos';
import { CabecalhoPagina, Estado, Indicador } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
/** Totais pertencem ao servidor, nunca à soma da página de histórico. */
export function TelaResumoFinanceiroApi({
  servico,
  area,
  fusoHorario = 'America/Recife',
}: {
  servico: ServicoPlanner;
  area: 'dashboard' | 'fluxo-caixa';
  fusoHorario?: string;
}) {
  const [revisao, setRevisao] = useState(0);
  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: fusoHorario,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const primeiroDia = `${hoje.slice(0, 7)}-01`;
  const [inicio, setInicio] = useState(primeiroDia),
    [fim, setFim] = useState(hoje);
  const [periodo, setPeriodo] = useState<{ inicio: string; fim: string } | null>({
    inicio: primeiroDia,
    fim: hoje,
  });
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
      {area === 'fluxo-caixa' && servico.projetarCaixa && <PainelProjecaoCaixa servico={servico} />}
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
              setRevisao((v) => v + 1);
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
              {area === 'fluxo-caixa' && estado.dados.semanas && (
                <section className="painel">
                  <h2>Caixa por semana</h2>
                  <p>
                    Semanas de segunda a domingo, limitadas ao período escolhido. Datas sem
                    movimento mantêm o saldo anterior.
                  </p>
                  <div
                    className="tabela-rolavel"
                    role="region"
                    aria-label="Caixa semanal"
                    tabIndex={0}
                  >
                    <table>
                      <thead>
                        <tr>
                          {[
                            'Período',
                            'Saldo inicial',
                            'Entradas líquidas',
                            'Despesas pagas',
                            'Saldo final',
                          ].map((t) => (
                            <th key={t} scope="col">
                              {t}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {estado.dados.semanas.map((w) => (
                          <tr key={w.inicio}>
                            <th scope="row">
                              {w.inicio} a {w.fim}
                            </th>
                            <td>{moeda(w.abertura)}</td>
                            <td>{moeda(w.entradas)}</td>
                            <td>{moeda(w.saidas)}</td>
                            <td>{moeda(w.saldo)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {periodo && area === 'dashboard' && servico.consultarComposicao && (
                <ComposicaoServidor servico={servico} periodo={periodo} revisao={revisao} />
              )}
            </>
          )
        ))}
    </>
  );
}
