import { useState } from 'react';
import type { ServicoPlanner } from '../tipos';
import { CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
import { moeda } from '../utilitarios/valoresFinanceiros';

export function TelaVendasIntegrada({ servico }: { servico: ServicoPlanner }) {
  const [busca, setBusca] = useState(''),
    [inicio, setInicio] = useState(''),
    [fim, setFim] = useState(''),
    [pagina, setPagina] = useState(1);
  const filtro = { busca, inicio, fim, pagina, tamanho: 20, meio: '' as const };
  const consulta = useConsultaRemota(JSON.stringify(filtro), async (sinal) => {
    if (!servico.consultarVendas) throw new Error('Consulta de vendas indisponível.');
    return servico.consultarVendas(filtro, sinal);
  });
  return (
    <>
      <CabecalhoPagina
        titulo="Vendas"
        descricao="Histórico de pagamentos, incluindo vendas pendentes, recusadas e sem operação de split."
      />
      <section className="painel">
        <form
          className="filtros"
          onSubmit={(e) => {
            e.preventDefault();
            consulta.recarregar();
          }}
        >
          <label className="campo">
            <span>Buscar venda</span>
            <input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
            />
          </label>
          <label className="campo">
            <span>De</span>
            <input
              type="date"
              value={inicio}
              onChange={(e) => {
                setInicio(e.target.value);
                setPagina(1);
              }}
            />
          </label>
          <label className="campo">
            <span>Até</span>
            <input
              type="date"
              value={fim}
              min={inicio || undefined}
              onChange={(e) => {
                setFim(e.target.value);
                setPagina(1);
              }}
            />
          </label>
          <button className="botao secundario">Atualizar consulta</button>
        </form>
        {consulta.carregando ? (
          <Estado titulo="Consultando vendas" carregando />
        ) : consulta.erro ? (
          <Estado
            titulo="Consulta indisponível"
            descricao={consulta.erro}
            acao={
              <button className="botao secundario" onClick={consulta.recarregar}>
                Tentar novamente
              </button>
            }
          />
        ) : (
          consulta.dados && (
            <>
              {consulta.dados.itens.length ? (
                <div
                  className="tabela-rolavel"
                  role="region"
                  aria-label="Vendas consultadas"
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Venda</th>
                        <th>Data</th>
                        <th>Pagamento</th>
                        <th>Valor</th>
                        <th>Split</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consulta.dados.itens.map((v) => (
                        <tr key={v.id}>
                          <td>
                            <a href={`#/vendas/${v.id}`}>{v.id}</a>
                          </td>
                          <td>{new Date(v.data).toLocaleString('pt-BR')}</td>
                          <td>
                            {v.meio} · {v.pagamento}
                          </td>
                          <td>{moeda(v.bruto)}</td>
                          <td>
                            {v.operacao ? (
                              <a href={`#/operacoes/${v.operacao.id}`}>{v.operacao.status}</a>
                            ) : (
                              'Não criado'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Estado titulo="Nenhuma venda encontrada" />
              )}
              <div className="paginacao">
                <span>
                  {consulta.dados.total} vendas · página {pagina}
                </span>
                <button
                  className="botao secundario"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>
                <button
                  className="botao secundario"
                  disabled={pagina * 20 >= consulta.dados.total}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </>
          )
        )}
      </section>
    </>
  );
}
export function TelaDetalheVenda({ id, servico, permitirRetomada = false }: { id: string; servico: ServicoPlanner; permitirRetomada?: boolean }) {
  const consulta = useConsultaRemota(id, async (sinal) => {
    if (!servico.consultarVenda) throw new Error('Consulta de venda indisponível.');
    return servico.consultarVenda(id, sinal);
  });
  const [recuperando, setRecuperando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  async function recuperar() {
    if (recuperando || !servico.recuperarSplitVenda) return;
    setRecuperando(true); setMensagem('');
    try { await servico.recuperarSplitVenda(id); consulta.recarregar(); setMensagem('Recuperação consultada. Confira o estado da operação.'); }
    catch { setMensagem('Não foi possível confirmar a recuperação. Atualize a venda antes de tentar novamente. A regra precisa cobrir a data original da venda.'); }
    finally { setRecuperando(false); }
  }
  const v = consulta.dados;
  return (
    <>
      <a className="voltar" href="#/vendas">
        Voltar às vendas
      </a>
      <CabecalhoPagina titulo="Detalhe da venda" descricao={id} />
      {consulta.carregando ? (
        <Estado titulo="Consultando venda" carregando />
      ) : consulta.erro ? (
        <Estado titulo="Não foi possível consultar a venda" descricao={consulta.erro} />
      ) : (
        v && (
          <section className="painel">
            <h2>Pagamento {v.pagamento}</h2>
            <p>
              {v.meio} · {moeda(v.bruto)} · {new Date(v.data).toLocaleString('pt-BR')}
            </p>
            {v.operacao ? (
              <a className="botao primario" href={`#/operacoes/${v.operacao.id}`}>
                Ver operação de split
              </a>
            ) : (
              <>
                <p>
                  {v.pagamento === 'recusado'
                    ? 'O pagamento foi recusado. Nenhuma operação de split foi criada.'
                    : v.pagamento === 'pendente'
                      ? 'O pagamento está pendente. Nenhuma operação de split foi criada.'
                      : 'Pagamento confirmado, mas o split não foi criado. A venda permanece registrada para acompanhamento.'}
                </p>
                {v.motivo && <p>Referência: {v.motivo}</p>}
                {permitirRetomada && servico.recuperarSplitVenda && v.pagamento === 'confirmado' && v.motivo === 'TAX_RULE_UNAVAILABLE' && <button className="botao primario" disabled={recuperando} onClick={recuperar}>{recuperando ? 'Recuperando…' : 'Recuperar split da mesma venda'}</button>}
                <p className="nota">
                  Esta venda não gera entrada no caixa enquanto o split não estiver concluído.
                </p>
              </>
            )}
          </section>
        )
      )}
      {mensagem && <p role="status">{mensagem}</p>}
      <button
        className="botao secundario"
        disabled={consulta.carregando || recuperando}
        onClick={consulta.recarregar}
      >
        Atualizar venda
      </button>
    </>
  );
}
