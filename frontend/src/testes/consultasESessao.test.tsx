import { TelaAnaliseIntegrada } from '../telas/TelaAnaliseIntegrada';
import { TelaAnalise } from '../telas/TelaAnalise';
import { criarCenario } from '../dados/cenarioDemonstrativo';
import { Indicador } from '../componentes/ElementosInterface';
// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
import { Aplicacao } from '../Aplicacao';
import { criarServicoDemonstrativo } from '../servicos/servicoDemonstrativo';
import { sessaoDemonstrativa } from '../servicos/sessaoUsuario';
import { TelaDespesasIntegrada } from '../telas/TelaDespesasIntegrada';
import { FalhaTransporte } from '../servicos/transporteApi';
beforeEach(() => {
  location.hash = '';
  sessionStorage.clear();
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('descarta resposta antiga e cancela ao trocar filtros', async () => {
  const resolver: Record<string, (v: string) => void> = {},
    sinais: Record<string, AbortSignal> = {};
  const { result, rerender } = renderHook(
    ({ chave }) =>
      useConsultaRemota(chave, (sinal) => {
        sinais[chave] = sinal;
        return new Promise<string>((r) => {
          resolver[chave] = r;
        });
      }),
    { initialProps: { chave: 'a' } },
  );
  await waitFor(() => expect(sinais.a).toBeDefined());
  rerender({ chave: 'b' });
  await waitFor(() => expect(sinais.b).toBeDefined());
  expect(sinais.a.aborted).toBe(true);
  await act(async () => {
    resolver.b('novo');
  });
  expect(result.current.dados).toBe('novo');
  await act(async () => {
    resolver.a('antigo');
  });
  expect(result.current.dados).toBe('novo');
});
it('modo API não carrega toda a base nem consulta rota sem permissão', async () => {
  const servico = criarServicoDemonstrativo();
  servico.carregar = vi.fn();
  servico.consultarResumo = vi.fn();
  servico.consultarOperacoes = vi
    .fn()
    .mockResolvedValue({ itens: [], total: 0, pagina: 1, tamanho: 20 });
  render(
    <Aplicacao
      integracao={{
        criarServico: () => servico,
        autenticacao: { entrar: async () => sessaoDemonstrativa('operador'), sair: async () => {} },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Entrar$/ }));
  fireEvent.change(screen.getByLabelText(/E-mail/), {
    target: { value: 'operador@exemplo.invalid' },
  });
  fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'demo' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  await screen.findByText('Nenhuma operação encontrada');
  expect(servico.carregar).not.toHaveBeenCalled();
  expect(servico.consultarResumo).not.toHaveBeenCalled();
  act(() => {
    location.hash = '/dashboard';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  await screen.findByText('Acesso não permitido');
  expect(servico.consultarResumo).not.toHaveBeenCalled();
});
it('despesa com resposta desconhecida bloqueia um segundo envio', async () => {
  const s = criarServicoDemonstrativo();
  s.categoriasDespesa = ['Estoque'];
  s.consultarDespesas = vi.fn().mockResolvedValue({ itens: [], total: 0, pagina: 1, tamanho: 20 });
  s.registrarDespesa = vi.fn().mockRejectedValue(new FalhaTransporte(0, 'Resposta desconhecida'));
  render(<TelaDespesasIntegrada servico={s} permitirRegistro />);
  fireEvent.click(screen.getByRole('button', { name: 'Registrar despesa' }));
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Estoque' } });
  fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '10,00' } });
  fireEvent.change(screen.getByLabelText('Data do pagamento'), { target: { value: '2026-10-09' } });
  const form = screen.getByLabelText('Descrição').closest('form')!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Salvar despesa' })).toBeDisabled(),
  );
  expect(s.registrarDespesa).toHaveBeenCalledTimes(1);
});

it('explicação remota renderiza marcação como texto, sem executar HTML', async () => {
  const servico = criarServicoDemonstrativo();
  servico.explicar = vi.fn().mockImplementation(async (periodo) => ({
    periodo,
    texto: '<img src=x onerror=alert(1)>',
    origem: 'servidor',
  }));
  render(<TelaAnaliseIntegrada servico={servico} />);
  fireEvent.change(screen.getByLabelText('Análise de'), { target: { value: '2026-10-01' } });
  fireEvent.change(screen.getByLabelText('Análise até'), { target: { value: '2026-10-09' } });
  fireEvent.click(screen.getByRole('button', { name: 'Solicitar explicação' }));
  expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  expect(document.querySelector('img')).toBeNull();
  expect(servico.explicar).toHaveBeenCalledWith(
    { inicio: '2026-10-01', fim: '2026-10-09' },
    expect.any(AbortSignal),
  );
  fireEvent.change(screen.getByLabelText('Análise até'), { target: { value: '2026-10-08' } });
  expect(screen.queryByText('<img src=x onerror=alert(1)>')).not.toBeInTheDocument();
});
it('explicação indisponível e sem dados preserva acesso ao caixa', () => {
  render(<TelaAnalise base={criarCenario()} />);
  fireEvent.change(screen.getByLabelText('Visualizar estado'), { target: { value: 'erro' } });
  expect(screen.getByText('Suas operações e valores continuam disponíveis.')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Visualizar estado'), { target: { value: 'vazio' } });
  expect(screen.getByText('Ainda não há dados suficientes')).toBeInTheDocument();
});
it('ausência de indicador não é apresentada como zero', () => {
  render(<Indicador titulo="Saldo" valor={null} detalhe="Aguardando serviço" />);
  expect(screen.getByText('Não informado')).toBeInTheDocument();
  expect(screen.queryByText('R$ 0,00')).not.toBeInTheDocument();
});
it('sessão 401 do serviço volta ao login sem fallback demonstrativo', async () => {
  location.hash = '/operacoes';
  const s = criarServicoDemonstrativo();
  s.consultarOperacoes = vi.fn().mockRejectedValue(new FalhaTransporte(401, 'Sessão expirada'));
  render(
    <Aplicacao
      integracao={{
        criarServico: () => s,
        autenticacao: { entrar: async () => sessaoDemonstrativa(), sair: async () => {} },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Entrar$/ }));
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: 'gestor@exemplo.invalid' },
  });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'demo' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Entrar no Planner' })).toBeInTheDocument(),
  );
  await waitFor(() => expect(s.consultarOperacoes).toHaveBeenCalled());
  expect(screen.queryByRole('heading', { name: 'Olá, Maria' })).not.toBeInTheDocument();
});
it('rota inexistente tem saída utilizável', async () => {
  location.hash = '/pagina-inexistente';
  render(<Aplicacao />);
  fireEvent.click(screen.getByRole('button', { name: 'Explorar demonstração' }));
  await screen.findByText('Página não encontrada');
  expect(screen.getByRole('link', { name: 'Voltar ao dashboard' })).toHaveAttribute(
    'href',
    '#/dashboard',
  );
});

it('preserva verificações síncronas de intenção sem bloquear nova venda ou despesa', async () => {
  location.hash = '/venda-demonstrativa';
  const servico = criarServicoDemonstrativo();
  servico.vendaPendente = () => false;
  servico.despesaPendente = () => false;
  servico.categoriasDespesa = ['Estoque'];
  servico.consultarDespesas = async () => ({ itens: [], total: 0, pagina: 1, tamanho: 20 });
  render(
    <Aplicacao
      integracao={{
        criarServico: () => servico,
        autenticacao: {
          entrar: async () => sessaoDemonstrativa(),
          sair: async () => {},
        },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Entrar$/ }));
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'gerente@demo.local' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'demo' } });
  fireEvent.click(screen.getByRole('button', { name: /^Entrar$/ }));
  expect(await screen.findByLabelText('Valor da venda (R$)')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Consultar a mesma tentativa' })).toBeNull();
  act(() => {
    location.hash = '/despesas';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  expect(await screen.findByRole('button', { name: 'Registrar despesa' })).toBeEnabled();
});
