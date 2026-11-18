export type Permissao = 'consultar' | 'financeiro' | 'vender' | 'despesa' | 'retomar' | 'exportar';
export interface SessaoUsuario {
  id: string;
  identidade?: string;
  fusoHorario?: string;
  nome: string;
  loja: string;
  permissoes: Permissao[];
  expiraEm: number;
}
export interface Credenciais {
  email: string;
  senha: string;
  /** "Lembrar de mim": mantém a sessão neste aparelho até expirar. A senha nunca é guardada. */
  lembrar?: boolean;
}
export interface ServicoSessao {
  cadastrar?(dados: { name: string; merchantName: string; email: string; password: string }): Promise<void>;
  /** Pede o link de recuperação. Na demonstração devolve o link simulado (não há e-mail). */
  solicitarRedefinicao?(email: string): Promise<string | void>;
  redefinirSenha?(token: string, senha: string): Promise<void>;
  entrar(dados: Credenciais): Promise<SessaoUsuario>;
  sair(): Promise<void>;
  /** Retoma a sessão lembrada neste aparelho, se ainda for válida. */
  retomar?(): SessaoUsuario | null;
  /** Apaga a sessão lembrada (por exemplo, quando expira). */
  esquecer?(): void;
}

/** Limite de tentativas erradas antes do bloqueio temporário (mesmo valor do servidor). */
export const MAXIMO_TENTATIVAS = 5;
export const MINUTOS_BLOQUEIO = 15;

/** Erro de login com a contagem de tentativas que ainda restam. */
export class FalhaLogin extends Error {
  constructor(
    mensagem: string,
    public tentativasRestantes?: number,
    public bloqueadoAteMs?: number,
  ) {
    super(mensagem);
  }
}

const CHAVE_EMAIL = 'planner:email-lembrado';
export function lerEmailLembrado() {
  try {
    return localStorage.getItem(CHAVE_EMAIL) ?? '';
  } catch {
    return '';
  }
}
export function lembrarEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(CHAVE_EMAIL, email);
    else localStorage.removeItem(CHAVE_EMAIL);
  } catch {
    /* Sem armazenamento: o e-mail não é lembrado. */
  }
}

function mensagemTentativas(base: string, restantes: number) {
  return `${base} ${restantes === 1 ? 'Resta 1 tentativa' : `Restam ${restantes} tentativas`} antes do bloqueio temporário.`;
}
function mensagemBloqueio(minutos: number) {
  return `Muitas tentativas erradas. O acesso foi bloqueado temporariamente. Tente novamente em ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} ou recupere sua senha.`;
}
export { mensagemTentativas, mensagemBloqueio };

// Contagem só da demonstração local (no MVP a contagem fica no servidor).
const tentativasDemo = new Map<string, { erros: number; bloqueadoAte: number }>();
export function zerarTentativasDemo() {
  tentativasDemo.clear();
}
export const perfisDemonstrativos = {
  gestor: {
    nome: 'Maria',
    permissoes: [
      'consultar',
      'financeiro',
      'vender',
      'despesa',
      'retomar',
      'exportar',
    ] as Permissao[],
  },
  financeiro: {
    nome: 'Mariana',
    permissoes: ['consultar', 'financeiro', 'despesa', 'exportar'] as Permissao[],
  },
  operador: { nome: 'João', permissoes: ['consultar', 'vender'] as Permissao[] },
};
export function sessaoDemonstrativa(
  perfil: keyof typeof perfisDemonstrativos = 'gestor',
): SessaoUsuario {
  return {
    id: crypto.randomUUID(),
    ...perfisDemonstrativos[perfil],
    loja: 'Mercadinho São João · demonstração',
    expiraEm: Date.now() + 30 * 60 * 1000,
  };
}
// Demonstração local: senhas trocadas pela recuperação valem até recarregar a página;
// links de recuperação simulados valem 30 minutos e uma vez só.
const senhasDemo = new Map<string, string>();
const linksDemo = new Map<string, { email: string; expiraEm: number }>();
const CHAVE_SESSAO_DEMO = 'planner:sessao-demo-lembrada';
function perfilDoEmail(email: string) {
  const perfil = email.split('@')[0] as keyof typeof perfisDemonstrativos;
  return Object.hasOwn(perfisDemonstrativos, perfil) && email === `${perfil}@exemplo.invalid` ? perfil : undefined;
}
function esquecerDemo() {
  try {
    localStorage.removeItem(CHAVE_SESSAO_DEMO);
  } catch {
    /* Sem armazenamento. */
  }
}
export function zerarDemonstracao() {
  tentativasDemo.clear();
  senhasDemo.clear();
  linksDemo.clear();
  esquecerDemo();
}
export const autenticacaoDemonstrativa: ServicoSessao = {
  async entrar({ email, senha, lembrar }) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const chave = email.trim().toLowerCase();
    const agora = Date.now();
    const registro = tentativasDemo.get(chave) ?? { erros: 0, bloqueadoAte: 0 };
    if (registro.bloqueadoAte > agora)
      throw new FalhaLogin(mensagemBloqueio(Math.ceil((registro.bloqueadoAte - agora) / 60000)), 0, registro.bloqueadoAte);
    const perfil = perfilDoEmail(email);
    if (!perfil || senha !== (senhasDemo.get(email) ?? 'demo')) {
      registro.erros = registro.bloqueadoAte && registro.bloqueadoAte <= agora ? 1 : registro.erros + 1;
      registro.bloqueadoAte = 0;
      const restantes = MAXIMO_TENTATIVAS - registro.erros;
      if (restantes <= 0) {
        registro.erros = 0;
        registro.bloqueadoAte = agora + MINUTOS_BLOQUEIO * 60000;
        tentativasDemo.set(chave, registro);
        throw new FalhaLogin(mensagemBloqueio(MINUTOS_BLOQUEIO), 0, registro.bloqueadoAte);
      }
      tentativasDemo.set(chave, registro);
      throw new FalhaLogin(mensagemTentativas('E-mail ou senha inválidos para a demonstração.', restantes), restantes);
    }
    tentativasDemo.delete(chave);
    const sessao = sessaoDemonstrativa(perfil);
    esquecerDemo();
    if (lembrar) {
      try {
        localStorage.setItem(CHAVE_SESSAO_DEMO, JSON.stringify({ perfil, expiraEm: sessao.expiraEm }));
      } catch {
        /* Sem armazenamento: a sessão vale só nesta aba. */
      }
    }
    return sessao;
  },
  retomar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_SESSAO_DEMO) ?? 'null') as { perfil?: string; expiraEm?: number } | null;
      if (!salvo) return null;
      if (typeof salvo.perfil !== 'string' || !Object.hasOwn(perfisDemonstrativos, salvo.perfil) || typeof salvo.expiraEm !== 'number' || salvo.expiraEm <= Date.now()) {
        esquecerDemo();
        return null;
      }
      return { ...sessaoDemonstrativa(salvo.perfil as keyof typeof perfisDemonstrativos), expiraEm: salvo.expiraEm };
    } catch {
      esquecerDemo();
      return null;
    }
  },
  esquecer: esquecerDemo,
  async solicitarRedefinicao(email) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const limpo = email.trim().toLowerCase();
    // Mesma resposta para qualquer e-mail; só perfis da demonstração recebem link.
    if (!perfilDoEmail(limpo)) return undefined;
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    linksDemo.set(token, { email: limpo, expiraEm: Date.now() + 30 * 60000 });
    return `#/redefinir-senha?token=${token}`;
  },
  async redefinirSenha(token, senha) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const link = linksDemo.get(token);
    linksDemo.delete(token);
    if (!link || link.expiraEm <= Date.now()) throw new Error('O link de recuperação é inválido ou expirou.');
    senhasDemo.set(link.email, senha);
    tentativasDemo.delete(link.email);
  },
  async sair() {
    esquecerDemo();
  },
};
export function podeAcessarRota(rota: string, sessao: SessaoUsuario) {
  const inicio = rota.split('/')[0];
  const requisito: Partial<Record<string, Permissao>> = {
    dashboard: 'financeiro',
    operacoes: 'consultar',
    vendas: 'consultar',
    despesas: 'financeiro',
    'fluxo-caixa': 'financeiro',
    analise: 'financeiro',
    relatorios: 'financeiro',
    simulacao: 'financeiro',
    'venda-demonstrativa': 'vender',
    'pos-prototipo': 'consultar',
  };
  return !requisito[inicio] || sessao.permissoes.includes(requisito[inicio]!);
}
