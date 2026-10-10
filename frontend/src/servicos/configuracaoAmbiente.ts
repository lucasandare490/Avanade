/** Ler configuração explicitamente, sem ativar integração nem fallback automático. */
export function lerUrlApi(ambiente: Record<string, unknown>): string | null {
  const valor = ambiente.VITE_API_URL;
  if (typeof valor !== 'string' || !valor.trim()) return null;
  const url = new URL(valor);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('Configure uma URL de API sem credenciais.');
  return url.toString().replace(/\/$/, '');
}
