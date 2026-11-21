import { describe, expect, it } from 'vitest';
import { destinoOficial, ENDERECO_OFICIAL } from './enderecoOficial';

describe('endereço único', () => {
  it('endereço antigo da Vercel vai para o Render no mesmo caminho e tela', () => {
    expect(destinoOficial({ hostname: 'avanade-frontend-xi.vercel.app', pathname: '/', search: '?a=1', hash: '#/credito' })).toBe(`${ENDERECO_OFICIAL}/?a=1#/credito`);
  });
  it('endereço oficial, local ou outro domínio não redireciona', () => {
    for (const hostname of ['planner-api-tvmg.onrender.com', '127.0.0.1', 'localhost', 'vercel.app.exemplo.com', 'exemplo.com'])
      expect(destinoOficial({ hostname, pathname: '/', search: '', hash: '' })).toBeNull();
  });
  it('o destino é sempre o endereço oficial, mesmo com caminho estranho', () => {
    const d = destinoOficial({ hostname: 'x.vercel.app', pathname: '//malicioso.example/', search: '', hash: '' })!;
    expect(new URL(d).host).toBe('planner-api-tvmg.onrender.com');
  });
});
