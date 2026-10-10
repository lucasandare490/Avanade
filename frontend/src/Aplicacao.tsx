import { TelaDespesasIntegrada } from './telas/TelaDespesasIntegrada';
import { TelaResumoIntegrado } from './telas/TelaResumoIntegrado';
import { TelaAnaliseIntegrada } from './telas/TelaAnaliseIntegrada';
import { TelaSimulacaoIntegrada } from './telas/TelaSimulacaoIntegrada';
import { TelaOperacoesRemotas, TelaDetalheRemoto } from './telas/TelaOperacoesRemotas';
import { DialogoConfirmacao } from './componentes/DialogoConfirmacao';
import { TelaLogin } from './telas/TelaLogin';
import {
  autenticacaoDemonstrativa,
  sessaoDemonstrativa,
  podeAcessarRota,
  type SessaoUsuario,
  type ServicoSessao,
} from './servicos/sessaoUsuario';
import { FalhaTransporte } from './servicos/transporteApi';
import { TelaAjuda } from './telas/TelaAjuda';
import { TelaEstadosAcesso } from './telas/TelaEstadosAcesso';
import { useEffect, useState, useRef, Component, type ReactNode, type ErrorInfo } from 'react';
import { AvisoConexao } from './componentes/AvisoConexao';
import { EstruturaPainel } from './componentes/EstruturaPainel';
import { Estado } from './componentes/ElementosInterface';
import { TelaEntrada } from './telas/TelaEntrada';
import { TelaDashboard } from './telas/TelaDashboard';
import { TelaOperacoes, TelaDetalheOperacao } from './telas/TelaOperacoes';
import { TelaDespesas } from './telas/TelaDespesas';
import { TelaFluxoCaixa } from './telas/TelaFluxoCaixa';
import { TelaSimulacao } from './telas/TelaSimulacao';
import { TelaVendaDemonstrativa } from './telas/TelaVendaDemonstrativa';
import { TelaAnalise } from './telas/TelaAnalise';
import { TelaConfiguracoes } from './telas/TelaConfiguracoes';
import { criarServicoDemonstrativo } from './servicos/servicoDemonstrativo';
import { limparPreferenciasSessao } from './utilitarios/usePreferenciaSessao';
import type { BaseDemonstracao, ServicoPlanner } from './tipos';
const lerRota = () => location.hash.replace(/^#\/?/, '') || 'dashboard';
export class LimiteErro extends Component<{ children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false };
  static getDerivedStateFromError() {
    return { falhou: true };
  }
  componentDidCatch(_erro: Error, _info: ErrorInfo) {
    /* Dados financeiros e detalhes internos não são registrados. */
  }
  render() {
    return this.state.falhou ? (
      <Estado
        titulo="Não foi possível exibir esta tela"
        descricao="Recarregue a demonstração para restaurar o cenário inicial."
        acao={
          <button className="botao primario" onClick={() => location.reload()}>
            Reabrir demonstração
          </button>
        }
      />
    ) : (
      this.props.children
    );
  }
}
export interface DependenciasFrontend {
  criarServico: (sessao: SessaoUsuario) => ServicoPlanner;
  autenticacao: ServicoSessao;
}
export function Aplicacao({ integracao }: { integracao?: DependenciasFrontend } = {}) {
  const servicoRef = useRef<ServicoPlanner | null>(null);
  if (!servicoRef.current) servicoRef.current = criarServicoDemonstrativo();
  const servicoPlanner = servicoRef.current;
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);
  const [login, setLogin] = useState(Boolean(integracao));
  const [mensagemSessao, setMensagemSessao] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const [tentativaAtiva, setTentativaAtiva] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const ordemConsulta = useRef(0);
  const consultaAtual = useRef<AbortController | null>(null);
  const encerramento = useRef<Promise<void>>(Promise.resolve());
  const [entrou, setEntrou] = useState(false),
    [rota, setRota] = useState(lerRota),
    [base, setBase] = useState<BaseDemonstracao | null>(null),
    [erro, setErro] = useState(''),
    [cenarioConsulta, setCenarioConsulta] = useState('normal');
  function encerrar(expirada = false) {
    ordemConsulta.current++;
    consultaAtual.current?.abort();
    servicoRef.current = criarServicoDemonstrativo();
    setTentativaAtiva(false);
    setConfirmarSaida(false);
    setSessao(null);
    setEntrou(false);
    setBase(null);
    setErro('');
    setAtualizando(false);
    setCenarioConsulta('normal');
    limparPreferenciasSessao();
    setLogin(expirada || Boolean(integracao));
    setMensagemSessao(expirada ? 'Sua sessão expirou. Entre novamente para continuar.' : '');
  }
  function iniciar(nova: SessaoUsuario) {
    ordemConsulta.current++;
    limparPreferenciasSessao();
    setBase(null);
    setErro('');
    const original = integracao ? integracao.criarServico(nova) : criarServicoDemonstrativo();
    const protegido: ServicoPlanner = new Proxy(original, {
      get(alvo, chave) {
        const membro = Reflect.get(alvo, chave);
        if (typeof membro !== 'function') return membro;
        return async (...argumentos: unknown[]) => {
          try {
            return await Reflect.apply(membro, alvo, argumentos);
          } catch (e) {
            if (
              servicoRef.current === protegido &&
              e instanceof FalhaTransporte &&
              e.codigo === 401
            )
              encerrar(true);
            throw e;
          }
        };
      },
    });
    servicoRef.current = protegido;
    setSessao(nova);
    setEntrou(true);
    setMensagemSessao('');
    if (!podeAcessarRota(lerRota(), nova)) location.hash = '/operacoes';
  }
  async function atualizar() {
    if (integracao) return;
    const numero = ++ordemConsulta.current;
    consultaAtual.current?.abort();
    const consulta = new AbortController();
    consultaAtual.current = consulta;
    const origem = servicoRef.current!;
    setAtualizando(true);
    try {
      const nova = await origem.carregar(consulta.signal);
      if (numero === ordemConsulta.current && origem === servicoRef.current) {
        setBase(nova);
        setErro('');
      }
    } catch (e) {
      if (numero !== ordemConsulta.current || origem !== servicoRef.current) return;
      if (e instanceof FalhaTransporte && e.codigo === 401) {
        encerrar(true);
        return;
      }
      if (e instanceof FalhaTransporte && e.codigo === 403) setBase(null);
      setErro(
        e instanceof FalhaTransporte
          ? e.message
          : 'Não foi possível atualizar. Os dados anteriores foram preservados.',
      );
    } finally {
      if (numero === ordemConsulta.current) setAtualizando(false);
    }
  }
  async function executarAcao<T>(acao: () => Promise<T>): Promise<T> {
    const origem = servicoRef.current;
    try {
      return await acao();
    } catch (e) {
      if (origem === servicoRef.current && e instanceof FalhaTransporte && e.codigo === 401)
        encerrar(true);
      throw e;
    }
  }
  function sair() {
    location.hash = '/dashboard';
    setRota('dashboard');
    encerrar();
    encerramento.current = (integracao?.autenticacao ?? autenticacaoDemonstrativa)
      .sair()
      .catch(() => {
        setMensagemSessao(
          'A sessão local foi encerrada. Não foi possível confirmar a revogação no servidor.',
        );
      });
  }
  useEffect(() => {
    if (sessao) void atualizar();
    return () => {
      consultaAtual.current?.abort();
      ordemConsulta.current++;
    };
  }, [sessao?.id]);
  useEffect(() => {
    if (!sessao) return;
    const restante = sessao.expiraEm - Date.now();
    if (restante <= 0) {
      encerrar(true);
      return;
    }
    const id = setTimeout(() => encerrar(true), Math.min(restante, 2147483647));
    return () => clearTimeout(id);
  }, [sessao?.id]);
  useEffect(() => {
    const mudar = () => {
      setRota(lerRota());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', mudar);
    return () => window.removeEventListener('hashchange', mudar);
  }, []);
  useEffect(() => {
    document.title = `Planner Comercial · ${rota.split('/')[0]}`;
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [rota, entrou]);
  if (!entrou || !sessao)
    return login ? (
      <TelaLogin
        demonstrativo={!integracao}
        mensagem={mensagemSessao}
        autenticar={async (dados) => {
          await encerramento.current;
          return (integracao?.autenticacao ?? autenticacaoDemonstrativa).entrar(dados);
        }}
        concluir={iniciar}
        voltar={() => setLogin(false)}
      />
    ) : (
      <TelaEntrada
        entrar={() => iniciar(sessaoDemonstrativa())}
        abrirLogin={() => setLogin(true)}
        permitirDemo={!integracao}
      />
    );
  const baseVisivel =
    cenarioConsulta === 'vazio'
      ? { operacoes: [], despesas: [] }
      : integracao
        ? { operacoes: [], despesas: [] }
        : base;
  let conteudo: ReactNode;
  if (integracao && rota.startsWith('operacoes/'))
    conteudo = (
      <TelaDetalheRemoto
        key={rota}
        id={rota.split('/')[1]}
        servico={servicoPlanner}
        permitirRetomada={sessao.permissoes.includes('retomar')}
        aposRetomar={atualizar}
      />
    );
  else if (integracao && rota === 'operacoes')
    conteudo = <TelaOperacoesRemotas servico={servicoPlanner} />;
  else if (integracao && rota === 'simulacao')
    conteudo = <TelaSimulacaoIntegrada servico={servicoPlanner} />;
  else if (integracao && rota === 'analise')
    conteudo = <TelaAnaliseIntegrada servico={servicoPlanner} />;
  else if (integracao && (rota === 'dashboard' || rota === 'fluxo-caixa'))
    conteudo = <TelaResumoIntegrado key={rota} servico={servicoPlanner} area={rota} />;
  else if (integracao && rota === 'despesas')
    conteudo = (
      <TelaDespesasIntegrada
        servico={servicoPlanner}
        permitirRegistro={sessao.permissoes.includes('despesa')}
      />
    );
  else if (erro && !baseVisivel)
    conteudo = (
      <Estado
        titulo={erro}
        acao={
          <button className="botao primario" onClick={() => void atualizar()}>
            Tentar novamente
          </button>
        }
      />
    );
  else if (!baseVisivel) conteudo = <Estado titulo="Preparando seu painel" carregando />;
  else if (rota.startsWith('operacoes/'))
    conteudo = (
      <TelaDetalheOperacao
        key={rota}
        operacao={baseVisivel.operacoes.find((o) => o.id === rota.split('/')[1])}
        permitirRetomada={sessao.permissoes.includes('retomar')}
        reprocessar={async (id) => {
          if (!sessao.permissoes.includes('retomar'))
            throw new Error('Seu perfil não pode retomar operações.');
          await executarAcao(() => servicoPlanner.reprocessar(id));
          if (servicoRef.current === servicoPlanner) await atualizar();
        }}
      />
    );
  else
    switch (rota) {
      case 'dashboard':
        conteudo = <TelaDashboard base={baseVisivel} nome={sessao.nome} />;
        break;
      case 'operacoes':
        conteudo = (
          <TelaOperacoes
            operacoes={baseVisivel.operacoes}
            permitirExportacao={sessao.permissoes.includes('exportar')}
          />
        );
        break;
      case 'despesas':
        conteudo = (
          <TelaDespesas
            despesas={baseVisivel.despesas}
            permitirRegistro={sessao.permissoes.includes('despesa')}
            permitirExportacao={sessao.permissoes.includes('exportar')}
            salvar={async (d) => {
              if (!sessao.permissoes.includes('despesa'))
                throw new Error('Seu perfil não pode registrar despesas.');
              await executarAcao(() => servicoPlanner.registrarDespesa(d));
              if (servicoRef.current === servicoPlanner) await atualizar();
            }}
          />
        );
        break;
      case 'fluxo-caixa':
        conteudo = (
          <TelaFluxoCaixa
            base={baseVisivel}
            permitirExportacao={sessao.permissoes.includes('exportar')}
          />
        );
        break;
      case 'simulacao':
        conteudo = integracao ? (
          <TelaSimulacaoIntegrada servico={servicoPlanner} />
        ) : (
          <TelaSimulacao />
        );
        break;
      case 'venda-demonstrativa':
        conteudo = null;
        break;
      case 'analise':
        conteudo = integracao ? (
          <TelaAnaliseIntegrada servico={servicoPlanner} />
        ) : (
          <TelaAnalise base={baseVisivel} />
        );
        break;
      case 'ajuda':
        conteudo = <TelaAjuda />;
        break;
      case 'previa-acesso':
        conteudo = <TelaEstadosAcesso />;
        break;
      case 'configuracoes':
        conteudo = (
          <TelaConfiguracoes
            demonstrativo={!integracao}
            cenario={cenarioConsulta}
            mudarCenario={integracao ? undefined : setCenarioConsulta}
            sessao={sessao}
            expirar={integracao ? undefined : () => encerrar(true)}
          />
        );
        break;
      default:
        conteudo = (
          <Estado
            titulo="Página não encontrada"
            acao={
              <a className="botao primario" href="#/dashboard">
                Voltar ao dashboard
              </a>
            }
          />
        );
    }
  if (rota !== 'configuracoes' && ['carregando', 'erro', 'negado'].includes(cenarioConsulta)) {
    conteudo = (
      <Estado
        carregando={cenarioConsulta === 'carregando'}
        titulo={
          cenarioConsulta === 'carregando'
            ? 'Consultando seus dados'
            : cenarioConsulta === 'negado'
              ? 'Acesso não permitido'
              : 'Serviço indisponível'
        }
        descricao="Este estado foi escolhido na configuração demonstrativa."
        acao={
          <button className="botao secundario" onClick={() => setCenarioConsulta('normal')}>
            Restaurar visualização normal
          </button>
        }
      />
    );
  }
  if (!podeAcessarRota(rota, sessao))
    conteudo = (
      <Estado
        titulo="Acesso não permitido"
        descricao="Seu perfil não tem permissão para esta área. A autorização real também deve ser verificada pelo servidor."
        acao={
          <a className="botao secundario" href="#/operacoes">
            Consultar operações
          </a>
        }
      />
    );
  return (
    <EstruturaPainel
      rota={rota}
      sessao={sessao}
      sair={() => (tentativaAtiva ? setConfirmarSaida(true) : sair())}
    >
      {confirmarSaida && (
        <DialogoConfirmacao
          titulo="Existe uma tentativa em andamento"
          descricao="Sair apaga os dados fictícios desta sessão, inclusive a tentativa com confirmação desconhecida. Para consultá-la, continue na demonstração e volte ao modo POS."
          confirmar={sair}
          cancelar={() => setConfirmarSaida(false)}
        />
      )}
      <AvisoConexao />
      {!integracao && (
        <div className="barra-atualizacao">
          <span role="status">
            {atualizando
              ? 'Atualizando dados…'
              : erro && base
                ? 'Exibindo dados anteriores; a atualização falhou.'
                : ''}
          </span>
          <button
            className="botao secundario"
            disabled={atualizando}
            onClick={() => void atualizar()}
          >
            Atualizar dados
          </button>
        </div>
      )}
      {erro && base && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}
      {cenarioConsulta !== 'normal' && (
        <p className="aviso" role="status">
          {cenarioConsulta === 'desatualizado'
            ? 'Atualização indisponível no cenário escolhido. Exibindo os dados anteriores.'
            : `Visualização demonstrativa: ${cenarioConsulta}.`}{' '}
          <button className="botao secundario" onClick={() => setCenarioConsulta('normal')}>
            Voltar ao normal
          </button>
        </p>
      )}
      <LimiteErro key={rota}>{conteudo}</LimiteErro>
      <div
        hidden={
          rota !== 'venda-demonstrativa' ||
          !podeAcessarRota(rota, sessao) ||
          (!integracao && !base) ||
          ['carregando', 'erro', 'negado'].includes(cenarioConsulta)
        }
      >
        <TelaVendaDemonstrativa
          demonstrativo={!integracao}
          informarTentativa={setTentativaAtiva}
          registrar={async (v) => {
            if (!sessao.permissoes.includes('vender'))
              throw new Error('Seu perfil não pode registrar vendas.');
            const o = await executarAcao(() => servicoPlanner.registrarVenda(v));
            if (servicoRef.current !== servicoPlanner)
              throw new Error('A sessão mudou. Consulte a operação após entrar novamente.');
            await atualizar();
            if (servicoRef.current !== servicoPlanner)
              throw new Error('A sessão mudou. Consulte a operação após entrar novamente.');
            return o;
          }}
        />
      </div>
    </EstruturaPainel>
  );
}
