import type { BaseDemonstracao, Despesa, Operacao } from '../tipos';
import type { SessaoUsuario, Permissao } from './sessaoUsuario';
function objeto(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor))
    throw new Error('Objeto esperado.');
  return valor as Record<string, unknown>;
}
function texto(valor: unknown): string {
  if (typeof valor !== 'string' || !valor.trim()) throw new Error('Texto obrigatório.');
  return valor;
}
function centavos(valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isSafeInteger(valor) || valor < 0)
    throw new Error('Centavos inteiros esperados.');
  return valor;
}
function data(valor: unknown): string {
  const t = texto(valor);
  if (!Number.isFinite(Date.parse(t))) throw new Error('Data inválida.');
  return t;
}
export function validarOperacao(valor: unknown): Operacao {
  const o = objeto(valor);
  const status = o.status;
  if (!['concluida', 'pendente', 'falha'].includes(String(status)))
    throw new Error('Estado não reconhecido; revisar mapeamento.');
  const meio = o.meio;
  if (!['PIX', 'Débito', 'Crédito'].includes(String(meio)))
    throw new Error('Meio não reconhecido.');
  const bruto = centavos(o.bruto),
    tributo = centavos(o.tributo),
    taxa = centavos(o.taxa),
    liquido = centavos(o.liquido);
  if (bruto !== tributo + taxa + liquido) throw new Error('Parcelas divergentes.');
  if (!Array.isArray(o.eventos)) throw new Error('Eventos ausentes.');
  if (
    o.pagamento !== undefined &&
    !['confirmado', 'pendente', 'recusado'].includes(String(o.pagamento))
  )
    throw new Error('Pagamento não reconhecido.');
  if (o.parcelas !== undefined && !Array.isArray(o.parcelas))
    throw new Error('Parcelas inválidas.');
  const parcelas = Array.isArray(o.parcelas)
    ? o.parcelas.map((v) => {
        const p = objeto(v);
        if (!['concluida', 'pendente', 'falha'].includes(String(p.status)))
          throw new Error('Estado de parcela não reconhecido.');
        return {
          id: texto(p.id),
          titulo: texto(p.titulo),
          destino: texto(p.destino),
          valor: centavos(p.valor),
          status: p.status as Operacao['status'],
        };
      })
    : undefined;
  if (
    parcelas &&
    (new Set(parcelas.map((p) => p.id)).size !== parcelas.length ||
      parcelas.reduce((s, p) => s + p.valor, 0) !== bruto)
  )
    throw new Error('Composição das parcelas inválida.');
  return {
    ...(o.pagamento !== undefined ? { pagamento: o.pagamento as Operacao['pagamento'] } : {}),
    ...(o.regraHistorica !== undefined ? { regraHistorica: texto(o.regraHistorica) } : {}),
    ...(parcelas ? { parcelas } : {}),
    id: texto(o.id),
    data: data(o.data),
    bruto,
    tributo,
    taxa,
    liquido,
    status: status as Operacao['status'],
    meio: meio as Operacao['meio'],
    eventos: o.eventos.map((v) => {
      const e = objeto(v);
      return { instante: data(e.instante), descricao: texto(e.descricao) };
    }),
  };
}
export function validarDespesaRecebida(valor: unknown): Despesa {
  const d = objeto(valor);
  return {
    id: texto(d.id),
    descricao: texto(d.descricao),
    categoria: texto(d.categoria),
    data: data(d.data),
    valor: centavos(d.valor),
  };
}
export function validarBase(valor: unknown): BaseDemonstracao {
  const b = objeto(valor);
  if (!Array.isArray(b.operacoes) || !Array.isArray(b.despesas))
    throw new Error('Coleções ausentes.');
  const operacoes = b.operacoes.map(validarOperacao),
    despesas = b.despesas.map(validarDespesaRecebida);
  if (
    new Set(operacoes.map((o) => o.id)).size !== operacoes.length ||
    new Set(despesas.map((d) => d.id)).size !== despesas.length
  )
    throw new Error('Identificadores duplicados.');
  return { operacoes, despesas };
}
export function validarSessao(valor: unknown): SessaoUsuario {
  const s = objeto(valor);
  const permissoes: Permissao[] = [
    'consultar',
    'financeiro',
    'vender',
    'despesa',
    'retomar',
    'exportar',
  ];
  if (
    !Array.isArray(s.permissoes) ||
    s.permissoes.some((p) => !permissoes.includes(p as Permissao))
  )
    throw new Error('Permissões inválidas.');
  if (typeof s.expiraEm !== 'number' || !Number.isFinite(s.expiraEm) || s.expiraEm <= Date.now())
    throw new Error('Sessão expirada.');
  return {
    id: texto(s.id),
    ...(s.identidade !== undefined ? { identidade: texto(s.identidade) } : {}),
    ...(s.fusoHorario !== undefined ? { fusoHorario: texto(s.fusoHorario) } : {}),
    nome: texto(s.nome),
    loja: texto(s.loja),
    permissoes: s.permissoes as Permissao[],
    expiraEm: s.expiraEm,
  };
}
