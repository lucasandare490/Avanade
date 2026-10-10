import { useRef, useState } from 'react';
import type { ServicoPlanner } from '../tipos';
import type { ConsultaOperacoes } from '../servicos/contratosConsultas';
import { CabecalhoPagina, Estado, TabelaOperacoes } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
import { moeda } from '../utilitarios/valoresFinanceiros';
import { Status } from '../componentes/ElementosInterface';
import { usePreferenciaSessao } from '../utilitarios/usePreferenciaSessao';
export function TelaOperacoesRemotas({ servico }: { servico: ServicoPlanner }) {
  const [busca, setBusca] = usePreferenciaSessao('api-busca', ''),
    [inicio, setInicio] = usePreferenciaSessao('api-inicio', ''),
    [fim, setFim] = usePreferenciaSessao('api-fim', '');
  const [status, setStatus] = usePreferenciaSessao('api-status', ''),
    [meio, setMeio] = usePreferenciaSessao('api-meio', ''),
    [paginaTexto, setPagina] = usePreferenciaSessao('api-pagina', '1');
  const [versao, setVersao] = useState(0);
  const consulta: ConsultaOperacoes = {
    busca,
    inicio,
    fim,
    status: status as ConsultaOperacoes['status'],
    meio: meio as ConsultaOperacoes['meio'],
    pagina: Math.max(1, Number(paginaTexto) || 1),
    tamanho: 20,
  };
  const invalido = Boolean(inicio && fim && inicio > fim);
  const estado = useConsultaRemota(JSON.stringify([consulta, versao]), async (sinal) => {
    if (invalido) throw new Error('A data final deve ser igual ou posterior à inicial.');
    if (!servico.consultarOperacoes)
      throw new Error('A consulta paginada ainda não foi configurada no contrato da API.');
    return servico.consultarOperacoes(consulta, sinal);
  });
  const filtro = (definir: (v: string) => void, valor: string) => {
    definir(valor);
    setPagina('1');
  };
  return (
    <>
      <CabecalhoPagina
        titulo="Operações"
        descricao="Consulta paginada do servidor, sem somar uma página como total geral."
      />
      <section className="painel">
        <form
          className="filtros"
          onSubmit={(e) => {
            e.preventDefault();
            setVersao((v) => v + 1);
          }}
        >
          <label className="campo">
            <span>Buscar operação</span>
            <input value={busca} onChange={(e) => filtro(setBusca, e.target.value)} />
          </label>
          <label className="campo">
            <span>De</span>
            <input
              type="date"
              value={inicio}
              onChange={(e) => filtro(setInicio, e.target.value)}
              aria-invalid={invalido}
            />
          </label>
          <label className="campo">
            <span>Até</span>
            <input
              type="date"
              value={fim}
              onChange={(e) => filtro(setFim, e.target.value)}
              aria-invalid={invalido}
            />
          </label>
          <label className="campo">
            <span>Status</span>
            <select value={status} onChange={(e) => filtro(setStatus, e.target.value)}>
              <option value="">Todos</option>
              <option value="concluida">Concluída</option>
              <option value="pendente">Pendente</option>
              <option value="falha">Falha parcial</option>
            </select>
          </label>
          <label className="campo">
            <span>Pagamento</span>
            <select value={meio} onChange={(e) => filtro(setMeio, e.target.value)}>
              <option value="">Todos</option>
              <option>PIX</option>
              <option>Débito</option>
              <option>Crédito</option>
            </select>
          </label>
          <button className="botao secundario">Atualizar consulta</button>
          <button
            type="button"
            className="botao secundario"
            onClick={() => {
              setBusca('');
              setInicio('');
              setFim('');
              setStatus('');
              setMeio('');
              setPagina('1');
            }}
          >
            Limpar filtros
          </button>
        </form>
        {estado.carregando ? (
          <Estado titulo="Consultando operações" carregando />
        ) : estado.erro ? (
          <Estado
            titulo="Consulta indisponível"
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
              {estado.dados.itens.length ? (
                <TabelaOperacoes operacoes={estado.dados.itens} demonstrativo={false} />
              ) : (
                <Estado titulo="Nenhuma operação encontrada" />
              )}
              <div className="paginacao">
                <span>
                  {estado.dados.total} operações no filtro · página {estado.dados.pagina}
                </span>
                <div>
                  <button
                    className="botao secundario"
                    disabled={consulta.pagina <= 1}
                    onClick={() => setPagina(String(consulta.pagina - 1))}
                  >
                    Anterior
                  </button>
                  <button
                    className="botao secundario"
                    disabled={consulta.pagina * consulta.tamanho >= estado.dados.total}
                    onClick={() => setPagina(String(consulta.pagina + 1))}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )
        )}
        <p className="nota">
          Exportação completa depende do contrato do servidor e não é substituída por exportação
          desta página.
        </p>
      </section>
    </>
  );
}
export function TelaDetalheRemoto({
  id,
  servico,
  permitirRetomada,
  aposRetomar,
}: {
  id: string;
  servico: ServicoPlanner;
  permitirRetomada: boolean;
  aposRetomar: () => Promise<void>;
}) {
  const [ocupado, setOcupado] = useState(false),
    [mensagem, setMensagem] = useState('');
  const bloqueio = useRef(false);
  const consulta = useConsultaRemota(id, async (sinal) => {
    if (!servico.consultarOperacao) throw new Error('Consulta do detalhe não configurada.');
    return servico.consultarOperacao(id, sinal);
  });
  if (consulta.carregando) return <Estado titulo="Consultando operação" carregando />;
  if (consulta.erro)
    return (
      <Estado
        titulo="Não foi possível abrir a operação"
        descricao={consulta.erro}
        acao={
          <button className="botao secundario" onClick={consulta.recarregar}>
            Tentar novamente
          </button>
        }
      />
    );
  const o = consulta.dados;
  if (!o) return <Estado titulo="Operação não encontrada" />;
  async function retomar() {
    if (bloqueio.current || !permitirRetomada) return;
    bloqueio.current = true;
    setOcupado(true);
    setMensagem('');
    try {
      await servico.reprocessar(id);
      consulta.recarregar();
      await aposRetomar();
      setMensagem('Solicitação processada. Consulte o estado atualizado da operação.');
    } catch {
      setMensagem(
        'Não foi possível confirmar a retomada. Atualize a operação antes de tentar novamente.',
      );
    } finally {
      bloqueio.current = false;
      setOcupado(false);
    }
  }
  return (
    <>
      <a href="#/operacoes" className="voltar">
        Voltar às operações
      </a>
      <CabecalhoPagina
        titulo={o.id}
        descricao={`${o.meio} · ${new Date(o.data).toLocaleString('pt-BR')}`}
        acao={<Status valor={o.status} />}
      />
      <section className="painel">
        <h2>Valores informados pelo servidor</h2>
        <p>Pagamento: {o.pagamento ?? 'confirmação não informada'}</p>
        <p>Regra histórica: {o.regraHistorica ?? 'não disponibilizada'}</p>

        <dl>
          <dt>Bruto</dt>
          <dd>{moeda(o.bruto)}</dd>
          <dt>Tributo</dt>
          <dd>{moeda(o.tributo)}</dd>
          <dt>Taxa</dt>
          <dd>{moeda(o.taxa)}</dd>
          <dt>Líquido da operação</dt>
          <dd>{moeda(o.liquido)}</dd>
        </dl>
        <p className="nota">
          O estado geral não informa sozinho a confirmação de cada parcela nem comprova
          recolhimento. Destinos e regras históricas serão apresentados quando fornecidos pelo
          contrato.
        </p>
      </section>
      <section className="painel">
        {o.parcelas && (
          <>
            <h2>Parcelas informadas</h2>
            {o.parcelas.map((p) => (
              <div className="linha-parcela" key={p.id}>
                <div>
                  <strong>{p.titulo}</strong>
                  <p>{p.destino}</p>
                  <Status valor={p.status} />
                </div>
                <b>{moeda(p.valor)}</b>
              </div>
            ))}
          </>
        )}
        <h2>Histórico da operação</h2>
        {o.eventos.length ? (
          <ol className="linha-tempo">
            {o.eventos.map((evento, i) => (
              <li key={i}>
                <strong>{evento.descricao}</strong>
                <time dateTime={evento.instante}>
                  {new Date(evento.instante).toLocaleString('pt-BR')}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p>Nenhum evento disponibilizado.</p>
        )}
      </section>
      {o.status === 'falha' && permitirRetomada && (
        <button className="botao primario" disabled={ocupado} onClick={() => void retomar()}>
          {ocupado ? 'Solicitando retomada…' : 'Solicitar retomada'}
        </button>
      )}
      {mensagem && (
        <p role="status" className="aviso">
          {mensagem}
        </p>
      )}
    </>
  );
}
