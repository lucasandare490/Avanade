// O site publicado na Vercel serve a versão da entrega final.
const base = 'https://avanade-frontend-xi.vercel.app';
const html = await (await fetch(base + '/')).text();
const js = html.match(/\/assets\/[^"]+\.js/)?.[0];
if (!js) { console.error('bundle não encontrado'); process.exit(1); }
const codigo = await (await fetch(base + js)).text();
const faltam = ['planner:tema', 'planner:sessao-lembrada', 'Lembrar de mim', 'redefinir-senha', 'Mais informações'].filter((t) => !codigo.includes(t));
if (faltam.length || codigo.includes('__planner')) { console.error(`faltam: ${faltam.join(', ')}; teste no build: ${codigo.includes('__planner')}`); process.exit(1); }
console.log(`site em producao atualizado: ${js}`);
