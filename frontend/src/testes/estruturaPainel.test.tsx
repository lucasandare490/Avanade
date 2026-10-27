// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EstruturaPainel } from '../componentes/EstruturaPainel';
import { sessaoDemonstrativa } from '../servicos/sessaoUsuario';

afterEach(cleanup);

it('distingue a sessão demonstrativa do processamento simulado com API', () => {
  const props = { rota: 'dashboard', sair: vi.fn(), sessao: sessaoDemonstrativa() };
  const { rerender } = render(<EstruturaPainel {...props} demonstrativo>Conteúdo</EstruturaPainel>);

  expect(screen.getByText('Ambiente demonstrativo')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sair da demonstração' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Smart POS · protótipo' })).toBeInTheDocument();

  rerender(<EstruturaPainel {...props} demonstrativo={false}>Conteúdo</EstruturaPainel>);

  expect(screen.getByText('Processamento simulado')).toBeInTheDocument();
  expect(screen.getByText('Sem movimentação real')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  expect(screen.queryByText('Ambiente demonstrativo')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Sair da demonstração' })).not.toBeInTheDocument();
  expect(screen.getByText('Estabelecimento cadastrado')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Análise financeira' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Smart POS · protótipo' })).not.toBeInTheDocument();
});
