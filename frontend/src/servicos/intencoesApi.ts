import { criarTransporteApi, FalhaTransporte } from './transporteApi';
interface Intencao {
  chave: string;
  caminho: string;
  dados?: unknown;
}
/** Guarda apenas a intenção desta aba por usuário/loja, nunca senha ou bearer. */
export function criarIntencoes(
  identidade: string,
  transporte: ReturnType<typeof criarTransporteApi>,
) {
  const prefixo = `planner-intencao-v1:${identidade}:`;
  function ler(acao: string): Intencao | null {
    const valor = sessionStorage.getItem(prefixo + acao);
    if (!valor) return null;
    const i = JSON.parse(valor) as Intencao;
    const caminho =
      acao === 'SALE'
        ? '/api/v1/sales'
        : acao === 'EXPENSE'
          ? '/api/v1/expenses'
          : `/api/v1/split-operations/${encodeURIComponent(acao.slice(10))}/reprocess`;
    if (!i || !/^[A-Za-z0-9_-]{8,128}$/.test(i.chave) || i.caminho !== caminho)
      throw new Error('Intenção armazenada inválida.');
    return i;
  }
  async function executar<T>(acao: string, i: Intencao, validar: (v: unknown) => T): Promise<T> {
    try {
      const resultado = await transporte(i.caminho, validar, {
        metodo: 'POST',
        dados: i.dados,
        chaveIdempotencia: i.chave,
      });
      sessionStorage.removeItem(prefixo + acao);
      return resultado;
    } catch (e) {
      // Rejeições de validação/permissão não gravam a intenção; rede/5xx/401/409 preservam a chave.
      if (e instanceof FalhaTransporte && [400, 403, 413, 422].includes(e.codigo))
        sessionStorage.removeItem(prefixo + acao);
      throw e;
    }
  }
  return {
    pendente: (acao: string) => Boolean(ler(acao)),
    async enviar<T>(
      acao: string,
      caminho: string,
      dados: unknown,
      validar: (v: unknown) => T,
      chave: string = crypto.randomUUID(),
    ) {
      const anterior = ler(acao);
      if (
        anterior &&
        (anterior.caminho !== caminho || JSON.stringify(anterior.dados) !== JSON.stringify(dados))
      )
        throw new FalhaTransporte(
          409,
          'Recupere a tentativa anterior antes de iniciar outro registro.',
        );
      const i = anterior ?? { chave, caminho, dados };
      sessionStorage.setItem(prefixo + acao, JSON.stringify(i));
      return executar(acao, i, validar);
    },
    async recuperar<T>(acao: string, validar: (v: unknown) => T): Promise<T> {
      const i = ler(acao);
      if (!i) throw new Error('Não há tentativa pendente nesta aba.');
      try {
        const resultado = await transporte(
          `/api/v1/requests/${encodeURIComponent(acao)}/${encodeURIComponent(i.chave)}`,
          validar,
        );
        sessionStorage.removeItem(prefixo + acao);
        return resultado;
      } catch (e) {
        // 404 pode anteceder o commit. Reenvia a MESMA intenção; nunca cria chave nova.
        if (e instanceof FalhaTransporte && e.codigo === 404) return executar(acao, i, validar);
        throw e;
      }
    },
  };
}
