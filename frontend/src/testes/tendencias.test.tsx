// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  descreverVariacao,
  periodoAnterior,
  tendenciasDemonstrativas,
  validarTendencias,
} from '../utilitarios/tendencias';
import { criarCenario } from '../dados/cenarioDemonstrativo';
import { TelaAnalise } from '../telas/TelaAnalise';
import { TelaAnaliseIntegrada } from '../telas/TelaAnaliseIntegrada';
import { criarServicoDemonstrativo } from '../servicos/servicoDemonstrativo';
afterEach(cleanup);
it('exibe comparação remota mesmo com texto vazio e limpa ao trocar período', async () => {
  const servico = criarServicoDemonstrativo();
  servico.explicar = async periodo => ({ periodo, texto: '', origem: 'servidor', tendencias: {
    anterior: periodoAnterior(periodo), indicadores: [{ titulo: 'Recebimentos', atual: 20000, anterior: 10000 }],
  } });
  render(<TelaAnaliseIntegrada servico={servico} />);
  fireEvent.change(screen.getByLabelText('Análise de'), { target: { value: '2026-10-07' } });
  fireEvent.change(screen.getByLabelText('Análise até'), { target: { value: '2026-10-09' } });
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar explicação' }));
  expect(await screen.findByText('Aumento de 100%')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Análise de'), { target: { value: '2026-10-08' } });
  expect(screen.queryByText('Aumento de 100%')).toBeNull();
});
it.each([
  [200, 100, 'Aumento de 100%'],
  [50, 100, 'Queda de 50%'],
  [100, 100, 'Estável'],
  [0, 0, 'Estável'],
  [null, 100, 'Dados insuficientes'],
  [100, 0, 'Aumento — sem base positiva para percentual'],
])('variação %s contra %s', (a, b, texto) =>
  expect(descreverVariacao(a as number | null, b as number | null)).toBe(texto),
);
it('compara dias inclusivos cruzando mês e ano', () =>
  expect(periodoAnterior({ inicio: '2026-01-01', fim: '2026-01-03' })).toEqual({
    inicio: '2025-12-29',
    fim: '2025-12-31',
  }));
it.each([
  { inicio: '2026-02-30', fim: '2026-03-01' },
  { inicio: '', fim: '2026-01-01' },
  { inicio: '2026-02-01', fim: '2026-01-01' },
])('rejeita período inválido', (p) => expect(() => periodoAnterior(p)).toThrow());
it('ausência de registros não vira zero nem altera o cenário', () => {
  const base = criarCenario(),
    antes = JSON.stringify(base);
  const r = tendenciasDemonstrativas(base, { inicio: '2030-01-01', fim: '2030-01-03' });
  expect(r.indicadores.every((i) => i.atual === null && i.anterior === null)).toBe(true);
  expect(JSON.stringify(base)).toBe(antes);
});
it('rejeita comparação remota com período ou valores inválidos', () => {
  const p = { inicio: '2026-10-07', fim: '2026-10-09' },
    r = tendenciasDemonstrativas(criarCenario(), p);
  expect(validarTendencias(r, p)).toBe(r);
  expect(() => validarTendencias({ ...r, anterior: p }, p)).toThrow();
  expect(() =>
    validarTendencias({ ...r, indicadores: [{ titulo: 'Valor', atual: NaN, anterior: 0 }] }, p),
  ).toThrow();
});
it('mantém comparações acessíveis quando a explicação falha e atualiza o período', () => {
  render(<TelaAnalise base={criarCenario()} />);
  fireEvent.change(screen.getByLabelText('Análise de'), { target: { value: '2026-10-07' } });
  expect(screen.getByText(/2026-10-04 a 2026-10-06/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Visualizar estado'), { target: { value: 'erro' } });
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByText('Suas operações e valores continuam disponíveis.')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Análise de'), { target: { value: '' } });
  expect(screen.queryByRole('table')).toBeNull();
});
