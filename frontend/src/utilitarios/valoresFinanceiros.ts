import type { Despesa, Operacao } from '../tipos';
export const moeda = (centavos: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100);
export const dataCurta = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
    new Date(`${iso.slice(0, 10)}T12:00:00`),
  );
export function lerCentavos(texto: string): number | null {
  const limpo = texto.trim();
  if (!/^\d{1,7}(,\d{1,2})?$/.test(limpo)) return null;
  const [inteiro, fracao = ''] = limpo.split(',');
  const valor = Number(inteiro) * 100 + Number(fracao.padEnd(2, '0'));
  return valor > 0 && valor <= 100000000 ? valor : null;
}
// Exclusivo da demonstração. A API será a autoridade financeira na integração.
export function calcularExemplo(bruto: number, tributoBps = 1000, taxaBps = 200) {
  if (
    !Number.isSafeInteger(bruto) ||
    bruto <= 0 ||
    !Number.isInteger(tributoBps) ||
    !Number.isInteger(taxaBps) ||
    tributoBps < 0 ||
    taxaBps < 0 ||
    tributoBps + taxaBps > 10000
  )
    throw new Error('Parâmetros inválidos.');
  const tributo = Math.round((bruto * tributoBps) / 10000);
  const taxa = Math.min(bruto - tributo, Math.round((bruto * taxaBps) / 10000));
  return { bruto, tributo, taxa, liquido: bruto - tributo - taxa };
}
export function resumir(operacoes: Operacao[], despesas: Despesa[]) {
  const confirmadas = operacoes.filter((o) => o.status === 'concluida');
  const soma = (campo: 'bruto' | 'tributo' | 'taxa' | 'liquido') =>
    confirmadas.reduce((total, o) => total + o[campo], 0);
  const saidas = despesas.reduce((total, d) => total + d.valor, 0);
  return {
    bruto: soma('bruto'),
    tributo: soma('tributo'),
    taxa: soma('taxa'),
    liquido: soma('liquido'),
    saidas,
    saldo: soma('liquido') - saidas,
    quantidade: confirmadas.length,
  };
}
export const dentroPeriodo = (data: string, inicio: string, fim: string) =>
  (!inicio || data.slice(0, 10) >= inicio) && (!fim || data.slice(0, 10) <= fim);
