// Reforma Tributária no caixa (Thayná Batista da Silva).
// Ferramentas para o comerciante lidar com os outros efeitos do split payment:
// créditos de IBS/CBS das compras, preço de venda, prazo com fornecedores,
// antecipação de recebíveis, leitura do XML da NF-e e pacote para o contador.
// Tudo em centavos inteiros e pontos-base. Os percentuais são informados pela
// pessoa (o sistema não tem as alíquotas oficiais), e nada movimenta dinheiro.
import type { Despesa, Operacao } from '../tipos';

export interface VendaReforma {
  id: string;
  data: string;
  meio: string;
  brutoCents: number;
  impostoCents: number;
  taxaCents: number;
  liquidoCents: number;
}
export interface CompraReforma {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valorCents: number;
  creditoCents: number;
}
export interface ResumoReforma {
  de: string;
  ate: string;
  vendas: number;
  brutoCents: number;
  impostoRetidoCents: number;
  taxasCents: number;
  liquidoCents: number;
  compras: number;
  comprasCents: number;
  comprasComCredito: number;
  creditoCents: number;
  creditoUsavelCents: number;
  creditoAcumuladoCents: number;
  impostoLiquidoCents: number;
  linhasVendas: VendaReforma[];
  linhasCompras: CompraReforma[];
  limiteLinhas: number;
}
export interface ServicoReforma {
  resumo(de: string, ate: string, sinal?: AbortSignal): Promise<ResumoReforma>;
}

export const MAXIMO_BP = 10_000;

/** Crédito usável, acumulado e imposto líquido a partir do imposto retido e dos créditos. */
export function compensar(impostoRetidoCents: number, creditoCents: number) {
  return {
    creditoUsavelCents: Math.min(impostoRetidoCents, creditoCents),
    creditoAcumuladoCents: Math.max(0, creditoCents - impostoRetidoCents),
    impostoLiquidoCents: Math.max(0, impostoRetidoCents - creditoCents),
  };
}

// ------------------------------------------------------------ preço de venda
export interface EntradaPreco {
  custoCents: number;
  creditoCents: number;
  aliquotaBp: number;
  taxaBp: number;
  margemBp: number;
  precoAtualCents?: number | null;
}
export interface ResultadoPreco {
  precoBaseCents: number;
  impostoCents: number;
  precoFinalCents: number;
  taxaCents: number;
  custoLiquidoCents: number;
  lucroCents: number;
  margemAtualBp: number | null;
  diferencaCents: number | null;
}
/**
 * Preço que mantém a margem desejada com o IBS/CBS "por fora" (calculado sobre o preço sem o
 * imposto, como na Reforma). O crédito da compra reduz o custo, porque volta como abatimento do
 * imposto. A taxa da maquininha incide sobre o valor total cobrado do cliente.
 * Fórmula: base = (custo - crédito) / (1 - taxa x (1 + alíquota) - margem); total = base x (1 + alíquota).
 */
export function calcularPreco(e: EntradaPreco): ResultadoPreco | { erro: string } {
  const inteiros = [e.custoCents, e.creditoCents, e.aliquotaBp, e.taxaBp, e.margemBp];
  if (inteiros.some((v) => !Number.isSafeInteger(v) || v < 0)) return { erro: 'Use valores positivos.' };
  if (e.custoCents <= 0) return { erro: 'Informe o custo do produto.' };
  if (e.creditoCents > e.custoCents) return { erro: 'O crédito não pode ser maior que o custo.' };
  if (e.aliquotaBp > MAXIMO_BP || e.taxaBp > MAXIMO_BP || e.margemBp > MAXIMO_BP) return { erro: 'Os percentuais vão de 0 a 100.' };
  const a = e.aliquotaBp / MAXIMO_BP,
    f = e.taxaBp / MAXIMO_BP,
    m = e.margemBp / MAXIMO_BP;
  const divisor = 1 - f * (1 + a) - m;
  if (divisor <= 0.0001) return { erro: 'Com essa taxa e essa margem, nenhum preço fecha a conta. Diminua a margem.' };
  const custoLiquido = e.custoCents - e.creditoCents;
  const base = Math.ceil(custoLiquido / divisor);
  const imposto = Math.round(base * a);
  const total = base + imposto;
  const taxa = Math.round(total * f);
  const lucro = total - imposto - taxa - custoLiquido;
  let margemAtualBp: number | null = null,
    diferencaCents: number | null = null;
  if (e.precoAtualCents && e.precoAtualCents > 0) {
    const baseAtual = e.precoAtualCents / (1 + a);
    const lucroAtual = e.precoAtualCents - (e.precoAtualCents - baseAtual) - e.precoAtualCents * f - custoLiquido;
    margemAtualBp = Math.round((lucroAtual / baseAtual) * MAXIMO_BP);
    diferencaCents = total - e.precoAtualCents;
  }
  return { precoBaseCents: base, impostoCents: imposto, precoFinalCents: total, taxaCents: taxa, custoLiquidoCents: custoLiquido, lucroCents: lucro, margemAtualBp, diferencaCents };
}

// ------------------------------------------------------------ prazo com fornecedores
/** Dinheiro que fica no caixa ao pagar o fornecedor mais tarde: compras por dia x dias a mais. */
export function caixaComPrazo(comprasMensaisCents: number, prazoAtualDias: number, prazoNovoDias: number) {
  if (![comprasMensaisCents, prazoAtualDias, prazoNovoDias].every((v) => Number.isSafeInteger(v) && v >= 0)) return null;
  if (prazoAtualDias > 180 || prazoNovoDias > 180) return null;
  const diasGanhos = prazoNovoDias - prazoAtualDias;
  return { diasGanhos, caixaLiberadoCents: Math.round((comprasMensaisCents * diasGanhos) / 30) };
}

// ------------------------------------------------------------ antecipação de recebíveis
export interface ResultadoAntecipacao {
  descontoCents: number;
  liquidoCents: number;
  custoMensalEfetivoBp: number;
}
/**
 * Antecipar vendas no cartão: o desconto é a taxa ao mês proporcional aos dias que faltam
 * (prática do mercado). O custo mensal efetivo permite comparar com o capital de giro.
 */
export function anteciparRecebiveis(valorCents: number, dias: number, taxaMensalBp: number): ResultadoAntecipacao | null {
  if (![valorCents, dias, taxaMensalBp].every((v) => Number.isSafeInteger(v) && v >= 0)) return null;
  if (valorCents <= 0 || dias < 1 || dias > 360 || taxaMensalBp > 2_000) return null;
  const desconto = Math.round((valorCents * taxaMensalBp * dias) / (MAXIMO_BP * 30));
  const liquido = valorCents - desconto;
  if (liquido <= 0) return null;
  const custo = Math.pow(valorCents / liquido, 30 / dias) - 1;
  return { descontoCents: desconto, liquidoCents: liquido, custoMensalEfetivoBp: Math.round(custo * MAXIMO_BP) };
}

// ------------------------------------------------------------ XML da NF-e de compra
export interface NotaCompra {
  numero: string;
  emitente: string;
  data: string;
  valorCents: number;
  creditoCents: number;
  temIbsCbs: boolean;
}
export const TAMANHO_MAXIMO_XML = 1_000_000;
const decimal = (t: string | null | undefined) => {
  const s = (t ?? '').trim();
  if (!/^\d{1,13}(\.\d{1,2})?$/.test(s)) return null;
  const [i, f = ''] = s.split('.');
  return Number(i) * 100 + Number(f.padEnd(2, '0'));
};
/**
 * Lê a NF-e (layout da Reforma: grupo IBSCBSTot com gIBS/vIBS e gCBS/vCBS). Recusa XML com
 * DOCTYPE ou entidades, para não expandir conteúdo escondido. Nada é enviado a lugar nenhum:
 * o resultado só preenche o formulário, e a pessoa confere antes de salvar.
 */
export function lerNotaCompra(xml: string): NotaCompra {
  if (xml.length > TAMANHO_MAXIMO_XML) throw new Error('O arquivo XML é grande demais.');
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('XML com declarações não permitidas.');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Não foi possível ler o XML. Confira se é o arquivo da NF-e.');
  const um = (pai: Element | Document, nome: string) => pai.getElementsByTagNameNS('*', nome)[0] ?? null;
  const filho = (pai: Element | null, nome: string) => (pai ? ([...pai.children].find((c) => c.localName === nome) ?? null) : null);
  const infNFe = um(doc, 'infNFe');
  if (!infNFe) throw new Error('Este XML não parece ser uma NF-e.');
  const ide = filho(infNFe, 'ide'),
    emit = filho(infNFe, 'emit'),
    total = filho(infNFe, 'total');
  const valor = decimal(filho(filho(total, 'ICMSTot'), 'vNF')?.textContent) ?? decimal(um(infNFe, 'vNF')?.textContent);
  if (!valor || valor > 100_000_000) throw new Error('A NF-e não tem um valor total válido.');
  const dataTexto = (filho(ide, 'dhEmi')?.textContent ?? filho(ide, 'dEmi')?.textContent ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataTexto)) throw new Error('A NF-e não tem uma data de emissão válida.');
  const ibsCbs = filho(total, 'IBSCBSTot');
  const vIBS = decimal(filho(filho(ibsCbs, 'gIBS'), 'vIBS')?.textContent) ?? 0;
  const vCBS = decimal(filho(filho(ibsCbs, 'gCBS'), 'vCBS')?.textContent) ?? 0;
  const limpar = (s: string | null | undefined, max: number) => (s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  return {
    numero: limpar(filho(ide, 'nNF')?.textContent, 20),
    emitente: limpar(filho(emit, 'xFant')?.textContent || filho(emit, 'xNome')?.textContent, 60),
    data: dataTexto,
    valorCents: valor,
    creditoCents: Math.min(vIBS + vCBS, valor),
    temIbsCbs: Boolean(ibsCbs),
  };
}
/** Descrição curta (até 100 caracteres) para a despesa criada a partir da nota. */
export function descricaoDaNota(n: NotaCompra) {
  return [n.numero ? `NF-e ${n.numero}` : 'NF-e', n.emitente].filter(Boolean).join(' · ').slice(0, 100);
}

// ------------------------------------------------------------ pacote do contador
export const COLUNAS_CONTADOR = ['Tipo', 'Data', 'Identificação', 'Descrição', 'Valor bruto (R$)', 'IBS/CBS retido (R$)', 'Taxa (R$)', 'Líquido (R$)', 'Crédito IBS/CBS (R$)'];
const reais = (c: number) => (c / 100).toFixed(2).replace('.', ',');
/** Linhas do CSV para o contador: resumo do período, vendas e compras, com os mesmos números da tela. */
export function linhasContador(r: ResumoReforma): string[][] {
  const linhas: string[][] = [
    ['Resumo', `${r.de} a ${r.ate}`, 'Vendas', `${r.vendas} vendas concluídas`, reais(r.brutoCents), reais(r.impostoRetidoCents), reais(r.taxasCents), reais(r.liquidoCents), ''],
    ['Resumo', `${r.de} a ${r.ate}`, 'Compras', `${r.compras} compras, ${r.comprasComCredito} com crédito`, reais(r.comprasCents), '', '', '', reais(r.creditoCents)],
    ['Resumo', `${r.de} a ${r.ate}`, 'Compensação', `Crédito usado ${reais(r.creditoUsavelCents)}; acumulado ${reais(r.creditoAcumuladoCents)}`, '', reais(r.impostoLiquidoCents), '', '', reais(r.creditoUsavelCents)],
  ];
  for (const v of r.linhasVendas) linhas.push(['Venda', v.data, v.id, v.meio, reais(v.brutoCents), reais(v.impostoCents), reais(v.taxaCents), reais(v.liquidoCents), '']);
  for (const c of r.linhasCompras) linhas.push(['Compra', c.data, c.id, `${c.descricao} (${c.categoria})`, reais(c.valorCents), '', '', '', reais(c.creditoCents)]);
  return linhas;
}

// ------------------------------------------------------------ demonstração
const MEIOS_DEMO: Record<string, string> = { PIX: 'PIX', Débito: 'DEBIT', Crédito: 'CREDIT' };
export function resumirBase(b: { operacoes: Operacao[]; despesas: Despesa[] }, de: string, ate: string, limite = 1000): ResumoReforma {
  const dentro = (d: string) => d.slice(0, 10) >= de && d.slice(0, 10) <= ate;
  const ops = b.operacoes.filter((o) => o.status === 'concluida' && dentro(o.data));
  const desp = b.despesas.filter((d) => dentro(d.data));
  const soma = <T>(l: T[], f: (x: T) => number) => l.reduce((s, x) => s + f(x), 0);
  const imposto = soma(ops, (o) => o.tributo),
    credito = soma(desp, (d) => d.credito ?? 0);
  return {
    de,
    ate,
    vendas: ops.length,
    brutoCents: soma(ops, (o) => o.bruto),
    impostoRetidoCents: imposto,
    taxasCents: soma(ops, (o) => o.taxa),
    liquidoCents: soma(ops, (o) => o.liquido),
    compras: desp.length,
    comprasCents: soma(desp, (d) => d.valor),
    comprasComCredito: desp.filter((d) => (d.credito ?? 0) > 0).length,
    creditoCents: credito,
    ...compensar(imposto, credito),
    linhasVendas: ops
      .slice(0, limite)
      .map((o) => ({ id: o.id, data: o.data.slice(0, 10), meio: MEIOS_DEMO[o.meio] ?? o.meio, brutoCents: o.bruto, impostoCents: o.tributo, taxaCents: o.taxa, liquidoCents: o.liquido })),
    linhasCompras: desp
      .slice(0, limite)
      .map((d) => ({ id: d.id, data: d.data, descricao: d.descricao, categoria: d.categoria, valorCents: d.valor, creditoCents: d.credito ?? 0 })),
    limiteLinhas: limite,
  };
}
export function criarReformaDemo(base: () => { operacoes: Operacao[]; despesas: Despesa[] }): ServicoReforma {
  return {
    async resumo(de, ate) {
      if (!de || !ate || de > ate) throw new Error('A data final deve ser igual ou posterior à inicial.');
      await new Promise((r) => setTimeout(r, 120));
      return resumirBase(base(), de, ate);
    },
  };
}

// ------------------------------------------------------------ API (/api/v1/tax-reform)
type Enviar = <T>(caminho: string, validar: (v: unknown) => T, opcoes?: { metodo?: 'GET'; sinal?: AbortSignal }) => Promise<T>;
const obj = (v: unknown) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Objeto esperado.');
  return v as Record<string, unknown>;
};
const txt = (v: unknown, max = 300) => {
  if (typeof v !== 'string' || !v || v.length > max) throw new Error('Texto inválido.');
  return v;
};
const dia = (v: unknown) => {
  const s = txt(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Data inválida.');
  return s;
};
const cents = (v: unknown) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) throw new Error('Centavos inteiros esperados.');
  return v;
};
const lista = (v: unknown) => {
  if (!Array.isArray(v) || v.length > 1000) throw new Error('Lista inválida.');
  return v;
};
export function validarResumoReforma(v: unknown): ResumoReforma {
  const o = obj(v);
  const r: ResumoReforma = {
    de: dia(o.from),
    ate: dia(o.to),
    vendas: cents(o.salesCount),
    brutoCents: cents(o.grossCents),
    impostoRetidoCents: cents(o.taxWithheldCents),
    taxasCents: cents(o.feeCents),
    liquidoCents: cents(o.netCents),
    compras: cents(o.purchasesCount),
    comprasCents: cents(o.purchasesCents),
    comprasComCredito: cents(o.purchasesWithCreditCount),
    creditoCents: cents(o.taxCreditCents),
    creditoUsavelCents: cents(o.creditUsableCents),
    creditoAcumuladoCents: cents(o.creditCarryOverCents),
    impostoLiquidoCents: cents(o.netTaxCents),
    linhasVendas: lista(o.sales).map((x) => {
      const s = obj(x);
      return { id: txt(s.id, 40), data: dia(s.date), meio: txt(s.paymentMethod, 10), brutoCents: cents(s.grossCents), impostoCents: cents(s.taxCents), taxaCents: cents(s.feeCents), liquidoCents: cents(s.netCents) };
    }),
    linhasCompras: lista(o.purchases).map((x) => {
      const c = obj(x);
      return { id: txt(c.id, 40), data: dia(c.date), descricao: txt(c.description, 240), categoria: txt(c.categoryName, 80), valorCents: cents(c.amountCents), creditoCents: cents(c.taxCreditCents) };
    }),
    limiteLinhas: cents(o.rowLimit),
  };
  if (r.brutoCents !== r.impostoRetidoCents + r.taxasCents + r.liquidoCents) throw new Error('Resumo da reforma inconsistente.');
  const c = compensar(r.impostoRetidoCents, r.creditoCents);
  if (c.creditoUsavelCents !== r.creditoUsavelCents || c.impostoLiquidoCents !== r.impostoLiquidoCents || c.creditoAcumuladoCents !== r.creditoAcumuladoCents)
    throw new Error('Compensação do resumo inconsistente.');
  return r;
}
export function criarReformaApi(enviar: Enviar): ServicoReforma {
  return {
    resumo(de, ate, sinal) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) return Promise.reject(new Error('Informe um período válido.'));
      const q = new URLSearchParams({ from: de, to: ate });
      return enviar(`/api/v1/tax-reform/summary?${q}`, validarResumoReforma, { sinal });
    },
  };
}
