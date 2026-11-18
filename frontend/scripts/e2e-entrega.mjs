// Sobe a demonstração (VITE_MODO_DADOS=demo) numa porta livre, roda os testes de
// navegador da entrega final e o de teclado/ampliação, e desliga o servidor.
// Uso: node scripts/e2e-entrega.mjs   (ou: npm run test:e2e:entrega)
import { spawn } from 'node:child_process';
import net from 'node:net';

const porta = await new Promise((ok) => {
  const s = net.createServer().listen(0, '127.0.0.1', () => {
    const p = s.address().port;
    s.close(() => ok(p));
  });
});
const url = `http://127.0.0.1:${porta}`;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(porta), '--strictPort'], {
  env: { ...process.env, VITE_MODO_DADOS: 'demo' },
  stdio: 'ignore',
});
const parar = () => vite.kill('SIGTERM');
process.on('exit', parar);
let pronto = false;
for (let i = 0; i < 60 && !pronto; i++) {
  try {
    pronto = (await fetch(url)).ok;
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}
if (!pronto) {
  console.error('A demonstração não subiu.');
  process.exit(1);
}
const pw = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', 'e2e/entrega-final.spec.ts', 'e2e/teclado-e-ampliacao.spec.ts', '--reporter=line'], {
  env: { ...process.env, E2E_URL: url, PLAYWRIGHT_CHANNEL: process.env.PLAYWRIGHT_CHANNEL || 'chromium' },
  stdio: 'inherit',
});
pw.on('exit', (codigo) => {
  parar();
  if (codigo === 0) console.log('e2e-entrega-ok');
  process.exit(codigo ?? 1);
});
