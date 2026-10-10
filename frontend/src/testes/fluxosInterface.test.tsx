// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Aplicacao } from '../Aplicacao';
import { TelaDashboard } from '../telas/TelaDashboard';
import { TelaDespesas } from '../telas/TelaDespesas';
import { criarCenario } from '../dados/cenarioDemonstrativo';

beforeEach(() => {
  sessionStorage.clear();
  location.hash = '';
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
async function abrir() {
  const user = userEvent.setup();
  render(<Aplicacao />);
  await user.click(screen.getByRole('button', { name: 'Explorar demonstração' }));
  await screen.findByRole('heading', { name: 'Olá, Maria' });
  return user;
}
async function navegar(user: ReturnType<typeof userEvent.setup>, nome: string) {
  await user.click(screen.getByRole('link', { name: nome }));
}

describe('fluxos de interface', () => {
  it('preserva filtro ao consultar uma operação e voltar', async () => {
    const user = await abrir();
    await navegar(user, 'Operações');
    await user.type(await screen.findByLabelText('Buscar operação'), 'OP-0184');
    await user.click(screen.getByRole('link', { name: 'OP-0184' }));
    await screen.findByRole('heading', { name: 'OP-0184' });
    expect(screen.getAllByText('R$ 487,50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 429,00').length).toBeGreaterThan(0);
    await navegar(user, 'Voltar às operações');
    expect(await screen.findByLabelText('Buscar operação')).toHaveValue('OP-0184');
    expect(screen.queryByRole('link', { name: 'OP-0183' })).not.toBeInTheDocument();
  });
  it('cadastra despesa e atualiza o caixa, limpando alterações ao sair', async () => {
    const user = await abrir();
    await navegar(user, 'Despesas');
    await user.click(await screen.findByRole('button', { name: 'Registrar despesa' }));
    await user.type(screen.getByLabelText('Descrição'), 'Teste de despesa');
    await user.type(screen.getByLabelText('Valor (R$)'), '10,01');
    await user.click(screen.getByRole('button', { name: 'Salvar despesa demonstrativa' }));
    await screen.findByText('Despesa paga registrada no cenário local.');
    expect(screen.getByText('Teste de despesa')).toBeInTheDocument();
    await navegar(user, 'Fluxo de Caixa');
    await screen.findByRole('heading', { name: 'Fluxo de Caixa' });
    expect(screen.getByText('R$ 2.588,18')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sair da demonstração' }));
    await user.click(screen.getByRole('button', { name: 'Explorar demonstração' }));
    await screen.findByRole('heading', { name: 'Olá, Maria' });
    expect(screen.getAllByText('R$ 2.598,19')).toHaveLength(2);
  });
  it('simular com e sem taxa não muda o dashboard', async () => {
    const user = await abrir();
    await navegar(user, 'Simulação Split');
    await user.click(await screen.findByRole('button', { name: 'Calcular simulação' }));
    expect(screen.getByText('R$ 132,00')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Incluir taxa demonstrativa de 2%'));
    expect(screen.queryByText('R$ 132,00')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Calcular simulação' }));
    expect(screen.getByText('R$ 135,00')).toBeInTheDocument();
    await navegar(user, 'Dashboard');
    await screen.findByRole('heading', { name: 'Olá, Maria' });
    expect(screen.getAllByText('R$ 2.598,19')).toHaveLength(2);
  });
  it('recupera resposta perdida reutilizando a tentativa', async () => {
    const user = await abrir();
    await navegar(user, 'Modo POS · demo web');
    await user.selectOptions(
      await screen.findByLabelText('Cenário de demonstração'),
      'resposta-perdida',
    );
    await user.click(screen.getByRole('button', { name: 'Revisar venda' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar venda simulada' }));
    await screen.findByText(/A resposta se perdeu/);
    expect(screen.getByRole('button', { name: 'Voltar e editar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Consultar a mesma tentativa' }));
    await screen.findByRole('heading', { name: /OP-DEMO-/ });
    await navegar(user, 'Dashboard');
    await screen.findByRole('heading', { name: 'Olá, Maria' });
    expect(screen.getByText('17 operações concluídas no período')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 2.730,19')).toHaveLength(2);
  });
  it('permite filtrar vazio e corrigir datas invertidas', async () => {
    const user = await abrir();
    await navegar(user, 'Operações');
    fireEvent.change(await screen.findByLabelText('De'), { target: { value: '2026-10-09' } });
    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-10-01' } });
    expect(screen.getByRole('alert')).toHaveTextContent('data final');
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Buscar operação'), 'inexistente');
    expect(
      screen.getByRole('heading', { name: 'Nenhuma operação encontrada' }),
    ).toBeInTheDocument();
  });
  it('mantém formulário ao falhar e impede duas submissões simultâneas', async () => {
    const user = userEvent.setup();
    const salvar = vi.fn().mockRejectedValue(new Error('Falha de teste.'));
    render(<TelaDespesas despesas={[]} salvar={salvar} />);
    await user.click(screen.getByRole('button', { name: 'Registrar despesa' }));
    await user.type(screen.getByLabelText('Descrição'), 'Internet');
    await user.type(screen.getByLabelText('Valor (R$)'), '50,00');
    await user.click(screen.getByRole('button', { name: 'Salvar despesa demonstrativa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de teste.');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Internet');
    let concluir!: () => void;
    salvar.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluir = resolve;
        }),
    );
    const formulario = screen.getByLabelText('Descrição').closest('form')!;
    fireEvent.submit(formulario);
    fireEvent.submit(formulario);
    expect(salvar).toHaveBeenCalledTimes(2);
    concluir();
    await screen.findByText('Despesa paga registrada no cenário local.');
  });
  it('gráfico e indicadores cobrem o mesmo período', async () => {
    const user = userEvent.setup();
    render(<TelaDashboard base={criarCenario()} />);
    await user.click(screen.getByText('Ver valores do gráfico em tabela'));
    const tabela = screen.getByRole('table');
    expect(within(tabela).getAllByRole('row')).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(within(tabela).getAllByRole('row')).toHaveLength(2);
    expect(within(tabela).getByText('R$ 561,00')).toBeInTheDocument();
  });
  it('não apresenta violações estruturais de acessibilidade nas telas principais', async () => {
    const user = await abrir();
    for (const [nome, titulo] of [
      ['Dashboard', 'Olá, Maria'],
      ['Operações', 'Operações'],
      ['Despesas', 'Despesas'],
      ['Fluxo de Caixa', 'Fluxo de Caixa'],
      ['Simulação Split', 'Simulação Split'],
      ['Análise com IA', 'Análise com IA'],
      ['Configurações', 'Sobre esta demonstração'],
      ['Modo POS · demo web', 'Nova venda demonstrativa'],
    ]) {
      await navegar(user, nome);
      await screen.findByRole('heading', { name: titulo, level: 1 });
      const resultado = await axe.run(document.body, {
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      });
      expect(
        resultado.violations.map(
          (v) => `${nome}: ${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`,
        ),
      ).toEqual([]);
    }
  }, 60000);
});
