// Confere que a branch atual está publicada no GitHub exatamente no HEAD local.
import { execFileSync } from 'node:child_process';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
const local = git('rev-parse', 'HEAD');
const remoto = git('ls-remote', 'origin', `refs/heads/${branch}`).split(/\s+/)[0];
if (!remoto) { console.error(`branch ${branch} não existe no GitHub`); process.exit(1); }
if (remoto !== local) { console.error(`GitHub está em ${remoto.slice(0, 8)}, local em ${local.slice(0, 8)}`); process.exit(1); }
if (git('status', '--porcelain', '--untracked-files=no')) { console.error('há alterações locais não commitadas'); process.exit(1); }
console.log(`publicacao confirmada: ${branch} em ${local.slice(0, 8)} no GitHub`);
