export type Tema = 'claro' | 'escuro' | 'sistema';
const CHAVE = 'planner:tema';
const consulta = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined;

export function lerTema(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema') return salvo;
  } catch {
    /* Sem armazenamento: segue o sistema. */
  }
  return 'sistema';
}

/** Tema efetivo: "sistema" vira claro ou escuro conforme o aparelho. */
export function resolverTema(tema: Tema): 'claro' | 'escuro' {
  if (tema !== 'sistema') return tema;
  return consulta()?.matches ? 'escuro' : 'claro';
}

let atual: Tema = 'sistema';
let pararSistema: (() => void) | undefined;
const ouvintes = new Set<(t: Tema) => void>();

export function aplicarTema(tema: Tema, salvar = true) {
  atual = tema;
  const raiz = document.documentElement;
  raiz.dataset.tema = resolverTema(tema);
  raiz.dataset.preferenciaTema = tema;
  raiz.style.colorScheme = resolverTema(tema) === 'escuro' ? 'dark' : 'light';
  pararSistema?.();
  pararSistema = undefined;
  const mq = consulta();
  if (tema === 'sistema' && mq) {
    const mudar = () => {
      raiz.dataset.tema = resolverTema('sistema');
      raiz.style.colorScheme = raiz.dataset.tema === 'escuro' ? 'dark' : 'light';
    };
    mq.addEventListener?.('change', mudar);
    pararSistema = () => mq.removeEventListener?.('change', mudar);
  }
  if (salvar) {
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* Preferência vale só nesta página. */
    }
  }
  ouvintes.forEach((f) => f(tema));
}

export function temaAtual() {
  return atual;
}

export function aoMudarTema(f: (t: Tema) => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}
