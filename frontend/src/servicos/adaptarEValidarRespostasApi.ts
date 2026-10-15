import type { ConsultasPlanner } from './contratosConsultas';
import { validarTendencias } from '../utilitarios/tendencias';
import type {
  BaseDemonstracao,
  Despesa,
  NovaVenda,
  ResultadoVenda,
  ServicoPlanner,
} from '../tipos';
import type { Credenciais, ServicoSessao, SessaoUsuario } from './sessaoUsuario';
import { criarTransporteApi, type OpcoesRequisicao } from './transporteApi';
import {
  validarBase,
  validarOperacao,
  validarSessao,
  validarDespesaRecebida,
} from './validarContratoInterno';
export interface RequisicaoMapeada extends OpcoesRequisicao {
  caminho: string;
}
export interface ContratoServidor {
  versao: string;
  cadastro?: string;
  extrairToken?: (resposta: unknown) => string;
  mapearVenda?: (resposta: unknown) => ResultadoVenda;
  prepararServico?: (
    enviar: ReturnType<typeof criarTransporteApi>,
    sessao: SessaoUsuario,
  ) => Partial<ServicoPlanner>;
  consultas?: (enviar: ReturnType<typeof criarTransporteApi>) => ConsultasPlanner;
  interpretarCampos?: (status: number, resposta: unknown) => Record<string, string>;
  credenciais: RequestCredentials;
  /** Deve coordenar paginação/agregados. Nunca representar uma página como toda a base. */
  carregar: (
    enviar: ReturnType<typeof criarTransporteApi>,
    sinal?: AbortSignal,
  ) => Promise<unknown>;
  login: (dados: Credenciais) => RequisicaoMapeada;
  mapearSessao: (resposta: unknown) => unknown;
  logout: () => RequisicaoMapeada;
  venda: (dados: NovaVenda) => RequisicaoMapeada;
  mapearOperacao: (resposta: unknown) => unknown;
  despesa: (dados: Omit<Despesa, 'id'>) => RequisicaoMapeada;
  retomada: (id: string, chave: string) => RequisicaoMapeada;
}
/** Adapter executável por injeção: todos os schemas e lacunas são fornecidos pelo contrato ratificado. */
export function criarIntegracaoApi(
  url: string,
  contrato: ContratoServidor,
): { autenticacao: ServicoSessao; criarServico: (sessao: SessaoUsuario) => ServicoPlanner } {
  if (!contrato.versao.trim()) throw new Error('Identifique a versão do contrato.');
  const enviar = criarTransporteApi(url, contrato.credenciais, contrato.interpretarCampos);
  let token: string | undefined;
  const executar = <T>(pedido: RequisicaoMapeada, validar: (v: unknown) => T) =>
    enviar(pedido.caminho, validar, pedido);
  return {
    autenticacao: {
      cadastrar: contrato.cadastro ? async (dados) => {
        await enviar(contrato.cadastro!, (v) => {
          if (!v || typeof v !== 'object' || !('created' in v) || v.created !== true)
            throw new Error('Confirmação de cadastro inválida. Tente entrar antes de repetir o cadastro.');
        }, {metodo:'POST',dados});
      } : undefined,
      async entrar(dados) {
        token = undefined;
        const resultado = await executar(contrato.login(dados), (v) => ({
          sessao: validarSessao(contrato.mapearSessao(v)),
          token: contrato.extrairToken?.(v),
        }));
        token = resultado.token;
        return resultado.sessao;
      },
      async sair() {
        const anterior = token;
        token = undefined;
        await executar({ ...contrato.logout(), token: anterior }, () => undefined);
      },
    },
    criarServico(sessao) {
      const tokenSessao = token;
      const autenticado: typeof enviar = (caminho, validar, opcoes) =>
        enviar(caminho, validar, { ...opcoes, token: tokenSessao });
      const executar = <T>(pedido: RequisicaoMapeada, validar: (v: unknown) => T) =>
        autenticado(pedido.caminho, validar, pedido);
      const chavesRetomada = new Map<string, string>();
      const consultas = contrato.consultas?.(autenticado);
      const seguras: ConsultasPlanner = {};
      if(consultas?.consultarLoja) seguras.consultarLoja=consultas.consultarLoja;
      if(consultas?.salvarNomeLoja) seguras.salvarNomeLoja=consultas.salvarNomeLoja;
      if(consultas?.sugerirCategoria) seguras.sugerirCategoria=consultas.sugerirCategoria;
      if (consultas?.projetarCaixa) seguras.projetarCaixa = consultas.projetarCaixa;
      if (consultas?.exportarOperacoes) seguras.exportarOperacoes = consultas.exportarOperacoes;
      if (consultas?.consultarComposicao) seguras.consultarComposicao = consultas.consultarComposicao;
      if (consultas?.consultarTendencias)
        seguras.consultarTendencias = async (p, sinal) =>
          validarTendencias(await consultas.consultarTendencias!(p, sinal), p);
      if (
        consultas?.categoriasDespesa &&
        consultas.categoriasDespesa.every((c) => typeof c === 'string' && c.trim())
      )
        seguras.categoriasDespesa = [...new Set(consultas.categoriasDespesa)];
      if (consultas?.consultarDespesas)
        seguras.consultarDespesas = async (filtro, sinal) => {
          const r = await consultas.consultarDespesas!(filtro, sinal);
          if (
            !r ||
            !Array.isArray(r.itens) ||
            !Number.isSafeInteger(r.total) ||
            r.total < 0 ||
            r.pagina !== filtro.pagina ||
            r.tamanho !== filtro.tamanho ||
            r.itens.length > r.tamanho ||
            r.itens.length > r.total
          )
            throw new Error('Paginação de despesas inválida.');
          const itens = r.itens.map(validarDespesaRecebida);
          if (new Set(itens.map((i) => i.id)).size !== itens.length)
            throw new Error('Despesas repetidas na resposta.');
          return { ...r, itens };
        };

      if (consultas?.consultarResumo)
        seguras.consultarResumo = async (area, periodo, sinal) => {
          const r = await consultas.consultarResumo!(area, periodo, sinal);
          if (
            !r ||
            r.periodo?.inicio !== periodo.inicio ||
            r.periodo?.fim !== periodo.fim ||
            !Number.isFinite(Date.parse(r.atualizadoEm)) ||
            !Array.isArray(r.indicadores) ||
            r.indicadores.some(
              (i) =>
                !i ||
                typeof i.id !== 'string' ||
                !i.id ||
                typeof i.titulo !== 'string' ||
                typeof i.descricao !== 'string' ||
                !Number.isSafeInteger(i.valor),
            ) ||
            new Set(r.indicadores.map((i) => i.id)).size !== r.indicadores.length
          )
            throw new Error('Resumo financeiro incompatível com o período solicitado.');
          return r;
        };

      if (consultas?.consultarOperacao)
        seguras.consultarOperacao = async (id, sinal) => {
          const o = validarOperacao(await consultas.consultarOperacao!(id, sinal));
          if (o.id !== id) throw new Error('Identificação da resposta divergente.');
          return o;
        };
      if (consultas?.consultarOperacoes)
        seguras.consultarOperacoes = async (filtro, sinal) => {
          const pagina = await consultas.consultarOperacoes!(filtro, sinal);
          if (
            !pagina ||
            !Array.isArray(pagina.itens) ||
            !Number.isSafeInteger(pagina.total) ||
            pagina.total < 0 ||
            pagina.pagina !== filtro.pagina ||
            pagina.tamanho !== filtro.tamanho ||
            pagina.itens.length > pagina.tamanho ||
            pagina.itens.length > pagina.total
          )
            throw new Error('Paginação inválida.');
          const itens = pagina.itens.map(validarOperacao);
          if (new Set(itens.map((o) => o.id)).size !== itens.length)
            throw new Error('Operações duplicadas na página.');
          return { ...pagina, itens };
        };
      if (consultas?.simular)
        seguras.simular = async (entrada, sinal) => {
          const r = await consultas.simular!(entrada, sinal);
          if (
            [r.bruto, r.tributo, r.taxa, r.liquido].some(
              (v) => !Number.isSafeInteger(v) || v < 0,
            ) ||
            r.bruto !== entrada.bruto ||
            r.bruto !== r.tributo + r.taxa + r.liquido ||
            typeof r.regra !== 'string'
          )
            throw new Error('Resultado de simulação inválido.');
          return r;
        };
      if (consultas?.explicar)
        seguras.explicar = async (periodo, sinal) => {
          const r = await consultas.explicar!(periodo, sinal);
          if (
            r.periodo.inicio !== periodo.inicio ||
            r.periodo.fim !== periodo.fim ||
            typeof r.texto !== 'string' ||
            !['demonstrativa', 'servidor'].includes(r.origem)
          )
            throw new Error('Explicação recebida não corresponde ao período.');
          if (r.tendencias !== undefined) validarTendencias(r.tendencias, periodo);
          return r;
        };
      return {
        ...seguras,
        async carregar(sinal?: AbortSignal): Promise<BaseDemonstracao> {
          return validarBase(await contrato.carregar(autenticado, sinal));
        },
        async registrarVenda(venda): Promise<ResultadoVenda> {
          const pedido = contrato.venda(venda);
          return executar(
            { ...pedido, chaveIdempotencia: pedido.chaveIdempotencia ?? venda.chave },
            (v) =>
              contrato.mapearVenda
                ? contrato.mapearVenda(v)
                : validarOperacao(contrato.mapearOperacao(v)),
          );
        },
        async registrarDespesa(despesa) {
          await executar(contrato.despesa(despesa), () => undefined);
        },
        async reprocessar(id) {
          const chave = chavesRetomada.get(id) ?? crypto.randomUUID();
          chavesRetomada.set(id, chave);
          const pedido = contrato.retomada(id, chave);
          await executar(
            { ...pedido, chaveIdempotencia: pedido.chaveIdempotencia ?? chave },
            () => undefined,
          );
          chavesRetomada.delete(id);
        },
        ...contrato.prepararServico?.(autenticado, sessao),
      };
    },
  };
}
