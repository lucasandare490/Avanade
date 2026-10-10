import { describe, expect, it } from 'vitest';
import { criarServicoDemonstrativo } from './servicoDemonstrativo';
import { resumir } from '../utilitarios/valoresFinanceiros';
describe('adapter demonstrativo', () => {
  it('recupera uma resposta perdida sem criar outra operação', async () => {
    const s = criarServicoDemonstrativo();
    const venda = {
      chave: 'perdida',
      bruto: 15000,
      meio: 'PIX' as const,
      cenario: 'resposta-perdida' as const,
    };
    await expect(s.registrarVenda(venda)).rejects.toThrow('resposta se perdeu');
    const antes = await s.carregar();
    expect(antes.operacoes).toHaveLength(19);
    const recuperada = await s.registrarVenda(venda);
    expect(recuperada.id).toBe(antes.operacoes[0].id);
    expect((await s.carregar()).operacoes).toHaveLength(19);
  });
  it('não duplica venda em solicitações concorrentes com mesma chave', async () => {
    const s = criarServicoDemonstrativo();
    const venda = {
      chave: 'igual',
      bruto: 15000,
      meio: 'PIX' as const,
      cenario: 'sucesso' as const,
    };
    const [a, b] = await Promise.all([s.registrarVenda(venda), s.registrarVenda(venda)]);
    expect(a.id).toBe(b.id);
    expect((await s.carregar()).operacoes).toHaveLength(19);
    await expect(s.registrarVenda({ ...venda, bruto: 16000 })).rejects.toThrow('outros dados');
  });
  it('recusa não produz operação nem entrada', async () => {
    const s = criarServicoDemonstrativo();
    await expect(
      s.registrarVenda({ chave: 'recusa', bruto: 15000, meio: 'PIX', cenario: 'recusa' }),
    ).rejects.toThrow('recusado');
    expect((await s.carregar()).operacoes).toHaveLength(18);
  });
  it('retomada repetida não duplica receita ou eventos', async () => {
    const s = criarServicoDemonstrativo();
    const antes = await s.carregar();
    const falha = antes.operacoes.find((o) => o.status === 'falha')!;
    const saldo = resumir(antes.operacoes, antes.despesas).saldo;
    await Promise.all([s.reprocessar(falha.id), s.reprocessar(falha.id)]);
    const depois = await s.carregar();
    expect(resumir(depois.operacoes, depois.despesas).saldo).toBe(saldo + falha.liquido);
    expect(depois.operacoes.find((o) => o.id === falha.id)?.eventos).toHaveLength(4);
  });
  it('consumidor não modifica base interna por referência', async () => {
    const s = criarServicoDemonstrativo();
    const b = await s.carregar();
    b.operacoes.length = 0;
    expect((await s.carregar()).operacoes).toHaveLength(18);
  });
});
