import { criarTransporteApi } from './transporteApi';
/** Rotas documentadas. Schemas, sessão e idempotência precisam de ratificação conjunta. */
export function criarCapacidadesApi(url: string, credenciais: RequestCredentials = 'omit') {
  const enviar = criarTransporteApi(url, credenciais);
  return {
    entrar<T>(dados: unknown, validar: (v: unknown) => T) {
      return enviar('/api/v1/auth/login', validar, { metodo: 'POST', dados });
    },
    consultarCaixa<T>(periodo: string, validar: (v: unknown) => T, sinal?: AbortSignal) {
      return enviar(`/api/v1/cash-flow?${new URLSearchParams({ period: periodo })}`, validar, {
        sinal,
      });
    },
    simular<T>(dados: unknown, validar: (v: unknown) => T, sinal?: AbortSignal) {
      return enviar('/api/v1/split-payment/simulate', validar, { metodo: 'POST', dados, sinal });
    },
    explicarCaixa<T>(dados: unknown, validar: (v: unknown) => T, sinal?: AbortSignal) {
      return enviar('/api/v1/ai/cash-analysis', validar, { metodo: 'POST', dados, sinal });
    },
    consultarOperacoes<T>(
      inicio: string,
      fim: string,
      validar: (v: unknown) => T,
      sinal?: AbortSignal,
    ) {
      const parametros = new URLSearchParams({ from: inicio, to: fim });
      return enviar(`/api/v1/split-operations?${parametros}`, validar, { sinal });
    },
    consultarOperacao<T>(id: string, validar: (v: unknown) => T, sinal?: AbortSignal) {
      return enviar(`/api/v1/split-operations/${encodeURIComponent(id)}`, validar, { sinal });
    },
    consultarEventos<T>(saleId: string, validar: (v: unknown) => T, sinal?: AbortSignal) {
      return enviar(`/api/v1/ledger?${new URLSearchParams({ saleId })}`, validar, { sinal });
    },
    criarVenda<T>(dados: unknown, chave: string, validar: (v: unknown) => T) {
      return enviar('/api/v1/sales', validar, { metodo: 'POST', dados, chaveIdempotencia: chave });
    },
    retomarOperacao<T>(id: string, chave: string, validar: (v: unknown) => T) {
      return enviar(`/api/v1/split-operations/${encodeURIComponent(id)}/reprocess`, validar, {
        metodo: 'POST',
        chaveIdempotencia: chave,
      });
    },
    registrarDespesa<T>(dados: unknown, validar: (v: unknown) => T) {
      return enviar('/api/v1/expenses', validar, { metodo: 'POST', dados });
    },
  };
}
