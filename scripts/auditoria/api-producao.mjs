// A API publicada no Render roda a versão nova: conta tentativas e aceita
// pedido de recuperação sem sessão. Usa um e-mail fictício diferente a cada vez.
const api = 'https://planner-api-tvmg.onrender.com/api/v1/auth';
const email = `verificacao-${Date.now()}@example.invalid`;
const post = (rota, corpo) => fetch(api + rota, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: AbortSignal.timeout(100000) });
const login = await post('/login', { email, password: 'Senha-errada-123' });
const corpo = await login.json().catch(() => ({}));
const reset = await post('/password-reset/request', { email });
if (login.status !== 401 || corpo.remainingAttempts !== 4) { console.error(`login sem contagem de tentativas (status ${login.status}): API ainda na versão antiga`); process.exit(1); }
if (reset.status !== 202) { console.error(`recuperação respondeu ${reset.status}: ainda exige sessão`); process.exit(1); }
console.log('api em producao atualizada: tentativas e recuperacao sem sessao');
