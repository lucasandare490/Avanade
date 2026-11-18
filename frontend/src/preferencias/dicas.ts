import { glossario } from './glossario';
import { tradutor, traduzirTexto, normalizarTexto, type Idioma } from './idioma';

/**
 * Ícone "i" ao lado de cada informação da tela (rótulos de campos, títulos,
 * indicadores e cabeçalhos de tabela). A explicação aparece ao passar o mouse,
 * ao focar com o teclado (Tab) e ao tocar no ícone (celular). Esc fecha.
 */
export const SELETORES_DICA = [
  '.cabecalho-pagina h1',
  'main h2',
  '.cartao-entrada h1',
  '.campo > span:first-child',
  'label.campo-check > span',
  '.indicador > span:first-child',
  'th',
  'dt',
].join(',');

const textoProprio = (el: Element) => {
  let t = '';
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) t += tradutor.original(n as Text);
    else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR') t += ' ';
    else if (n.nodeType === Node.ELEMENT_NODE && !(n as Element).classList.contains('dica-i') && !(n as Element).classList.contains('somente-leitor'))
      t += (n as Element).textContent ?? '';
  });
  return normalizarTexto(t);
};

export function explicacao(rotulo: string, idioma: Idioma): string | undefined {
  const item = glossario[normalizarTexto(rotulo).toLowerCase()];
  if (!item) return undefined;
  return idioma === 'pt' ? item[0] : idioma === 'en' ? item[1] : item[2];
}

let contador = 0;
class Dicas {
  private observador?: MutationObserver;
  private balao?: HTMLDivElement;
  private aberto?: HTMLElement;
  private fixo = false;
  private agendado = false;
  semExplicacao = new Set<string>();

  private pararIdioma?: () => void;
  private ouvintes: [EventTarget, string, EventListener, boolean?][] = [];

  /** Desliga o observador e remove o balão (usado nos testes e ao reiniciar). */
  parar() {
    this.observador?.disconnect();
    this.observador = undefined;
    this.pararIdioma?.();
    this.ouvintes.forEach(([alvo, tipo, f, captura]) => alvo.removeEventListener(tipo, f, captura));
    this.ouvintes = [];
    this.balao?.remove();
    this.balao = undefined;
    this.aberto = undefined;
    this.fixo = false;
  }

  private ouvir(alvo: EventTarget, tipo: string, f: EventListener, captura?: boolean) {
    alvo.addEventListener(tipo, f, captura);
    this.ouvintes.push([alvo, tipo, f, captura]);
  }

  iniciar(raiz: HTMLElement) {
    this.parar();
    this.balao = document.createElement('div');
    this.balao.id = 'dica-flutuante';
    this.balao.className = 'dica-balao';
    this.balao.setAttribute('role', 'tooltip');
    this.balao.setAttribute('data-sem-traducao', '');
    this.balao.hidden = true;
    document.body.appendChild(this.balao);
    this.observador = new MutationObserver((mudancas) => {
      // Ignora as próprias mudanças (balão e ícones) para não entrar em ciclo.
      const relevante = mudancas.some((m) => {
        const alvo = m.target.nodeType === Node.ELEMENT_NODE ? (m.target as Element) : m.target.parentElement;
        if (alvo?.closest('.dica-balao,.dica-i')) return false;
        const proprios = [...m.addedNodes, ...m.removedNodes].every(
          (n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).classList.contains('dica-i'),
        );
        return !(m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length) && proprios);
      });
      if (relevante) this.agendar();
    });
    this.observador.observe(raiz, { subtree: true, childList: true, characterData: true });
    this.ouvir(document, 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape' && this.aberto) this.fechar(true);
    });
    this.ouvir(document, 'pointerdown', (e) => {
      if (this.fixo && this.aberto && !this.aberto.contains(e.target as Node)) this.fechar();
    });
    this.ouvir(window, 'scroll', () => this.posicionar(), true);
    this.ouvir(window, 'resize', () => this.posicionar());
    const parar = tradutor.aoMudar(() => this.atualizarTudo(raiz));
    this.pararIdioma = () => {
      parar();
    };
    this.atualizarTudo(raiz);
  }

  private agendar() {
    if (this.agendado) return;
    this.agendado = true;
    queueMicrotask(() => {
      this.agendado = false;
      if (this.observador) this.atualizarTudo(document.body);
    });
  }

  atualizarTudo(raiz: ParentNode) {
    raiz.querySelectorAll<HTMLElement>(SELETORES_DICA).forEach((el) => this.preparar(el));
    raiz.querySelectorAll<HTMLElement>('.dica-i').forEach((icone) => {
      const alvo = icone.dataset.alvo ? document.getElementById(icone.dataset.alvo) : null;
      if (!alvo || !alvo.isConnected) icone.remove();
    });
  }

  private preparar(el: HTMLElement) {
    // Fora: textos só para leitor de tela, estados de carregamento/erro (.estado)
    // e o painel de apresentação da marca, que não são informações a explicar.
    if (el.closest('.somente-leitor,[hidden],.dica-balao,[data-sem-dica],.estado,.painel-marca-entrada,.mensagem-marca-entrada')) return;
    const rotulo = textoProprio(el);
    if (!rotulo || !/[A-Za-zÀ-ú]/.test(rotulo)) return;
    // Saudação com o nome da pessoa e códigos de registro (ex.: OP-0184) não precisam de explicação.
    if (/^(Olá|Hello|Hola),/.test(rotulo) || /^[A-Z]{2,}(-[A-Z0-9]+)+$/.test(rotulo)) return;
    const texto = explicacao(rotulo, tradutor.idioma);
    if (!texto) {
      this.semExplicacao.add(rotulo);
      return;
    }
    const dentroDeRotulo = el.parentElement?.tagName === 'LABEL' ? el.parentElement : null;
    // Texto usado como nome de um campo (aria-labelledby): o ícone fica ao lado,
    // fora do texto, para o nome do campo continuar exatamente o rótulo.
    const nomeiaCampo =
      Boolean(dentroDeRotulo) ||
      Boolean(el.id && document.querySelector(`[aria-labelledby~="${typeof CSS !== "undefined" && CSS.escape ? CSS.escape(el.id) : el.id}"]`));
    let icone = (nomeiaCampo ? el.nextElementSibling : el.lastElementChild) as HTMLElement | null;
    if (!icone?.classList.contains('dica-i')) {
      if (!el.id) el.id = `dica-alvo-${++contador}`;
      icone = document.createElement('span');
      icone.className = 'dica-i';
      icone.setAttribute('role', 'button');
      icone.tabIndex = 0;
      icone.dataset.alvo = el.id;
      icone.setAttribute('data-sem-traducao', '');
      icone.setAttribute('aria-expanded', 'false');
      // A letra "i" é desenhada pelo CSS (::before): não entra no texto do rótulo.
      this.ligar(icone);
      if (nomeiaCampo) {
        el.insertAdjacentElement('afterend', icone);
        // O nome acessível do campo continua sendo só o rótulo, sem o ícone.
        const campo = dentroDeRotulo?.querySelector('input,select,textarea');
        if (campo && !campo.hasAttribute('aria-labelledby') && !campo.hasAttribute('aria-label'))
          campo.setAttribute('aria-labelledby', el.id);
      } else el.appendChild(icone);
    }
    const nome = traduzirTexto(rotulo, tradutor.idioma);
    const prefixo = tradutor.idioma === 'en' ? 'More information' : tradutor.idioma === 'es' ? 'Más información' : 'Mais informações';
    // Títulos e cabeçalhos de tabela têm o nome tirado do conteúdo: fixa o nome
    // no próprio rótulo para o leitor de tela não anunciar o texto do ícone junto.
    if (!nomeiaCampo && /^(H[1-6]|TH)$/.test(el.tagName) && (!el.hasAttribute('aria-label') || el.dataset.rotuloDica !== undefined)) {
      if (el.getAttribute('aria-label') !== nome) el.setAttribute('aria-label', nome);
      el.dataset.rotuloDica = '';
    }
    // Nome curto ("Mais informações") e o rótulo como descrição: o leitor de tela
    // anuncia "Mais informações, botão, Valor bruto" sem confundir com o campo.
    if (icone.getAttribute('aria-label') !== prefixo) icone.setAttribute('aria-label', prefixo);
    const descricao = this.aberto === icone ? `${el.id} dica-flutuante` : el.id;
    if (icone.getAttribute('aria-describedby') !== descricao) icone.setAttribute('aria-describedby', descricao);
    if (icone.dataset.texto !== texto) icone.dataset.texto = texto;
    if (this.aberto === icone && this.balao && this.balao.textContent !== texto) this.balao.textContent = texto;
  }

  private ligar(icone: HTMLElement) {
    icone.addEventListener('mouseenter', () => !this.fixo && this.abrir(icone));
    icone.addEventListener('mouseleave', () => !this.fixo && this.fechar());
    icone.addEventListener('focus', () => !this.fixo && this.abrir(icone));
    icone.addEventListener('blur', () => !this.fixo && this.fechar());
    const alternar = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.aberto === icone && this.fixo) this.fechar();
      else {
        this.abrir(icone);
        this.fixo = true;
      }
    };
    icone.addEventListener('click', alternar);
    icone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') alternar(e);
    });
  }

  abrir(icone: HTMLElement) {
    if (!this.balao) return;
    if (this.aberto && this.aberto !== icone) this.fechar();
    this.aberto = icone;
    if (this.balao.textContent !== (icone.dataset.texto ?? '')) this.balao.textContent = icone.dataset.texto ?? '';
    this.balao.hidden = false;
    icone.setAttribute('aria-expanded', 'true');
    icone.setAttribute('aria-describedby', `${icone.dataset.alvo} dica-flutuante`);
    this.posicionar();
  }

  fechar(devolverFoco = false) {
    const icone = this.aberto;
    this.fixo = false;
    this.aberto = undefined;
    if (this.balao) this.balao.hidden = true;
    if (icone) {
      icone.setAttribute('aria-expanded', 'false');
      icone.setAttribute('aria-describedby', icone.dataset.alvo ?? '');
      if (devolverFoco) icone.focus();
    }
  }

  private posicionar() {
    if (!this.aberto || !this.balao || this.balao.hidden) return;
    const r = this.aberto.getBoundingClientRect();
    const largura = Math.min(280, window.innerWidth - 24);
    this.balao.style.maxWidth = `${largura}px`;
    const b = this.balao.getBoundingClientRect();
    let esquerda = r.left + r.width / 2 - b.width / 2;
    esquerda = Math.max(12, Math.min(esquerda, window.innerWidth - b.width - 12));
    let topo = r.bottom + 8;
    if (topo + b.height > window.innerHeight - 8) topo = Math.max(8, r.top - b.height - 8);
    this.balao.style.left = `${esquerda}px`;
    this.balao.style.top = `${topo}px`;
  }
}

export const dicas = new Dicas();
