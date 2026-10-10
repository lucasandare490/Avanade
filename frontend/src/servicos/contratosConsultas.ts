import type { Despesa, Operacao, StatusOperacao, MeioPagamento } from '../tipos';
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
export interface ResumoFinanceiro {
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
export interface ConsultasPlanner {
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
