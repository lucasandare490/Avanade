export type Permissao = 'consultar' | 'financeiro' | 'vender' | 'despesa' | 'retomar' | 'exportar';
export interface SessaoUsuario {
  id: string;
  nome: string;
  loja: string;
  permissoes: Permissao[];
  expiraEm: number;
}
export interface Credenciais {
  email: string;
  senha: string;
}
export interface ServicoSessao {
  entrar(dados: Credenciais): Promise<SessaoUsuario>;
  sair(): Promise<void>;
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
    const perfil = email.split('@')[0] as keyof typeof perfisDemonstrativos;
    if (
      senha !== 'demo' ||
      !Object.hasOwn(perfisDemonstrativos, perfil) ||
      email !== `${perfil}@exemplo.invalid`
    )
      throw new Error('E-mail ou senha inválidos para a demonstração.');
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
    despesas: 'financeiro',
    'fluxo-caixa': 'financeiro',
    analise: 'financeiro',
    simulacao: 'financeiro',
    'venda-demonstrativa': 'vender',
  };
  return !requisito[inicio] || sessao.permissoes.includes(requisito[inicio]!);
}
