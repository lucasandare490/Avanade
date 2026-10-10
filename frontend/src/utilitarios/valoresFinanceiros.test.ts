import { describe, expect, it } from 'vitest';
import { calcularExemplo, dentroPeriodo, lerCentavos, resumir } from './valoresFinanceiros';
import { criarCenario } from '../dados/cenarioDemonstrativo';
describe('valores financeiros demonstrativos', () => {
  it('interpreta vírgula sem confundir centavos ou aceitar entradas ambíguas', () => {
    expect(lerCentavos('150,01')).toBe(15001);
    expect(lerCentavos('0,01')).toBe(1);
    for (const v of ['0', '-1', '1.000', 'abc', '10,123', '1000001'])
      expect(lerCentavos(v)).toBeNull();
  });
  it('conserva centavos e diferencia cenário com taxa', () => {
    expect(calcularExemplo(15000)).toEqual({
      bruto: 15000,
      tributo: 1500,
      taxa: 300,
      liquido: 13200,
    });
    expect(calcularExemplo(15000, 1000, 0).liquido).toBe(13500);
    for (let v = 1; v < 10000; v += 13) {
      const r = calcularExemplo(v);
      expect(r.tributo + r.taxa + r.liquido).toBe(v);
    }
  });
  it('exclui operações não concluídas do caixa', () => {
    const b = criarCenario();
    const r = resumir(b.operacoes, b.despesas);
    expect(r.quantidade).toBe(16);
    expect(r.liquido).toBe(
      b.operacoes.filter((o) => o.status === 'concluida').reduce((s, o) => s + o.liquido, 0),
    );
    expect(r.saldo).toBe(r.liquido - r.saidas);
  });
  it('respeita datas inclusivas sem conversão para outro fuso', () => {
    expect(dentroPeriodo('2026-10-09T23:59:00-03:00', '2026-10-09', '2026-10-09')).toBe(true);
    expect(dentroPeriodo('2026-10-08', '2026-10-09', '2026-10-09')).toBe(false);
  });
});
