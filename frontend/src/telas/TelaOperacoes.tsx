import { exportarRelatorio } from '../utilitarios/exportarRelatorio';
import { useRef, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import {
  Aviso,
  CabecalhoPagina,
  Estado,
  Indicador,
  SeloSimulado,
  Status,
  TabelaOperacoes,
} from '../componentes/ElementosInterface';
import type { Operacao, StatusOperacao } from '../tipos';
import { dentroPeriodo, moeda } from '../utilitarios/valoresFinanceiros';
import { usePreferenciaSessao } from '../utilitarios/usePreferenciaSessao';
export function TelaOperacoes({
  operacoes,
  permitirExportacao = true,
}: {
  operacoes: Operacao[];
  permitirExportacao?: boolean;
}) {
  const [busca, setBusca] = usePreferenciaSessao('operacoes-busca', ''),
    [status, setStatus] = usePreferenciaSessao('operacoes-status', ''),
    [meio, setMeio] = usePreferenciaSessao('operacoes-meio', ''),
    [ordem, setOrdem] = usePreferenciaSessao('operacoes-ordem', 'recentes'),
    [inicio, setInicio] = usePreferenciaSessao('operacoes-inicio', ''),
    [fim, setFim] = usePreferenciaSessao('operacoes-fim', ''),
    [paginaTexto, definirPagina] = usePreferenciaSessao('operacoes-pagina', '1');
  const pagina = Math.max(1, Math.floor(Number(paginaTexto)) || 1);
  const setPagina = (p: number) => definirPagina(String(p));
  const invalido = Boolean(inicio && fim && inicio > fim);
  const filtradas = operacoes.filter(
    (o) =>
      !invalido &&
      o.id.toLowerCase().includes(busca.toLowerCase()) &&
      (!status || o.status === status) &&
      (!meio || o.meio === meio) &&
      dentroPeriodo(o.data, inicio, fim),
  );
  filtradas.sort((a, b) =>
    ordem === 'maior'
      ? b.bruto - a.bruto
      : ordem === 'menor'
        ? a.bruto - b.bruto
        : ordem === 'antigas'
          ? a.data.localeCompare(b.data)
          : b.data.localeCompare(a.data),
  );
  const paginas = Math.max(1, Math.ceil(filtradas.length / 8)),
    atual = Math.min(pagina, paginas);
  function alterar(acao: () => void) {
    acao();
    setPagina(1);
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Operações"
        descricao="Consulte o caminho de cada valor, da venda ao líquido."
        acao={<SeloSimulado />}
      />
      <section className="painel">
        <button
          className="botao secundario"
          disabled={!filtradas.length || !permitirExportacao}
          onClick={() =>
            exportarRelatorio(
              'operacoes',
              [
                'Modo',
                'Operação',
                'Data',
                'Pagamento',
                'Bruto (centavos)',
                'Tributo (centavos)',
                'Taxa (centavos)',
                'Líquido (centavos)',
                'Status',
              ],
              filtradas.map((o) => [
                'SIMULADO',
                o.id,
                o.data,
                o.meio,
                o.bruto,
                o.tributo,
                o.taxa,
                o.liquido,
                o.status,
              ]),
            )
          }
        >
          Exportar consulta demonstrativa
        </button>
        <p className="nota">
          O arquivo contém todas as operações do filtro, não apenas esta página. Valores em
          centavos; não é documento fiscal.
        </p>
        <div className="filtros">
          <label className="campo">
            <span>Meio de pagamento</span>
            <select value={meio} onChange={(e) => alterar(() => setMeio(e.target.value))}>
              <option value="">Todos</option>
              <option>PIX</option>
              <option>Débito</option>
              <option>Crédito</option>
            </select>
          </label>
          <label className="campo">
            <span>Ordenar operações</span>
            <select value={ordem} onChange={(e) => alterar(() => setOrdem(e.target.value))}>
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
              <option value="maior">Maior valor bruto</option>
              <option value="menor">Menor valor bruto</option>
            </select>
          </label>
          <label className="campo busca">
            <span>Buscar operação</span>
            <div>
              <Search size={17} />
              <input
                value={busca}
                placeholder="Ex.: OP-0184"
                onChange={(e) => alterar(() => setBusca(e.target.value))}
              />
            </div>
          </label>
          <label className="campo">
            <span>Status</span>
            <select value={status} onChange={(e) => alterar(() => setStatus(e.target.value))}>
              <option value="">Todos os status</option>
              <option value="concluida">Concluída</option>
              <option value="pendente">Pendente</option>
              <option value="falha">Falha parcial</option>
            </select>
          </label>
          <label className="campo">
            <span>De</span>
            <input
              type="date"
              value={inicio}
              onChange={(e) => alterar(() => setInicio(e.target.value))}
            />
          </label>
          <label className="campo">
            <span>Até</span>
            <input
              type="date"
              value={fim}
              onChange={(e) => alterar(() => setFim(e.target.value))}
            />
          </label>
          <button
            className="botao secundario"
            onClick={() => {
              setBusca('');
              setStatus('');
              setMeio('');
              setOrdem('recentes');
              setInicio('');
              setFim('');
              setPagina(1);
            }}
          >
            Limpar filtros
          </button>
        </div>
        {invalido && (
          <p className="erro" role="alert">
            A data final deve ser igual ou posterior à inicial.
          </p>
        )}
        {filtradas.length ? (
          <TabelaOperacoes operacoes={filtradas.slice((atual - 1) * 8, atual * 8)} />
        ) : (
          <Estado
            titulo={operacoes.length ? 'Nenhuma operação encontrada' : 'Ainda não há operações'}
            descricao="Ajuste a busca ou limpe os filtros para ver todas as operações."
          />
        )}
        <div className="paginacao">
          <span>
            {filtradas.length} {filtradas.length === 1 ? 'operação' : 'operações'} · página {atual}{' '}
            de {paginas}
          </span>
          <div>
            <button
              className="botao secundario"
              disabled={atual === 1}
              onClick={() => setPagina(atual - 1)}
            >
              Anterior
            </button>
            <button
              className="botao secundario"
              disabled={atual === paginas}
              onClick={() => setPagina(atual + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
export function TelaDetalheOperacao({
  operacao,
  reprocessar,
  permitirRetomada = true,
}: {
  operacao: Operacao | undefined;
  reprocessar: (id: string) => Promise<void>;
  permitirRetomada?: boolean;
}) {
  const bloqueio = useRef(false);
  const [ocupado, setOcupado] = useState(false),
    [mensagem, setMensagem] = useState('');
  if (!operacao)
    return (
      <Estado
        titulo="Operação não encontrada"
        descricao="Verifique o endereço ou volte ao histórico."
        acao={
          <a className="botao primario" href="#/operacoes">
            Voltar às operações
          </a>
        }
      />
    );
  const o = operacao;
  async function retomar() {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setOcupado(true);
    setMensagem('');
    try {
      await reprocessar(o.id);
      setMensagem('Retomada demonstrativa concluída. Valores atualizados no painel.');
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Não foi possível retomar.');
    } finally {
      bloqueio.current = false;
      setOcupado(false);
    }
  }
  const parcelas: [string, number, StatusOperacao][] = [
    ['Tributo · destino simulado', o.tributo, o.status === 'falha' ? 'concluida' : o.status],
    ['Taxa · processamento simulado', o.taxa, o.status === 'falha' ? 'pendente' : o.status],
    ['Líquido · estabelecimento', o.liquido, o.status === 'falha' ? 'pendente' : o.status],
  ];
  return (
    <>
      <a className="voltar" href="#/operacoes">
        <ArrowLeft size={16} />
        Voltar às operações
      </a>
      <CabecalhoPagina
        titulo={o.id}
        descricao={`Pagamento ${o.meio} · ${new Date(o.data).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })}`}
        acao={<Status valor={o.status} />}
      />
      <Aviso>
        Operação simulada. Pagamento confirmado no cenário de teste; nenhum valor foi transferido.
      </Aviso>
      <button className="botao secundario nao-imprimir" onClick={() => window.print()}>
        Imprimir comprovante demonstrativo
      </button>
      <p className="nota">
        Comprovante sem valor fiscal, sem prova de recolhimento ou transferência real.
      </p>
      <div className="grade-indicadores">
        <Indicador titulo="VALOR BRUTO" valor={o.bruto} detalhe="Total da venda" tom="azul" />
        <Indicador
          titulo="TRIBUTO"
          valor={o.tributo}
          detalhe="Regra histórica demo · 10%"
          tom="amarelo"
        />
        <Indicador titulo="TAXA" valor={o.taxa} detalhe="Regra histórica demo · 2%" />
        <Indicador
          titulo={o.status === 'concluida' ? 'LÍQUIDO CONFIRMADO' : 'LÍQUIDO PREVISTO'}
          valor={o.liquido}
          detalhe={
            o.status === 'concluida'
              ? 'Incluído no caixa demonstrativo'
              : 'Ainda não incluído no caixa'
          }
          tom="verde"
        />
      </div>
      <div className="grade-dupla">
        <section className="painel">
          <div className="titulo-painel">
            <h2>Destino das parcelas</h2>
            <SeloSimulado />
          </div>
          {parcelas.map(([nome, valor, status]) => (
            <div className="linha-parcela" key={nome}>
              <div>
                <strong>{nome}</strong>
                <Status valor={status} />
              </div>
              <b>{moeda(valor)}</b>
            </div>
          ))}
          <p className="nota bloco">
            Bruto = tributo + taxa + líquido. Os percentuais pertencem apenas a este exemplo.
          </p>
        </section>
        <section className="painel">
          <h2>Rastreabilidade da operação</h2>
          <ol className="linha-tempo">
            {o.eventos.map((e, i) => (
              <li key={i}>
                <strong>{e.descricao}</strong>
                <small>
                  {new Date(e.instante).toLocaleTimeString('pt-BR', {
                    timeZone: 'America/Fortaleza',
                  })}
                </small>
              </li>
            ))}
          </ol>
        </section>
      </div>
      {o.status === 'falha' && permitirRetomada && (
        <section className="painel">
          <h2>Retomar parcelas pendentes</h2>
          <p>
            A parcela tributária já foi confirmada neste cenário. A retomada simula apenas as
            parcelas restantes.
          </p>
          <button className="botao primario" disabled={ocupado} onClick={retomar}>
            {ocupado ? 'Retomando…' : 'Retomar simulação'}
          </button>
        </section>
      )}
      {o.status === 'pendente' && (
        <Aviso>
          Este registro demonstra uma confirmação pendente. Nenhuma entrada líquida foi reconhecida.
          A conclusão automática depende da futura API.
        </Aviso>
      )}
      {mensagem && (
        <p role="status" className="aviso">
          {mensagem}
        </p>
      )}
    </>
  );
}
