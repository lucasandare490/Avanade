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
  solicitarRedefinicao?(email: string): Promise<void>;
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
export const autenticacaoDemonstrativa: ServicoSessao = {
  async entrar({ email, senha }) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const chave = email.trim().toLowerCase();
    const agora = Date.now();
    const registro = tentativasDemo.get(chave) ?? { erros: 0, bloqueadoAte: 0 };
    if (registro.bloqueadoAte > agora)
      throw new FalhaLogin(mensagemBloqueio(Math.ceil((registro.bloqueadoAte - agora) / 60000)), 0, registro.bloqueadoAte);
    const perfil = email.split('@')[0] as keyof typeof perfisDemonstrativos;
    if (
      senha !== 'demo' ||
      !Object.hasOwn(perfisDemonstrativos, perfil) ||
      email !== `${perfil}@exemplo.invalid`
    ) {
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
    return sessaoDemonstrativa(perfil);
  },
  async sair() {
    /* Não existe sessão de servidor no cenário local. */
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
