// Capital de giro com parceiro de crédito (fintech ou banco). O comerciante
// autoriza o compartilhamento de dados agregados, simula e contrata dentro do app.
// No MVP o parceiro é simulado: nenhum dinheiro é movimentado.
import type { Operacao } from '../tipos';

export interface FatosCredito {
  entradasLiquidas90dCents: number;
  despesas90dCents: number;
  vendas90d: number;
}
export interface ParcelaCredito {
  numero: number;
  vencimento: string;
  valorCents: number;
  status: 'A_VENCER' | 'PAGA';
}
export interface PropostaCredito {
  id: string;
  modo: 'SIMULADO' | 'REAL';
  valorCents: number;
  parcelas: number;
  parcelaCents: number;
  totalCents: number;
  jurosCents: number;
  taxaMensalBp: number;
  cetAnualBp: number;
  primeiroVencimento: string;
  validaAte: string;
}
export interface ContratoCredito {
  id: string;
  contratadoEm: string;
  status: 'ATIVO' | 'QUITADO';
  modo: 'SIMULADO' | 'REAL';
  valorCents: number;
  parcelas: number;
  parcelaCents: number;
  totalCents: number;
  taxaMensalBp: number;
  cetAnualBp: number;
  cronograma: ParcelaCredito[];
}
export interface SituacaoCredito {
  parceiro: { nome: string; modo: 'SIMULADO' | 'REAL'; limiteCents: number; motivo?: string; fatos: FatosCredito };
  consentimento: { concedidoEm: string; escopos: string[] } | null;
  contratos: ContratoCredito[];
  podeContratar: boolean;
}
export interface ServicoCredito {
  consultar(sinal?: AbortSignal): Promise<SituacaoCredito>;
  consentir(): Promise<void>;
  revogar(): Promise<void>;
  simular(valorCents: number, parcelas: number): Promise<PropostaCredito>;
  contratar(propostaId: string): Promise<ContratoCredito>;
}

export const MINIMO_CREDITO_CENTS = 50_000;
export const MAXIMO_CREDITO_CENTS = 5_000_000;
export const TAXA_MENSAL_SIMULADA_BP = 249;

/** Mesmas regras do parceiro simulado do servidor (ParceiroCreditoSimulado.java). */
export function limiteSimulado(fatos: FatosCredito) {
  const limite = Math.min(MAXIMO_CREDITO_CENTS, Math.floor(Math.max(0, fatos.entradasLiquidas90dCents) / 2 / 10_000) * 10_000);
  return limite < MINIMO_CREDITO_CENTS
    ? {
        limiteCents: 0,
        motivo:
          'Ainda não há vendas suficientes para o parceiro oferecer crédito. São necessários pelo menos R$ 1.000,00 em entradas líquidas nos últimos 90 dias.',
      }
    : { limiteCents: limite };
}
/** Parcela fixa da tabela Price, arredondada para cima ao centavo. */
export function parcelaPrice(valorCents: number, taxaMensalBp: number, parcelas: number) {
  if (taxaMensalBp === 0) return Math.ceil(valorCents / parcelas);
  const i = taxaMensalBp / 10_000;
  const fator = (1 + i) ** parcelas;
  // Pequena margem para erro de ponto flutuante antes do arredondamento para cima.
  return Math.ceil((valorCents * i * fator) / (fator - 1) - 1e-6);
}
export function cetAnualBp(taxaMensalBp: number) {
  return Math.round(((1 + taxaMensalBp / 10_000) ** 12 - 1) * 10_000);
}
function somarMeses(data: string, meses: number) {
  const [a, m, d] = data.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}

/** Demonstração local: tudo em memória, recarregar a página volta ao início. */
export function criarCreditoDemo(operacoes: () => Operacao[], hoje: string): ServicoCredito {
  let consentimento: SituacaoCredito['consentimento'] = null;
  const propostas = new Map<string, PropostaCredito>();
  const contratos: ContratoCredito[] = [];
  const aguardar = () => new Promise((r) => setTimeout(r, 200));
  const fatos = (): FatosCredito => {
    const inicio = somarMeses(hoje, -3);
    const concluidas = operacoes().filter((o) => o.status === 'concluida' && o.data.slice(0, 10) > inicio && o.data.slice(0, 10) <= hoje);
    return {
      entradasLiquidas90dCents: concluidas.reduce((s, o) => s + o.liquido, 0),
      despesas90dCents: 0,
      vendas90d: concluidas.length,
    };
  };
  return {
    async consultar() {
      await aguardar();
      const f = fatos();
      const l = limiteSimulado(f);
      return {
        parceiro: { nome: 'Parceiro financeiro demonstrativo', modo: 'SIMULADO', limiteCents: l.limiteCents, motivo: l.motivo, fatos: f },
        consentimento: consentimento && structuredClone(consentimento),
        contratos: structuredClone(contratos),
        podeContratar: true,
      };
    },
    async consentir() {
      await aguardar();
      consentimento ??= { concedidoEm: new Date().toISOString(), escopos: ['VENDAS_E_CAIXA_90_DIAS'] };
    },
    async revogar() {
      await aguardar();
      consentimento = null;
    },
    async simular(valorCents, parcelas) {
      await aguardar();
      if (!consentimento) throw new Error('Autorize o compartilhamento dos dados com o parceiro antes de simular.');
      const l = limiteSimulado(fatos());
      if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 12) throw new Error('Escolha de 1 a 12 parcelas.');
      if (!Number.isInteger(valorCents) || valorCents < MINIMO_CREDITO_CENTS || valorCents > l.limiteCents)
        throw new Error(l.limiteCents === 0 ? l.motivo! : 'Escolha um valor entre R$ 500,00 e o limite disponível.');
      const parcelaCents = parcelaPrice(valorCents, TAXA_MENSAL_SIMULADA_BP, parcelas);
      const proposta: PropostaCredito = {
        id: crypto.randomUUID(),
        modo: 'SIMULADO',
        valorCents,
        parcelas,
        parcelaCents,
        totalCents: parcelaCents * parcelas,
        jurosCents: parcelaCents * parcelas - valorCents,
        taxaMensalBp: TAXA_MENSAL_SIMULADA_BP,
        cetAnualBp: cetAnualBp(TAXA_MENSAL_SIMULADA_BP),
        primeiroVencimento: somarMeses(hoje, 1),
        validaAte: new Date(Date.now() + 24 * 3600_000).toISOString(),
      };
      propostas.set(proposta.id, proposta);
      return structuredClone(proposta);
    },
    async contratar(id) {
      await aguardar();
      const existente = contratos.find((c) => c.id === `contrato-${id}`);
      if (existente) return structuredClone(existente);
      const p = propostas.get(id);
      if (!p) throw new Error('O registro não foi encontrado.');
      if (Date.parse(p.validaAte) <= Date.now()) throw new Error('A proposta venceu. Faça uma nova simulação.');
      if (!consentimento) throw new Error('O compartilhamento de dados com o parceiro foi revogado. Autorize de novo para contratar.');
      const contrato: ContratoCredito = {
        id: `contrato-${id}`,
        contratadoEm: new Date().toISOString(),
        status: 'ATIVO',
        modo: 'SIMULADO',
        valorCents: p.valorCents,
        parcelas: p.parcelas,
        parcelaCents: p.parcelaCents,
        totalCents: p.totalCents,
        taxaMensalBp: p.taxaMensalBp,
        cetAnualBp: p.cetAnualBp,
        cronograma: Array.from({ length: p.parcelas }, (_, n) => ({
          numero: n + 1,
          vencimento: somarMeses(p.primeiroVencimento, n),
          valorCents: p.parcelaCents,
          status: 'A_VENCER' as const,
        })),
      };
      contratos.unshift(contrato);
      return structuredClone(contrato);
    },
  };
}

// ---- Validação das respostas do servidor (/api/v1/credit) ----
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
const cents = (v: unknown, max = 100_000_000_00) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0 || v > max) throw new Error('Centavos inteiros esperados.');
  return v;
};
const modo = (v: unknown) => {
  if (v !== 'SIMULADO' && v !== 'REAL') throw new Error('Modo inválido.');
  return v;
};
function proposta(v: unknown): PropostaCredito {
  const o = obj(v);
  const p: PropostaCredito = {
    id: txt(o.id),
    modo: modo(o.mode),
    valorCents: cents(o.amountCents),
    parcelas: cents(o.installments, 12),
    parcelaCents: cents(o.installmentCents),
    totalCents: cents(o.totalCents),
    jurosCents: cents(o.interestCents),
    taxaMensalBp: cents(o.monthlyRateBp, 10_000),
    cetAnualBp: cents(o.annualCetBp, 1_000_000),
    primeiroVencimento: txt(o.firstDueOn),
    validaAte: txt(o.expiresAt),
  };
  if (p.parcelas < 1 || p.totalCents !== p.parcelaCents * p.parcelas || p.jurosCents !== p.totalCents - p.valorCents)
    throw new Error('Proposta inconsistente.');
  return p;
}
function contrato(v: unknown): ContratoCredito {
  const o = obj(v);
  if (!Array.isArray(o.schedule)) throw new Error('Lista inválida.');
  const c: ContratoCredito = {
    id: txt(o.id),
    contratadoEm: txt(o.acceptedAt),
    status: o.status === 'ATIVO' || o.status === 'QUITADO' ? o.status : (() => { throw new Error('Estado desconhecido.'); })(),
    modo: modo(o.mode),
    valorCents: cents(o.amountCents),
    parcelas: cents(o.installments, 12),
    parcelaCents: cents(o.installmentCents),
    totalCents: cents(o.totalCents),
    taxaMensalBp: cents(o.monthlyRateBp, 10_000),
    cetAnualBp: cents(o.annualCetBp, 1_000_000),
    cronograma: o.schedule.map((p) => {
      const x = obj(p);
      if (x.status !== 'A_VENCER' && x.status !== 'PAGA') throw new Error('Estado desconhecido.');
      return { numero: cents(x.number, 12), vencimento: txt(x.dueOn), valorCents: cents(x.amountCents), status: x.status };
    }),
  };
  if (c.cronograma.length !== c.parcelas) throw new Error('Parcelas divergentes.');
  return c;
}
export function criarCreditoApi(enviar: Enviar): ServicoCredito {
  return {
    consultar: (sinal) =>
      enviar(
        '/api/v1/credit',
        (v) => {
          const o = obj(v);
          const p = obj(o.partner);
          const f = obj(p.facts);
          const consent = o.consent === null ? null : obj(o.consent);
          return {
            parceiro: {
              nome: txt(p.name),
              modo: modo(p.mode),
              limiteCents: cents(p.limitCents),
              ...(p.reason !== undefined ? { motivo: txt(p.reason) } : {}),
              fatos: {
                entradasLiquidas90dCents: typeof f.netInflow90dCents === 'number' && Number.isSafeInteger(f.netInflow90dCents) ? f.netInflow90dCents : 0,
                despesas90dCents: typeof f.expenses90dCents === 'number' && Number.isSafeInteger(f.expenses90dCents) ? f.expenses90dCents : 0,
                vendas90d: cents(f.sales90d, 10_000_000),
              },
            },
            consentimento: consent && {
              concedidoEm: txt(consent.grantedAt),
              escopos: Array.isArray(consent.scopes) ? consent.scopes.map(txt) : [],
            },
            contratos: Array.isArray(o.contracts) ? o.contracts.map(contrato) : [],
            podeContratar: o.canContract === true,
          };
        },
        { sinal },
      ),
    consentir: () => enviar('/api/v1/credit/consent', () => undefined, { metodo: 'POST' }),
    revogar: () => enviar('/api/v1/credit/consent', () => undefined, { metodo: 'DELETE' }),
    simular: (valorCents, parcelas) =>
      enviar('/api/v1/credit/offers', proposta, { metodo: 'POST', dados: { amountCents: valorCents, installments: parcelas } }),
    contratar: (id) => {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.reject(new Error('Identificador inválido.'));
      return enviar(`/api/v1/credit/offers/${id}/accept`, contrato, { metodo: 'POST' });
    },
  };
}
