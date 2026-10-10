/** Infraestrutura para o futuro adapter. Não contém rotas inventadas ou fallback para mock. */
export class ErroApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}
export function criarClienteHttp(baseUrl: string) {
  if (!/^https?:\/\//.test(baseUrl)) throw new Error('Informe a URL HTTP da API.');
  return async function consultar<T>(
    caminho: string,
    validar: (resposta: unknown) => T,
    sinal?: AbortSignal,
  ): Promise<T> {
    const resposta = await fetch(`${baseUrl.replace(/\/$/, '')}/${caminho.replace(/^\//, '')}`, {
      signal: sinal,
      headers: { Accept: 'application/json' },
    });
    if (!resposta.ok)
      throw new ErroApi(
        resposta.status,
        resposta.status === 401
          ? 'Sua sessão expirou.'
          : resposta.status === 403
            ? 'Você não tem acesso a estes dados.'
            : 'Não foi possível consultar os dados. Tente novamente.',
      );
    return validar(await resposta.json());
  };
}
