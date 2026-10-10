import { afterEach, describe, expect, it, vi } from 'vitest';
import { criarClienteHttp, ErroApi } from './clienteHttp';
afterEach(() => vi.unstubAllGlobals());
describe('cliente HTTP futuro, sem fallback silencioso', () => {
  it('valida resposta antes de entregá-la ao consumidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ valor: 15 }))));
    const cliente = criarClienteHttp('http://localhost:8080/');
    const resultado = await cliente('/exemplo', (r) => {
      if (typeof r !== 'object' || r === null || !('valor' in r))
        throw new Error('Resposta inválida');
      return r.valor;
    });
    expect(resultado).toBe(15);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/exemplo',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });
  it.each([401, 403, 404, 409, 500])(
    'preserva status %i sem mostrar resposta interna',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('segredo-interno', { status })),
      );
      const c = criarClienteHttp('http://localhost:8080');
      try {
        await c('/teste', (r) => r);
        throw new Error('Deveria falhar');
      } catch (e) {
        expect(e).toBeInstanceOf(ErroApi);
        expect((e as ErroApi).status).toBe(status);
        expect((e as Error).message).not.toContain('segredo-interno');
      }
    },
  );
  it('não substitui indisponibilidade por dados mock', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(criarClienteHttp('http://localhost:8080')('/teste', (r) => r)).rejects.toThrow();
  });
  it('repassa cancelamento de consulta', async () => {
    const controlador = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
    await criarClienteHttp('http://localhost:8080')('/teste', (r) => r, controlador.signal);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controlador.signal }),
    );
  });
});
