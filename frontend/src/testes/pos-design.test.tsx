// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TelaPosDesign } from '../telas/TelaPosDesign';

afterEach(cleanup);

function iniciarDemo(voltar = vi.fn()) {
  cleanup();
  render(<TelaPosDesign voltar={voltar} />);
  fireEvent.click(screen.getByRole('button', { name: /iniciar demonstração/i }));
  return voltar;
}

it('simula uma venda e permite abrir o registro somente leitura', () => {
  iniciarDemo();
  fireEvent.click(screen.getByRole('button', { name: /nova venda/i }));
  fireEvent.change(screen.getByLabelText(/valor da venda/i), { target: { value: '150,00' } });
  fireEvent.click(screen.getByRole('button', { name: /cobrar/i }));

  expect(screen.getByRole('heading', { name: /processando/i })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /continuar demonstração/i }));
  expect(screen.getByRole('heading', { name: /venda simulada/i })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /ver registro/i }));

  expect(screen.getByText(/registro somente leitura/i)).toBeVisible();
  expect(screen.getByText(/R\$\s?150,00/)).toBeVisible();
});

it('demonstra falha, preserva o registro e reprocessa sem perder a venda', () => {
  iniciarDemo();
  fireEvent.click(screen.getByRole('button', { name: /nova venda/i }));
  fireEvent.change(screen.getByLabelText(/valor da venda/i), { target: { value: '80,00' } });
  fireEvent.click(screen.getByRole('button', { name: /demonstrar fluxo com falha/i }));
  fireEvent.click(screen.getByRole('button', { name: /continuar demonstração/i }));

  expect(screen.getByRole('heading', { name: /falha ao rotear uma parcela/i })).toBeVisible();
  expect(screen.getByText(/registro preservado/i)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /reprocessar/i }));
  fireEvent.click(screen.getByRole('button', { name: /continuar demonstração/i }));

  expect(screen.getByRole('heading', { name: /venda simulada/i })).toBeVisible();
  expect(screen.getAllByText(/R\$\s?80,00/).length).toBeGreaterThan(0);
});

it('leva ao dashboard pela entrada e também pelo perfil', () => {
  const voltar = vi.fn();
  render(<TelaPosDesign voltar={voltar} />);
  fireEvent.click(screen.getByRole('button', { name: /dashboard web/i }));
  expect(voltar).toHaveBeenCalledOnce();

  iniciarDemo(voltar);
  fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
  fireEvent.click(screen.getByRole('button', { name: /voltar ao dashboard web/i }));
  expect(voltar).toHaveBeenCalledTimes(2);
});

it('filtra operações pelo status sem alterar o restante da navegação', () => {
  iniciarDemo();
  fireEvent.click(screen.getByRole('button', { name: 'Operações' }));
  expect(screen.getByRole('button', { name: /OP-2026-0042/ })).toBeVisible();
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Falha' } });

  expect(screen.getByRole('button', { name: /OP-2026-0039/ })).toBeVisible();
  expect(screen.queryByRole('button', { name: /OP-2026-0042/ })).toBeNull();
});
