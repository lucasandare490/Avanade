import { criarCenario, DATA_REFERENCIA } from '../dados/cenarioDemonstrativo';
import type { BaseDemonstracao, NovaVenda, Operacao, ServicoPlanner } from '../tipos';
import { calcularExemplo } from '../utilitarios/valoresFinanceiros';
import { validarDespesa } from '../utilitarios/validarDespesa';

export function criarServicoDemonstrativo(): ServicoPlanner {
  let base: BaseDemonstracao = criarCenario();
  const tentativas = new Map<string, { entrada: string; operacao: Operacao }>();
  const aguardar = () => new Promise((resolve) => setTimeout(resolve, 180));
  return {
    async carregar() {
      await aguardar();
      return structuredClone(base);
    },
    async registrarDespesa(despesa) {
      const erro = validarDespesa(despesa);
      if (erro) throw new Error(erro);
      base = {
        ...base,
        despesas: [{ ...despesa, id: `DES-${crypto.randomUUID()}` }, ...base.despesas],
      };
      await aguardar();
    },
    async registrarVenda(venda: NovaVenda) {
      const entrada = JSON.stringify([venda.bruto, venda.meio, venda.cenario]);
      const anterior = tentativas.get(venda.chave);
      if (anterior) {
        if (anterior.entrada !== entrada)
          throw new Error('Esta tentativa já foi usada com outros dados. Inicie uma nova venda.');
        return structuredClone(anterior.operacao);
      }
      if (venda.cenario === 'recusa')
        throw new Error('Pagamento recusado na demonstração. Nenhuma operação foi criada.');
      const data = `${DATA_REFERENCIA}T16:00:00-03:00`;
      const operacao: Operacao = {
        id: `OP-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        data,
        ...calcularExemplo(venda.bruto),
        meio: venda.meio,
        status: venda.cenario === 'falha' ? 'falha' : 'concluida',
        eventos: [
          { instante: data, descricao: 'Pagamento simulado confirmado.' },
          {
            instante: data,
            descricao:
              venda.cenario === 'falha'
                ? 'Tributo confirmado; demais parcelas aguardam retomada simulada.'
                : 'Split simulado concluído.',
          },
        ],
      };
      // Reserva síncrona antes da espera: cliques concorrentes compartilham a operação.
      tentativas.set(venda.chave, { entrada, operacao });
      base.operacoes.unshift(operacao);
      await aguardar();
      if (venda.cenario === 'resposta-perdida')
        throw new Error(
          'A resposta se perdeu no cenário demonstrativo. A venda pode ter sido registrada. Consulte a mesma tentativa, sem criar outra venda.',
        );
      return structuredClone(operacao);
    },
    async reprocessar(id) {
      const operacao = base.operacoes.find((o) => o.id === id);
      if (!operacao) throw new Error('Operação não encontrada.');
      if (operacao.status === 'pendente') throw new Error('Aguarde a confirmação desta operação.');
      if (operacao.status === 'falha') {
        operacao.status = 'concluida';
        operacao.eventos.push({
          instante: `${DATA_REFERENCIA}T16:10:00-03:00`,
          descricao: 'Retomada simulada: somente parcelas pendentes confirmadas.',
        });
      }
      await aguardar();
    },
  };
}
