import { describe, expect, it } from 'vitest';
import { cetAnualBp, criarCreditoApi, criarCreditoDemo, limiteSimulado, parcelaPrice } from './credito';
import type { Operacao } from '../tipos';

// Capital de giro (Thayná Batista da Silva): mesmas contas do parceiro simulado do servidor.
describe('cálculos do parceiro simulado', () => {
  it('tabela Price e CET iguais aos do servidor', () => {
    expect(parcelaPrice(100_000, 249, 6)).toBe(18_149);
    expect(parcelaPrice(100_000, 249, 1)).toBe(102_490);
    expect(parcelaPrice(120_000, 0, 12)).toBe(10_000);
    expect(cetAnualBp(249)).toBe(3433);
  });
  it('limite de 50% das entradas de 90 dias, em múltiplos de R$ 100, entre R$ 500 e R$ 50 mil', () => {
    expect(limiteSimulado({ entradasLiquidas90dCents: 99_999, despesas90dCents: 0, vendas90d: 1 }).limiteCents).toBe(0);
    expect(limiteSimulado({ entradasLiquidas90dCents: 395_859, despesas90dCents: 0, vendas90d: 16 }).limiteCents).toBe(190_000);
    expect(limiteSimulado({ entradasLiquidas90dCents: 999_999_999, despesas90dCents: 0, vendas90d: 1 }).limiteCents).toBe(5_000_000);
  });
});

describe('capital de giro na demonstração', () => {
  const op = (liquido: number, data = '2026-10-01T10:00:00-03:00'): Operacao =>
    ({ id: `OP-${liquido}`, data, bruto: liquido, tributo: 0, taxa: 0, liquido, meio: 'PIX', status: 'concluida', eventos: [] }) as Operacao;
  it('exige consentimento, respeita o limite, contrata uma vez e bloqueia depois de revogar', async () => {
    const demo = criarCreditoDemo(() => [op(300_000), op(100_000), op(500_000, '2026-01-01T10:00:00-03:00')], '2026-10-09');
    const s = await demo.consultar();
    expect(s.parceiro.fatos.entradasLiquidas90dCents).toBe(400_000);
    expect(s.parceiro.limiteCents).toBe(200_000);
    await expect(demo.simular(100_000, 6)).rejects.toThrow('Autorize');
    await demo.consentir();
    await expect(demo.simular(300_000, 6)).rejects.toThrow('limite');
    await expect(demo.simular(100_000, 13)).rejects.toThrow('1 a 12');
    const p = await demo.simular(100_000, 6);
    expect(p).toMatchObject({ parcelaCents: 18_149, totalCents: 108_894, jurosCents: 8_894, primeiroVencimento: '2026-11-09' });
    const c = await demo.contratar(p.id);
    expect(c.cronograma.map((x) => x.vencimento)).toEqual(['2026-11-09', '2026-12-09', '2027-01-09', '2027-02-09', '2027-03-09', '2027-04-09']);
    expect((await demo.contratar(p.id)).id).toBe(c.id);
    expect((await demo.consultar()).contratos).toHaveLength(1);
    const p2 = await demo.simular(60_000, 1);
    await demo.revogar();
    await expect(demo.contratar(p2.id)).rejects.toThrow('revogado');
  });
  it('loja sem vendas não recebe limite', async () => {
    const s = await criarCreditoDemo(() => [], '2026-10-09').consultar();
    expect(s.parceiro.limiteCents).toBe(0);
    expect(s.parceiro.motivo).toContain('Ainda não há vendas suficientes');
  });
});

describe('respostas da API de crédito', () => {
  const comResposta = (resposta: unknown) =>
    criarCreditoApi((async (_c: string, validar: (v: unknown) => unknown) => validar(resposta)) as never);
  const valida = { id: '6f1e2d3c-1111-4222-8333-444455556666', mode: 'SIMULADO', amountCents: 100000, installments: 6, installmentCents: 18149, totalCents: 108894, interestCents: 8894, monthlyRateBp: 249, annualCetBp: 3433, firstDueOn: '2026-11-09', expiresAt: '2026-10-10T12:00:00Z' };
  it('aceita proposta coerente', async () => {
    await expect(comResposta(valida).simular(100000, 6)).resolves.toMatchObject({ parcelaCents: 18149 });
  });
  it('recusa proposta com total, juros ou modo errados', async () => {
    await expect(comResposta({ ...valida, totalCents: 1 }).simular(100000, 6)).rejects.toThrow();
    await expect(comResposta({ ...valida, interestCents: 0 }).simular(100000, 6)).rejects.toThrow();
    await expect(comResposta({ ...valida, mode: 'OUTRO' }).simular(100000, 6)).rejects.toThrow();
    await expect(comResposta({ ...valida, amountCents: -5 }).simular(100000, 6)).rejects.toThrow();
  });
  it('não monta URL com identificador estranho', async () => {
    await expect(comResposta({}).contratar('../../auth/logout')).rejects.toThrow('Identificador inválido');
  });
});
