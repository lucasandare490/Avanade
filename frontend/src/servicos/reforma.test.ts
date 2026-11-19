// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  anteciparRecebiveis,
  caixaComPrazo,
  calcularPreco,
  compensar,
  criarReformaApi,
  descricaoDaNota,
  lerNotaCompra,
  linhasContador,
  resumirBase,
  validarResumoReforma,
} from './reforma';
import { criarCenario } from '../dados/cenarioDemonstrativo';
import { lerPercentualBp } from '../telas/TelaReforma';

// Valores esperados calculados à parte (Python), não copiados do código.
describe('reforma no caixa: cálculos', () => {
  it('compensa o crédito das compras com o imposto retido e acumula a sobra', () => {
    expect(compensar(10_000, 3_000)).toEqual({ creditoUsavelCents: 3_000, creditoAcumuladoCents: 0, impostoLiquidoCents: 7_000 });
    expect(compensar(2_000, 5_000)).toEqual({ creditoUsavelCents: 2_000, creditoAcumuladoCents: 3_000, impostoLiquidoCents: 0 });
  });

  it('preço de venda com IBS/CBS por fora, crédito da compra, taxa e margem', () => {
    const r = calcularPreco({ custoCents: 10_000, creditoCents: 1_000, aliquotaBp: 2_650, taxaBp: 200, margemBp: 2_000, precoAtualCents: 13_000 });
    expect('erro' in r).toBe(false);
    if ('erro' in r) return;
    expect(r).toMatchObject({ precoBaseCents: 11_618, impostoCents: 3_079, precoFinalCents: 14_697, taxaCents: 294, custoLiquidoCents: 9_000, lucroCents: 2_324 });
    expect(r.margemAtualBp).toBe(989);
    expect(r.diferencaCents).toBe(1_697);
  });

  it('preço recusa crédito maior que o custo e margem impossível', () => {
    expect(calcularPreco({ custoCents: 1_000, creditoCents: 2_000, aliquotaBp: 0, taxaBp: 0, margemBp: 0 })).toHaveProperty('erro');
    expect(calcularPreco({ custoCents: 1_000, creditoCents: 0, aliquotaBp: 2_650, taxaBp: 500, margemBp: 9_500 })).toHaveProperty('erro');
    expect(calcularPreco({ custoCents: 0, creditoCents: 0, aliquotaBp: 0, taxaBp: 0, margemBp: 0 })).toHaveProperty('erro');
  });

  it('prazo com fornecedor: compras por dia vezes os dias a mais', () => {
    expect(caixaComPrazo(300_000, 0, 30)).toEqual({ diasGanhos: 30, caixaLiberadoCents: 300_000 });
    expect(caixaComPrazo(300_000, 10, 25)).toEqual({ diasGanhos: 15, caixaLiberadoCents: 150_000 });
    expect(caixaComPrazo(300_000, 30, 20)).toEqual({ diasGanhos: -10, caixaLiberadoCents: -100_000 });
    expect(caixaComPrazo(300_000, 0, 181)).toBeNull();
  });

  it('antecipação: desconto proporcional aos dias e custo mensal efetivo', () => {
    expect(anteciparRecebiveis(100_000, 30, 250)).toEqual({ descontoCents: 2_500, liquidoCents: 97_500, custoMensalEfetivoBp: 256 });
    expect(anteciparRecebiveis(100_000, 15, 250)).toEqual({ descontoCents: 1_250, liquidoCents: 98_750, custoMensalEfetivoBp: 255 });
    expect(anteciparRecebiveis(100_000, 0, 250)).toBeNull();
    expect(anteciparRecebiveis(100_000, 30, 2_001)).toBeNull();
  });

  it('lê percentuais com vírgula de 0 a 100', () => {
    expect(lerPercentualBp('26,5')).toBe(2_650);
    expect(lerPercentualBp('2')).toBe(200);
    expect(lerPercentualBp('100')).toBe(10_000);
    expect(lerPercentualBp('100,01')).toBeNull();
    expect(lerPercentualBp('2.5')).toBeNull();
    expect(lerPercentualBp('-1')).toBeNull();
  });
});

const nfe = (total: string) => `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe1" versao="4.00">
<ide><nNF>4521</nNF><dhEmi>2026-10-05T10:20:00-03:00</dhEmi></ide>
<emit><xNome>Distribuidora Exemplo LTDA</xNome><xFant>Distribuidora Exemplo</xFant></emit>
<total><ICMSTot><vNF>1000.00</vNF></ICMSTot>${total}</total>
</infNFe></NFe></nfeProc>`;

describe('XML da NF-e de compra', () => {
  it('lê valor, data, fornecedor e o crédito de IBS + CBS do grupo IBSCBSTot', () => {
    const n = lerNotaCompra(
      nfe('<IBSCBSTot><vBCIBSCBS>1000.00</vBCIBSCBS><gIBS><gIBSUF><vIBSUF>10.00</vIBSUF></gIBSUF><gIBSMun><vIBSMun>7.70</vIBSMun></gIBSMun><vIBS>17.70</vIBS></gIBS><gCBS><vCBS>88.50</vCBS></gCBS></IBSCBSTot>'),
    );
    expect(n).toEqual({ numero: '4521', emitente: 'Distribuidora Exemplo', data: '2026-10-05', valorCents: 100_000, creditoCents: 10_620, temIbsCbs: true });
    expect(descricaoDaNota(n)).toBe('NF-e 4521 · Distribuidora Exemplo');
  });

  it('nota sem o grupo da Reforma vira compra sem crédito', () => {
    const n = lerNotaCompra(nfe(''));
    expect(n.creditoCents).toBe(0);
    expect(n.temIbsCbs).toBe(false);
  });

  it('recusa DOCTYPE, entidades, XML quebrado e arquivo que não é NF-e', () => {
    expect(() => lerNotaCompra('<!DOCTYPE x [<!ENTITY a "b">]><x>&a;</x>')).toThrow(/não permitidas/);
    expect(() => lerNotaCompra('<nfeProc><infNFe>')).toThrow();
    expect(() => lerNotaCompra('<pedido><valor>1</valor></pedido>')).toThrow(/NF-e/);
    expect(() => lerNotaCompra('x'.repeat(1_000_001))).toThrow(/grande/);
  });

  it('texto do fornecedor não leva caracteres de controle e fica curto', () => {
    const n = lerNotaCompra(nfe('').replace('<xFant>Distribuidora Exemplo</xFant>', `<xFant>${'A'.repeat(200)}&#9;B</xFant>`));
    expect(n.emitente.length).toBeLessThanOrEqual(60);
    expect(n.emitente).not.toMatch(/[\u0000-\u001f]/);
  });
});

describe('resumo e pacote do contador', () => {
  it('demonstração soma imposto retido e créditos das compras do período', () => {
    const base = criarCenario();
    const r = resumirBase(base, '2026-10-01', '2026-10-09');
    const ops = base.operacoes.filter((o) => o.status === 'concluida' && o.data.slice(0, 10) >= '2026-10-01');
    expect(r.impostoRetidoCents).toBe(ops.reduce((s, o) => s + o.tributo, 0));
    expect(r.creditoCents).toBe(9_500 + 2_864);
    expect(r.comprasComCredito).toBe(2);
    expect(r.brutoCents).toBe(r.impostoRetidoCents + r.taxasCents + r.liquidoCents);
    expect(r.impostoLiquidoCents).toBe(Math.max(0, r.impostoRetidoCents - r.creditoCents));
  });

  it('CSV do contador traz resumo, uma linha por venda e por compra, em reais com vírgula', () => {
    const r = resumirBase(criarCenario(), '2026-10-01', '2026-10-09');
    const linhas = linhasContador(r);
    expect(linhas.length).toBe(3 + r.linhasVendas.length + r.linhasCompras.length);
    expect(linhas[0][4]).toBe((r.brutoCents / 100).toFixed(2).replace('.', ','));
    const compra = linhas.find((l) => l[0] === 'Compra' && l[3].startsWith('Reposição de estoque'))!;
    expect(compra[8]).toBe('95,00');
    expect(linhas.every((l) => l.length === 9)).toBe(true);
  });

  it('valida a resposta da API e recusa números que não fecham', () => {
    const resposta = {
      from: '2026-10-01', to: '2026-10-09', salesCount: 1, grossCents: 1000, taxWithheldCents: 100, feeCents: 20, netCents: 880,
      purchasesCount: 1, purchasesCents: 500, purchasesWithCreditCount: 1, taxCreditCents: 50, creditUsableCents: 50, creditCarryOverCents: 0, netTaxCents: 50,
      sales: [{ id: 'a', date: '2026-10-02', paymentMethod: 'PIX', grossCents: 1000, taxCents: 100, feeCents: 20, netCents: 880 }],
      purchases: [{ id: 'b', date: '2026-10-03', description: 'Compra', categoryName: 'Estoque', amountCents: 500, taxCreditCents: 50 }],
      rowLimit: 1000, mode: 'SIMULADO',
    };
    expect(validarResumoReforma(resposta).creditoCents).toBe(50);
    expect(() => validarResumoReforma({ ...resposta, netCents: 881 })).toThrow();
    expect(() => validarResumoReforma({ ...resposta, netTaxCents: 0 })).toThrow();
    expect(() => validarResumoReforma({ ...resposta, taxCreditCents: -1 })).toThrow();
  });

  it('a API monta a URL com o período e recusa datas inválidas', async () => {
    const caminhos: string[] = [];
    const api = criarReformaApi(async (c) => {
      caminhos.push(c);
      throw new Error('fim');
    });
    await expect(api.resumo('2026-10-01', '2026-10-09')).rejects.toThrow('fim');
    expect(caminhos[0]).toBe('/api/v1/tax-reform/summary?from=2026-10-01&to=2026-10-09');
    await expect(api.resumo('2026-10-01&x=1', '2026-10-09')).rejects.toThrow(/período/);
  });
});
