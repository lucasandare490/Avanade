import { test, expect, type Page } from '@playwright/test';
import axe from 'axe-core';

// Entrega final (Thayná Batista da Silva): login seguro, tema, idioma e ícones "i".
// Roda contra o modo demonstração: VITE_MODO_DADOS=demo npm run dev
const ROTAS = ['dashboard', 'operacoes', 'operacoes/OP-0184', 'despesas', 'fluxo-caixa', 'analise', 'simulacao', 'configuracoes', 'ajuda', 'venda-demonstrativa'];

async function entrarDemo(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.getByRole('button', { name: /Iniciar demonstração|Explorar demonstração|Entrar com perfil demonstrativo/ }).first().click();
  await expect(page.locator('main#conteudo')).toBeVisible();
}
async function irPara(page: Page, rota: string) {
  await page.evaluate((r) => (location.hash = `/${r}`), rota);
  await page.waitForTimeout(400);
}
/** Rótulos e títulos que deveriam ter o "i" mas não têm explicação no glossário. */
async function semDica(page: Page) {
  return page.evaluate(() => [...(window as any).__planner.dicas.semExplicacao as Set<string>]);
}
/** Textos visíveis (e rótulos acessíveis) sem tradução no idioma atual. */
async function textosEmPortugues(page: Page) {
  return page.evaluate(() => {
    const p = (window as any).__planner;
        const ignorar = (t: string) =>
      !/[A-Za-zÀ-ú]{2}/.test(t) || t in p.textosSemTraducao || /^[A-Z]{2,}(-[A-Z0-9]+)+$/.test(t) || /^[A-ZÀ-Ú]{2}$/.test(t) ||
      /@exemplo\.invalid|@example|São João|Thayná|Kleysson|Mercadinho|^Planner Comercial$|^(Pix|PIX|POS|CSV|MVP|IA|AI|BRL|R\$|OK)$/.test(t);
    const falta = (original: string) => {
      const t = original.replace(/\s+/g, ' ').trim();
      return t && !ignorar(t) && !p.temTraducao(t);
    };
    const achados = new Set<string>();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = w.nextNode())) {
      const el = n.parentElement!;
      if (el.closest('script,style,[data-sem-traducao],option[lang],.dica-balao') || !el.getClientRects().length) continue;
      const original = p.tradutor.original(n);
      if (falta(original)) achados.add(original.replace(/\s+/g, ' ').trim());
    }
    document.querySelectorAll('[aria-label],[placeholder],[title]').forEach((el) => {
      // Títulos com ícone "i": o nome acessível é copiado do texto já traduzido na tela.
      if (el.closest('[data-sem-traducao]') || el.hasAttribute('data-rotulo-dica')) return;
      for (const a of ['aria-label', 'placeholder', 'title']) {
        if (!el.hasAttribute(a)) continue;
        const v = p.tradutor.originalAtributo(el, a);
        if (v && falta(v)) achados.add(`[${a}] ${v}`);
      }
    });
    return [...achados];
  });
}

test.describe('login seguro', () => {
  test('olhinho mostra e esconde a senha; lembrar de mim e cadastre-se aparecem', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar com perfil|Conhecer as telas|Entrar/ }).last().click();
    const senha = page.getByLabel('Senha', { exact: true });
    await senha.fill('segredo');
    await expect(senha).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(senha).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(senha).toHaveAttribute('type', 'password');
    await expect(page.getByRole('checkbox', { name: 'Lembrar de mim' })).toBeVisible();
    await expect(page.getByText('Ainda não tem uma conta?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cadastre-se' })).toBeVisible();
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
    await expect(page.getByRole('heading', { name: 'Recuperar conta' })).toBeVisible();
    await page.getByLabel('E-mail', { exact: true }).fill('alguem@exemplo.invalid');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await expect(page.getByText('Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.')).toBeVisible();
  });

  test('avisa as tentativas restantes e bloqueia na quinta senha errada', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar com perfil|Conhecer as telas|Entrar/ }).last().click();
    await page.getByLabel('E-mail', { exact: true }).fill('gestor@exemplo.invalid');
    for (const restantes of [4, 3, 2, 1]) {
      await page.getByLabel('Senha', { exact: true }).fill('errada');
      await page.getByRole('button', { name: 'Entrar no cenário simulado' }).click();
      await expect(page.getByRole('alert')).toContainText(restantes === 1 ? 'Resta 1 tentativa' : `Restam ${restantes} tentativas`);
    }
    await page.getByLabel('Senha', { exact: true }).fill('errada');
    await page.getByRole('button', { name: 'Entrar no cenário simulado' }).click();
    await expect(page.getByRole('alert')).toContainText('bloqueado temporariamente');
    await expect(page.getByText(/Tempo restante: 1[45]:\d\d/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar no cenário simulado' })).toBeDisabled();
  });
});

test.describe('tema', () => {
  for (const [escolha, esperado] of [['claro', 'claro'], ['escuro', 'escuro']] as const) {
    test(`tema ${escolha} vale em todas as telas e fica salvo`, async ({ page }) => {
      await entrarDemo(page);
      await page.getByLabel('Tema', { exact: true }).first().selectOption(escolha);
      for (const rota of ROTAS) {
        await irPara(page, rota);
        await expect(page.locator('html')).toHaveAttribute('data-tema', esperado);
      }
      const fundo = await page.evaluate(() => getComputedStyle(document.querySelector('main#conteudo')!.closest('.area-principal') ?? document.body).backgroundColor);
      expect(fundo).toBeTruthy();
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-tema', esperado);
    });
  }
  test('usar tema do sistema segue o aparelho', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await entrarDemo(page);
    await page.getByLabel('Tema', { exact: true }).first().selectOption('sistema');
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  });
  test('tema escuro deixa o fundo da página escuro e o texto claro', async ({ page }) => {
    await entrarDemo(page);
    await page.getByLabel('Tema', { exact: true }).first().selectOption('escuro');
    const [fundo, texto] = await page.evaluate(() => {
      const h1 = document.querySelector('main#conteudo h1')!;
      const luz = (c: string) => { const [r, g, b] = c.match(/\d+/g)!.map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
      return [luz(getComputedStyle(document.body).backgroundColor), luz(getComputedStyle(h1).color)];
    });
    expect(fundo).toBeLessThan(0.2);
    expect(texto).toBeGreaterThan(0.6);
  });
});

test.describe('idiomas', () => {
  for (const idioma of ['en', 'es'] as const) {
    test(`todas as telas em ${idioma} sem texto em português`, async ({ page }) => {
      await entrarDemo(page);
      await page.getByLabel('Idioma', { exact: true }).first().selectOption(idioma);
      await expect(page.locator('html')).toHaveAttribute('lang', idioma);
      const restos: Record<string, string[]> = {};
      for (const rota of ROTAS) {
        await irPara(page, rota);
        const t = await textosEmPortugues(page);
        if (t.length) restos[rota] = t;
      }
      expect(restos).toEqual({});
      await page.getByLabel(idioma === 'en' ? 'Language' : 'Idioma', { exact: true }).first().selectOption('pt');
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
      await expect(page.getByRole('link', { name: /Dashboard/ }).first()).toBeVisible();
    });
  }
  test('telas públicas (entrada e login) também trocam de idioma', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.getByLabel('Idioma', { exact: true }).selectOption('en');
    expect(await textosEmPortugues(page)).toEqual([]);
    await page.getByRole('button', { name: /Sign in|See the access screens/ }).last().click();
    expect(await textosEmPortugues(page)).toEqual([]);
  });
});

test.describe('ícones "i"', () => {
  test('toda informação das telas tem explicação', async ({ page }) => {
    await entrarDemo(page);
    for (const rota of ROTAS) await irPara(page, rota);
    expect(await semDica(page)).toEqual([]);
    const contagem = await page.locator('.dica-i').count();
    expect(contagem).toBeGreaterThan(0);
  });
  test('explicação abre com mouse, teclado e toque, e fecha com Esc', async ({ page }) => {
    await entrarDemo(page);
    await irPara(page, 'simulacao');
    const icone = page.locator('.dica-i').first();
    await icone.hover();
    await expect(page.locator('#dica-flutuante')).toBeVisible();
    await expect(page.locator('#dica-flutuante')).not.toHaveText('');
    await page.mouse.move(0, 0);
    await expect(page.locator('#dica-flutuante')).toBeHidden();
    await icone.focus();
    await expect(page.locator('#dica-flutuante')).toBeVisible();
    await expect(icone).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#dica-flutuante')).toBeHidden();
    await icone.click();
    await expect(page.locator('#dica-flutuante')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.locator('#dica-flutuante')).toBeVisible(); // toque fixa a explicação
    await icone.click();
    await expect(page.locator('#dica-flutuante')).toBeHidden();
  });
  test('explicações também mudam de idioma', async ({ page }) => {
    await entrarDemo(page);
    await irPara(page, 'simulacao');
    await page.getByLabel('Idioma', { exact: true }).first().selectOption('en');
    const icone = page.locator('.dica-i').first();
    await icone.focus();
    const texto = await page.locator('#dica-flutuante').textContent();
    expect(texto).not.toMatch(/[ãõç]/);
    await expect(icone).toHaveAttribute('aria-label', 'More information');
    await expect(icone).toHaveAccessibleDescription(/Split simulation/);
  });
  test('o nome dos campos continua sendo só o rótulo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar com perfil|Conhecer as telas|Entrar/ }).last().click();
    await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  });
});

test.describe('acessibilidade nos dois temas', () => {
  for (const tema of ['claro', 'escuro'] as const) {
    test(`sem violações WCAG A/AA no tema ${tema}, em todas as telas`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('planner:tema', t), tema);
      await entrarDemo(page);
      await page.addInitScript((t) => localStorage.setItem('planner:tema', t), tema);
      const problemas: string[] = [];
      for (const rota of ROTAS) {
        await irPara(page, rota);
        await page.addScriptTag({ content: axe.source });
        const r = await page.evaluate(async () =>
          (await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(
            (v: any) => `${v.id}: ${v.nodes.map((n: any) => n.target.join(' ')).join(' | ')}`,
          ),
        );
        r.forEach((x: string) => problemas.push(`${rota} → ${x}`));
      }
      expect(problemas).toEqual([]);
    });
  }
});
