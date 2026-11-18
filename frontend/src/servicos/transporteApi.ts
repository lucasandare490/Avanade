/** Transporte de integração. Nenhuma resposta de erro é substituída por dados demo. */
export class FalhaTransporte extends Error {
  constructor(
    public codigo: number,
    mensagem: string,
    public campos: Record<string, string> = {},
    /** Login: tentativas que restam antes do bloqueio (quando o servidor informa). */
    public tentativasRestantes?: number,
    /** Login bloqueado: segundos até poder tentar de novo. */
    public esperaSegundos?: number,
  ) {
    super(mensagem);
  }
}

const inteiroSeguro = (v: unknown, max: number) =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max ? v : undefined;
/** Monta a mensagem do login a partir dos números do servidor, sem exibir texto livre recebido. */
export function mensagemLogin(status: number, corpo: unknown) {
  const c = corpo && typeof corpo === 'object' ? (corpo as Record<string, unknown>) : {};
  const restantes = inteiroSeguro(c.remainingAttempts, 20);
  const espera = inteiroSeguro(c.retryAfterSeconds, 86400);
  if (status === 429 && espera !== undefined) {
    const minutos = Math.max(1, Math.ceil(espera / 60));
    return {
      mensagem: `Muitas tentativas erradas. O acesso foi bloqueado temporariamente. Tente novamente em ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} ou recupere sua senha.`,
      restantes: 0,
      espera,
    };
  }
  if (status === 401 && restantes !== undefined && restantes > 0)
    return {
      mensagem: `E-mail ou senha inválidos. ${restantes === 1 ? 'Resta 1 tentativa' : `Restam ${restantes} tentativas`} antes do bloqueio temporário.`,
      restantes,
      espera: undefined,
    };
  return undefined;
}
export interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  dados?: unknown;
  sinal?: AbortSignal;
  chaveIdempotencia?: string;
  token?: string;
}
export function criarTransporteApi(
  url: string,
  credenciais: RequestCredentials = 'omit',
  interpretarCampos?: (status: number, resposta: unknown) => Record<string, string>,
) {
  const base = new URL(url);
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new Error('Endereço de API inválido.');
  if (base.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
    throw new Error('Use HTTPS para APIs fora do computador local.');
  return async function requisitar<T>(
    caminho: string,
    validar: (valor: unknown) => T,
    opcoes: OpcoesRequisicao = {},
  ): Promise<T> {
    if (!caminho.startsWith('/') || caminho.startsWith('//') || caminho.includes('\\'))
      throw new Error('Use um caminho relativo à API.');
    const controlador = new AbortController();
    const cancelar = () => controlador.abort();
    opcoes.sinal?.addEventListener('abort', cancelar, { once: true });
    if (opcoes.sinal?.aborted) cancelar();
    // O Render Free pode levar mais de 50 s para acordar. Autenticação precisa
    // aguardar esse primeiro retorno; operações de negócio continuam limitadas.
    const limiteMs = caminho.startsWith('/api/v1/auth/') ? 60000 : 15000;
    const tempo = setTimeout(cancelar, limiteMs);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (opcoes.dados !== undefined) headers['Content-Type'] = 'application/json';
      if (opcoes.token) headers.Authorization = `Bearer ${opcoes.token}`;
      if (opcoes.chaveIdempotencia) headers['Idempotency-Key'] = opcoes.chaveIdempotencia;
      const resposta = await fetch(`${base.href.replace(/\/$/, '')}${caminho}`, {
        method: opcoes.metodo ?? 'GET',
        redirect: 'error',
        headers,
        credentials: credenciais,
        signal: controlador.signal,
        body: opcoes.dados === undefined ? undefined : JSON.stringify(opcoes.dados),
      });
      if (!resposta.ok) {
        const mensagens: Record<number, string> = {
          400: 'Confira os campos informados.',
          401:
            caminho === '/api/v1/auth/login'
              ? 'E-mail ou senha inválidos.'
              : 'Sua sessão expirou. Entre novamente.',
          403: 'Seu perfil não tem permissão para esta ação.',
          404: 'O registro não foi encontrado.',
          409: 'O registro mudou ou esta tentativa possui dados diferentes. Consulte seu estado.',
          422: 'Revise os dados antes de continuar.',
          429: 'Muitas solicitações. Aguarde antes de tentar novamente.',
          503: 'O serviço está acordando após um período de inatividade. Aguarde alguns segundos e tente novamente.',
          502: 'O serviço respondeu de forma incompleta. Aguarde alguns segundos e tente novamente.',
        };
        if (caminho === '/api/v1/auth/login' && [401, 429].includes(resposta.status)) {
          let corpo: unknown;
          try {
            corpo = await resposta.json();
          } catch {
            /* Servidor antigo ou corpo vazio: usa a mensagem padrão. */
          }
          const login = mensagemLogin(resposta.status, corpo);
          if (login)
            throw new FalhaTransporte(resposta.status, login.mensagem, {}, login.restantes, login.espera);
        }
        let campos: Record<string, string> = {};
        if (interpretarCampos && [400, 422].includes(resposta.status)) {
          try {
            campos = interpretarCampos(resposta.status, await resposta.json());
          } catch {
            /* Resposta inválida não expõe detalhes do servidor. */
          }
        }
        throw new FalhaTransporte(
          resposta.status,
          mensagens[resposta.status] ?? 'O serviço está indisponível. Tente novamente mais tarde.',
          campos,
        );
      }
      if (resposta.status === 204) return validar(undefined);
      try {
        return validar(await resposta.json());
      } catch {
        throw new FalhaTransporte(502, 'A resposta recebida não corresponde ao formato esperado.');
      }
    } catch (erro) {
      if (erro instanceof FalhaTransporte) throw erro;
      if (controlador.signal.aborted)
        throw new FalhaTransporte(
          0,
          opcoes.sinal?.aborted
            ? 'Consulta cancelada.'
            : caminho.startsWith('/api/v1/auth/')
              ? 'O serviço está acordando após um período de inatividade. Aguarde até um minuto e tente entrar novamente.'
              : 'O serviço pode estar acordando após um período de inatividade. Aguarde alguns segundos e tente novamente. Se a operação já foi enviada, consulte o resultado antes de repetir.',
        );
      throw new FalhaTransporte(0, 'Não foi possível alcançar o serviço. Verifique sua conexão.');
    } finally {
      clearTimeout(tempo);
      opcoes.sinal?.removeEventListener('abort', cancelar);
    }
  };
}
