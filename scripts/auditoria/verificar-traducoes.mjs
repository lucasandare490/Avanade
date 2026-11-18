// Confere que todo texto da interface tem tradução em inglês e espanhol e que
// toda explicação dos ícones "i" existe nos três idiomas.
// Uso (na pasta frontend ou na raiz): node scripts/auditoria/verificar-traducoes.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { extrair, normalizar, pastaPadrao } from './extrair-textos.mjs';

const pasta = pastaPadrao;
function carregarObjetos(arquivo, nomes) {
  let fonte = fs.readFileSync(path.join(pasta, 'preferencias', arquivo), 'utf8');
  fonte = fonte
    .replace(/^import .*$/gm, '')
    .replace(/^type .*$/gm, '')
    .replace(/export const (\w+)\s*:\s*[^=]+=/g, 'const $1 =')
    .replace(/const (\w+)\s*:\s*E\s*=/g, 'const $1 =')
    .replace(/\bas const\b/g, '');
  const ctx = {};
  vm.runInNewContext(`${fonte}\n;globalThis.__r = { ${nomes.join(', ')} };`, ctx);
  return ctx.__r;
}
const { traducoes, textosSemTraducao } = carregarObjetos('traducoes.ts', ['traducoes', 'textosSemTraducao']);
const { glossario } = carregarObjetos('glossario.ts', ['glossario']);
const PADROES = [
  /^(\d+) operações concluídas no período$/, /^Venda OP-/, /^Ver OP-/, /^Página \d+ de \d+$/,
];
const problemas = [];
for (const [pt, par] of Object.entries(traducoes)) {
  if (!Array.isArray(par) || par.length !== 2 || par.some((t) => typeof t !== 'string' || !t.trim()))
    problemas.push(`tradução incompleta: "${pt}"`);
}
for (const [chave, trio] of Object.entries(glossario)) {
  if (chave !== chave.toLowerCase()) problemas.push(`chave do glossário deve estar em minúsculas: "${chave}"`);
  if (!Array.isArray(trio) || trio.length !== 3 || trio.some((t) => typeof t !== 'string' || t.trim().length < 10))
    problemas.push(`explicação incompleta no glossário: "${chave}"`);
}
const achados = extrair(pasta);
const faltando = [];
for (const [texto, arquivos] of achados) {
  const n = normalizar(texto);
  if (n in traducoes || n in textosSemTraducao || PADROES.some((r) => r.test(n))) continue;
  // Fragmentos de código que o extrator não consegue descartar sozinho.
  if (!/[À-ú]/.test(n) && (/[(){}]|\w\.\w|=>|\?\./.test(n) || /^[a-z]+(-[a-z]+)+( [a-z]+(-[a-z]+)*)*$/.test(n))) continue;
  faltando.push(`${n}   (${[...arquivos].join(', ')})`);
}
if (faltando.length) problemas.push(`textos sem tradução (${faltando.length}):\n  ${faltando.join('\n  ')}`);
if (problemas.length) {
  console.error(problemas.join('\n'));
  process.exit(1);
}
console.log(`traducoes completas: ${Object.keys(traducoes).length} textos em EN/ES, ${Object.keys(glossario).length} explicações em PT/EN/ES`);
