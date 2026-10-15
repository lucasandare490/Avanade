// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { criarIntegracaoApi } from './adaptarEValidarRespostasApi';
import { contratoServidor, mapearResultadoVenda, mapearOperacao } from './contratoBackendPlanner';
import exemplo from '../../../backend/docs/examples/sale-confirmed.json';
const resposta = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status });
function sessao(token = 'a'.repeat(43), loja = 'loja-1') {
  return {
    sessionId: crypto.randomUUID(),
    accessToken: token,
    tokenType: 'Bearer',
    user: { id: 'usuario-1', name: 'Gerente' },
    merchant: { id: loja, name: 'Loja', timeZone: 'America/Recife' },
    permissions: ['consultar', 'financeiro', 'vender', 'despesa', 'retomar'],
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}
const credenciais = { email: 'gerente1@demo.local', senha: 'senha-de-teste' };
const filtro = {
  busca: '',
  inicio: '',
  fim: '',
  meio: '' as const,
  status: '' as const,
  pagina: 1,
  tamanho: 20,
};
beforeEach(() => sessionStorage.clear());
afterEach(() => vi.unstubAllGlobals());
async function conectar(f: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', f);
  const api = criarIntegracaoApi('http://127.0.0.1:8080', contratoServidor);
  const s = await api.autenticacao.entrar(credenciais);
  return { api, servico: api.criarServico(s) };
}
it('mapeia a resposta executada do backend preservando parcelas, regra e eventos', () => {
  const o = mapearResultadoVenda(exemplo);
  expect(o).toMatchObject({
    bruto: 15000,
    tributo: 1500,
    taxa: 300,
    liquido: 13200,
    status: 'concluida',
    pagamento: 'confirmado',
  });
  expect('parcelas' in o && o.parcelas).toHaveLength(3);
  expect(() => mapearOperacao({ ...exemplo.operation, status: 'DESCONHECIDO' })).toThrow();
  expect(() => mapearOperacao({ ...exemplo.operation, netCents: 13000 })).toThrow();
  expect(() => mapearResultadoVenda({ ...exemplo, payment: { status: 'DECLINED' } })).toThrow();
});
it.each(['PENDING', 'DECLINED', 'CONFIRMED'])(
  'pagamento %s sem operação não inventa split',
  (status) => {
    const v = mapearResultadoVenda({
      ...exemplo,
      payment: { status },
      operation: null,
      failureCode: 'SEM_SPLIT',
    });
    expect(v).toMatchObject({ tipo: 'sem-operacao', id: exemplo.id, bruto: 15000 });
    expect(v).not.toHaveProperty('liquido');
  },
);
it('envia bearer capturado por sessão, revoga no logout e não persiste credenciais', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockResolvedValueOnce(resposta(sessao('b'.repeat(43), 'loja-2')))
    .mockResolvedValueOnce(resposta({ items: [], total: 0, page: 1, size: 20 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  const { api, servico } = await conectar(f);
  await api.autenticacao.entrar(credenciais);
  await servico.consultarOperacoes!(filtro);
  await api.autenticacao.sair();
  expect(f.mock.calls[0][1].headers.Authorization).toBeUndefined();
  expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({
    email: credenciais.email,
    password: credenciais.senha,
  });
  expect(f.mock.calls[2][1].headers.Authorization).toBe(`Bearer ${'a'.repeat(43)}`);
  expect(f.mock.calls[3][1].headers.Authorization).toBe(`Bearer ${'b'.repeat(43)}`);
  expect(sessionStorage.length).toBe(0);
});
it('recarrega categorias reais, preserva intenção de despesa e recupera após recriar integração', async () => {
  const d = {
    id: 'd1',
    description: 'Estoque',
    amountCents: 1000,
    categoryName: 'Estoque',
    paidOn: '2026-10-13',
  };
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockResolvedValueOnce(resposta([{ id: 'STOCK', name: 'Estoque' }]))
    .mockRejectedValueOnce(new TypeError('rede'))
    .mockResolvedValueOnce(resposta(sessao()))
    .mockResolvedValueOnce(resposta(d));
  const { servico } = await conectar(f);
  await servico.consultarCategoriasDespesa!();
  await expect(
    servico.registrarDespesa({
      descricao: 'Estoque',
      valor: 1000,
      categoria: 'Estoque',
      data: '2026-10-13',
    }),
  ).rejects.toMatchObject({ codigo: 0 });
  const chave = f.mock.calls[2][1].headers['Idempotency-Key'];
  expect(JSON.parse(f.mock.calls[2][1].body).categoryId).toBe('STOCK');
  const segunda = await conectar(f);
  expect(segunda.servico.despesaPendente!()).toBe(true);
  await segunda.servico.recuperarDespesa!();
  expect(f.mock.calls[4][0]).toContain(`/requests/EXPENSE/${chave}`);
  expect(segunda.servico.despesaPendente!()).toBe(false);
  expect(f.mock.calls.filter((c) => c[0].endsWith('/expenses'))).toHaveLength(1);
});
it('recovery 404 reenvia a mesma venda e mantém a chave após resposta perdida', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockRejectedValueOnce(new TypeError('rede'))
    .mockResolvedValueOnce(resposta({}, 404))
    .mockResolvedValueOnce(resposta(exemplo));
  const { servico } = await conectar(f);
  await expect(
    servico.registrarVenda({
      chave: 'chave-venda-123',
      bruto: 15000,
      meio: 'PIX',
      cenario: 'falha',
    }),
  ).rejects.toThrow();
  expect(servico.vendaPendente!()).toBe(true);
  const o = await servico.recuperarVenda!();
  expect(o.id).toBe(exemplo.operation.id);
  expect(f.mock.calls[1][1].body).toBe(f.mock.calls[3][1].body);
  expect(f.mock.calls[3][1].headers['Idempotency-Key']).toBe('chave-venda-123');
  expect(JSON.parse(f.mock.calls[1][1].body)).not.toHaveProperty('cenario');
  expect(servico.vendaPendente!()).toBe(false);
});
it('isola as intenções por usuário/loja e rejeita outra venda enquanto a anterior está incerta', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockRejectedValueOnce(new TypeError('rede'))
    .mockResolvedValueOnce(resposta(sessao('b'.repeat(43), 'loja-2')));
  const { api, servico } = await conectar(f);
  await expect(
    servico.registrarVenda({
      chave: 'chave-venda-123',
      bruto: 15000,
      meio: 'PIX',
      cenario: 'sucesso',
    }),
  ).rejects.toThrow();
  await expect(
    servico.registrarVenda({ chave: 'outra-chave', bruto: 16000, meio: 'PIX', cenario: 'sucesso' }),
  ).rejects.toMatchObject({ codigo: 409 });
  const outra = api.criarServico(await api.autenticacao.entrar(credenciais));
  expect(outra.vendaPendente!()).toBe(false);
  expect(servico.vendaPendente!()).toBe(true);
  expect(f).toHaveBeenCalledTimes(3);
});
it('usa período e paginação do servidor e agrupa estados pendentes no backend', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockResolvedValueOnce(resposta({ items: [], total: 0, page: 2, size: 20 }));
  const { servico } = await conectar(f);
  await servico.consultarOperacoes!({
    ...filtro,
    status: 'pendente',
    meio: 'Crédito',
    inicio: '2026-10-01',
    fim: '2026-10-13',
    pagina: 2,
  });
  const url = new URL(f.mock.calls[1][0]);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    page: '2',
    size: '20',
    status: 'PENDENTE',
    paymentMethod: 'CREDIT',
    from: '2026-10-01',
    to: '2026-10-13',
  });
  await expect(
    servico.consultarOperacoes!({ ...filtro, inicio: '2026-10-01' }),
  ).rejects.toMatchObject({ codigo: 400 });
  expect(f).toHaveBeenCalledTimes(2);
});
it('mapeia saldo negativo sem somar páginas e rejeita saldo inconsistente', async () => {
  const p = { inicio: '2026-10-01', fim: '2026-10-13' };
  const cash = {
    period: { from: p.inicio, to: p.fim },
    openingCents: 100,
    inflowCents: 200,
    expenseCents: 400,
    closingCents: -100,
    updatedAt: new Date().toISOString(),
  };
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockResolvedValueOnce(resposta(cash))
    .mockResolvedValueOnce(resposta({ ...cash, closingCents: 0 }));
  const { servico } = await conectar(f);
  expect((await servico.consultarResumo!('dashboard', p)).indicadores.at(-1)?.valor).toBe(-100);
  await expect(servico.consultarResumo!('fluxo-caixa', p)).rejects.toMatchObject({ codigo: 502 });
});
it('não transforma erro de autenticação em sessão expirada no formulário de login', async () => {
  const f = vi.fn().mockResolvedValue(resposta({}, 401));
  await expect(conectar(f)).rejects.toMatchObject({
    codigo: 401,
    message: 'E-mail ou senha inválidos.',
  });
});

it('retomada preserva a chave após perda de resposta e valida a operação retornada', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(resposta(sessao()))
    .mockRejectedValueOnce(new TypeError('rede'))
    .mockResolvedValueOnce(resposta(exemplo.operation));
  const { servico } = await conectar(f);
  await expect(servico.reprocessar(exemplo.operation.id)).rejects.toMatchObject({ codigo: 0 });
  await servico.reprocessar(exemplo.operation.id);
  expect(f.mock.calls[1][1].headers['Idempotency-Key']).toBe(
    f.mock.calls[2][1].headers['Idempotency-Key'],
  );
  expect(f.mock.calls[1][0]).toContain(`/split-operations/${exemplo.operation.id}/reprocess`);
  expect(sessionStorage.length).toBe(0);
});
it('consulta tendências autenticadas e rejeita período anterior divergente', async () => {
  const p = { inicio: '2026-10-14', fim: '2026-10-14' };
  const r = { anterior: { inicio: '2026-10-13', fim: '2026-10-13' }, indicadores: [{ titulo: 'Entradas', atual: 13200, anterior: null }] };
  const f = vi.fn().mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta(r)).mockResolvedValueOnce(resposta({ ...r, anterior: p }));
  const { servico } = await conectar(f);
  expect(await servico.consultarTendencias!(p)).toEqual(r);
  expect(String(f.mock.calls[1][0])).toContain('/api/v1/trends?from=2026-10-14&to=2026-10-14');
  await expect(servico.consultarTendencias!(p)).rejects.toThrow();
});
it('valida composição e reconciliação da série diária recebida', async () => {
  const p = { inicio: '2026-10-14', fim: '2026-10-14' };
  const amounts = { grossCents: 15000, taxCents: 1500, feeCents: 300, netCents: 13200 };
  const r = { period: { from: p.inicio, to: p.fim }, recognition: 'COMPLETED_AT_IN_MERCHANT_TIME_ZONE', totals: { ...amounts, count: 1 }, series: [{ ...amounts, date: p.inicio }] };
  const f = vi.fn().mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta(r)).mockResolvedValueOnce(resposta({ ...r, series: [] })).mockResolvedValueOnce(resposta({ ...r, totals: { ...r.totals, netCents: 1 } }));
  const { servico } = await conectar(f);
  expect(await servico.consultarComposicao!(p)).toMatchObject({ totais: { bruto: 15000, liquido: 13200 }, dias: [{ data: p.inicio }] });
  await expect(servico.consultarComposicao!(p)).rejects.toThrow();
  await expect(servico.consultarComposicao!(p)).rejects.toThrow();
});

it('exporta todo o filtro sem enviar página e rejeita arquivo truncado', async () => {
  const conteudo={mode:'SIMULADO',total:1,columns:['id','data','status','meio','bruto','tributo','taxa','liquido'],rows:[['op-1','2026-10-14','CONCLUIDA','PIX','15000','1500','300','13200']]};
  const f=vi.fn().mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta(conteudo)).mockResolvedValueOnce(resposta({...conteudo,total:2}));
  const {servico}=await conectar(f);
  const consulta={...filtro,inicio:'2026-10-01',fim:'2026-10-14',pagina:3,status:'concluida' as const};
  expect((await servico.exportarOperacoes!(consulta)).total).toBe(1);
  const url=new URL(String(f.mock.calls[1][0]));
  expect(url.searchParams.has('page')).toBe(false);expect(url.searchParams.has('size')).toBe(false);
  expect(url.searchParams.get('status')).toBe('CONCLUIDA');
  await expect(servico.exportarOperacoes!(consulta)).rejects.toThrow();
});
it('valida continuidade e conciliação das semanas do caixa', async () => {
  const p={inicio:'2026-10-01',fim:'2026-10-06'};
  const cash={period:{from:p.inicio,to:p.fim},openingCents:100,inflowCents:200,expenseCents:400,closingCents:-100,updatedAt:new Date().toISOString(),weeks:[
    {from:'2026-10-01',to:'2026-10-04',openingCents:100,inflowCents:200,expenseCents:0,closingCents:300},
    {from:'2026-10-05',to:'2026-10-06',openingCents:300,inflowCents:0,expenseCents:400,closingCents:-100}]};
  const f=vi.fn().mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta(cash)).mockResolvedValueOnce(resposta({...cash,weeks:cash.weeks.slice(1)})).mockResolvedValueOnce(resposta({...cash,weeks:[cash.weeks[0],{...cash.weeks[1],openingCents:0}]}));
  const {servico}=await conectar(f);
  expect((await servico.consultarResumo!('fluxo-caixa',p)).semanas?.at(-1)?.saldo).toBe(-100);
  await expect(servico.consultarResumo!('fluxo-caixa',p)).rejects.toMatchObject({codigo:502});
  await expect(servico.consultarResumo!('fluxo-caixa',p)).rejects.toMatchObject({codigo:502});
});
