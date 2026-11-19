import { traducoes } from './traducoes';

export type Idioma = 'pt' | 'en' | 'es';
export const idiomas: { valor: Idioma; nome: string; lang: string }[] = [
  { valor: 'pt', nome: 'Português', lang: 'pt-BR' },
  { valor: 'en', nome: 'English', lang: 'en' },
  { valor: 'es', nome: 'Español', lang: 'es' },
];
const CHAVE = 'planner:idioma';
const ATRIBUTOS = ['aria-label', 'placeholder', 'title', 'alt', 'aria-description', 'data-dica'] as const;

// Frases montadas com números ou datas que chegam do servidor ou do código.
const padroes: [RegExp, (m: RegExpMatchArray) => readonly [string, string]][] = [
  [/^(?:Credenciais inválidas\.|E-mail ou senha inválidos(?: para a demonstração)?\.) Restam (\d+) tentativas antes do bloqueio temporário\.$/,
    (m) => [`Invalid email or password. ${m[1]} attempts left before a temporary lock.`, `Correo o contraseña inválidos. Quedan ${m[1]} intentos antes del bloqueo temporal.`]],
  [/^(?:Credenciais inválidas\.|E-mail ou senha inválidos(?: para a demonstração)?\.) Resta 1 tentativa antes do bloqueio temporário\.$/,
    () => ['Invalid email or password. 1 attempt left before a temporary lock.', 'Correo o contraseña inválidos. Queda 1 intento antes del bloqueo temporal.']],
  [/^Muitas tentativas erradas\. O acesso foi bloqueado temporariamente\. Tente novamente em (\d+) minutos? ou recupere sua senha\.$/,
    (m) => [`Too many wrong attempts. Access is temporarily locked. Try again in ${m[1]} minute${m[1] === '1' ? '' : 's'} or recover your password.`, `Demasiados intentos erróneos. El acceso se bloqueó temporalmente. Intente de nuevo en ${m[1]} minuto${m[1] === '1' ? '' : 's'} o recupere su contraseña.`]],
  [/^Restam (\d+) tentativas antes do bloqueio temporário\.$/,
    (m) => [`${m[1]} attempts left before a temporary lock.`, `Quedan ${m[1]} intentos antes del bloqueo temporal.`]],
  [/^Planner Comercial · (.+)$/, (m) => [`Planner Comercial · ${traduzirTexto(m[1], 'en')}`, `Planner Comercial · ${traduzirTexto(m[1], 'es')}`]],
  [/^Ver (OP-[\w-]+)$/, (m) => [`See ${m[1]}`, `Ver ${m[1]}`]],
  [/^Capital de giro contratado: (R\$ [\d.,]+) em (\d+)x de (R\$ [\d.,]+)\. O valor entra na projeção do caixa e as parcelas aparecem como compromissos\.$/,
    (m) => [`Working capital contracted: ${m[1]} in ${m[2]}x of ${m[3]}. The amount enters the cash projection and the installments appear as commitments.`, `Capital de trabajo contratado: ${m[1]} en ${m[2]}x de ${m[3]}. El monto entra en la proyección de caja y las cuotas aparecen como compromisos.`]],
  [/^Escolha um valor entre R\$ 500,00 e (R\$ [\d.,]+)\.$/, (m) => [`Choose an amount between R$ 500,00 and ${m[1]}.`, `Elija un monto entre R$ 500,00 y ${m[1]}.`]],
  [/^(\d+)x mensais$/, (m) => [`${m[1]} monthly installments`, `${m[1]} cuotas mensuales`]],
  [/^([\d.,]+%) ao (mês|ano)$/, (m) => [`${m[1]} per ${m[2] === 'mês' ? 'month' : 'year'}`, `${m[1]} al ${m[2] === 'mês' ? 'mes' : 'año'}`]],
  [/^(\d+) dias de despesas$/, (m) => [`${m[1]} days of expenses`, `${m[1]} días de gastos`]],
  [/^em (\d+)x$/, (m) => [`in ${m[1]}x`, `en ${m[1]}x`]],
  [/^· ([\d.,]+%) das entradas mensais$/, (m) => [`· ${m[1]} of monthly inflows`, `· ${m[1]} de las entradas mensuales`]],
  [/^Pague as parcelas em ordem\. A próxima é a parcela (\d+)\.$/, (m) => [`Pay the installments in order. The next one is installment ${m[1]}.`, `Pague las cuotas en orden. La próxima es la cuota ${m[1]}.`]],
  [/^Contrato com (.+)$/, (m) => [`Contract with ${traduzirTexto(m[1], 'en')}`, `Contrato con ${traduzirTexto(m[1], 'es')}`]],
  [/^Olá, (.+)$/, (m) => [`Hello, ${m[1]}`, `Hola, ${m[1]}`]],
  [/^Venda (OP-[\w-]+)$/, (m) => [`Sale ${m[1]}`, `Venta ${m[1]}`]],
  [/^(\d+) operações concluídas no período$/, (m) => [`${m[1]} completed operations in the period`, `${m[1]} operaciones concluidas en el período`]],
  [/^(\d+) operação concluída no período$/, () => ['1 completed operation in the period', '1 operación concluida en el período']],
  [/^Pagamento (PIX|Pix|Débito|Crédito|débito|crédito) · (.+)$/, (m) => [`${traduzirTexto(m[1], 'en')} payment · ${m[2]}`, `Pago ${traduzirTexto(m[1], 'es')} · ${m[2]}`]],
  [/^Mais informações: (.+)$/, (m) => [`More information: ${traduzirTexto(m[1], 'en')}`, `Más información: ${traduzirTexto(m[1], 'es')}`]],
  [/^(.+), perfil atual$/, (m) => [`${m[1]}, current profile`, `${m[1]}, perfil actual`]],
  [/^Página (\d+) de (\d+)$/, (m) => [`Page ${m[1]} of ${m[2]}`, `Página ${m[1]} de ${m[2]}`]],
  [/^Sobre: (.+)$/, (m) => [`About: ${traduzirTexto(m[1], 'en')}`, `Acerca de: ${traduzirTexto(m[1], 'es')}`]],
  // Reforma no caixa (Thayná Batista da Silva)
  [/^(\d+) vendas? concluídas?$/, (m) => [`${m[1]} completed sale${m[1] === '1' ? '' : 's'}`, `${m[1]} venta${m[1] === '1' ? '' : 's'} concluida${m[1] === '1' ? '' : 's'}`]],
  [/^(\d+) de (\d+) compras com crédito$/, (m) => [`${m[1]} of ${m[2]} purchases with credit`, `${m[1]} de ${m[2]} compras con crédito`]],
  [/^Usar as compras registradas \((R\$ [\d.,]+) por mês\)$/, (m) => [`Use the recorded purchases (${m[1]} per month)`, `Usar las compras registradas (${m[1]} por mes)`]],
  [/^Nota lida: (R\$ [\d.,]+), com (R\$ [\d.,]+) de crédito de IBS\/CBS\. Confira e salve\.$/, (m) => [`Invoice read: ${m[1]}, with ${m[2]} of IBS/CBS credit. Check and save.`, `Factura leída: ${m[1]}, con ${m[2]} de crédito de IBS/CBS. Verifique y guarde.`]],
  [/^Nota lida: (R\$ [\d.,]+)\. Ela não tem o grupo de IBS\/CBS; informe o crédito se houver\.$/, (m) => [`Invoice read: ${m[1]}. It has no IBS/CBS group; enter the credit if there is one.`, `Factura leída: ${m[1]}. No tiene el grupo de IBS/CBS; ingrese el crédito si lo hay.`]],
  [/^Com o preço atual, a margem fica em (-?[\d.,]+%)\. Para manter a margem desejada, o preço precisa subir (R\$ [\d.,]+)\.$/, (m) => [`At the current price, the margin is ${m[1]}. To keep the desired margin, the price needs to go up by ${m[2]}.`, `Con el precio actual, el margen queda en ${m[1]}. Para mantener el margen deseado, el precio debe subir ${m[2]}.`]],
  [/^O preço atual já cobre a margem desejada \(margem de (-?[\d.,]+%)\)\.$/, (m) => [`The current price already covers the desired margin (margin of ${m[1]}).`, `El precio actual ya cubre el margen deseado (margen de ${m[1]}).`]],
  [/^Pagando (\d+) dias depois, ficam (R\$ [\d.,]+) a mais no caixa, sem juros\.$/, (m) => [`Paying ${m[1]} days later keeps ${m[2]} more in the cash, with no interest.`, `Pagando ${m[1]} días después, quedan ${m[2]} más en la caja, sin intereses.`]],
  [/^Com um prazo menor, saem (R\$ [\d.,]+) do caixa mais cedo\.$/, (m) => [`With a shorter term, ${m[1]} leaves the cash earlier.`, `Con un plazo menor, salen ${m[1]} de la caja antes.`]],
  [/^Isso cobre toda a falta de caixa prevista para 30 dias \((R\$ [\d.,]+)\), sem precisar de crédito\.$/, (m) => [`This covers the whole cash shortfall expected for 30 days (${m[1]}), without needing credit.`, `Esto cubre todo el faltante de caja previsto para 30 días (${m[1]}), sin necesitar crédito.`]],
  [/^Isso cobre (\d+)% da falta de caixa prevista para 30 dias \((R\$ [\d.,]+)\)\.$/, (m) => [`This covers ${m[1]}% of the cash shortfall expected for 30 days (${m[2]}).`, `Esto cubre el ${m[1]}% del faltante de caja previsto para 30 días (${m[2]}).`]],
  [/^O capital de giro do parceiro sai mais barato: ([\d.,]+%) ao mês, contra ([\d.,]+%) da antecipação\.$/, (m) => [`The partner's working capital is cheaper: ${m[1]} per month, versus ${m[2]} for the advance.`, `El capital de trabajo del socio sale más barato: ${m[1]} al mes, contra ${m[2]} del anticipo.`]],
  [/^A antecipação sai mais barata que o capital de giro do parceiro \(([\d.,]+%) ao mês\)\.$/, (m) => [`The advance is cheaper than the partner's working capital (${m[1]} per month).`, `El anticipo sale más barato que el capital de trabajo del socio (${m[1]} al mes).`]],
  [/^O período tem mais de (\d+) registros\. Escolha um período menor para o arquivo trazer todos\.$/, (m) => [`The period has more than ${m[1]} records. Choose a shorter period so the file includes all of them.`, `El período tiene más de ${m[1]} registros. Elija un período menor para que el archivo los incluya todos.`]],
];

const MESES_CURTOS: Record<string, readonly [string, string]> = {
  jan: ['Jan', 'ene'], fev: ['Feb', 'feb'], mar: ['Mar', 'mar'], abr: ['Apr', 'abr'], mai: ['May', 'may'], jun: ['Jun', 'jun'],
  jul: ['Jul', 'jul'], ago: ['Aug', 'ago'], set: ['Sep', 'sept'], out: ['Oct', 'oct'], nov: ['Nov', 'nov'], dez: ['Dec', 'dic'],
};
const MESES: Record<string, readonly [string, string]> = {
  janeiro: ['January', 'enero'], fevereiro: ['February', 'febrero'], março: ['March', 'marzo'], abril: ['April', 'abril'],
  maio: ['May', 'mayo'], junho: ['June', 'junio'], julho: ['July', 'julio'], agosto: ['August', 'agosto'],
  setembro: ['September', 'septiembre'], outubro: ['October', 'octubre'], novembro: ['November', 'noviembre'], dezembro: ['December', 'diciembre'],
};
/** Datas escritas em português ("09 de out.", "9 de outubro de 2026") no idioma escolhido. */
function traduzirDatas(t: string, indice: 0 | 1) {
  let mudou = false;
  let r = t.replace(/\b(\d{1,2}) de (jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.(?: de (\d{4}))?/g, (_, d, m, a) => {
    mudou = true;
    const mes = MESES_CURTOS[m][indice];
    return indice === 0 ? `${mes} ${d}${a ? `, ${a}` : ''}` : `${d} ${mes}${a ? ` ${a}` : ''}`;
  });
  r = r.replace(/\b(\d{1,2}) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?: de (\d{4}))?/g, (_, d, m, a) => {
    mudou = true;
    const mes = MESES[m][indice];
    return indice === 0 ? `${mes} ${d}${a ? `, ${a}` : ''}` : `${d} de ${mes}${a ? ` de ${a}` : ''}`;
  });
  return mudou ? r : undefined;
}

export function normalizarTexto(t: string) {
  return t.replace(/\s+/g, ' ').trim();
}

/** Traduz um texto em português; devolve o próprio texto quando não há tradução. */
export function traduzirTexto(texto: string, idioma: Idioma): string {
  if (idioma === 'pt') return texto;
  const chave = normalizarTexto(texto);
  if (!chave) return texto;
  const indice = idioma === 'en' ? 0 : 1;
  let traduzido = traducoes[chave]?.[indice];
  // Título em maiúsculas ("TRIBUTO"): usa a tradução da forma normal e volta para maiúsculas.
  if (traduzido === undefined && chave === chave.toUpperCase() && /[A-ZÀ-Ú]{2}/.test(chave)) {
    const normal = chave.charAt(0) + chave.slice(1).toLowerCase();
    const achado = traducoes[normal]?.[indice];
    if (achado !== undefined) traduzido = achado.toUpperCase();
  }
  if (traduzido === undefined) {
    for (const [regex, montar] of padroes) {
      const m = chave.match(regex);
      if (m) {
        traduzido = montar(m)[indice];
        break;
      }
    }
  }
  if (traduzido === undefined) {
    const comDatas = traduzirDatas(chave, indice);
    if (comDatas !== undefined) {
      // Data sozinha ou com conectores simples ("a 09 de outubro").
      traduzido = comDatas
        .replace(/^a (?=\S)/, indice === 0 ? 'to ' : 'a ')
        .replace(/–/g, '–');
    }
  }
  if (traduzido === undefined) return texto;
  const inicio = texto.match(/^\s*/)![0];
  const fim = texto.match(/\s*$/)![0];
  return inicio + traduzido + fim;
}

/** Há tradução (dicionário, padrão ou data) para este texto em português? */
export function temTraducao(texto: string): boolean {
  const chave = normalizarTexto(texto);
  const normal = chave.charAt(0) + chave.slice(1).toLowerCase();
  return chave in traducoes || (chave === chave.toUpperCase() && normal in traducoes) ||
    padroes.some(([re]) => re.test(chave)) || traduzirDatas(chave, 0) !== undefined;
}

export function lerIdioma(): Idioma {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'pt' || salvo === 'en' || salvo === 'es') return salvo;
  } catch {
    /* Armazenamento bloqueado: usa o idioma do navegador. */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'pt').toLowerCase();
  return nav.startsWith('es') ? 'es' : nav.startsWith('en') ? 'en' : 'pt';
}

/**
 * Tradutor da página. Observa o DOM e troca cada texto em português pela
 * tradução do idioma escolhido, guardando o original para voltar ao português.
 * Não altera valores digitados em campos nem o comportamento das telas.
 */
class TradutorPagina {
  idioma: Idioma = 'pt';
  private textos = new WeakMap<Text, { original: string; aplicado: string }>();
  private atributos = new WeakMap<Element, Map<string, { original: string; aplicado: string }>>();
  private observador?: MutationObserver;
  private ouvintes = new Set<(i: Idioma) => void>();
  raiz?: HTMLElement;

  iniciar(raiz: HTMLElement, idioma: Idioma) {
    this.raiz = raiz;
    this.observador?.disconnect();
    this.observador = new MutationObserver((mudancas) => {
      for (const m of mudancas) {
        if (m.type === 'characterData') this.texto(m.target as Text);
        else if (m.type === 'attributes') this.atributo(m.target as Element, m.attributeName!);
        else m.addedNodes.forEach((n) => this.percorrer(n));
      }
    });
    this.observador.observe(raiz, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATRIBUTOS],
    });
    this.definir(idioma, false);
  }

  parar() {
    this.observador?.disconnect();
    this.observador = undefined;
  }

  aoMudar(f: (i: Idioma) => void) {
    this.ouvintes.add(f);
    return () => this.ouvintes.delete(f);
  }

  definir(idioma: Idioma, salvar = true) {
    this.idioma = idioma;
    document.documentElement.lang = idiomas.find((i) => i.valor === idioma)!.lang;
    if (salvar) {
      try {
        localStorage.setItem(CHAVE, idioma);
      } catch {
        /* Preferência vale só nesta página. */
      }
    }
    if (this.raiz) this.percorrer(this.raiz);
    this.ouvintes.forEach((f) => f(idioma));
  }

  private ignorar(no: Node) {
    const el = no.nodeType === Node.ELEMENT_NODE ? (no as Element) : no.parentElement;
    return !el || Boolean(el.closest('script,style,textarea,code,[data-sem-traducao]'));
  }

  private percorrer(no: Node) {
    if (no.nodeType === Node.TEXT_NODE) return this.texto(no as Text);
    if (no.nodeType !== Node.ELEMENT_NODE || this.ignorar(no)) return;
    const el = no as Element;
    for (const a of ATRIBUTOS) if (el.hasAttribute(a)) this.atributo(el, a);
    const caminhante = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let atual = caminhante.nextNode();
    while (atual) {
      if (atual.nodeType === Node.TEXT_NODE) this.texto(atual as Text);
      else for (const a of ATRIBUTOS) if ((atual as Element).hasAttribute(a)) this.atributo(atual as Element, a);
      atual = caminhante.nextNode();
    }
  }

  private texto(no: Text) {
    const valor = no.nodeValue ?? '';
    if (!/[A-Za-zÀ-ú]/.test(valor) || this.ignorar(no)) return;
    let registro = this.textos.get(no);
    if (!registro || valor !== registro.aplicado) {
      registro = { original: valor, aplicado: valor };
      this.textos.set(no, registro);
    }
    const novo = traduzirTexto(registro.original, this.idioma);
    if (novo !== valor) {
      registro.aplicado = novo;
      no.nodeValue = novo;
    }
  }

  private atributo(el: Element, nome: string) {
    const valor = el.getAttribute(nome);
    if (valor === null || this.ignorar(el)) return;
    let mapa = this.atributos.get(el);
    if (!mapa) this.atributos.set(el, (mapa = new Map()));
    let registro = mapa.get(nome);
    if (!registro || valor !== registro.aplicado) {
      registro = { original: valor, aplicado: valor };
      mapa.set(nome, registro);
    }
    const novo = traduzirTexto(registro.original, this.idioma);
    if (novo !== valor) {
      registro.aplicado = novo;
      el.setAttribute(nome, novo);
    }
  }

  /** Valor original (em português) de um atributo já traduzido. */
  originalAtributo(el: Element, nome: string) {
    return this.atributos.get(el)?.get(nome)?.original ?? el.getAttribute(nome) ?? '';
  }

  /** Texto original (em português) de um nó de texto já traduzido. */
  original(no: Text) {
    return this.textos.get(no)?.original ?? no.nodeValue ?? '';
  }
}

export const tradutor = new TradutorPagina();
