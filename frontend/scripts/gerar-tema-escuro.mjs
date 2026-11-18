// Gera src/preferencias/tema-escuro.css a partir das folhas de estilo do tema claro.
// Cada regra com cor ganha uma versão sob html[data-tema="escuro"], com fundos
// escuros, textos claros e as cores de destaque preservadas.
// Uso: node scripts/gerar-tema-escuro.mjs   (ou: npm run tema:escuro)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTES = ['src/estilos.css', 'src/design-fidelidade.css', 'src/estilos-pos.css'];
const SAIDA = 'src/preferencias/tema-escuro.css';
const PROPRIEDADES = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left)|border(-(top|right|bottom|left))?-color|outline|outline-color|box-shadow|fill|stroke|caret-color|text-decoration-color|accent-color|column-rule-color)$/;
// Áreas que já são escuras no tema claro (menu lateral e painel de marca).
const JA_ESCURO = /barra-lateral|grupo-menu|rodape-menu|painel-marca-entrada|topo-menu|fundo-menu/;
const COR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b/g;

function paraRgb(c) {
  if (c === 'white') return [255, 255, 255, 1];
  if (c === 'black') return [0, 0, 0, 1];
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const p = c.match(/[\d.]+%?/g).map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v)));
  return [p[0], p[1], p[2], p[3] ?? 1];
}
function rgbParaHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslParaHex(h, s, l, a = 1) {
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  const alfa = a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : '';
  return `#${f(0)}${f(8)}${f(4)}${alfa}`;
}
const destaque = ([, s, l]) => s > 0.35 && l > 0.25 && l < 0.75;

/** Converte uma cor do tema claro para o escuro, conforme o uso (texto, fundo, borda, sombra). */
export function converter(cor, propriedade, regraTemFundoDestaque) {
  const rgba = paraRgb(cor);
  const [h, s, l] = rgbParaHsl(rgba);
  const a = rgba[3];
  if (propriedade === 'box-shadow') return `rgba(0, 0, 0, ${Math.min(0.6, a * 2.5 + 0.1).toFixed(2)})`;
  if (propriedade === 'color' || propriedade === 'fill' || propriedade === 'caret-color' || propriedade === 'text-decoration-color') {
    if (l > 0.9 || regraTemFundoDestaque) return cor; // texto branco sobre cor de destaque
    if (s > 0.35) return hslParaHex(h, Math.min(s, 0.85), Math.max(l, 0.68), a); // texto colorido mais claro
    return hslParaHex(h, s * 0.6, Math.max(0.68, 0.08 + (1 - l) * 0.85), a); // texto neutro claro
  }
  if (destaque([h, s, l]) && !/border|outline/.test(propriedade)) return cor; // botões e selos de destaque
  if (l < 0.3 && s > 0.3) return cor; // fundos já escuros
  if (/border|outline|column-rule/.test(propriedade)) return hslParaHex(h, s * 0.5, Math.min(0.32, 0.12 + (1 - l) * 0.5), a);
  // Fundos: claro vira escuro, mantendo um leve tom da cor original.
  if (l >= 0.995) return hslParaHex(220, 0.32, 0.13, a); // cartões brancos
  if (l >= 0.95) return hslParaHex(h, Math.min(s, 0.4) * 0.8, 0.085, a); // fundo da página
  return hslParaHex(h, s * 0.75, Math.min(0.26, 0.07 + (1 - l) * 0.8), a);
}

function regras(css) {
  // Analisador simples para as folhas do projeto (sem aninhamento além de @media).
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const saida = [];
  let i = 0;
  const pilha = [];
  let inicio = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      const cabeca = css.slice(inicio, i).trim();
      if (cabeca.startsWith('@media') || cabeca.startsWith('@supports')) {
        pilha.push(cabeca);
        inicio = i + 1;
      } else if (cabeca.startsWith('@')) {
        // @keyframes, @font-face etc.: pula o bloco inteiro.
        let nivel = 1; i++;
        while (i < css.length && nivel) { if (css[i] === '{') nivel++; else if (css[i] === '}') nivel--; i++; }
        inicio = i;
        continue;
      } else {
        const fim = css.indexOf('}', i);
        saida.push({ midia: [...pilha], seletor: cabeca, corpo: css.slice(i + 1, fim) });
        i = fim;
        inicio = i + 1;
      }
    } else if (ch === '}') {
      pilha.pop();
      inicio = i + 1;
    }
    i++;
  }
  return saida;
}

export function gerar() {
  const blocos = [];
  for (const arquivo of FONTES) {
    const css = fs.readFileSync(path.join(raiz, arquivo), 'utf8');
    for (const r of regras(css)) {
      if (JA_ESCURO.test(r.seletor)) continue;
      const decls = r.corpo.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
        const k = d.indexOf(':');
        return [d.slice(0, k).trim().toLowerCase(), d.slice(k + 1).trim()];
      });
      const fundoDestaque = decls.some(([p, v]) => /^background/.test(p) && (v.match(COR) ?? []).some((c) => destaque(rgbParaHsl(paraRgb(c)))) || /^background/.test(p) && /var\(--(accent|action|sidebar)\)/.test(v));
      const novas = [];
      for (const [p, v] of decls) {
        if (!PROPRIEDADES.test(p) || p.startsWith('--')) continue;
        if (!COR.test(v)) { COR.lastIndex = 0; continue; }
        COR.lastIndex = 0;
        const convertido = v.replace(COR, (c) => converter(c, p, fundoDestaque));
        if (convertido !== v) novas.push(`  ${p}: ${convertido.replace(/\s*!important/, '')} !important;`);
      }
      if (!novas.length) continue;
      const seletor = r.seletor.split(',').map((s) => s.trim()).map((s) =>
        s === ':root' || s === 'html' ? 'html[data-tema="escuro"]' : s === 'body' ? 'html[data-tema="escuro"] body' : `html[data-tema="escuro"] ${s}`).join(',\n');
      let bloco = `${seletor} {\n${novas.join('\n')}\n}`;
      for (const m of [...r.midia].reverse()) bloco = `${m} {\n${bloco}\n}`;
      blocos.push(bloco);
    }
  }
  const cabecalho = `/* GERADO por scripts/gerar-tema-escuro.mjs a partir de ${FONTES.join(', ')}.\n   Não edite à mão: rode "npm run tema:escuro" depois de mudar as cores do tema claro. */\n`;
  const base = `html[data-tema="escuro"] {\n  --azul: #dbe6f5;\n  --borda: #263247;\n  --muted: #9fb0c6;\n  --verde: #4ade80;\n  --fundo: #0b1220;\n  color: #e2e8f0;\n  background: #0b1220;\n}\nhtml[data-tema="escuro"] body {\n  background: #0b1220 !important;\n  color: #e2e8f0;\n}\nhtml[data-tema="escuro"] input,\nhtml[data-tema="escuro"] select,\nhtml[data-tema="escuro"] textarea {\n  background-color: #111a2b;\n  color: #e2e8f0;\n  border-color: #334155;\n}\n`;
  return cabecalho + base + blocos.join('\n') + '\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const css = gerar();
  if (process.argv.includes('--verificar')) {
    const atual = fs.readFileSync(path.join(raiz, SAIDA), 'utf8');
    if (atual !== css) { console.error('tema-escuro.css desatualizado: rode npm run tema:escuro'); process.exit(1); }
    console.log('tema escuro atualizado');
  } else {
    fs.writeFileSync(path.join(raiz, SAIDA), css);
    console.log(`gerado ${SAIDA} (${css.split('\n').length} linhas)`);
  }
}
