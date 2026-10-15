import type { Despesa, Operacao, StatusOperacao, MeioPagamento, Venda } from '../tipos';
export interface ConsultaOperacoes {
  busca: string;
  inicio: string;
  fim: string;
  status: StatusOperacao | '';
  meio: MeioPagamento | '';
  pagina: number;
  tamanho: number;
}
export interface PaginaOperacoes {
  itens: Operacao[];
  total: number;
  pagina: number;
  tamanho: number;
}
export interface EntradaSimulacao {
  bruto: number;
  incluirTaxa: boolean;
  percentualHipoteticoBps?: number;
}
export interface ResultadoSimulacao {
  bruto: number;
  tributo: number;
  taxa: number;
  liquido: number;
  regra: string;
}
export interface PeriodoConsulta {
  inicio: string;
  fim: string;
}
export interface ExplicacaoPeriodo {
  detalhes?: {
    atencao: 'saldo-negativo' | 'saldo-zero' | 'saldo-positivo';
    recomendacoes: string[];
    limitacoes: string[];
    versao: string;
  };
  tendencias?: import('../utilitarios/tendencias').ComparacaoTendencias;
  periodo: PeriodoConsulta;
  texto: string;
  origem: 'demonstrativa' | 'servidor';
}
export interface IndicadorFinanceiro {
  id: string;
  titulo: string;
  valor: number;
  descricao: string;
}
export interface SemanaCaixa {
  inicio: string;
  fim: string;
  abertura: number;
  entradas: number;
  saidas: number;
  saldo: number;
}
export interface ResumoFinanceiro {
  semanas?: SemanaCaixa[];
  periodo: PeriodoConsulta;
  indicadores: IndicadorFinanceiro[];
  atualizadoEm: string;
}
export interface ConsultaDespesas {
  busca: string;
  inicio: string;
  fim: string;
  pagina: number;
  tamanho: number;
}
export interface PaginaDespesas {
  itens: Despesa[];
  total: number;
  pagina: number;
  tamanho: number;
}
export interface ComposicaoPeriodo {
  totais: { quantidade: number; bruto: number; tributo: number; taxa: number; liquido: number };
  dias: { data: string; bruto: number; tributo: number; taxa: number; liquido: number }[];
}
export interface ProjecaoCaixa {
  asOf: string;
  until: string;
  openingCents: number;
  incomeCents: number;
  expenseCents: number;
  projectedCents: number;
  attention: string;
  explanation: string;
  assumption: string;
  origin: string;
}
export interface ConsultasPlanner {
  consultarRelatorio?: (
    tipo: 'sales' | 'expenses' | 'taxes',
    periodo: PeriodoConsulta,
    sinal?: AbortSignal,
  ) => Promise<{ colunas: string[]; linhas: string[][]; total: number }>;
  explicarSplit?: (
    id: string,
    sinal?: AbortSignal,
  ) => Promise<{ texto: string; limitacoes: string[] }>;
  consultarLoja?: (
    sinal?: AbortSignal,
  ) => Promise<{ nome: string; fuso: string; podeEditar: boolean }>;
  salvarNomeLoja?: (nome: string) => Promise<{ nome: string; fuso: string; podeEditar: boolean }>;
  sugerirCategoria?: (
    descricao: string,
    sinal?: AbortSignal,
  ) => Promise<{ categorias: string[]; explicacao: string }>;
  projetarCaixa?: (
    entrada: { until: string; incomeCents: number; expenseCents: number },
    sinal?: AbortSignal,
  ) => Promise<ProjecaoCaixa>;
  exportarOperacoes?: (
    consulta: ConsultaOperacoes,
    sinal?: AbortSignal,
  ) => Promise<{ colunas: string[]; linhas: string[][]; total: number }>;
  consultarComposicao?: (
    periodo: PeriodoConsulta,
    sinal?: AbortSignal,
  ) => Promise<ComposicaoPeriodo>;
  consultarTendencias?: (
    periodo: PeriodoConsulta,
    sinal?: AbortSignal,
  ) => Promise<import('../utilitarios/tendencias').ComparacaoTendencias>;
  consultarVendas?: (
    consulta: Omit<ConsultaOperacoes, 'status'>,
    sinal?: AbortSignal,
  ) => Promise<{ itens: Venda[]; total: number; pagina: number; tamanho: number }>;
  recuperarSplitVenda?: (id: string) => Promise<void>;
  consultarVenda?: (id: string, sinal?: AbortSignal) => Promise<Venda>;
  consultarCategoriasDespesa?: (sinal?: AbortSignal) => Promise<string[]>;
  recuperarDespesa?: () => Promise<void>;
  despesaPendente?: () => boolean;
  recuperarVenda?: () => Promise<import('../tipos').ResultadoVenda>;
  vendaPendente?: () => boolean;

  categoriasDespesa?: string[];
  consultarDespesas?: (consulta: ConsultaDespesas, sinal?: AbortSignal) => Promise<PaginaDespesas>;

  consultarResumo?: (
    area: 'dashboard' | 'fluxo-caixa',
    periodo: PeriodoConsulta,
    sinal?: AbortSignal,
  ) => Promise<ResumoFinanceiro>;

  consultarOperacoes?: (
    consulta: ConsultaOperacoes,
    sinal?: AbortSignal,
  ) => Promise<PaginaOperacoes>;
  consultarOperacao?: (id: string, sinal?: AbortSignal) => Promise<Operacao>;
  simular?: (entrada: EntradaSimulacao, sinal?: AbortSignal) => Promise<ResultadoSimulacao>;
  explicar?: (periodo: PeriodoConsulta, sinal?: AbortSignal) => Promise<ExplicacaoPeriodo>;
}
