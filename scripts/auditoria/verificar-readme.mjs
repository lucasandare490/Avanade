// Confere o README nos três idiomas: instalação logo no começo, problema
// (descapitalização) antes da solução, toda a equipe com suas contribuições.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EQUIPE = ['Thayná Batista da Silva', 'Kássio Lima de Oliveira', 'Lucas André Cardoso de Lima', 'Kleysson Teixeira da Cruz Junior', 'Heitor Sette Couto de Melo', 'James Bernardino da Silva Neto'];
const VERSOES = [
  { arquivo: 'README.md', instalar: '## Instalar e rodar', problema: '## O problema', solucao: '## A solução', equipe: '## Equipe', termo: /descapitaliza/i, confirmar: /Como confirmar que funcionou/ },
  { arquivo: 'README.en.md', instalar: '## Install and run', problema: '## The problem', solucao: '## The solution', equipe: '## Team', termo: /decapitaliz/i, confirmar: /How to confirm it works/ },
  { arquivo: 'README.es.md', instalar: '## Instalar y ejecutar', problema: '## El problema', solucao: '## La solución', equipe: '## Equipo', termo: /descapitaliza/i, confirmar: /Cómo confirmar que funcionó/ },
];
const erros = [];
for (const v of VERSOES) {
  const caminho = path.join(raiz, v.arquivo);
  if (!fs.existsSync(caminho)) { erros.push(`${v.arquivo} não existe`); continue; }
  const t = fs.readFileSync(caminho, 'utf8');
  const pos = (s) => t.indexOf(s);
  for (const s of [v.instalar, v.problema, v.solucao, v.equipe]) if (pos(s) < 0) erros.push(`${v.arquivo}: falta a seção "${s}"`);
  if (pos(v.instalar) > 1500) erros.push(`${v.arquivo}: instalação deve ficar logo no começo`);
  if (!(pos(v.instalar) < pos(v.problema) && pos(v.problema) < pos(v.solucao))) erros.push(`${v.arquivo}: o problema deve vir antes da solução`);
  const problema = t.slice(pos(v.problema), pos(v.solucao));
  if (!v.termo.test(problema)) erros.push(`${v.arquivo}: o problema precisa falar da descapitalização`);
  if (!v.confirmar.test(t)) erros.push(`${v.arquivo}: falta como confirmar que funcionou`);
  if (!t.includes('```bash') || !t.includes('./scripts/dev.sh')) erros.push(`${v.arquivo}: falta o comando de instalação pronto para copiar`);
  if (!t.includes('https://planner-api-tvmg.onrender.com/')) erros.push(`${v.arquivo}: falta o link do deploy`);
  const secaoEquipe = t.slice(pos(v.equipe));
  for (const pessoa of EQUIPE) if (!secaoEquipe.includes(pessoa)) erros.push(`${v.arquivo}: falta ${pessoa} na equipe`);
  for (const outro of VERSOES) if (outro !== v && !t.includes(`(${outro.arquivo})`)) erros.push(`${v.arquivo}: falta link para ${outro.arquivo}`);
}
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
console.log('readme verificado: PT, EN e ES com instalação, problema antes da solução e equipe completa');
