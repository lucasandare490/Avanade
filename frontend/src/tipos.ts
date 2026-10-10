import type { ConsultasPlanner } from './servicos/contratosConsultas';
export type StatusOperacao = 'concluida' | 'pendente' | 'falha';
export type MeioPagamento = 'PIX' | 'Débito' | 'Crédito';
export interface Evento {
  instante: string;
  descricao: string;
}
export interface ParcelaOperacao {
  id: string;
  titulo: string;
  destino: string;
  valor: number;
  status: StatusOperacao;
}
export interface Operacao {
  pagamento?: 'confirmado' | 'pendente' | 'recusado';
  regraHistorica?: string;
  parcelas?: ParcelaOperacao[];

  id: string;
  data: string;
  bruto: number;
  tributo: number;
  taxa: number;
  liquido: number;
  meio: MeioPagamento;
  status: StatusOperacao;
  eventos: Evento[];
}
export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}
export interface BaseDemonstracao {
  operacoes: Operacao[];
  despesas: Despesa[];
}
export interface NovaVenda {
  chave: string;
  bruto: number;
  meio: MeioPagamento;
  cenario: 'sucesso' | 'falha' | 'recusa' | 'resposta-perdida';
}
export interface ServicoPlanner extends ConsultasPlanner {
  carregar(sinal?: AbortSignal): Promise<BaseDemonstracao>;
  registrarDespesa(despesa: Omit<Despesa, 'id'>): Promise<void>;
  registrarVenda(venda: NovaVenda): Promise<Operacao>;
  reprocessar(id: string): Promise<void>;
}
