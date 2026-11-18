// Confere que nenhuma IA recebe crédito no projeto: arquivos versionados e
// mensagens de commit da branch atual (em relação ao main publicado).
// Uso: node scripts/auditoria/verificar-sem-credito-ia.mjs [--autoteste]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ESTE = path.relative(raiz, fileURLToPath(import.meta.url));
export const PADROES = [
  /co-authored-by:[^\n]*(claude|anthropic|openai|chatgpt|gpt-|copilot|codex|gemini|cursor|\bai\b|\bia\b)/i,
  /noreply@anthropic\.com/i,
  /generated (with|by) (\[)?(claude|chatgpt|gpt|copilot|codex|gemini|an? ai|ai)/i,
  /🤖\s*generated/i,
  /(gerado|feito|criado|escrito) (com|por|pela|pelo) (a )?(ia|intelig[eê]ncia artificial|claude|chatgpt|copilot|codex|gemini)\b/i,
  /(generado|hecho|creado|escrito) (con|por) (la )?(ia|inteligencia artificial|claude|chatgpt|copilot|codex|gemini)\b/i,
  /modelConfigVersion|anthropic-claude-[\w.-]+/i,
  /\bclaude code\b/i,
];
export function encontrar(texto) {
  return PADROES.filter((p) => p.test(texto)).map(String);
}

if (process.argv.includes('--autoteste')) {
  // Controle positivo: o verificador precisa acusar estes exemplos.
  const exemplos = ['Co-Authored-By: Claude <noreply@anthropic.com>', '🤖 Generated with Claude Code', 'Texto gerado por IA', 'Modelo: anthropic-claude-4.6-sonnet'];
  const falhou = exemplos.filter((e) => encontrar(e).length === 0);
  const falsoPositivo = encontrar('Análise com IA: explicação por regras, sem IA externa.').length > 0;
  if (falhou.length || falsoPositivo) { console.error('autoteste falhou', { falhou, falsoPositivo }); process.exit(1); }
  console.log('autoteste ok');
  process.exit(0);
}

const git = (...a) => execFileSync('git', a, { cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const achados = [];
for (const arquivo of git('ls-files', '-z').split('\0').filter(Boolean)) {
  if (arquivo === ESTE) continue;
  const caminho = path.join(raiz, arquivo);
  let st;
  try { st = fs.statSync(caminho); } catch { continue; }
  if (!st.isFile() || st.size > 5 * 1024 * 1024) continue;
  const buf = fs.readFileSync(caminho);
  if (buf.includes(0)) continue; // binário
  const texto = buf.toString('utf8');
  for (const p of encontrar(texto)) achados.push(`${arquivo}: ${p}`);
}
let base = 'origin/main';
try { git('rev-parse', '--verify', base); } catch { base = ''; }
const mensagens = base ? git('log', '--format=%H%n%B%n--fim--', `${base}..HEAD`) : '';
for (const bloco of mensagens.split('--fim--')) {
  const [sha, ...corpo] = bloco.trim().split('\n');
  for (const p of encontrar(corpo.join('\n'))) achados.push(`commit ${sha?.slice(0, 8)}: ${p}`);
}
if (achados.length) {
  console.error(`crédito de IA encontrado:\n  ${achados.join('\n  ')}`);
  process.exit(1);
}
console.log('sem credito de ia: arquivos versionados e commits da branch conferidos');
