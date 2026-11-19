import { describe, expect, it } from 'vitest';
import {
  cetAnualBp,
  comprometimentoBp,
  cotarQuitacao,
  criarCreditoApi,
  criarCreditoDemo,
  diagnosticar,
  limiteSimulado,
  mesesAte,
  nivelComprometimento,
  parcelaPrice,
  projetarSemanas,
} from './credito';
import type { Despesa, Operacao } from '../tipos';

// Capital de giro (Thayná Batista da Silva). Valores esperados calculados à parte
// (Python, Decimal), iguais aos do servidor (CreditoIntegrationTest).
describe('cálculos do crédito', () => {
  it('tabela Price e CET dos dois parceiros', () => {
    expect(parcelaPrice(100_000, 249, 6)).toBe(18_149);
    expect(parcelaPrice(100_000, 189, 6)).toBe(17_787);
    expect(parcelaPrice(100_000, 249, 1)).toBe(102_490);
    expect(parcelaPrice(120_000, 0, 12)).toBe(10_000);
    expect(cetAnualBp(249)).toBe(3433);
    expect(cetAnualBp(189)).toBe(2519);
  });
  it('limite por parceiro: percentual das entradas de 90 dias, múltiplos de R$ 100, entre R$ 500 e R$ 50 mil', () => {
    const f = (e: number) => ({ entradasLiquidas90dCents: e, despesas90dCents: 0, vendas90d: 1 });
    expect(limiteSimulado(f(99_999), 50).limiteCents).toBe(0);
    expect(limiteSimulado(f(395_859), 50).limiteCents).toBe(190_000);
    expect(limiteSimulado(f(395_859), 30).limiteCents).toBe(110_000);
    expect(limiteSimulado(f(999_999_999), 50).limiteCents).toBe(5_000_000);
  });
  it('crédito responsável: comprometimento e níveis', () => {
    expect(comprometimentoBp(17_600, 176_000)).toBe(1000);
    expect(comprometimentoBp(10_000, 0)).toBeNull();
    expect(nivelComprometimento(2000)).toBe('SAUDAVEL');
    expect(nivelComprometimento(2001)).toBe('ATENCAO');
    expect(nivelComprometimento(3001)).toBe('ALTO');
    expect(nivelComprometimento(5001)).toBe('EXCESSIVO');
    expect(nivelComprometimento(null)).toBe('SEM_RENDA');
  });
  it('prazo em meses e quitação: no dia da contratação volta ao principal; depois, desconta juros', () => {
    expect(mesesAte('2026-10-09', '2026-11-09')).toBe(1);
    expect(mesesAte('2026-10-09', '2026-11-24')).toBeCloseTo(1.5, 10);
    expect(mesesAte('2026-10-09', '2026-10-01')).toBe(0);
    const parcelas = Array.from({ length: 6 }, (_, k) => ({ vencimento: ['2026-11-09', '2026-12-09', '2027-01-09', '2027-02-09', '2027-03-09', '2027-04-09'][k], valorCents: 17_787 }));
    const q = cotarQuitacao('2026-10-09', 189, parcelas);
    expect(q.restanteCents).toBe(106_722);
    expect(q.quitacaoCents).toBe(100_004); // Python: 100003,57 arredondado para cima
    expect(q.descontoCents).toBe(6_718);
  });
  it('diagnóstico aponta descapitalização e recomenda valor e parcelas que cabem', () => {
    const d = diagnosticar({
      impostoRetido90dCents: 60_000,
      saldoAtualCents: -1_500_000,
      fatos: { entradasLiquidas90dCents: 528_000, despesas90dCents: 2_000_000, vendas90d: 2 },
      melhorLimiteCents: 260_000,
      menorTaxaBp: 189,
    });
    expect(d.impostoRetidoMensalCents).toBe(20_000);
    expect(d.situacao).toBe('DESCAPITALIZADO');
    expect(d.falta30dCents).toBe(666_666 - (-1_500_000 + 176_000));
    expect(d.valorRecomendadoCents).toBe(260_000);
    expect(parcelaPrice(260_000, 189, d.parcelasRecomendadas!) * 10_000).toBeLessThanOrEqual(176_000 * 3000);
    const saudavel = diagnosticar({ impostoRetido90dCents: 0, saldoAtualCents: 500_000, fatos: { entradasLiquidas90dCents: 300_000, despesas90dCents: 90_000, vendas90d: 3 }, melhorLimiteCents: 100_000, menorTaxaBp: 189 });
    expect(saudavel.situacao).toBe('SAUDAVEL');
    expect(saudavel.valorRecomendadoCents).toBe(0);
  });
  it('caixa das próximas semanas sem e com o crédito', () => {
    const d = diagnosticar({ impostoRetido90dCents: 0, saldoAtualCents: 0, fatos: { entradasLiquidas90dCents: 300_000, despesas90dCents: 300_000, vendas90d: 1 }, melhorLimiteCents: 0, menorTaxaBp: 0 });
    const semanas = projetarSemanas(d, '2026-10-09', { valorCents: 100_000, parcelas: 2, parcelaCents: 51_000, primeiroVencimento: '2026-11-09' } as never, 6);
    expect(semanas).toHaveLength(7);
    expect(semanas[0]).toMatchObject({ semCreditoCents: 0, comCreditoCents: 100_000 });
    expect(semanas[5].comCreditoCents).toBe(100_000 - 51_000); // 13/11: primeira parcela já venceu
  });
});

describe('ciclo completo na demonstração', () => {
  const op = (liquido: number, tributo = 0, data = '2026-10-01T10:00:00-03:00'): Operacao =>
    ({ id: `OP-${liquido}`, data, bruto: liquido + tributo, tributo, taxa: 0, liquido, meio: 'PIX', status: 'concluida', eventos: [] }) as Operacao;
  const base = (despesas: Despesa[] = []) => ({ operacoes: [op(300_000, 30_000), op(100_000, 10_000), op(500_000, 0, '2026-01-01T10:00:00-03:00')], despesas });
  it('dois parceiros, consentimento, ofertas pelo CET, contratação única, parcela em ordem e quitação', async () => {
    const demo = criarCreditoDemo(() => base(), '2026-10-09');
    const s = await demo.consultar();
    expect(s.parceiros.map((p) => p.limiteCents)).toEqual([200_000, 120_000]);
    expect(s.diagnostico.impostoRetido90dCents).toBe(40_000);
    await expect(demo.simular(100_000, 6)).rejects.toThrow('Autorize');
    await demo.consentir();
    const r = await demo.simular(100_000, 6);
    expect(r.ofertas.map((o) => o.parceiroId)).toEqual(['banco-demo', 'fintech-demo']);
    expect(r.ofertas[0]).toMatchObject({ parcelaCents: 17_787, primeiroVencimento: '2026-11-09', nivel: 'SAUDAVEL' });
    const soFintech = await demo.simular(150_000, 6);
    expect(soFintech.recusadoPor).toEqual(['Banco demonstrativo']);
    const c = await demo.contratar(r.ofertas[0].id);
    expect((await demo.contratar(r.ofertas[0].id)).id).toBe(c.id);
    await expect(demo.pagarParcela(c.id, 2)).rejects.toThrow('em ordem');
    const pago = await demo.pagarParcela(c.id, 1);
    expect(pago.pagoCents).toBe(17_787);
    expect(pago.podeDesistir).toBe(false);
    const q = await demo.cotarQuitacao(c.id);
    expect(q.quitacaoCents).toBeLessThan(q.restanteCents);
    const quitado = await demo.quitar(c.id);
    expect(quitado.status).toBe('QUITADO');
    expect(quitado.quitacaoCents).toBe(q.quitacaoCents);
    expect((await demo.eventos()).map((e) => e.tipo)).toEqual(['QUITADO', 'PARCELA_PAGA', 'CONTRATADO', 'PROPOSTAS_GERADAS', 'PROPOSTAS_GERADAS', 'CONSENTIMENTO_CONCEDIDO']);
  });
  it('desistência em 7 dias, crédito responsável e revogação', async () => {
    const demo = criarCreditoDemo(() => base(), '2026-10-09');
    await demo.consentir();
    const c = await demo.contratar((await demo.simular(60_000, 3)).ofertas[0].id);
    const cancelado = await demo.desistir(c.id);
    expect(cancelado).toMatchObject({ status: 'CANCELADO', quitacaoCents: 60_000 });
    const excessiva = (await demo.simular(120_000, 1)).ofertas[0];
    expect(excessiva.nivel).toBe('EXCESSIVO');
    await expect(demo.contratar(excessiva.id)).rejects.toThrow('mais da metade');
    const p = (await demo.simular(60_000, 1)).ofertas[0];
    await demo.revogar();
    await expect(demo.contratar(p.id)).rejects.toThrow('revogado');
  });
  it('loja sem vendas: sem limite e sem recomendação', async () => {
    const s = await criarCreditoDemo(() => ({ operacoes: [], despesas: [] }), '2026-10-09').consultar();
    expect(s.parceiros.every((p) => p.limiteCents === 0)).toBe(true);
    expect(s.diagnostico.valorRecomendadoCents).toBe(0);
  });
});

describe('respostas da API de crédito', () => {
  const comResposta = (resposta: unknown) =>
    criarCreditoApi((async (_c: string, validar: (v: unknown) => unknown) => validar(resposta)) as never);
  const valida = { id: '6f1e2d3c-1111-4222-8333-444455556666', partnerId: 'banco-demo', partnerName: 'Banco demonstrativo', mode: 'SIMULADO', amountCents: 100000, installments: 6, installmentCents: 17787, totalCents: 106722, interestCents: 6722, monthlyRateBp: 189, annualCetBp: 2519, commitmentBp: 1011, commitmentLevel: 'SAUDAVEL', canContract: true, firstDueOn: '2026-11-09', expiresAt: '2026-10-10T12:00:00Z' };
  it('aceita ofertas coerentes em ordem de CET', async () => {
    await expect(comResposta({ offers: [valida], declinedBy: [] }).simular(100000, 6)).resolves.toMatchObject({ ofertas: [{ parcelaCents: 17787 }] });
  });
  it('recusa total, juros, nível, modo ou ordem incoerentes', async () => {
    for (const ruim of [{ totalCents: 1 }, { interestCents: 0 }, { commitmentLevel: 'SAUDAVEL', commitmentBp: 6000 }, { mode: 'OUTRO' }, { amountCents: -5 }])
      await expect(comResposta({ offers: [{ ...valida, ...ruim }] }).simular(100000, 6)).rejects.toThrow();
    await expect(comResposta({ offers: [{ ...valida, annualCetBp: 3000 }, valida] }).simular(100000, 6)).rejects.toThrow();
  });
  it('não monta URL com identificador estranho', async () => {
    await expect(comResposta({}).contratar('../../auth/logout')).rejects.toThrow('Identificador inválido');
    await expect(comResposta({}).quitar('x/../y')).rejects.toThrow('Identificador inválido');
    await expect(comResposta({}).pagarParcela('6f1e2d3c-1111-4222-8333-444455556666', 99)).rejects.toThrow('Identificador inválido');
  });
});
