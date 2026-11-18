// Extrai os textos visíveis da interface (frontend/src) para conferir traduções.
// Uso: node scripts/auditoria/extrair-textos.mjs [pasta-src]  -> imprime JSON com a lista.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const pastaPadrao = path.resolve(aqui, '../../frontend/src');
const ATRIBUTOS_TEXTO = /\b(aria-label|placeholder|title|alt|titulo|descricao|detalhe|rotulo|label|nome|mensagem|texto|periodo|legenda|aria-description)=\s*"([^"]+)"/g;
const CHAVES_TEXTO = /\b(nome|titulo|descricao|detalhe|rotulo|label|mensagem|texto|legenda|ajuda|explicacao|periodo|resumo|acao|status)\s*:\s*(['"])((?:(?!\2)[^\\\n]|\\.)+)\2/g;
const LITERAL = /(['"`])((?:(?!\1)[^\\\n$]|\\.)*)\1/g;

export function normalizar(t) {
  return t.replace(/\s+/g, ' ').trim();
}
function pareceInterface(t) {
  if (!/[A-Za-zÀ-ú]{2}/.test(t)) return false;
  if (/^(https?:|#|\/|\.|@|\w+\/\w)/.test(t)) return false;
  if (/[{};=<>]|=>|\|\||&&/.test(t)) return false;
  if (/^[a-z0-9]+([-_.][a-z0-9]+)*$/.test(t)) return false; // ids, classes, chaves
  if (/^[a-z-]+( [a-z-]+)+$/.test(t) && !/[à-ú]/.test(t) && !/\b(de|do|da|e|o|a|para|com|sem|em|no|na)\b/.test(t)) return false; // listas de classes
  if (/^[A-Z_0-9]+$/.test(t) && t.length > 4 && !['SIMULADO', 'ACESSO AO PLANNER'].includes(t)) return false; // códigos
  if (/^(GET|POST|PUT|PATCH|DELETE|BRL|PIX|CSV|JSON|HTTP|HTTPS|API|POS|IA|MS|UTC)$/.test(t)) return false;
  if (/^(application|text|image)\//.test(t)) return false;
  if (/^\w+\(.*\)$/.test(t)) return false;
  if (/^[A-Z][a-zA-Z]+$/.test(t) && /[a-z][A-Z]/.test(t)) return false; // CamelCase
  if (/^(pt-BR|en-US|es-ES|America\/\w+)$/.test(t)) return false;
  return true;
}
export function arquivosFonte(pasta = pastaPadrao) {
  const lista = [];
  (function andar(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
        if (!['testes', 'preferencias'].includes(f)) andar(p);
      } else if (/\.tsx?$/.test(f) && !/\.(test|d)\.tsx?$/.test(f)) lista.push(p);
    }
  })(pasta);
  return lista.sort();
}
export function extrair(pasta = pastaPadrao) {
  const achados = new Map();
  const somar = (t, arquivo) => {
    const n = normalizar(t.replace(/\\(['"`])/g, '$1'));
    if (!n || !pareceInterface(n)) return;
    if (!achados.has(n)) achados.set(n, new Set());
    achados.get(n).add(path.relative(path.resolve(pasta, '..'), arquivo));
  };
  for (const arquivo of arquivosFonte(pasta)) {
    const fonte = fs.readFileSync(arquivo, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const m of fonte.matchAll(/>([^<>{}]+)</g)) {
      const t = m[1];
      if (/[A-Za-zÀ-ú]/.test(t) && !/^\s*[\w.]+\s*$/.test(t.replace(/[À-ú]/g, 'a')) || /\s\w/.test(t.trim())) somar(t, arquivo);
    }
    for (const m of fonte.matchAll(ATRIBUTOS_TEXTO)) somar(m[2], arquivo);
    for (const m of fonte.matchAll(CHAVES_TEXTO)) somar(m[3], arquivo);
    for (const m of fonte.matchAll(LITERAL)) {
      const t = m[2];
      if (m[1] === '`' && t.includes('${')) continue;
      if ((/\s/.test(t.trim()) || /[À-ú]/.test(t) || /^[A-ZÁÉÍÓÚ][a-zà-ú]{2,}$/.test(t)) && /[a-zà-ú]{2}/.test(t)) somar(t, arquivo);
    }
  }
  return achados;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const achados = extrair(process.argv[2] ? path.resolve(process.argv[2]) : pastaPadrao);
  console.log(JSON.stringify([...achados.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')), null, 1));
}
