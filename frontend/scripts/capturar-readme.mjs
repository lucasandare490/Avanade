// Tira os prints usados nos READMEs (português, inglês e espanhol), a partir da
// demonstração (VITE_MODO_DADOS=demo), sem dados reais de ninguém.
// Uso: node scripts/capturar-readme.mjs   → grava em ../documentacao/readme/
// Autoria: Thayná Batista da Silva.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import net from 'node:net';
import { chromium } from 'playwright';

const DESTINO = new URL('../../documentacao/readme/', import.meta.url).pathname;
mkdirSync(DESTINO, { recursive: true });

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
process.on('exit', () => vite.kill('SIGTERM'));
let pronto = false;
for (let i = 0; i < 60 && !pronto; i++) {
  try {
    pronto = (await fetch(url)).ok;
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}
if (!pronto) throw new Error('A demonstração não subiu.');

const navegador = await chromium.launch();

async function abrir(idioma, tema, largura = 1280, altura = 800) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  await page.addInitScript(
    ([i, t]) => {
      localStorage.setItem('planner:idioma', i);
      localStorage.setItem('planner:tema', t);
    },
    [idioma, tema],
  );
  await page.goto(url);
  return { page, contexto };
}
async function entrar(page) {
  await page.getByRole('button', { name: /demonstra|demo/i }).first().click();
  await page.locator('main#conteudo').waitFor();
  await page.waitForTimeout(500);
}
async function ir(page, rota) {
  await page.evaluate((r) => (location.hash = `/${r}`), rota);
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
}
async function foto(page, nome) {
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${DESTINO}${nome}.png` });
  console.log(`${nome}.png`);
}

for (const idioma of ['pt', 'en', 'es']) {
  const { page, contexto } = await abrir(idioma, 'claro');
  await foto(page, `${idioma}-entrada`);
  await entrar(page);
  await ir(page, 'dashboard');
  await foto(page, `${idioma}-painel`);
  await ir(page, 'fluxo-caixa');
  await foto(page, `${idioma}-fluxo-caixa`);
  await ir(page, 'operacoes/OP-0184');
  await foto(page, `${idioma}-split`);
  await ir(page, 'credito');
  await foto(page, `${idioma}-capital-de-giro`);
  // Explicação "i" aberta no primeiro indicador do painel.
  await ir(page, 'dashboard');
  await page.getByRole('button', { name: /Mais informações|More information|Más información/ }).first().click();
  await page.locator('#dica-flutuante').waitFor({ state: 'visible' });
  await foto(page, `${idioma}-explicacao`);
  await contexto.close();

  const escuro = await abrir(idioma, 'escuro');
  await entrar(escuro.page);
  await ir(escuro.page, 'dashboard');
  await foto(escuro.page, `${idioma}-painel-escuro`);
  await ir(escuro.page, 'credito');
  await foto(escuro.page, `${idioma}-capital-de-giro-escuro`);
  await escuro.contexto.close();

  const celular = await abrir(idioma, 'claro', 390, 844);
  await entrar(celular.page);
  await ir(celular.page, 'dashboard');
  await foto(celular.page, `${idioma}-celular`);
  await celular.contexto.close();
}
await navegador.close();
console.log('capturas-readme-ok');
process.exit(0);
