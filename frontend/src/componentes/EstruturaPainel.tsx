import { SeletorPreferencias } from './SeletorPreferencias';
import { useIdioma } from '../preferencias/useIdioma';
import { podeAcessarRota, type SessaoUsuario } from '../servicos/sessaoUsuario';
import {
  ArrowLeftRight,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
  Percent,
  Landmark,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
const grupos = [
  { nome: 'PRINCIPAL', itens: [{ rota: 'dashboard', nome: 'Dashboard', icone: LayoutDashboard }] },
  {
    nome: 'OPERAÇÕES',
    itens: [
      { rota: 'vendas', nome: 'Vendas', icone: Receipt },
      { rota: 'operacoes', nome: 'Operações', icone: ArrowLeftRight },
      { rota: 'despesas', nome: 'Despesas', icone: Receipt },
    ],
  },
  {
    nome: 'FINANCEIRO',
    itens: [
      { rota: 'fluxo-caixa', nome: 'Fluxo de Caixa', icone: Wallet },
      { rota: 'relatorios', nome: 'Relatórios', icone: Receipt },
      { rota: 'simulacao', nome: 'Simulação Split', icone: Percent },
      { rota: 'credito', nome: 'Capital de giro', icone: Landmark },
    ],
  },
  { nome: 'INTELIGÊNCIA', itens: [{ rota: 'analise', nome: 'Análise com IA', icone: Sparkles }] },
  {
    nome: 'CONTA',
    itens: [
      { rota: 'configuracoes', nome: 'Configurações', icone: Settings },
      { rota: 'ajuda', nome: 'Ajuda', icone: CircleHelp },
      { rota: 'venda-demonstrativa', nome: 'Modo POS · demo web', icone: Smartphone },
      { rota: 'pos-prototipo', nome: 'Smart POS · protótipo', icone: Smartphone },
    ],
  },
];
export function Marca() {
  return (
    <div className="marca">
      <span className="marca-icone">
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
          <path d="M3 14.5a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="14.5" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <div>
        Planner Comercial<small>Mais controle. Mais resultado.</small>
      </div>
    </div>
  );
}
export function EstruturaPainel({
  rota,
  sair,
  children,
  sessao,
  demonstrativo = true,
}: {
  rota: string;
  sair: () => void;
  children: ReactNode;
  sessao?: SessaoUsuario;
  demonstrativo?: boolean;
}) {
  const [menu, setMenu] = useState(false);
  const lateral = useRef<HTMLElement>(null);
  const abrir = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);
  const idioma = useIdioma();
  function fecharMenu() {
    devolverFoco.current = true;
    setMenu(false);
  }
  useEffect(() => {
    setMenu(false);
  }, [rota]);
  useEffect(() => {
    if (!menu) {
      if (devolverFoco.current) {
        abrir.current?.focus();
        devolverFoco.current = false;
      }
      return;
    }
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const controles = () =>
      Array.from(lateral.current?.querySelectorAll<HTMLElement>('a,button') ?? []).filter(
        (el) => el.getClientRects().length > 0,
      );
    controles()[0]?.focus();
    const fechar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharMenu();
      if (e.key === 'Tab') {
        const itens = controles(),
          primeiro = itens[0],
          ultimo = itens.at(-1);
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo?.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro?.focus();
        }
      }
    };
    const tela = window.matchMedia('(max-width: 1023px)');
    const mudou = () => {
      if (!tela.matches) setMenu(false);
    };
    tela.addEventListener('change', mudou);
    window.addEventListener('keydown', fechar);
    return () => {
      window.removeEventListener('keydown', fechar);
      tela.removeEventListener('change', mudou);
      document.body.style.overflow = anterior;
    };
  }, [menu]);
  return (
    <div className={`aplicacao rota-${rota.split('/')[0]}`}>
      <a
        href="#conteudo"
        className="pular-conteudo"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('conteudo')?.focus();
        }}
      >
        Pular para conteúdo
      </a>
      {menu && (
        <button
          className="fundo-menu"
          tabIndex={-1}
          aria-label="Fechar menu"
          onClick={fecharMenu}
        />
      )}
      <aside
        ref={lateral}
        id="menu-principal"
        className={`barra-lateral ${menu ? 'aberta' : ''}`}
        aria-label="Menu principal"
      >
        <div className="topo-menu">
          <Marca />
          <button
            className="botao-icone somente-mobile"
            onClick={fecharMenu}
            aria-label="Fechar menu"
          >
            <X />
          </button>
        </div>
        <div className="loja">
          <span className="avatar">MS</span>
          <div>
            <strong>{sessao?.loja ?? 'Mercadinho São João'}</strong>
            <small>{demonstrativo ? 'Estabelecimento demonstrativo' : 'Estabelecimento cadastrado'}</small>
          </div>
        </div>
        <nav>
          {grupos.map((g) => (
            <div className="grupo-menu" key={g.nome}>
              <p>{g.nome}</p>
              {g.itens
                .filter(
                  (item) =>
                    (!demonstrativo || !['vendas','relatorios'].includes(item.rota)) &&
                    (demonstrativo || item.rota !== 'pos-prototipo') &&
                    (!sessao || podeAcessarRota(item.rota, sessao)),
                )
                .map(({ rota: r, nome, icone: Icone }) => (
                  <a
                    href={`#/${r}`}
                    key={r}
                    onClick={() => {
                      if (r === rota) fecharMenu();
                    }}
                    aria-current={rota.split('/')[0] === r ? 'page' : undefined}
                  >
                    <Icone size={18} />
                    {r === 'venda-demonstrativa' && !demonstrativo
                      ? 'Nova venda · POS web'
                      : r === 'analise' && !demonstrativo
                        ? 'Análise financeira'
                        : nome}
                    {r === 'analise' && demonstrativo && (
                      <span className="mini-selo" aria-hidden="true">
                        IA
                      </span>
                    )}
                  </a>
                ))}
            </div>
          ))}
        </nav>
        <div className="rodape-menu">
          <SeletorPreferencias />
          <div>
            <ShieldCheck size={16} />
            <span>
              {demonstrativo ? 'Ambiente demonstrativo' : 'Processamento simulado'}
              <small>Sem movimentação real</small>
            </span>
          </div>
          <button onClick={sair}>
            <LogOut size={17} />
            {demonstrativo ? 'Sair da demonstração' : 'Sair'}
          </button>
        </div>
      </aside>
      <div className="area-principal" inert={menu}>
        <header className="barra-superior">
          <div className="trilha">
            <button
              className="botao-icone somente-mobile"
              ref={abrir}
              onClick={() => setMenu(true)}
              aria-label="Abrir menu"
              aria-expanded={menu}
              aria-controls="menu-principal"
            >
              <Menu />
            </button>
            <span>Meu estabelecimento</span>
            <ChevronRight size={14} />
            <strong>Visão do negócio</strong>
          </div>
          <div className="acoes-topo">
            <time data-sem-traducao className="data-topo" dateTime={new Date().toISOString().slice(0, 10)}>
              {new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : idioma === 'es' ? 'es-ES' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </time>
            <span className="modo-demo">
              <i />
              {demonstrativo ? 'Demonstração local' : 'MVP online · pagamentos simulados'}
            </span>
            <a href="#/configuracoes" className="botao-icone" aria-label={demonstrativo ? 'Sobre esta demonstração' : 'Configurações e sessão'}>
              <CircleHelp size={19} />
            </a>
            <span
              role="img"
              className="avatar pequena"
              aria-label={`${sessao?.nome ?? 'Maria'}, perfil atual`}
            >
              {sessao?.nome.slice(0, 2).toUpperCase() ?? 'MS'}
            </span>
            <span className="nome-topo">{sessao?.nome ?? 'Maria Silva'}</span>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <footer className="rodape-pagina">
          Planner Comercial · Squad 19 <span>Design de referência: Thayná Batista da Silva</span>
        </footer>
      </div>
    </div>
  );
}
