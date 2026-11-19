// Capital de giro com parceiros de crédito (fintech ou banco), de ponta a ponta:
// diagnóstico da descapitalização, ofertas comparáveis, crédito responsável,
// contratação, pagamento de parcela, quitação antecipada, desistência e eventos.
// No MVP os parceiros são simulados: nenhum dinheiro é movimentado.
// As regras abaixo são as mesmas do servidor (CreditoService.java / ParceiroCreditoSimulado.java).
import type { Despesa, Operacao } from '../tipos';

export type ModoCredito = 'SIMULADO' | 'REAL';
export type NivelComprometimento = 'SAUDAVEL' | 'ATENCAO' | 'ALTO' | 'EXCESSIVO' | 'SEM_RENDA';
export type SituacaoCaixa = 'SAUDAVEL' | 'ATENCAO' | 'DESCAPITALIZADO';

export interface FatosCredito {
  entradasLiquidas90dCents: number;
  despesas90dCents: number;
  vendas90d: number;
}
export interface ParceiroResumo {
  id: string;
  nome: string;
  modo: ModoCredito;
  limiteCents: number;
  motivo?: string;
  taxaMensalBp?: number;
  cetAnualBp?: number;
}
export interface DiagnosticoCaixa {
  impostoRetido90dCents: number;
  impostoRetidoMensalCents: number;
  saldoAtualCents: number;
  entradaMensalCents: number;
  despesaMensalCents: number;
  disponivel30dCents: number;
  falta30dCents: number;
  coberturaDias: number | null;
  situacao: SituacaoCaixa;
  valorRecomendadoCents: number;
  parcelasRecomendadas: number | null;
}
export interface PropostaCredito {
  id: string;
  parceiroId: string;
  parceiroNome: string;
  modo: ModoCredito;
  valorCents: number;
  parcelas: number;
  parcelaCents: number;
  totalCents: number;
  jurosCents: number;
  taxaMensalBp: number;
  cetAnualBp: number;
  comprometimentoBp: number | null;
  nivel: NivelComprometimento;
  podeContratar: boolean;
  primeiroVencimento: string;
  validaAte: string;
}
export interface ParcelaCredito {
  numero: number;
  vencimento: string;
  valorCents: number;
  status: 'A_VENCER' | 'PAGA';
  pagaEm: string | null;
}
export interface ContratoCredito {
  id: string;
  parceiroId: string;
  parceiroNome: string;
  contratadoEm: string;
  status: 'ATIVO' | 'QUITADO' | 'CANCELADO';
  modo: ModoCredito;
  valorCents: number;
  parcelas: number;
  parcelaCents: number;
  totalCents: number;
  taxaMensalBp: number;
  cetAnualBp: number;
  pagoCents: number;
  restanteCents: number;
  proximaParcela: ParcelaCredito | null;
  atrasada: boolean;
  desistenciaAte: string;
  podeDesistir: boolean;
  quitacaoCents: number | null;
  quitadoEm: string | null;
  canceladoEm: string | null;
  cronograma: ParcelaCredito[];
}
export interface CotacaoQuitacao {
  restanteCents: number;
  quitacaoCents: number;
  descontoCents: number;
}
export interface EventoCredito {
  tipo: string;
  contratoId: string | null;
  em: string;
}
export interface SituacaoCredito {
  parceiros: ParceiroResumo[];
  fatos: FatosCredito;
  diagnostico: DiagnosticoCaixa;
  consentimento: { concedidoEm: string; escopos: string[] } | null;
  contratos: ContratoCredito[];
  podeContratar: boolean;
}
export interface ServicoCredito {
  consultar(sinal?: AbortSignal): Promise<SituacaoCredito>;
  consentir(): Promise<void>;
  revogar(): Promise<void>;
  simular(valorCents: number, parcelas: number): Promise<{ ofertas: PropostaCredito[]; recusadoPor: string[] }>;
  contratar(propostaId: string): Promise<ContratoCredito>;
  pagarParcela(contratoId: string, numero: number): Promise<ContratoCredito>;
  cotarQuitacao(contratoId: string): Promise<CotacaoQuitacao>;
  quitar(contratoId: string): Promise<ContratoCredito>;
  desistir(contratoId: string): Promise<ContratoCredito>;
  eventos(sinal?: AbortSignal): Promise<EventoCredito[]>;
}

// ------------------------------------------------------------------ regras e cálculos

export const MINIMO_CREDITO_CENTS = 50_000;
export const MAXIMO_CREDITO_CENTS = 5_000_000;
export const COMPROMETIMENTO_SAUDAVEL_BP = 2000;
export const COMPROMETIMENTO_ATENCAO_BP = 3000;
export const COMPROMETIMENTO_MAXIMO_BP = 5000;
export const DIAS_DESISTENCIA = 7;
export const PARCEIROS_SIMULADOS = [
  { id: 'fintech-demo', nome: 'Fintech demonstrativa', taxaMensalBp: 249, percentualLimite: 50 },
  { id: 'banco-demo', nome: 'Banco demonstrativo', taxaMensalBp: 189, percentualLimite: 30 },
] as const;

export function limiteSimulado(fatos: FatosCredito, percentualLimite = 50) {
  const base = Math.floor((Math.max(0, fatos.entradasLiquidas90dCents) * percentualLimite) / 100);
  const limite = Math.min(MAXIMO_CREDITO_CENTS, Math.floor(base / 10_000) * 10_000);
  return limite < MINIMO_CREDITO_CENTS
    ? { limiteCents: 0, motivo: 'Ainda não há vendas suficientes para este parceiro oferecer crédito.' }
    : { limiteCents: limite };
}
/** Parcela fixa da tabela Price, arredondada para cima ao centavo. */
export function parcelaPrice(valorCents: number, taxaMensalBp: number, parcelas: number) {
  if (taxaMensalBp === 0) return Math.ceil(valorCents / parcelas);
  const i = taxaMensalBp / 10_000;
  const fator = (1 + i) ** parcelas;
  return Math.ceil((valorCents * i * fator) / (fator - 1) - 1e-6);
}
export function cetAnualBp(taxaMensalBp: number) {
  return Math.round(((1 + taxaMensalBp / 10_000) ** 12 - 1) * 10_000);
}
export function comprometimentoBp(parcelaCents: number, entradaMensalCents: number) {
  if (entradaMensalCents <= 0) return null;
  return Math.min(1_000_000, Math.ceil((parcelaCents * 10_000) / entradaMensalCents));
}
export function nivelComprometimento(bp: number | null): NivelComprometimento {
  if (bp === null) return 'SEM_RENDA';
  if (bp <= COMPROMETIMENTO_SAUDAVEL_BP) return 'SAUDAVEL';
  if (bp <= COMPROMETIMENTO_ATENCAO_BP) return 'ATENCAO';
  if (bp <= COMPROMETIMENTO_MAXIMO_BP) return 'ALTO';
  return 'EXCESSIVO';
}
export function somarMeses(data: string, meses: number) {
  const [a, m, d] = data.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}
const dia = (s: string) => Date.parse(`${s}T00:00:00Z`) / 86_400_000;
/** Prazo em meses (inteiros + dias restantes / 30), como no servidor. */
export function mesesAte(hoje: string, vencimento: string) {
  if (dia(vencimento) <= dia(hoje)) return 0;
  let meses = 0;
  while (dia(somarMeses(hoje, meses + 1)) <= dia(vencimento)) meses++;
  return meses + (dia(vencimento) - dia(somarMeses(hoje, meses))) / 30;
}
export function cotarQuitacao(hoje: string, taxaMensalBp: number, parcelas: { vencimento: string; valorCents: number }[]): CotacaoQuitacao {
  let restante = 0;
  let presente = 0;
  for (const p of parcelas) {
    restante += p.valorCents;
    presente += p.valorCents / (1 + taxaMensalBp / 10_000) ** mesesAte(hoje, p.vencimento);
  }
  const quitacao = Math.min(restante, Math.ceil(presente - 1e-6));
  return { restanteCents: restante, quitacaoCents: quitacao, descontoCents: restante - quitacao };
}
/** Diagnóstico da descapitalização: o mesmo do servidor. */
export function diagnosticar(entrada: {
  impostoRetido90dCents: number;
  saldoAtualCents: number;
  fatos: FatosCredito;
  melhorLimiteCents: number;
  menorTaxaBp: number;
}): DiagnosticoCaixa {
  const entradaMensal = Math.trunc(entrada.fatos.entradasLiquidas90dCents / 3);
  const despesaMensal = Math.trunc(entrada.fatos.despesas90dCents / 3);
  const disponivel = entrada.saldoAtualCents + entradaMensal;
  const falta = Math.max(0, despesaMensal - disponivel);
  const cobertura = despesaMensal > 0 ? Math.max(0, Math.min(9999, Math.trunc((entrada.saldoAtualCents * 30) / despesaMensal))) : null;
  let recomendado = 0;
  let parcelas: number | null = null;
  if (falta > 0 && entrada.melhorLimiteCents > 0) {
    recomendado = Math.min(entrada.melhorLimiteCents, Math.max(MINIMO_CREDITO_CENTS, Math.ceil(falta / 10_000) * 10_000));
    for (let n = 1; n <= 12; n++)
      if (entradaMensal > 0 && parcelaPrice(recomendado, entrada.menorTaxaBp, n) * 10_000 <= entradaMensal * COMPROMETIMENTO_ATENCAO_BP) {
        parcelas = n;
        break;
      }
  }
  return {
    impostoRetido90dCents: entrada.impostoRetido90dCents,
    impostoRetidoMensalCents: Math.trunc(entrada.impostoRetido90dCents / 3),
    saldoAtualCents: entrada.saldoAtualCents,
    entradaMensalCents: entradaMensal,
    despesaMensalCents: despesaMensal,
    disponivel30dCents: disponivel,
    falta30dCents: falta,
    coberturaDias: cobertura,
    situacao: falta > 0 ? 'DESCAPITALIZADO' : cobertura !== null && cobertura < 15 ? 'ATENCAO' : 'SAUDAVEL',
    valorRecomendadoCents: recomendado,
    parcelasRecomendadas: parcelas,
  };
}
export interface SemanaProjetada {
  semana: number;
  inicio: string;
  semCreditoCents: number;
  comCreditoCents: number;
}
/**
 * Caixa estimado nas próximas semanas, sem e com o crédito: saldo atual, mais o
 * resultado médio semanal (entradas menos despesas), mais o valor recebido, menos as
 * parcelas que vencem. Estimativa por médias dos últimos 90 dias, sem garantia.
 */
export function projetarSemanas(d: DiagnosticoCaixa, hoje: string, proposta: PropostaCredito | null, semanas = 12): SemanaProjetada[] {
  const resultadoSemanal = ((d.entradaMensalCents - d.despesaMensalCents) * 7) / 30;
  const vencimentos = proposta ? Array.from({ length: proposta.parcelas }, (_, k) => somarMeses(proposta.primeiroVencimento, k)) : [];
  return Array.from({ length: semanas + 1 }, (_, w) => {
    const fim = new Date(Date.parse(`${hoje}T00:00:00Z`) + w * 7 * 86_400_000).toISOString().slice(0, 10);
    const sem = Math.round(d.saldoAtualCents + resultadoSemanal * w);
    const pagas = vencimentos.filter((v) => v <= fim).length;
    const com = proposta ? sem + proposta.valorCents - pagas * proposta.parcelaCents : sem;
    return { semana: w, inicio: fim, semCreditoCents: sem, comCreditoCents: com };
  });
}

// ------------------------------------------------------------------ demonstração local

/** Demonstração local: tudo em memória, recarregar a página volta ao início. */
export function criarCreditoDemo(base: () => { operacoes: Operacao[]; despesas: Despesa[] }, hoje: string): ServicoCredito {
  let consentimento: SituacaoCredito['consentimento'] = null;
  const propostas = new Map<string, PropostaCredito>();
  const contratos: ContratoCredito[] = [];
  const eventos: EventoCredito[] = [];
  const aguardar = () => new Promise((r) => setTimeout(r, 200));
  const registrar = (tipo: string, contratoId: string | null = null) => eventos.unshift({ tipo, contratoId, em: new Date().toISOString() });
  const inicio = somarMeses(hoje, -3);
  const dentro = (d: string) => d.slice(0, 10) > inicio && d.slice(0, 10) <= hoje;
  const fatos = (): FatosCredito => {
    const b = base();
    const concluidas = b.operacoes.filter((o) => o.status === 'concluida' && dentro(o.data));
    return {
      entradasLiquidas90dCents: concluidas.reduce((s, o) => s + o.liquido, 0),
      despesas90dCents: b.despesas.filter((x) => dentro(x.data)).reduce((s, x) => s + x.valor, 0),
      vendas90d: concluidas.length,
    };
  };
  const parceiros = (f: FatosCredito): ParceiroResumo[] =>
    PARCEIROS_SIMULADOS.map((p) => {
      const l = limiteSimulado(f, p.percentualLimite);
      return {
        id: p.id,
        nome: p.nome,
        modo: 'SIMULADO' as const,
        limiteCents: l.limiteCents,
        ...(l.motivo ? { motivo: l.motivo } : { taxaMensalBp: p.taxaMensalBp, cetAnualBp: cetAnualBp(p.taxaMensalBp) }),
      };
    });
  const atualizar = (c: ContratoCredito) => {
    c.pagoCents = c.cronograma.filter((p) => p.status === 'PAGA').reduce((s, p) => s + p.valorCents, 0);
    const abertas = c.cronograma.filter((p) => p.status === 'A_VENCER');
    c.restanteCents = c.status === 'ATIVO' ? abertas.reduce((s, p) => s + p.valorCents, 0) : 0;
    c.proximaParcela = c.status === 'ATIVO' ? (abertas[0] ?? null) : null;
    c.atrasada = Boolean(c.proximaParcela && c.proximaParcela.vencimento < hoje);
    c.podeDesistir = c.status === 'ATIVO' && c.pagoCents === 0 && Date.now() < Date.parse(c.desistenciaAte);
    return structuredClone(c);
  };
  const achar = (id: string) => {
    const c = contratos.find((x) => x.id === id);
    if (!c) throw new Error('O registro não foi encontrado.');
    return c;
  };
  return {
    async consultar() {
      await aguardar();
      const f = fatos();
      const lista = parceiros(f);
      const b = base();
      const saldo = b.operacoes.filter((o) => o.status === 'concluida' && o.data.slice(0, 10) <= hoje).reduce((s, o) => s + o.liquido, 0) - b.despesas.reduce((s, x) => s + x.valor, 0);
      const comLimite = lista.filter((p) => p.limiteCents > 0);
      return {
        parceiros: lista,
        fatos: f,
        diagnostico: diagnosticar({
          impostoRetido90dCents: b.operacoes.filter((o) => o.status === 'concluida' && dentro(o.data)).reduce((s, o) => s + o.tributo, 0),
          saldoAtualCents: saldo,
          fatos: f,
          melhorLimiteCents: Math.max(0, ...lista.map((p) => p.limiteCents)),
          menorTaxaBp: comLimite.length ? Math.min(...comLimite.map((p) => p.taxaMensalBp!)) : 0,
        }),
        consentimento: consentimento && structuredClone(consentimento),
        contratos: contratos.map(atualizar),
        podeContratar: true,
      };
    },
    async consentir() {
      await aguardar();
      if (!consentimento) {
        consentimento = { concedidoEm: new Date().toISOString(), escopos: ['VENDAS_E_CAIXA_90_DIAS'] };
        registrar('CONSENTIMENTO_CONCEDIDO');
      }
    },
    async revogar() {
      await aguardar();
      if (consentimento) registrar('CONSENTIMENTO_REVOGADO');
      consentimento = null;
    },
    async simular(valorCents, parcelas) {
      await aguardar();
      if (!consentimento) throw new Error('Autorize o compartilhamento dos dados com os parceiros antes de simular.');
      if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 12) throw new Error('Escolha de 1 a 12 parcelas.');
      const f = fatos();
      const entradaMensal = Math.trunc(f.entradasLiquidas90dCents / 3);
      const ofertas: PropostaCredito[] = [];
      const recusadoPor: string[] = [];
      for (const p of PARCEIROS_SIMULADOS) {
        const l = limiteSimulado(f, p.percentualLimite);
        if (!Number.isInteger(valorCents) || valorCents < MINIMO_CREDITO_CENTS || valorCents > l.limiteCents) {
          recusadoPor.push(p.nome);
          continue;
        }
        const parcela = parcelaPrice(valorCents, p.taxaMensalBp, parcelas);
        const comp = comprometimentoBp(parcela, entradaMensal);
        const proposta: PropostaCredito = {
          id: crypto.randomUUID(),
          parceiroId: p.id,
          parceiroNome: p.nome,
          modo: 'SIMULADO',
          valorCents,
          parcelas,
          parcelaCents: parcela,
          totalCents: parcela * parcelas,
          jurosCents: parcela * parcelas - valorCents,
          taxaMensalBp: p.taxaMensalBp,
          cetAnualBp: cetAnualBp(p.taxaMensalBp),
          comprometimentoBp: comp,
          nivel: nivelComprometimento(comp),
          podeContratar: comp !== null && comp <= COMPROMETIMENTO_MAXIMO_BP,
          primeiroVencimento: somarMeses(hoje, 1),
          validaAte: new Date(Date.now() + 24 * 3600_000).toISOString(),
        };
        propostas.set(proposta.id, proposta);
        ofertas.push(proposta);
      }
      if (!ofertas.length) throw new Error('Nenhum parceiro oferece esse valor agora. Escolha um valor entre R$ 500,00 e o maior limite disponível.');
      ofertas.sort((a, b) => a.cetAnualBp - b.cetAnualBp);
      registrar('PROPOSTAS_GERADAS');
      return { ofertas: structuredClone(ofertas), recusadoPor };
    },
    async contratar(id) {
      await aguardar();
      const existente = contratos.find((c) => c.id === `contrato-${id}`);
      if (existente) return atualizar(existente);
      const p = propostas.get(id);
      if (!p) throw new Error('O registro não foi encontrado.');
      if (Date.parse(p.validaAte) <= Date.now()) throw new Error('A proposta venceu. Faça uma nova simulação.');
      if (!consentimento) throw new Error('O compartilhamento de dados com os parceiros foi revogado. Autorize de novo para contratar.');
      if (!p.podeContratar) throw new Error('A parcela comprometeria mais da metade das entradas líquidas mensais da loja. Escolha um valor menor ou mais parcelas.');
      const contrato: ContratoCredito = {
        id: `contrato-${id}`,
        parceiroId: p.parceiroId,
        parceiroNome: p.parceiroNome,
        contratadoEm: new Date().toISOString(),
        status: 'ATIVO',
        modo: 'SIMULADO',
        valorCents: p.valorCents,
        parcelas: p.parcelas,
        parcelaCents: p.parcelaCents,
        totalCents: p.totalCents,
        taxaMensalBp: p.taxaMensalBp,
        cetAnualBp: p.cetAnualBp,
        pagoCents: 0,
        restanteCents: p.totalCents,
        proximaParcela: null,
        atrasada: false,
        desistenciaAte: new Date(Date.now() + DIAS_DESISTENCIA * 86_400_000).toISOString(),
        podeDesistir: true,
        quitacaoCents: null,
        quitadoEm: null,
        canceladoEm: null,
        cronograma: Array.from({ length: p.parcelas }, (_, n) => ({
          numero: n + 1,
          vencimento: somarMeses(p.primeiroVencimento, n),
          valorCents: p.parcelaCents,
          status: 'A_VENCER' as const,
          pagaEm: null,
        })),
      };
      contratos.unshift(contrato);
      registrar('CONTRATADO', contrato.id);
      return atualizar(contrato);
    },
    async pagarParcela(contratoId, numero) {
      await aguardar();
      const c = achar(contratoId);
      if (c.status !== 'ATIVO') throw new Error('Este contrato não está ativo.');
      const proxima = c.cronograma.find((p) => p.status === 'A_VENCER');
      if (!proxima) throw new Error('Não há parcelas a pagar.');
      if (proxima.numero !== numero) throw new Error(`Pague as parcelas em ordem. A próxima é a parcela ${proxima.numero}.`);
      proxima.status = 'PAGA';
      proxima.pagaEm = new Date().toISOString();
      registrar('PARCELA_PAGA', c.id);
      if (c.cronograma.every((p) => p.status === 'PAGA')) {
        c.status = 'QUITADO';
        c.quitadoEm = new Date().toISOString();
        registrar('QUITADO', c.id);
      }
      return atualizar(c);
    },
    async cotarQuitacao(contratoId) {
      await aguardar();
      const c = achar(contratoId);
      if (c.status !== 'ATIVO') throw new Error('Este contrato não está ativo.');
      return cotarQuitacao(hoje, c.taxaMensalBp, c.cronograma.filter((p) => p.status === 'A_VENCER'));
    },
    async quitar(contratoId) {
      await aguardar();
      const c = achar(contratoId);
      if (c.status !== 'ATIVO') throw new Error('Este contrato não está ativo.');
      const q = cotarQuitacao(hoje, c.taxaMensalBp, c.cronograma.filter((p) => p.status === 'A_VENCER'));
      const agora = new Date().toISOString();
      c.cronograma.forEach((p) => {
        if (p.status === 'A_VENCER') {
          p.status = 'PAGA';
          p.pagaEm = agora;
        }
      });
      c.status = 'QUITADO';
      c.quitadoEm = agora;
      c.quitacaoCents = q.quitacaoCents;
      registrar('QUITADO', c.id);
      return atualizar(c);
    },
    async desistir(contratoId) {
      await aguardar();
      const c = achar(contratoId);
      if (c.status !== 'ATIVO') throw new Error('Este contrato não está ativo.');
      if (Date.now() >= Date.parse(c.desistenciaAte)) throw new Error('O prazo de 7 dias para desistir terminou. Você pode quitar antecipadamente.');
      if (c.cronograma.some((p) => p.status === 'PAGA')) throw new Error('Já há parcela paga. Use a quitação antecipada.');
      c.status = 'CANCELADO';
      c.canceladoEm = new Date().toISOString();
      c.quitacaoCents = c.valorCents;
      registrar('CANCELADO_ARREPENDIMENTO', c.id);
      return atualizar(c);
    },
    async eventos() {
      await aguardar();
      return structuredClone(eventos);
    },
  };
}

// ------------------------------------------------------------------ API (/api/v1/credit)

type Enviar = <T>(
  caminho: string,
  validar: (v: unknown) => T,
  opcoes?: { metodo?: 'GET' | 'POST' | 'DELETE'; dados?: unknown; sinal?: AbortSignal },
) => Promise<T>;
const obj = (v: unknown) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Objeto esperado.');
  return v as Record<string, unknown>;
};
const txt = (v: unknown) => {
  if (typeof v !== 'string' || !v || v.length > 500) throw new Error('Texto inválido.');
  return v;
};
const txtOuNulo = (v: unknown) => (v === null || v === undefined ? null : txt(v));
const cents = (v: unknown, max = 10_000_000_000) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0 || v > max) throw new Error('Centavos inteiros esperados.');
  return v;
};
const inteiroLivre = (v: unknown) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v)) throw new Error('Centavos inteiros esperados.');
  return v;
};
const opcao = <T extends string>(v: unknown, permitidos: readonly T[]) => {
  if (!permitidos.includes(v as T)) throw new Error('Estado desconhecido.');
  return v as T;
};
const MODOS = ['SIMULADO', 'REAL'] as const;
const NIVEIS = ['SAUDAVEL', 'ATENCAO', 'ALTO', 'EXCESSIVO', 'SEM_RENDA'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function proposta(v: unknown): PropostaCredito {
  const o = obj(v);
  const p: PropostaCredito = {
    id: txt(o.id),
    parceiroId: txt(o.partnerId),
    parceiroNome: txt(o.partnerName),
    modo: opcao(o.mode, MODOS),
    valorCents: cents(o.amountCents),
    parcelas: cents(o.installments, 12),
    parcelaCents: cents(o.installmentCents),
    totalCents: cents(o.totalCents),
    jurosCents: cents(o.interestCents),
    taxaMensalBp: cents(o.monthlyRateBp, 10_000),
    cetAnualBp: cents(o.annualCetBp, 1_000_000),
    comprometimentoBp: o.commitmentBp === null ? null : cents(o.commitmentBp, 1_000_000),
    nivel: opcao(o.commitmentLevel, NIVEIS),
    podeContratar: o.canContract === true,
    primeiroVencimento: txt(o.firstDueOn),
    validaAte: txt(o.expiresAt),
  };
  if (p.parcelas < 1 || p.totalCents !== p.parcelaCents * p.parcelas || p.jurosCents !== p.totalCents - p.valorCents)
    throw new Error('Proposta inconsistente.');
  if (p.nivel !== nivelComprometimento(p.comprometimentoBp)) throw new Error('Proposta inconsistente.');
  return p;
}
function parcela(v: unknown): ParcelaCredito {
  const x = obj(v);
  return {
    numero: cents(x.number, 12),
    vencimento: txt(x.dueOn),
    valorCents: cents(x.amountCents),
    status: opcao(x.status, ['A_VENCER', 'PAGA'] as const),
    pagaEm: txtOuNulo(x.paidAt),
  };
}
function contrato(v: unknown): ContratoCredito {
  const o = obj(v);
  if (!Array.isArray(o.schedule)) throw new Error('Lista inválida.');
  const c: ContratoCredito = {
    id: txt(o.id),
    parceiroId: txt(o.partnerId),
    parceiroNome: txt(o.partnerName),
    contratadoEm: txt(o.acceptedAt),
    status: opcao(o.status, ['ATIVO', 'QUITADO', 'CANCELADO'] as const),
    modo: opcao(o.mode, MODOS),
    valorCents: cents(o.amountCents),
    parcelas: cents(o.installments, 12),
    parcelaCents: cents(o.installmentCents),
    totalCents: cents(o.totalCents),
    taxaMensalBp: cents(o.monthlyRateBp, 10_000),
    cetAnualBp: cents(o.annualCetBp, 1_000_000),
    pagoCents: cents(o.paidCents),
    restanteCents: cents(o.remainingCents),
    proximaParcela: o.nextInstallment === null || o.nextInstallment === undefined ? null : parcela(o.nextInstallment),
    atrasada: o.overdue === true,
    desistenciaAte: txt(o.withdrawalUntil),
    podeDesistir: o.canWithdraw === true,
    quitacaoCents: o.payoffCents === null || o.payoffCents === undefined ? null : cents(o.payoffCents),
    quitadoEm: txtOuNulo(o.settledAt),
    canceladoEm: txtOuNulo(o.cancelledAt),
    cronograma: o.schedule.map(parcela),
  };
  if (c.cronograma.length !== c.parcelas) throw new Error('Parcelas divergentes.');
  return c;
}
function diagnostico(v: unknown): DiagnosticoCaixa {
  const d = obj(v);
  return {
    impostoRetido90dCents: cents(d.taxWithheld90dCents),
    impostoRetidoMensalCents: cents(d.taxWithheldMonthlyCents),
    saldoAtualCents: inteiroLivre(d.currentBalanceCents),
    entradaMensalCents: inteiroLivre(d.monthlyNetInflowCents),
    despesaMensalCents: inteiroLivre(d.monthlyExpensesCents),
    disponivel30dCents: inteiroLivre(d.available30dCents),
    falta30dCents: cents(d.shortfall30dCents),
    coberturaDias: d.coverageDays === null || d.coverageDays === undefined ? null : cents(d.coverageDays, 9999),
    situacao: opcao(d.status, ['SAUDAVEL', 'ATENCAO', 'DESCAPITALIZADO'] as const),
    valorRecomendadoCents: cents(d.recommendedAmountCents),
    parcelasRecomendadas: d.recommendedInstallments === null || d.recommendedInstallments === undefined ? null : cents(d.recommendedInstallments, 12),
  };
}
const idSeguro = (id: string) => {
  if (!UUID.test(id)) throw new Error('Identificador inválido.');
  return id;
};
export function criarCreditoApi(enviar: Enviar): ServicoCredito {
  return {
    consultar: (sinal) =>
      enviar(
        '/api/v1/credit',
        (v) => {
          const o = obj(v);
          const f = obj(o.facts);
          if (!Array.isArray(o.partners)) throw new Error('Lista inválida.');
          const consent = o.consent === null || o.consent === undefined ? null : obj(o.consent);
          return {
            parceiros: o.partners.map((x) => {
              const p = obj(x);
              return {
                id: txt(p.id),
                nome: txt(p.name),
                modo: opcao(p.mode, MODOS),
                limiteCents: cents(p.limitCents),
                ...(p.reason !== undefined ? { motivo: txt(p.reason) } : {}),
                ...(p.monthlyRateBp !== undefined ? { taxaMensalBp: cents(p.monthlyRateBp, 10_000), cetAnualBp: cents(p.annualCetBp, 1_000_000) } : {}),
              };
            }),
            fatos: {
              entradasLiquidas90dCents: inteiroLivre(f.netInflow90dCents),
              despesas90dCents: inteiroLivre(f.expenses90dCents),
              vendas90d: cents(f.sales90d, 10_000_000),
            },
            diagnostico: diagnostico(o.diagnosis),
            consentimento: consent && { concedidoEm: txt(consent.grantedAt), escopos: Array.isArray(consent.scopes) ? consent.scopes.map(txt) : [] },
            contratos: Array.isArray(o.contracts) ? o.contracts.map(contrato) : [],
            podeContratar: o.canContract === true,
          };
        },
        { sinal },
      ),
    consentir: () => enviar('/api/v1/credit/consent', () => undefined, { metodo: 'POST' }),
    revogar: () => enviar('/api/v1/credit/consent', () => undefined, { metodo: 'DELETE' }),
    simular: (valorCents, parcelas) =>
      enviar(
        '/api/v1/credit/offers',
        (v) => {
          const o = obj(v);
          if (!Array.isArray(o.offers)) throw new Error('Lista inválida.');
          const ofertas = o.offers.map(proposta);
          for (let i = 1; i < ofertas.length; i++) if (ofertas[i].cetAnualBp < ofertas[i - 1].cetAnualBp) throw new Error('Proposta inconsistente.');
          return { ofertas, recusadoPor: Array.isArray(o.declinedBy) ? o.declinedBy.map(txt) : [] };
        },
        { metodo: 'POST', dados: { amountCents: valorCents, installments: parcelas } },
      ),
    contratar: async (id) => enviar(`/api/v1/credit/offers/${idSeguro(id)}/accept`, contrato, { metodo: 'POST' }),
    pagarParcela: async (id, numero) => {
      if (!Number.isInteger(numero) || numero < 1 || numero > 12) throw new Error('Identificador inválido.');
      return enviar(`/api/v1/credit/contracts/${idSeguro(id)}/installments/${numero}/pay`, contrato, { metodo: 'POST' });
    },
    cotarQuitacao: async (id) =>
      enviar(`/api/v1/credit/contracts/${idSeguro(id)}/payoff`, (v) => {
        const o = obj(v);
        const q = { restanteCents: cents(o.remainingCents), quitacaoCents: cents(o.payoffCents), descontoCents: cents(o.discountCents) };
        if (q.restanteCents - q.quitacaoCents !== q.descontoCents) throw new Error('Proposta inconsistente.');
        return q;
      }),
    quitar: async (id) => enviar(`/api/v1/credit/contracts/${idSeguro(id)}/payoff`, contrato, { metodo: 'POST' }),
    desistir: async (id) => enviar(`/api/v1/credit/contracts/${idSeguro(id)}/cancel`, contrato, { metodo: 'POST' }),
    eventos: (sinal) =>
      enviar(
        '/api/v1/credit/events',
        (v) => {
          if (!Array.isArray(v)) throw new Error('Lista inválida.');
          return v.map((e) => {
            const x = obj(e);
            return { tipo: txt(x.type), contratoId: txtOuNulo(x.contractId), em: txt(x.at) };
          });
        },
        { sinal },
      ),
  };
}
