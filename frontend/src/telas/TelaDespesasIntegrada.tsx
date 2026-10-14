import { useRef, useState, type FormEvent } from 'react';
import type { ServicoPlanner } from '../tipos';
import { CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
import { moeda, lerCentavos } from '../utilitarios/valoresFinanceiros';
import { FalhaTransporte } from '../servicos/transporteApi';
export function TelaDespesasIntegrada({
  servico,
  permitirRegistro,
}: {
  servico: ServicoPlanner;
  permitirRegistro: boolean;
}) {
  const [busca, setBusca] = useState(''),
    [inicio, setInicio] = useState(''),
    [fim, setFim] = useState(''),
    [pagina, setPagina] = useState(1);
  const [aberto, setAberto] = useState(false),
    [ocupado, setOcupado] = useState(false),
    [mensagem, setMensagem] = useState(''),
    [incerta, setIncerta] = useState(() => servico.despesaPendente?.() ?? false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const trava = useRef(false),
    botaoAbrir = useRef<HTMLButtonElement>(null);
  const categoriasConsulta = useConsultaRemota('categorias', async (sinal) => {
    if (!permitirRegistro) return [];
    return servico.consultarCategoriasDespesa
      ? servico.consultarCategoriasDespesa(sinal)
      : (servico.categoriasDespesa ?? []);
  });
  const categorias = categoriasConsulta.dados ?? servico.categoriasDespesa ?? [];
  const filtro = { busca, inicio, fim, pagina, tamanho: 20 };
  const consulta = useConsultaRemota(JSON.stringify(filtro), async (sinal) => {
    if (inicio && fim && inicio > fim) throw new Error('Confira o período informado.');
    if (!servico.consultarDespesas)
      throw new Error('A consulta de despesas ainda não foi configurada.');
    return servico.consultarDespesas(filtro, sinal);
  });
  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trava.current || incerta || !permitirRegistro) return;
    const form = e.currentTarget,
      dados = new FormData(form),
      valor = lerCentavos(String(dados.get('valor')));
    if (valor === null) {
      setErros({ valor: 'Informe um valor positivo em reais, usando vírgula decimal.' });
      return;
    }
    const categoria = String(dados.get('categoria'));
    if (!categorias.includes(categoria)) {
      setErros({ categoria: 'Selecione uma categoria disponível.' });
      return;
    }
    trava.current = true;
    setOcupado(true);
    setErros({});
    setMensagem('');
    try {
      await servico.registrarDespesa({
        descricao: String(dados.get('descricao')).trim(),
        valor,
        categoria,
        data: String(dados.get('data')),
      });
      setAberto(false);
      setMensagem('Despesa registrada. A consulta será atualizada.');
      consulta.recarregar();
      botaoAbrir.current?.focus();
    } catch (e) {
      if (e instanceof FalhaTransporte) {
        setErros(e.campos);
        if (e.codigo === 0 || e.codigo >= 500 || servico.despesaPendente?.()) setIncerta(true);
        setMensagem(e.message);
      } else {
        setIncerta(true);
        setMensagem(
          'Não foi possível confirmar o registro. Consulte as despesas antes de iniciar outra tentativa.',
        );
      }
    } finally {
      trava.current = false;
      setOcupado(false);
    }
  }
  async function recuperar() {
    if (trava.current || !servico.recuperarDespesa) return;
    trava.current = true;
    setOcupado(true);
    try {
      await servico.recuperarDespesa();
      setIncerta(false);
      setAberto(false);
      setMensagem('Despesa confirmada. A consulta será atualizada.');
      consulta.recarregar();
    } catch (e) {
      setIncerta(servico.despesaPendente?.() ?? true);
      setMensagem(e instanceof Error ? e.message : 'Não foi possível recuperar a tentativa.');
    } finally {
      trava.current = false;
      setOcupado(false);
    }
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Despesas"
        descricao="Registros pagos retornados pelo serviço."
        acao={
          <button
            ref={botaoAbrir}
            className="botao primario"
            disabled={!permitirRegistro || !categorias.length || ocupado || incerta}
            onClick={() => {
              setAberto(true);
              setErros({});
              setMensagem('');
            }}
          >
            Registrar despesa
          </button>
        }
      />
      {permitirRegistro && categoriasConsulta.carregando && (
        <p role="status">Carregando categorias…</p>
      )}
      {permitirRegistro && categoriasConsulta.erro && (
        <p className="erro" role="alert">
          {categoriasConsulta.erro}{' '}
          <button className="botao secundario" onClick={categoriasConsulta.recarregar}>
            Recarregar categorias
          </button>
        </p>
      )}
      {mensagem && (
        <p role="status" className="aviso">
          {mensagem}
        </p>
      )}
      {incerta && (
        <p role="alert" className="erro">
          Resultado desconhecido. Recupere a mesma tentativa para evitar um registro duplicado.
          {servico.recuperarDespesa && (
            <button
              type="button"
              className="botao secundario"
              disabled={ocupado}
              onClick={recuperar}
            >
              {ocupado ? 'Recuperando…' : 'Recuperar despesa'}
            </button>
          )}
        </p>
      )}
      {aberto && (
        <section className="painel">
          <h2>Nova despesa paga</h2>
          <form onSubmit={salvar}>
            <fieldset disabled={ocupado || incerta} className="grade-formulario campos-sem-borda">
              <legend className="somente-leitor">Dados da despesa</legend>
              {(['descricao', 'valor', 'data'] as const).map((nome) => (
                <label className="campo" key={nome}>
                  <span>
                    {nome === 'descricao'
                      ? 'Descrição'
                      : nome === 'valor'
                        ? 'Valor (R$)'
                        : 'Data do pagamento'}
                  </span>
                  <input
                    name={nome}
                    type={nome === 'data' ? 'date' : 'text'}
                    inputMode={nome === 'valor' ? 'decimal' : undefined}
                    required
                    autoFocus={nome === 'descricao'}
                    aria-invalid={Boolean(erros[nome])}
                    aria-describedby={erros[nome] ? `erro-api-${nome}` : undefined}
                  />
                  {erros[nome] && (
                    <span id={`erro-api-${nome}`} className="erro">
                      {erros[nome]}
                    </span>
                  )}
                </label>
              ))}
              <label className="campo">
                <span>Categoria</span>
                <select
                  required
                  name="categoria"
                  aria-invalid={Boolean(erros.categoria)}
                  aria-describedby={erros.categoria ? 'erro-api-categoria' : undefined}
                >
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {erros.categoria && (
                  <span id="erro-api-categoria" className="erro">
                    {erros.categoria}
                  </span>
                )}
              </label>
            </fieldset>
            <button className="botao primario" disabled={ocupado || incerta}>
              {ocupado ? 'Salvando…' : 'Salvar despesa'}
            </button>
            <button
              type="button"
              className="botao secundario"
              disabled={ocupado}
              onClick={() => {
                setAberto(false);
                botaoAbrir.current?.focus();
              }}
            >
              Fechar formulário
            </button>
          </form>
        </section>
      )}
      <section className="painel">
        <form
          className="filtros"
          onSubmit={(e) => {
            e.preventDefault();
            consulta.recarregar();
          }}
        >
          <label className="campo">
            <span>Buscar descrição</span>
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
              min={inicio || undefined}
              value={fim}
              onChange={(e) => {
                setFim(e.target.value);
                setPagina(1);
              }}
            />
          </label>
          <button className="botao secundario">Atualizar consulta</button>
        </form>
        {consulta.carregando ? (
          <Estado titulo="Consultando despesas" carregando />
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
                  aria-label="Despesas consultadas"
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Pagamento</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consulta.dados.itens.map((d) => (
                        <tr key={d.id}>
                          <td>{d.descricao}</td>
                          <td>{d.categoria}</td>
                          <td>{d.data}</td>
                          <td>{moeda(d.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Estado titulo="Nenhuma despesa encontrada" />
              )}
              <div className="paginacao">
                <span>
                  {consulta.dados.total} registros · página {pagina}
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
