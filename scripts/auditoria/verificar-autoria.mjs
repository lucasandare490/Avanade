// Confere que todo commit da branch (em relação ao main publicado) tem autora e
// committer Thayná Batista da Silva, com um e-mail dela (o pessoal, usado a partir de 26/11/2026,
// ou o noreply do GitHub, usado antes), e nenhum co-autor.
import { execFileSync } from 'node:child_process';
const NOME = 'Thayná Batista da Silva';
const EMAILS = ['thaynabdstec@gmail.com', '228145459+thaynabds@users.noreply.github.com'];
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const linhas = git('log', '--format=%H%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%(trailers:key=Co-authored-by,valueonly,separator=;)', 'origin/main..HEAD').trim().split('\n').filter(Boolean);
if (!linhas.length) { console.error('nenhum commit na branch'); process.exit(1); }
const erros = [];
for (const l of linhas) {
  const [sha, an, ae, cn, ce, co] = l.split('\x1f');
  if (an !== NOME || !EMAILS.includes(ae) || cn !== NOME || !EMAILS.includes(ce)) erros.push(`${sha.slice(0, 8)}: autor ${an} <${ae}>, committer ${cn} <${ce}>`);
  if (co && co.trim()) erros.push(`${sha.slice(0, 8)}: co-autor ${co}`);
}
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
console.log(`autoria verificada: ${linhas.length} commits de ${NOME}`);
