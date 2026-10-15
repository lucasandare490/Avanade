// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TelaRegistroVenda } from '../telas/TelaRegistroVenda';
import { TelaDetalheVenda } from '../telas/TelaVendasIntegrada';
import { criarServicoDemonstrativo } from '../servicos/servicoDemonstrativo';
import { mapearResultadoVenda, mapearVenda } from '../servicos/contratoBackendPlanner';
import exemplo from '../../../backend/docs/examples/sale-confirmed.json';
beforeEach(() => {
  location.hash = '';
});
afterEach(cleanup);
it.each(['PENDING', 'DECLINED', 'CONFIRMED'])(
  'venda %s sem split abre o detalhe de venda sem inventar operação',
  async (status) => {
    const resposta = { ...exemplo, operation: null, payment: { status } };
    const registrar = vi.fn().mockResolvedValue(mapearResultadoVenda(resposta));
    const tela = render(<TelaRegistroVenda demonstrativo={false} registrar={registrar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Revisar venda' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar venda' }));
    await waitFor(() => expect(location.hash).toBe(`#/vendas/${exemplo.id}`));
    tela.unmount();
    const servico = criarServicoDemonstrativo();
    servico.consultarVenda = async () => mapearVenda(resposta);
    render(<TelaDetalheVenda id={exemplo.id} servico={servico} />);
    expect(await screen.findByRole('heading', { name: /^Pagamento / })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Ver operação de split' })).toBeNull();
    expect(screen.getByText(/não gera entrada no caixa/)).toBeVisible();
  },
);
