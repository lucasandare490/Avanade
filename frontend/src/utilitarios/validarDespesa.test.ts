import { describe, expect, it } from 'vitest';
import { validarDespesa } from './validarDespesa';
describe('validação da despesa demonstrativa', () => {
  const valida = { descricao: 'Estoque', valor: 15000, categoria: 'Estoque', data: '2026-10-09' };
  it('aceita pagamento na data de referência', () => expect(validarDespesa(valida)).toBeNull());
  it.each(['2026-02-30', '2026-13-01', '2026-10-10', '2025-12-31', ''])(
    'rejeita data impossível ou fora do cenário: %s',
    (data) => expect(validarDespesa({ ...valida, data })).not.toBeNull(),
  );
  it('rejeita descrição vazia e categoria desconhecida', () => {
    expect(validarDespesa({ ...valida, descricao: '   ' })).not.toBeNull();
    expect(validarDespesa({ ...valida, categoria: 'inventada' })).not.toBeNull();
  });
});
