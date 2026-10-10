import { FalhaTransporte } from '../servicos/transporteApi';
import { exportarRelatorio } from '../utilitarios/exportarRelatorio';
import { usePreferenciaSessao } from '../utilitarios/usePreferenciaSessao';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { Despesa } from '../tipos';
import { Aviso, CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
import { dataCurta, dentroPeriodo, lerCentavos, moeda } from '../utilitarios/valoresFinanceiros';
import { validarDespesa, CATEGORIAS_DESPESA } from '../utilitarios/validarDespesa';
export function TelaDespesas({
  despesas,
  salvar,
  permitirRegistro = true,
  permitirExportacao = true,
}: {
  despesas: Despesa[];
  permitirRegistro?: boolean;
  permitirExportacao?: boolean;
  salvar: (d: Omit<Despesa, 'id'>) => Promise<void>;
}) {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [aberto, setAberto] = useState(false),
    [ocupado, setOcupado] = useState(false),
    [erro, setErro] = useState(''),
    [sucesso, setSucesso] = useState('');
  const [busca, setBusca] = usePreferenciaSessao('despesas-busca', ''),
    [categoria, setCategoria] = usePreferenciaSessao('despesas-categoria', ''),
    [inicio, setInicio] = usePreferenciaSessao('despesas-inicio', ''),
    [fim, setFim] = usePreferenciaSessao('despesas-fim', '');
  const focoPendente = useRef<string | null>(null);
  const formulario = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!ocupado && focoPendente.current) {
      (formulario.current?.elements.namedItem(focoPendente.current) as HTMLElement | null)?.focus();
      focoPendente.current = null;
    }
  }, [ocupado]);
  const bloqueio = useRef(false),
    botaoAbrir = useRef<HTMLButtonElement>(null);
  const periodoInvalido = Boolean(inicio && fim && inicio > fim);
  const filtradas = despesas.filter(
    (d) =>
      !periodoInvalido &&
      d.descricao.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')) &&
      (!categoria || d.categoria === categoria) &&
      dentroPeriodo(d.data, inicio, fim),
  );
  function fechar() {
    setAberto(false);
    botaoAbrir.current?.focus();
  }
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueio.current) return;
    const form = e.currentTarget;
    setErrosCampo({});
    const f = new FormData(form);
    const valor = lerCentavos(String(f.get('valor')));
    if (valor === null) {
      setErro('Informe um valor de 0,01 a 1.000.000,00, sem ponto de milhar.');
      return;
    }
    const despesa = {
      descricao: String(f.get('descricao')).trim(),
      valor,
      categoria: String(f.get('categoria')),
      data: String(f.get('data')),
    };
    const validacao = validarDespesa(despesa);
    if (validacao) {
      setErro(validacao);
      return;
    }
    bloqueio.current = true;
    setOcupado(true);
    setErro('');
    try {
      await salvar(despesa);
      fechar();
      setSucesso('Despesa paga registrada no cenário local.');
    } catch (e) {
      if (e instanceof FalhaTransporte) {
        setErrosCampo(e.campos);
        const campo = ['descricao', 'valor', 'categoria', 'data'].find((nome) => e.campos[nome]);
        if (campo) focoPendente.current = campo;
      }
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setOcupado(false);
      bloqueio.current = false;
    }
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Despesas"
        descricao="Acompanhe as saídas do seu estabelecimento."
        acao={
          <button
            className="botao primario"
            ref={botaoAbrir}
            disabled={ocupado || !permitirRegistro}
            onClick={() => {
              setAberto(true);
              setErro('');
              setSucesso('');
            }}
          >
            <Plus size={17} />
            Registrar despesa
          </button>
        }
      />
      <Aviso>
        Neste incremento, registramos apenas despesas já pagas. Vencimentos, recorrência, edição e
        exclusão aguardam contrato com o backend.
      </Aviso>
      {sucesso && (
        <p role="status" className="sucesso">
          {sucesso}
        </p>
      )}
      {aberto && (
        <section className="painel formulario-painel">
          <div className="titulo-painel">
            <h2>Nova despesa paga</h2>
            <button
              className="botao-icone"
              disabled={ocupado || !permitirRegistro}
              onClick={fechar}
              aria-label="Fechar formulário"
            >
              <X />
            </button>
          </div>
          <form
            ref={formulario}
            onSubmit={enviar}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && !ocupado) fechar();
            }}
          >
            <fieldset
              disabled={ocupado || !permitirRegistro}
              className="grade-formulario campos-sem-borda"
            >
              <legend className="somente-leitor">Dados da despesa paga</legend>
              <label className="campo">
                <span>Descrição</span>
                <input
                  name="descricao"
                  aria-invalid={Boolean(errosCampo.descricao)}
                  aria-describedby={
                    errosCampo.descricao
                      ? 'erro-despesa-descricao'
                      : erro
                        ? 'erro-despesa'
                        : undefined
                  }
                  required
                  maxLength={100}
                  autoFocus
                  placeholder="Ex.: reposição de estoque"
                />
              </label>
              <label className="campo">
                <span>Valor (R$)</span>
                <input
                  name="valor"
                  aria-invalid={Boolean(errosCampo.valor)}
                  required
                  inputMode="decimal"
                  placeholder="150,00"
                  aria-describedby={
                    errosCampo.valor ? 'erro-despesa-valor' : erro ? 'erro-despesa' : undefined
                  }
                />
              </label>
              <label className="campo">
                <span>Categoria</span>
                <select
                  name="categoria"
                  aria-describedby={
                    errosCampo.categoria
                      ? 'erro-despesa-categoria'
                      : erro
                        ? 'erro-despesa'
                        : undefined
                  }
                >
                  <option>Estoque</option>
                  <option>Serviços</option>
                  <option>Operacional</option>
                  <option>Outros</option>
                </select>
              </label>
              <label className="campo">
                <span>Data do pagamento</span>
                <input
                  type="date"
                  name="data"
                  aria-invalid={Boolean(errosCampo.data)}
                  aria-describedby={
                    errosCampo.data ? 'erro-despesa-data' : erro ? 'erro-despesa' : undefined
                  }
                  required
                  defaultValue="2026-10-09"
                  min="2026-01-01"
                  max="2026-10-09"
                />
              </label>
            </fieldset>
            {Object.entries(errosCampo)
              .filter(([nome]) => ['descricao', 'valor', 'categoria', 'data'].includes(nome))
              .map(([nome, mensagem]) => (
                <p key={nome} id={`erro-despesa-${nome}`} className="erro" role="alert">
                  {nome}: {mensagem}
                </p>
              ))}
            {erro && (
              <p className="erro" id="erro-despesa" role="alert">
                {erro}
              </p>
            )}
            <p className="nota">Não registre novamente taxas já deduzidas nas parcelas do split.</p>
            <button className="botao primario" disabled={ocupado || !permitirRegistro}>
              {ocupado ? 'Salvando…' : 'Salvar despesa demonstrativa'}
            </button>
          </form>
        </section>
      )}
      <section className="painel">
        <div className="titulo-painel">
          <h2>Despesas registradas</h2>
          <span>
            {filtradas.length} registros · {moeda(filtradas.reduce((s, d) => s + d.valor, 0))}
          </span>
        </div>
        <button
          className="botao secundario"
          disabled={!filtradas.length || !permitirExportacao}
          onClick={() =>
            exportarRelatorio(
              'despesas',
              ['Modo', 'Descrição', 'Categoria', 'Data', 'Valor (centavos)'],
              filtradas.map((d) => ['SIMULADO', d.descricao, d.categoria, d.data, d.valor]),
            )
          }
        >
          Exportar despesas filtradas
        </button>
        <div className="filtros">
          <label className="campo busca">
            <span>Buscar despesa</span>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Descrição da despesa"
            />
          </label>
          <label className="campo">
            <span>Filtrar categoria</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIAS_DESPESA.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Pagamento de</span>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </label>
          <label className="campo">
            <span>Pagamento até</span>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </label>
          <button
            className="botao secundario"
            onClick={() => {
              setBusca('');
              setCategoria('');
              setInicio('');
              setFim('');
            }}
          >
            Limpar filtros
          </button>
        </div>
        {periodoInvalido && (
          <p role="alert" className="erro">
            A data final deve ser igual ou posterior à inicial.
          </p>
        )}
        {filtradas.length ? (
          <div
            className="tabela-rolavel"
            tabIndex={0}
            role="region"
            aria-label="Despesas registradas"
          >
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Pagamento</th>
                  <th className="numero">Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.descricao}</strong>
                    </td>
                    <td>{d.categoria}</td>
                    <td>{dataCurta(d.data)}</td>
                    <td className="numero">{moeda(d.valor)}</td>
                    <td>
                      <span className="status concluida">Paga</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Estado
            titulo="Nenhuma despesa encontrada"
            descricao="Ajuste os filtros ou registre uma despesa paga."
          />
        )}
      </section>
    </>
  );
}
