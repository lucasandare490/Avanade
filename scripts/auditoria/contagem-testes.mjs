#!/usr/bin/env node
// Contagem de testes no README (Thayná Batista da Silva).
// Mede os testes de verdade e mantém os números do README (PT, EN, ES) em dia.
//
//   --atualizar   reescreve os números entre os marcadores <!-- t:chave -->…<!-- /t -->
//   --verificar   não escreve nada; falha (código 1) se algum número do README estiver errado
//
// Fontes (use só as que tiver):
//   --backend DIR      relatórios do Surefire (backend/target/surefire-reports)
//   --vitest ARQ       resultado JSON do Vitest (npx vitest run --reporter=json --outputFile=ARQ)
//   --playwright       lista os testes de navegador (npx playwright test --list), sem abrir navegador
//
// Exemplo completo, depois de rodar os testes:
//   node scripts/auditoria/contagem-testes.mjs --atualizar --backend backend/target/surefire-reports \
//     --vitest frontend/test-results/vitest.json --playwright
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const READMES = { pt: 'README.md', en: 'README.en.md', es: 'README.es.md' };
const DEMO = ['entrega-final.spec.ts', 'teclado-e-ampliacao.spec.ts'];

const args = process.argv.slice(2);
const modo = args.includes('--atualizar') ? 'atualizar' : args.includes('--verificar') ? 'verificar' : null;
const valor = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!modo) {
  console.error('Use --atualizar ou --verificar (veja o comentário no topo do script).');
  process.exit(2);
}

/** Backend: soma os relatórios TEST-*.xml do Surefire, por classe. */
function lerBackend(dir) {
  const pasta = path.resolve(dir);
  if (!existsSync(pasta)) throw new Error(`pasta do Surefire não encontrada: ${dir}`);
  const classes = [];
  for (const nome of readdirSync(pasta).filter((n) => /^TEST-.*\.xml$/.test(n)).sort()) {
    const xml = readFileSync(path.join(pasta, nome), 'utf8');
    const suite = xml.match(/<testsuite\b[^>]*>/);
    if (!suite) continue;
    const attr = (a) => Number((suite[0].match(new RegExp(`\\b${a}="(\\d+)"`)) ?? [0, 0])[1]);
    const classe = (suite[0].match(/\bname="([^"]+)"/) ?? [0, nome])[1].replace(/^br\.com\.avanade\.split\./, '');
    classes.push({ classe, total: attr('tests'), falhas: attr('failures') + attr('errors'), pulados: attr('skipped') });
  }
  if (!classes.length) throw new Error(`nenhum relatório TEST-*.xml em ${dir}`);
  const total = classes.reduce((s, c) => s + c.total, 0);
  const passaram = classes.reduce((s, c) => s + c.total - c.falhas - c.pulados, 0);
  return { classes: classes.sort((a, b) => a.classe.localeCompare(b.classe)), total, passaram };
}

/** Frontend: resultado JSON do Vitest. */
function lerVitest(arq) {
  const j = JSON.parse(readFileSync(path.resolve(arq), 'utf8'));
  return { arquivos: j.testResults.length, total: j.numTotalTests, passaram: j.numPassedTests };
}

/** Navegador: lista os testes por arquivo (não executa nada). */
function lerPlaywright() {
  const saida = execFileSync('npx', ['playwright', 'test', '--list', '--reporter=json'], {
    cwd: path.join(RAIZ, 'frontend'),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const j = JSON.parse(saida);
  const porArquivo = {};
  const visitar = (suite, arquivo) => {
    const f = suite.file ?? arquivo;
    for (const spec of suite.specs ?? []) porArquivo[f] = (porArquivo[f] ?? 0) + spec.tests.length;
    for (const s of suite.suites ?? []) visitar(s, f);
  };
  for (const s of j.suites) visitar(s, s.file);
  const lista = (filtro) => Object.entries(porArquivo).filter(([f]) => filtro(f)).sort(([a], [b]) => a.localeCompare(b));
  const demo = lista((f) => DEMO.includes(f));
  const api = lista((f) => !DEMO.includes(f));
  const soma = (l) => l.reduce((s, [, n]) => s + n, 0);
  return { demo, api, totalDemo: soma(demo), totalApi: soma(api) };
}

const deDe = { pt: 'de', en: 'of', es: 'de' };
const palavraClasses = { pt: 'classes', en: 'classes', es: 'clases' };
const hoje = new Date();
const data = {
  pt: hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' }),
  en: hoje.toLocaleDateString('sv-SE', { timeZone: 'America/Recife' }),
  es: hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' }),
};
const arquivos = (l) => l.map(([f, n]) => `\`${f}\` (${n})`).join(', ');

const valores = {};
const problemas = [];
if (valor('--backend')) {
  const b = lerBackend(valor('--backend'));
  if (b.passaram !== b.total) problemas.push(`backend: ${b.total - b.passaram} teste(s) não passaram; a contagem só registra baterias que passaram inteiras`);
  for (const l of Object.keys(READMES)) {
    valores[l] ??= {};
    valores[l].backend = `${b.passaram} ${deDe[l]} ${b.total}`;
    valores[l]['backend-classes'] = `${b.classes.length} ${palavraClasses[l]}: ${b.classes.map((c) => `\`${c.classe}\` (${c.total})`).join(', ')}`;
  }
}
if (valor('--vitest')) {
  const v = lerVitest(valor('--vitest'));
  if (v.passaram !== v.total) problemas.push(`frontend: ${v.total - v.passaram} teste(s) não passaram`);
  for (const l of Object.keys(READMES)) {
    valores[l] ??= {};
    valores[l].unit = `${v.passaram} ${deDe[l]} ${v.total}`;
    valores[l]['unit-arquivos'] = String(v.arquivos);
  }
}
if (args.includes('--playwright')) {
  const p = lerPlaywright();
  for (const l of Object.keys(READMES)) {
    valores[l] ??= {};
    valores[l].demo = `${p.totalDemo} ${deDe[l]} ${p.totalDemo}`;
    valores[l]['demo-arquivos'] = arquivos(p.demo);
    valores[l].api = `${p.totalApi} ${deDe[l]} ${p.totalApi}`;
    valores[l]['api-arquivos'] = arquivos(p.api);
  }
}
if (!Object.keys(valores).length) {
  console.error('Nenhuma fonte informada: use --backend, --vitest e/ou --playwright.');
  process.exit(2);
}
if (problemas.length) {
  console.error(problemas.join('\n'));
  process.exit(1);
}

const MARCADOR = /<!-- t:([a-z-]+) -->([\s\S]*?)<!-- \/t -->/g;
let divergencias = 0;
for (const [lingua, arq] of Object.entries(READMES)) {
  const caminho = path.join(RAIZ, arq);
  const texto = readFileSync(caminho, 'utf8');
  const medidos = valores[lingua];
  const vistos = new Set();
  const novo = texto.replace(MARCADOR, (inteiro, chave, atual) => {
    vistos.add(chave);
    if (chave === 'data') return modo === 'atualizar' ? `<!-- t:data -->${data[lingua]}<!-- /t -->` : inteiro;
    if (!(chave in medidos)) return inteiro;
    if (atual !== medidos[chave]) {
      divergencias++;
      console.error(`${arq}: "${chave}" diz "${atual.slice(0, 80)}", medido "${medidos[chave].slice(0, 80)}"`);
    }
    return `<!-- t:${chave} -->${medidos[chave]}<!-- /t -->`;
  });
  for (const chave of Object.keys(medidos)) if (!vistos.has(chave)) {
    divergencias++;
    console.error(`${arq}: falta o marcador <!-- t:${chave} -->`);
  }
  if (modo === 'atualizar' && novo !== texto) writeFileSync(caminho, novo);
}
if (modo === 'verificar') {
  if (divergencias) {
    console.error(`\n${divergencias} número(s) do README diferente(s) dos testes. Rode com --atualizar e faça o commit.`);
    process.exit(1);
  }
  console.log('contagem de testes do README confere');
} else {
  console.log(`contagem de testes atualizada nos READMEs (${divergencias} valor(es) mudaram)`);
}
