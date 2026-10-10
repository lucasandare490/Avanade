import type { BaseDemonstracao } from '../tipos';
import type { PeriodoConsulta } from '../servicos/contratosConsultas';
import { dentroPeriodo, resumir } from './valoresFinanceiros';
export interface ComparacaoTendencias {
  anterior: PeriodoConsulta;
  indicadores: { titulo: string; atual: number | null; anterior: number | null }[];
}
const dia = 86400000;
function instante(data: string) {
  const n = Date.parse(`${data}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    !Number.isFinite(n) ||
    new Date(n).toISOString().slice(0, 10) !== data
  )
    throw new Error('Informe datas válidas.');
  return n;
}
export function periodoAnterior(p: PeriodoConsulta): PeriodoConsulta {
  const inicio = instante(p.inicio),
    fim = instante(p.fim),
    duracao = fim - inicio + dia;
  if (duracao <= 0 || duracao > 366 * dia)
    throw new Error('Selecione um período válido de até 366 dias.');
  return {
    inicio: new Date(inicio - duracao).toISOString().slice(0, 10),
    fim: new Date(inicio - dia).toISOString().slice(0, 10),
  };
}
export function descreverVariacao(atual: number | null, anterior: number | null) {
  if (atual === null || anterior === null) return 'Dados insuficientes';
  if (atual === anterior) return 'Estável';
  const sentido = atual > anterior ? 'Aumento' : 'Queda';
  if (anterior <= 0) return `${sentido} — sem base positiva para percentual`;
  return `${sentido} de ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Math.abs((atual - anterior) / anterior) * 100)}%`;
}
/** Comparação exploratória local, sem previsão ou apuração tributária. */
export function tendenciasDemonstrativas(
  base: BaseDemonstracao,
  periodo: PeriodoConsulta,
): ComparacaoTendencias {
  const anterior = periodoAnterior(periodo);
  const obter = (p: PeriodoConsulta) => {
    const ops = base.operacoes.filter((o) => dentroPeriodo(o.data, p.inicio, p.fim));
    const despesas = base.despesas.filter((d) => dentroPeriodo(d.data, p.inicio, p.fim));
    const r = resumir(ops, despesas);
    return [
      r.quantidade ? r.bruto : null,
      r.quantidade ? r.liquido : null,
      despesas.length ? r.saidas : null,
    ];
  };
  const atuais = obter(periodo),
    anteriores = obter(anterior);
  return {
    anterior,
    indicadores: ['Vendas brutas concluídas', 'Entradas líquidas', 'Despesas pagas'].map(
      (titulo, i) => ({ titulo, atual: atuais[i], anterior: anteriores[i] }),
    ),
  };
}
export function validarTendencias(v: ComparacaoTendencias, periodo: PeriodoConsulta) {
  const p = periodoAnterior(periodo);
  if (
    !v ||
    v.anterior?.inicio !== p.inicio ||
    v.anterior?.fim !== p.fim ||
    !Array.isArray(v.indicadores) ||
    v.indicadores.length === 0 ||
    v.indicadores.length > 20 ||
    v.indicadores.some(
      (i) =>
        !i ||
        typeof i.titulo !== 'string' ||
        !i.titulo.trim() ||
        [i.atual, i.anterior].some((n) => n !== null && (!Number.isSafeInteger(n) || n < 0)),
    )
  )
    throw new Error('Comparação de tendências inválida.');
  return v;
}
