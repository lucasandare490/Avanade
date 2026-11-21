// A API publicada no Render (ou no endereço passado) roda a versão nova: conta tentativas e aceita
// pedido de recuperação sem sessão. Usa um e-mail fictício diferente a cada vez.
// Uso: node scripts/auditoria/api-producao.mjs [https://endereço-da-api]  (padrão: Render)
const base = new URL(process.argv[2] ?? 'https://planner-api-tvmg.onrender.com');
if (base.protocol !== 'https:' || base.username || base.password) { console.error('use um endereço https sem credenciais'); process.exit(1); }
const api = base.origin + '/api/v1/auth';
const email = `verificacao-${Date.now()}@example.invalid`;
const post = (rota, corpo) => fetch(api + rota, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: AbortSignal.timeout(100000) });
let login;
try {
  login = await post('/login', { email, password: 'Senha-errada-123' });
} catch {
  console.error(`a API em ${base.host} não respondeu em 100 s (pode estar acordando); rode de novo em seguida`);
  process.exit(1);
}
const corpo = await login.json().catch(() => ({}));
const reset = await post('/password-reset/request', { email }).catch(() => ({ status: 0 }));
const credito = await fetch(api.replace('/auth', '/credit'), { signal: AbortSignal.timeout(60000) }).catch(() => ({ status: 0 }));
if (login.status !== 401 || corpo.remainingAttempts !== 4) { console.error(`login sem contagem de tentativas (status ${login.status}): API ainda na versão antiga`); process.exit(1); }
if (reset.status !== 202) { console.error(`recuperação respondeu ${reset.status}: ainda exige sessão`); process.exit(1); }
// Sem token, a rota de crédito existente responde 401; a versão antiga responde 401 também (filtro), então
// a contagem de tentativas e a recuperação sem sessão são os sinais decisivos da versão nova.
void credito;
console.log('api em producao atualizada: tentativas e recuperacao sem sessao');
