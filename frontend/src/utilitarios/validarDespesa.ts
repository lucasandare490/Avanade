import type { Despesa } from '../tipos';
import { DATA_REFERENCIA } from '../dados/cenarioDemonstrativo';
export const CATEGORIAS_DESPESA = ['Estoque', 'Serviços', 'Operacional', 'Outros'] as const;
export function validarDespesa(d: Omit<Despesa, 'id'>): string | null {
  if (!d.descricao.trim() || d.descricao.trim().length > 100)
    return 'Informe uma descrição de até 100 caracteres.';
  if (!Number.isSafeInteger(d.valor) || d.valor <= 0 || d.valor > 100000000)
    return 'Informe um valor de 0,01 a 1.000.000,00.';
  if (!CATEGORIAS_DESPESA.some((c) => c === d.categoria))
    return 'Selecione uma categoria disponível.';
  const data = new Date(`${d.data}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(d.data) ||
    !Number.isFinite(data.getTime()) ||
    data.toISOString().slice(0, 10) !== d.data ||
    d.data < '2026-01-01' ||
    d.data > DATA_REFERENCIA
  )
    return 'Informe uma data válida entre 01/01/2026 e 09/10/2026, referência deste cenário.';
  return null;
}
