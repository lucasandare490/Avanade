/**
 * Endereço único do Planner Comercial (Thayná Batista da Silva). Se o site for aberto por
 * um endereço antigo da Vercel, o visitante vai para o endereço oficial no Render, no mesmo
 * caminho e na mesma tela. O destino é fixo: não vem da URL, então não serve para desviar
 * ninguém para outro site.
 */
export const ENDERECO_OFICIAL = 'https://planner-api-tvmg.onrender.com';

export function destinoOficial(local: { hostname: string; pathname: string; search: string; hash: string }): string | null {
  if (!/\.vercel\.app$/i.test(local.hostname)) return null;
  return ENDERECO_OFICIAL + local.pathname + local.search + local.hash;
}
