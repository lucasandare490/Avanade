import { test, expect, type Page } from '@playwright/test';
import axe from 'axe-core';

// Entrega final (Thayná Batista da Silva): login seguro, tema, idioma e ícones "i".
// Roda contra o modo demonstração: VITE_MODO_DADOS=demo npm run dev
const ROTAS = ['dashboard', 'operacoes', 'operacoes/OP-0184', 'despesas', 'fluxo-caixa', 'analise', 'simulacao', 'configuracoes', 'ajuda', 'venda-demonstrativa', 'credito', 'reforma'];

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

test.describe('demonstração funcional', () => {
  test('recuperação de senha completa com link simulado', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar com perfil|Conhecer as telas|Entrar/ }).last().click();
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
    await page.getByLabel('E-mail', { exact: true }).fill('operador@exemplo.invalid');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await page.getByRole('link', { name: 'Abrir o link do e-mail (simulado)' }).click();
    await expect(page.getByRole('heading', { name: 'Criar nova senha' })).toBeVisible();
    await page.getByLabel('Nova senha', { exact: true }).fill('Senha-nova-123456');
    await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha-nova-123456');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByText('Senha redefinida. Entre com a nova senha.')).toBeVisible();
    await page.getByLabel('E-mail', { exact: true }).fill('operador@exemplo.invalid');
    await page.getByLabel('Senha', { exact: true }).fill('Senha-nova-123456');
    await page.getByRole('button', { name: 'Entrar no cenário simulado' }).click();
    await expect(page.locator('main#conteudo')).toBeVisible();
  });
  test('lembrar de mim mantém a demonstração aberta depois de recarregar', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar com perfil|Conhecer as telas|Entrar/ }).last().click();
    await page.getByLabel('Senha', { exact: true }).fill('demo');
    await page.getByRole('checkbox', { name: 'Lembrar de mim' }).check();
    await page.getByRole('button', { name: 'Entrar no cenário simulado' }).click();
    await expect(page.locator('main#conteudo')).toBeVisible();
    await page.reload();
    await expect(page.locator('main#conteudo')).toBeVisible();
  });
});

test.describe('capital de giro', () => {
  async function autorizar(page: Page) {
    await page.getByRole('checkbox', { name: 'Autorizo compartilhar esses dados com os parceiros financeiros' }).check();
    await page.getByRole('button', { name: 'Autorizar compartilhamento' }).click();
    await expect(page.getByText('Compartilhamento autorizado em', { exact: false })).toBeVisible();
  }
  async function contratar(page: Page, valor: string, parcelas: string) {
    await page.getByLabel('Valor do crédito (R$)', { exact: true }).fill(valor);
    await page.getByLabel('Número de parcelas', { exact: true }).selectOption(parcelas);
    await page.getByRole('button', { name: 'Simular', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Li e concordo com o valor total, a taxa de juros e o CET' }).check();
    await page.getByRole('button', { name: 'Contratar capital de giro' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Capital de giro contratado' })).toBeVisible();
  }
  test('diagnóstico, comparação de ofertas e contratação com cronograma', async ({ page }) => {
    await entrarDemo(page);
    await page.getByRole('link', { name: 'Capital de giro' }).click();
    await expect(page.getByRole('heading', { name: 'Capital de giro', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Diagnóstico do capital de giro' })).toBeVisible();
    await expect(page.getByText('IMPOSTO RETIDO POR MÊS', { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Parceiros financeiros e limites' }).getByRole('row')).toHaveCount(3);
    await expect(page.getByRole('region', { name: 'Caixa estimado por semana' }).getByRole('row')).toHaveCount(14);
    await autorizar(page);
    await page.getByLabel('Valor do crédito (R$)', { exact: true }).fill('1000,00');
    await page.getByLabel('Número de parcelas', { exact: true }).selectOption('6');
    await page.getByRole('button', { name: 'Simular', exact: true }).click();
    const ofertas = page.getByRole('group', { name: 'Escolha a oferta' });
    await expect(ofertas.getByRole('radio')).toHaveCount(2);
    await expect(ofertas.getByText('Menor CET')).toBeVisible();
    await expect(ofertas.getByRole('radio').first()).toBeChecked();
    await expect(page.getByText('6x de R$ 177,87', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Com crédito' })).toBeVisible();
    const botao = page.getByRole('button', { name: 'Contratar capital de giro' });
    await expect(botao).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Li e concordo com o valor total, a taxa de juros e o CET' }).check();
    await botao.click();
    await expect(page.getByRole('status').filter({ hasText: 'Capital de giro contratado' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Parcelas do contrato' }).getByRole('row')).toHaveCount(7);
    await expect(page.getByText('Você pode desistir sem pagar juros até', { exact: false })).toBeVisible();
  });
  test('pagar parcela, quitar com desconto e ver o histórico', async ({ page }) => {
    await entrarDemo(page);
    await page.evaluate(() => (location.hash = '/credito'));
    await autorizar(page);
    await contratar(page, '1000,00', '6');
    await page.getByRole('button', { name: 'Registrar pagamento da próxima parcela' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Parcela registrada como paga.' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Parcelas do contrato' }).getByRole('cell', { name: 'Paga', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Quitar antecipadamente' }).click();
    await expect(page.getByText('Valor para quitar hoje', { exact: true })).toBeVisible();
    await expect(page.getByText('Desconto dos juros', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar quitação' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Contrato quitado antecipadamente' })).toBeVisible();
    await expect(page.getByText('Quitado', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Resumo do contrato' }).click();
    await expect(page.getByRole('heading', { name: 'Resumo do contrato de capital de giro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Histórico do crédito' })).toBeVisible();
    await expect(page.locator('.historico-credito').getByText('Contrato quitado')).toBeVisible();
  });
  test('desistir em 7 dias e bloqueio de parcela que compromete demais', async ({ page }) => {
    await entrarDemo(page);
    await page.evaluate(() => (location.hash = '/credito'));
    await autorizar(page);
    await contratar(page, '600,00', '3');
    await page.getByRole('button', { name: 'Desistir do contrato' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Desistência registrada' })).toBeVisible();
    await expect(page.getByText('Cancelado', { exact: true })).toBeVisible();
    await page.getByLabel('Valor do crédito (R$)', { exact: true }).fill('1100,00');
    await page.getByLabel('Número de parcelas', { exact: true }).selectOption('1');
    await page.getByRole('button', { name: 'Simular', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('mais da metade das entradas líquidas mensais');
    await expect(page.getByRole('button', { name: 'Contratar capital de giro' })).toHaveCount(0);
    await page.getByLabel('Valor do crédito (R$)', { exact: true }).fill('999999,00');
    await page.getByRole('button', { name: 'Simular', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Escolha um valor entre R$ 500,00 e');
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

test.describe('reforma no caixa', () => {
  const nfe = `<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe1" versao="4.00"><ide><nNF>881</nNF><dhEmi>2026-10-07T09:00:00-03:00</dhEmi></ide><emit><xNome>Atacado Exemplo</xNome></emit><total><ICMSTot><vNF>400.00</vNF></ICMSTot><IBSCBSTot><gIBS><vIBS>7.08</vIBS></gIBS><gCBS><vCBS>35.40</vCBS></gCBS></IBSCBSTot></total></infNFe></NFe></nfeProc>`;
  test('créditos das compras, NF-e, preço, prazo, antecipação e pacote do contador', async ({ page }) => {
    await entrarDemo(page);
    await page.getByRole('link', { name: 'Reforma no caixa' }).click();
    await expect(page.getByRole('heading', { name: 'Reforma no caixa', level: 1 })).toBeVisible();
    const creditos = page.locator('.indicador').filter({ hasText: 'CRÉDITOS DAS COMPRAS' });
    await expect(creditos).toContainText('R$ 123,64');
    await expect(page.getByRole('region', { name: 'Compras do período e créditos' }).getByRole('row')).toHaveCount(4);

    // Preço: custo 100, crédito 10, alíquota 26,5%, taxa 2%, margem 20% (conferido à parte: R$ 146,97).
    await page.getByLabel('Custo do produto (R$)', { exact: true }).fill('100,00');
    await page.getByLabel('Crédito de IBS/CBS da compra (R$)', { exact: true }).fill('10,00');
    await page.getByLabel('Alíquota de IBS/CBS (%)', { exact: true }).fill('26,5');
    await page.getByLabel('Preço atual (R$)', { exact: true }).fill('130,00');
    await page.getByRole('button', { name: 'Calcular preço' }).click();
    await expect(page.getByText('R$ 146,97', { exact: true })).toBeVisible();
    await expect(page.getByText('o preço precisa subir R$ 16,97', { exact: false })).toBeVisible();

    await page.getByLabel('Compras por mês com fornecedores (R$)', { exact: true }).fill('3000,00');
    await page.getByRole('button', { name: 'Calcular efeito no caixa' }).click();
    await expect(page.getByText('Pagando 30 dias depois, ficam R$ 3.000,00 a mais no caixa', { exact: false })).toBeVisible();

    await page.getByLabel('Vendas no cartão a receber (R$)', { exact: true }).fill('1000,00');
    await page.getByRole('button', { name: 'Simular antecipação' }).click();
    await expect(page.getByText('R$ 975,00', { exact: true })).toBeVisible();
    await expect(page.getByText('O capital de giro do parceiro sai mais barato', { exact: false })).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar pacote do contador (CSV)' }).click();
    const arquivo = await download;
    expect(arquivo.suggestedFilename()).toMatch(/^pacote-contador-2026-09-10-a-2026-10-09-SIMULADO\.csv$/);
    const csv = await (await arquivo.createReadStream())!.toArray().then((p) => Buffer.concat(p).toString('utf8'));
    expect(csv).toContain('Crédito IBS/CBS (R$)');
    expect(csv).toContain('"95,00"');

    // NF-e de compra: o XML preenche o formulário de despesa e o crédito entra no resumo.
    await page.getByRole('link', { name: 'Despesas' }).click();
    await page.getByRole('button', { name: 'Registrar despesa' }).click();
    await page.getByLabel('Importar XML da NF-e', { exact: true }).setInputFiles({ name: 'nota.xml', mimeType: 'application/xml', buffer: Buffer.from(nfe) });
    await expect(page.getByText('Nota lida: R$ 400,00, com R$ 42,48 de crédito de IBS/CBS', { exact: false })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Descrição', exact: true })).toHaveValue('NF-e 881 · Atacado Exemplo');
    await expect(page.getByLabel('Crédito de IBS/CBS da nota (R$)', { exact: true })).toHaveValue('42,48');
    await page.getByRole('button', { name: 'Salvar despesa demonstrativa' }).click();
    await expect(page.getByText('Despesa paga registrada no cenário local.', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'Reforma no caixa' }).click();
    await expect(creditos).toContainText('R$ 166,12');
  });

  test('XML que não é NF-e mostra erro e não preenche nada', async ({ page }) => {
    await entrarDemo(page);
    await page.getByRole('link', { name: 'Despesas' }).click();
    await page.getByRole('button', { name: 'Registrar despesa' }).click();
    await page.getByLabel('Importar XML da NF-e', { exact: true }).setInputFiles({ name: 'x.xml', mimeType: 'application/xml', buffer: Buffer.from('<!DOCTYPE a [<!ENTITY b "c">]><a>&b;</a>') });
    await expect(page.getByRole('alert').filter({ hasText: 'XML com declarações não permitidas.' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Descrição', exact: true })).toHaveValue('');
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
