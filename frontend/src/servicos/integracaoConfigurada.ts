import { validarTendencias, type ComparacaoTendencias } from '../utilitarios/tendencias';
import type { ContratoServidor } from './adapterApi';
import type { ConsultaOperacoes, ConsultaDespesas, PeriodoConsulta } from './contratosConsultas';
import type { MeioPagamento, Operacao, Venda, ResultadoVenda } from '../tipos';
import { FalhaTransporte } from './transporteApi';
import { validarOperacao, validarDespesaRecebida } from './validarContratoInterno';
import { criarIntencoes } from './intencoesApi';

function objeto(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Objeto inválido.');
  return v as Record<string, unknown>;
}
function texto(v: unknown): string {
  if (typeof v !== 'string' || !v.trim()) throw new Error('Texto inválido.');
  return v;
}
function inteiro(v: unknown, minimo = 0): number {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < minimo)
    throw new Error('Valor inválido.');
  return v;
}
function lista(v: unknown): unknown[] {
  if (!Array.isArray(v)) throw new Error('Lista inválida.');
  return v;
}
function opcao<T extends string>(v: unknown, mapa: Record<string, T>): T {
  if (typeof v !== 'string' || !Object.hasOwn(mapa, v)) throw new Error('Estado desconhecido.');
  return mapa[v];
}
const meios: Record<MeioPagamento, string> = { PIX: 'PIX', Débito: 'DEBIT', Crédito: 'CREDIT' };
const pagamento = (v: unknown) =>
  opcao(v, { CONFIRMED: 'confirmado', PENDING: 'pendente', DECLINED: 'recusado' } as const);
const meio = (v: unknown) => opcao(v, { PIX: 'PIX', DEBIT: 'Débito', CREDIT: 'Crédito' } as const);
function modo(v: Record<string, unknown>) {
  if (v.currency !== 'BRL' || v.mode !== 'SIMULADO')
    throw new Error('Moeda ou ambiente inesperado.');
}
function regra(v: unknown): string {
  const r = objeto(v);
  return `Regra simulada ${texto(r.version)} · tributo ${inteiro(r.taxBps) / 100}% · taxa ${inteiro(r.feeBps) / 100}%`;
}
export function mapearOperacao(v: unknown): Operacao {
  const o = objeto(v);
  modo(o);
  return validarOperacao({
    id: o.id,
    data: o.createdAt,
    bruto: o.grossCents,
    tributo: o.taxCents,
    taxa: o.feeCents,
    liquido: o.netCents,
    meio: meio(o.paymentMethod),
    pagamento: pagamento(o.paymentStatus),
    status: opcao(o.status, {
      CRIADA: 'pendente',
      SEPARADA: 'pendente',
      ROTEADA: 'pendente',
      CONCLUIDA: 'concluida',
      FALHA: 'falha',
    }),
    regraHistorica: regra(o.rule),
    parcelas: lista(o.parcels).map((v) => {
      const p = objeto(v);
      return {
        id: p.id,
        titulo: opcao(p.kind, { TAX: 'Tributo', FEE: 'Taxa', NET: 'Líquido' }),
        destino: p.destination,
        valor: p.amountCents,
        status: opcao(p.status, {
          PENDENTE: 'pendente',
          ENVIADA: 'pendente',
          CONFIRMADA: 'concluida',
          FALHA: 'falha',
        }),
      };
    }),
    eventos: lista(o.events).map((v) => {
      const e = objeto(v);
      return { instante: e.occurredAt, descricao: e.description };
    }),
  });
}
export function mapearVenda(v: unknown): Venda {
  const s = objeto(v);
  modo(s);
  const data = texto(s.createdAt);
  if (!Number.isFinite(Date.parse(data))) throw new Error('Data inválida.');
  const venda: Venda = {
    id: texto(s.id),
    data,
    bruto: inteiro(s.amountCents, 1),
    meio: meio(s.paymentMethod),
    pagamento: pagamento(objeto(s.payment).status),
    motivo: s.failureCode === null ? null : texto(s.failureCode),
    operacao: s.operation === null ? null : mapearOperacao(s.operation),
  };
  if (
    venda.operacao &&
    (venda.pagamento !== 'confirmado' ||
      venda.operacao.bruto !== venda.bruto ||
      venda.operacao.meio !== venda.meio ||
      objeto(s.operation).saleId !== venda.id)
  )
    throw new Error('Venda e operação divergentes.');
  return venda;
}
export function mapearResultadoVenda(v: unknown): ResultadoVenda {
  const { operacao, ...venda } = mapearVenda(v);
  return operacao ?? { ...venda, tipo: 'sem-operacao' as const };
}
function despesa(v: unknown) {
  const d = objeto(v);
  return validarDespesaRecebida({
    id: d.id,
    descricao: d.description,
    valor: d.amountCents,
    categoria: d.categoryName,
    data: d.paidOn,
  });
}
function pagina<T extends { id: string }>(
  v: unknown,
  filtro: { pagina: number; tamanho: number },
  mapear: (v: unknown) => T,
) {
  const p = objeto(v),
    itens = lista(p.items).map(mapear),
    total = inteiro(p.total);
  if (
    p.page !== filtro.pagina ||
    p.size !== filtro.tamanho ||
    itens.length > filtro.tamanho ||
    itens.length > total ||
    new Set(itens.map((i) => i.id)).size !== itens.length
  )
    throw new Error('Paginação divergente.');
  return { itens, total, pagina: filtro.pagina, tamanho: filtro.tamanho };
}
function periodo(p: PeriodoConsulta) {
  if (!p.inicio || !p.fim || p.inicio > p.fim)
    throw new FalhaTransporte(400, 'Informe as duas datas em ordem crescente.');
  return { from: p.inicio, to: p.fim };
}
function filtros(f: ConsultaDespesas | Omit<ConsultaOperacoes, 'status'>) {
  const p = new URLSearchParams({ page: String(f.pagina), size: String(f.tamanho) });
  if (f.inicio || f.fim) Object.entries(periodo(f)).forEach(([k, v]) => p.set(k, v));
  if (f.busca.trim()) p.set('search', f.busca.trim());
  if ('meio' in f && f.meio) p.set('paymentMethod', meios[f.meio]);
  return p;
}
function periodoRecebido(v: unknown, esperado: PeriodoConsulta) {
  const p = objeto(v);
  if (p.from !== esperado.inicio || p.to !== esperado.fim) throw new Error('Período divergente.');
  return esperado;
}

/** Contrato concreto do backend Spring /api/v1; token somente em memória. */
export const contratoServidor: ContratoServidor = {
  versao: 'split-v1',
  credenciais: 'omit',
  login: (d) => ({
    caminho: '/api/v1/auth/login',
    metodo: 'POST',
    dados: { email: d.email, password: d.senha },
  }),
  logout: () => ({ caminho: '/api/v1/auth/logout', metodo: 'POST' }),
  extrairToken(v) {
    const s = objeto(v);
    if (s.tokenType !== 'Bearer' || !/^[A-Za-z0-9_-]{43}$/.test(texto(s.accessToken)))
      throw new Error('Token inválido.');
    return texto(s.accessToken);
  },
  mapearSessao(v) {
    const s = objeto(v),
      u = objeto(s.user),
      m = objeto(s.merchant);
    return {
      id: s.sessionId,
      nome: u.name,
      loja: m.name,
      permissoes: s.permissions,
      expiraEm: Date.parse(texto(s.expiresAt)),
      identidade: `${texto(m.id)}:${texto(u.id)}`,
      fusoHorario: texto(m.timeZone),
    };
  },
  interpretarCampos(_status, v) {
    const campos = objeto(objeto(v).fieldErrors);
    const nomes: Record<string, string> = {
      description: 'descricao',
      amountCents: 'valor',
      categoryId: 'categoria',
      paidOn: 'data',
      email: 'email',
      password: 'senha',
    };
    return Object.fromEntries(
      Object.entries(campos)
        .filter(([k, v]) => Object.hasOwn(nomes, k) && typeof v === 'string')
        .map(([k, v]) => [nomes[k], String(v)]),
    );
  },
  async carregar() {
    throw new Error('Use as consultas paginadas e os totais do servidor.');
  },
  venda: (v) => ({
    caminho: '/api/v1/sales',
    metodo: 'POST',
    chaveIdempotencia: v.chave,
    dados: {
      amountCents: v.bruto,
      currency: 'BRL',
      paymentMethod: meios[v.meio],
      taxCategory: 'GENERAL',
    },
  }),
  mapearOperacao,
  mapearVenda: mapearResultadoVenda,
  despesa: () => {
    throw new Error('Use o envio de despesas com intenção persistida.');
  },
  retomada: (id, chave) => ({
    caminho: `/api/v1/split-operations/${encodeURIComponent(id)}/reprocess`,
    metodo: 'POST',
    chaveIdempotencia: chave,
  }),
  consultas: (enviar) => ({
    exportarOperacoes: (f, sinal) => {
      const p = filtros(f); p.delete('page'); p.delete('size');
      Object.entries(periodo(f)).forEach(([k,v]) => p.set(k,v));
      if (f.status) p.set('status', {concluida:'CONCLUIDA',falha:'FALHA',pendente:'PENDENTE'}[f.status]);
      return enviar(`/api/v1/exports/operations?${p}`, v => {
        const r=objeto(v), total=inteiro(r.total);
        const colunas=lista(r.columns).map(texto);
        const linhas=lista(r.rows).map(row => lista(row).map(texto));
        if(r.mode!=='SIMULADO' || total>2000 || linhas.length!==total || colunas.length!==8 || colunas.some(c=>c.length>100) || linhas.some(l=>l.length!==8 || l.some(c=>c.length>200)) || new Set(linhas.map(l=>l[0])).size!==total) throw new Error('Exportação incompleta ou inválida.');
        return {colunas,linhas,total};
      }, {sinal});
    },
    consultarComposicao: (p, sinal) => enviar(
      `/api/v1/dashboard/details?${new URLSearchParams(periodo(p))}`, v => {
        const r = objeto(v); periodoRecebido(r.period, p);
        if (r.recognition !== 'COMPLETED_AT_IN_MERCHANT_TIME_ZONE') throw new Error('Reconhecimento desconhecido.');
        const valores = (v: unknown) => {
          const a = objeto(v);
          const bruto = inteiro(a.grossCents), tributo = inteiro(a.taxCents), taxa = inteiro(a.feeCents), liquido = inteiro(a.netCents);
          if (bruto !== tributo + taxa + liquido) throw new Error('Composição divergente.');
          return { bruto, tributo, taxa, liquido };
        };
        const totais = { ...valores(r.totals), quantidade: inteiro(objeto(r.totals).count) };
        const dias = lista(r.series).map(v => ({ ...valores(v), data: texto(objeto(v).date) }));
        const primeiro = Date.parse(p.inicio + 'T00:00:00Z'), ultimo = Date.parse(p.fim + 'T00:00:00Z');
        if (dias.length !== (ultimo - primeiro) / 86400000 + 1 || dias.some((d,i) => d.data !== new Date(primeiro + i*86400000).toISOString().slice(0,10))) throw new Error('Série diária incompleta.');
        for (const campo of ['bruto','tributo','taxa','liquido'] as const) {
          const soma = dias.reduce((n,d) => n + d[campo],0);
          if (!Number.isSafeInteger(soma) || soma !== totais[campo]) throw new Error('Série e totais divergentes.');
        }
        return { totais, dias };
      }, { sinal }),
    consultarTendencias: (p, sinal) => enviar(
      `/api/v1/trends?${new URLSearchParams(periodo(p))}`,
      v => validarTendencias(v as ComparacaoTendencias, p), { sinal }),
    async consultarOperacoes(f, sinal) {
      const p = filtros(f);
      if (f.status)
        p.set('status', { concluida: 'CONCLUIDA', falha: 'FALHA', pendente: 'PENDENTE' }[f.status]);
      return enviar(`/api/v1/split-operations?${p}`, (v) => pagina(v, f, mapearOperacao), {
        sinal,
      });
    },
    consultarOperacao: (id, sinal) =>
      enviar(`/api/v1/split-operations/${encodeURIComponent(id)}`, mapearOperacao, { sinal }),
    consultarDespesas: (f, sinal) =>
      enviar(`/api/v1/expenses?${filtros(f)}`, (v) => pagina(v, f, despesa), { sinal }),
    consultarResumo: (area, p, sinal) =>
      enviar(
        `/api/v1/${area === 'dashboard' ? 'dashboard' : 'cash-flow'}?${new URLSearchParams(periodo(p))}`,
        (v) => {
          const r = objeto(v);
          const abertura = inteiro(r.openingCents, Number.MIN_SAFE_INTEGER),
            entradas = inteiro(r.inflowCents),
            despesas = inteiro(r.expenseCents),
            saldo = inteiro(r.closingCents, Number.MIN_SAFE_INTEGER);
          if (saldo !== abertura + entradas - despesas) throw new Error('Saldo inconsistente.');
          return {
            periodo: periodoRecebido(r.period, p),
            atualizadoEm: texto(r.updatedAt),
            indicadores: [
              {
                id: 'abertura',
                titulo: 'Saldo inicial',
                valor: abertura,
                descricao: 'Saldo anterior ao período.',
              },
              {
                id: 'entradas',
                titulo: 'Entradas líquidas',
                valor: entradas,
                descricao: 'Vendas com split concluído no período.',
              },
              {
                id: 'despesas',
                titulo: 'Despesas pagas',
                valor: despesas,
                descricao: 'Saídas registradas no período.',
              },
              {
                id: 'saldo',
                titulo: 'Saldo final',
                valor: saldo,
                descricao: 'Saldo inicial + entradas − despesas.',
              },
            ],
          };
        },
        { sinal },
      ),
    simular: (e, sinal) =>
      enviar(
        '/api/v1/split-payment/simulate',
        (v) => {
          const r = objeto(v);
          modo(r);
          if (r.simulation !== true || r.includeFee !== e.incluirTaxa)
            throw new Error('Simulação divergente.');
          const a = objeto(r.amounts);
          return {
            bruto: inteiro(a.grossCents),
            tributo: inteiro(a.taxCents),
            taxa: inteiro(a.feeCents),
            liquido: inteiro(a.netCents),
            regra: regra(r.rule),
          };
        },
        {
          metodo: 'POST',
          dados: { amountCents: e.bruto, includeFee: e.incluirTaxa, taxCategory: 'GENERAL' },
          sinal,
        },
      ),
    explicar: (p, sinal) =>
      enviar(
        '/api/v1/ai/cash-analysis',
        (v) => {
          const r = objeto(v);
          return {
            periodo: periodoRecebido(r.period, p),
            tendencias: r.tendencias === undefined ? undefined : validarTendencias(r.tendencias as ComparacaoTendencias, p),
            texto: texto(r.text),
            origem: opcao(r.origin, {
              demonstrativa: 'demonstrativa',
              servidor: 'servidor',
            } as const),
          };
        },
        { metodo: 'POST', dados: periodo(p), sinal },
      ),
  }),
  prepararServico(enviar, sessao) {
    const intencoes = criarIntencoes(sessao.identidade ?? sessao.id, enviar);
    const categorias = new Map<string, string>();
    return {
      async consultarCategoriasDespesa(sinal) {
        const registros = await enviar(
          '/api/v1/expense-categories',
          (v) =>
            lista(v).map((v) => {
              const c = objeto(v);
              return { id: texto(c.id), nome: texto(c.name) };
            }),
          { sinal },
        );
        categorias.clear();
        registros.forEach((c) => categorias.set(c.nome, c.id));
        return [...categorias.keys()];
      },
      async registrarDespesa(d) {
        const id = categorias.get(d.categoria);
        if (!id)
          throw new FalhaTransporte(422, 'Selecione uma categoria disponível.', {
            categoria: 'Categoria inválida.',
          });
        await intencoes.enviar(
          'EXPENSE',
          '/api/v1/expenses',
          { description: d.descricao, amountCents: d.valor, categoryId: id, paidOn: d.data },
          despesa,
        );
      },
      async recuperarDespesa() {
        await intencoes.recuperar('EXPENSE', despesa);
      },
      despesaPendente: () => intencoes.pendente('EXPENSE'),
      async registrarVenda(v) {
        const r = contratoServidor.venda(v);
        return intencoes.enviar('SALE', r.caminho, r.dados, mapearResultadoVenda, v.chave);
      },
      recuperarVenda: () => intencoes.recuperar('SALE', mapearResultadoVenda),
      vendaPendente: () => intencoes.pendente('SALE'),
      async reprocessar(id) {
        await intencoes.enviar(
          `REPROCESS:${id}`,
          `/api/v1/split-operations/${encodeURIComponent(id)}/reprocess`,
          undefined,
          mapearOperacao,
        );
      },
      consultarVendas: (f, sinal) =>
        enviar(`/api/v1/sales?${filtros(f)}`, (v) => pagina(v, f, mapearVenda), { sinal }),
      consultarVenda: (id, sinal) =>
        enviar(
          `/api/v1/sales/${encodeURIComponent(id)}`,
          (v) => {
            const s = mapearVenda(v);
            if (s.id !== id) throw new Error('Venda divergente.');
            return s;
          },
          { sinal },
        ),
    };
  },
};
