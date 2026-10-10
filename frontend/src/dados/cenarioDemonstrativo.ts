import type { BaseDemonstracao, Operacao, StatusOperacao } from '../tipos';
import { calcularExemplo } from '../utilitarios/valoresFinanceiros';
export const DATA_REFERENCIA = '2026-10-09';
const valores = [
  48750, 15000, 8600, 22000, 32500, 17990, 64000, 12500, 7800, 42500, 9600, 55000, 18200, 29900,
  75000, 23900, 14600, 38000,
];
export function criarCenario(): BaseDemonstracao {
  const operacoes: Operacao[] = valores.map((bruto, indice) => {
    const status: StatusOperacao = indice === 3 ? 'pendente' : indice === 6 ? 'falha' : 'concluida';
    const data = `2026-10-${String(9 - Math.floor(indice / 2)).padStart(2, '0')}T${indice % 2 ? '10:48' : '14:32'}:00-03:00`;
    return {
      id: `OP-${String(184 - indice).padStart(4, '0')}`,
      data,
      ...calcularExemplo(bruto),
      meio: (['PIX', 'Débito', 'Crédito'] as const)[indice % 3],
      status,
      eventos: [
        { instante: data, descricao: 'Venda demonstrativa registrada.' },
        { instante: data, descricao: 'Pagamento simulado confirmado.' },
        {
          instante: data,
          descricao:
            status === 'concluida'
              ? 'Três parcelas confirmadas no cenário simulado.'
              : status === 'falha'
                ? 'Parcela tributária confirmada. Taxa e líquido aguardam retomada simulada.'
                : 'Separação aguardando conclusão simulada.',
        },
      ],
    };
  });
  return {
    operacoes,
    despesas: [
      {
        id: 'DES-01',
        descricao: 'Reposição de estoque',
        valor: 95000,
        categoria: 'Estoque',
        data: '2026-10-08',
      },
      {
        id: 'DES-02',
        descricao: 'Energia do estabelecimento',
        valor: 28640,
        categoria: 'Serviços',
        data: '2026-10-06',
      },
      {
        id: 'DES-03',
        descricao: 'Materiais de limpeza',
        valor: 12400,
        categoria: 'Operacional',
        data: '2026-10-03',
      },
    ],
  };
}
