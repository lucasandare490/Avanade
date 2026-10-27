// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TelaEntrada } from '../telas/TelaEntrada';
import { TelaLogin } from '../telas/TelaLogin';
import { TelaAjuda } from '../telas/TelaAjuda';
import { TelaConfiguracoes } from '../telas/TelaConfiguracoes';
import { TelaRegistroVenda } from '../telas/TelaRegistroVenda';

afterEach(cleanup);

it('apresenta o site com API como MVP e identifica o exemplo financeiro', () => {
  render(<TelaEntrada entrar={vi.fn()} abrirLogin={vi.fn()} permitirDemo={false} />);
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  expect(screen.getByText('Exemplo de venda')).toBeInTheDocument();
  expect(screen.getByText(/Planner Comercial MVP\. Os registros são salvos no servidor/)).toBeInTheDocument();
  expect(screen.queryByText(/Explorar demonstração/)).not.toBeInTheDocument();
});

it('usa identificação de MVP no login conectado à API', () => {
  render(<TelaLogin demonstrativo={false} autenticar={vi.fn()} concluir={vi.fn()} voltar={vi.fn()} />);
  expect(screen.getByText('Planner Comercial · MVP · Pagamentos simulados')).toBeInTheDocument();
  expect(screen.queryByText(/MVP demonstrativo/)).not.toBeInTheDocument();
});

it('explica os limites do MVP nas telas integradas', () => {
  const { rerender } = render(<TelaAjuda demonstrativo={false} />);
  expect(screen.getByText('Entenda os valores e saiba como usar o Planner Comercial.')).toBeInTheDocument();
  rerender(<TelaConfiguracoes demonstrativo={false} />);
  expect(screen.getByText('Recursos e limites do MVP')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Conhecer as telas de acesso' })).not.toBeInTheDocument();
  rerender(<TelaRegistroVenda demonstrativo={false} registrar={vi.fn()} />);
  expect(screen.getByText(/Vendas confirmadas ficam no servidor/)).toBeInTheDocument();
  expect(screen.queryByText(/servidor de demonstração/)).not.toBeInTheDocument();
});
