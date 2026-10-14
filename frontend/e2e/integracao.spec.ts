import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const senha =
  process.env.DEMO_PASSWORD || readFileSync('../backend/.local/demo-password', 'utf8').trim();
const hoje = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Recife',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
async function entrar(page: Page, perfil = 'gerente1') {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(`${perfil}@demo.local`);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  const resposta = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/login'));
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  const r = await resposta;
  expect(r.status()).toBe(200);
  await expect(page.getByText('Servidor conectado · simulado')).toBeVisible();
  return (await r.json()).accessToken as string;
}
async function novaVenda(page: Page, valor = '150,00') {
  await page.getByRole('link', { name: 'Nova venda · POS web' }).click();
  await page.getByLabel('Valor da venda (R$)').fill(valor);
  await page.getByRole('button', { name: 'Revisar venda' }).click();
  await page.getByRole('button', { name: 'Confirmar venda', exact: true }).click();
}
async function novaDespesa(page: Page, descricao: string) {
  await page.getByRole('link', { name: 'Despesas', exact: true }).click();
  await page.getByRole('button', { name: 'Registrar despesa', exact: true }).click();
  await page.getByLabel('Descrição', { exact: true }).fill(descricao);
  await page.getByLabel('Valor (R$)', { exact: true }).fill('10,00');
  await page.getByLabel('Data do pagamento').fill(hoje);
  await page
    .getByRole('combobox', { name: 'Categoria', exact: true })
    .selectOption({ label: 'Estoque' });
  await page.getByRole('button', { name: 'Salvar despesa' }).click();
}
test('venda, despesas, totais, simulação, análise, consulta e logout contra PostgreSQL', async ({
  page,
}) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  const token = await entrar(page);
  const auth = { Authorization: `Bearer ${token}` };
  const url = `/api/v1/cash-flow?from=${hoje}&to=${hoje}`;
  const antes = await (await page.request.get(url, { headers: auth })).json();
  await novaVenda(page);
  await expect(page).toHaveURL(/#\/operacoes\//);
  await expect(page.getByText('Pagamento: confirmado', { exact: true })).toBeVisible();
  await expect(page.getByText('R$ 132,00', { exact: true }).first()).toBeVisible();
  const operacao = page.url().split('/').at(-1)!;
  await page.getByRole('link', { name: 'Operações', exact: true }).click();
  await page.getByLabel('Buscar operação').fill(operacao);
  await expect(page.getByRole('link', { name: operacao, exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('pendente');
  await expect(page.getByText('Nenhuma operação encontrada')).toBeVisible();
  const descricao = `E2E integração ${Date.now()}`;
  await novaDespesa(page, descricao);
  await expect(page.getByText('Despesa registrada. A consulta será atualizada.')).toBeVisible();
  await page.getByLabel('Buscar descrição').fill(descricao);
  await expect(page.getByRole('cell', { name: descricao, exact: true })).toHaveCount(1);
  const depois = await (await page.request.get(url, { headers: auth })).json();
  expect(depois.inflowCents - antes.inflowCents).toBe(13200);
  expect(depois.expenseCents - antes.expenseCents).toBe(1000);
  expect(depois.closingCents - antes.closingCents).toBe(12200);
  await page.getByRole('link', { name: 'Fluxo de Caixa', exact: true }).click();
  await page.getByLabel('De', { exact: true }).fill(hoje);
  await page.getByLabel('Até', { exact: true }).fill(hoje);
  await page.getByRole('button', { name: 'Consultar período' }).click();
  await expect(page.getByText('Saldo final', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Simulação Split', exact: true }).click();
  await page.getByLabel('Valor bruto (R$)').fill('150,00');
  await page.getByRole('button', { name: 'Calcular simulação' }).click();
  await expect(page.getByText('R$ 132,00', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Análise com IA/ }).click();
  await page.getByLabel('Análise de').fill(hoje);
  await page.getByLabel('Análise até').fill(hoje);
  await page.getByRole('button', { name: 'Solicitar explicação' }).click();
  await expect(page.getByText(/provedor demonstrativo do servidor/)).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrar no Planner' })).toBeVisible();
  await expect
    .poll(async () => (await page.request.get('/api/v1/sales', { headers: auth })).status())
    .toBe(401);
  expect(erros).toEqual([]);
});
test('resposta de venda perdida após commit é recuperada após recarregar, sem duplicar', async ({
  page,
}) => {
  await entrar(page);
  let vendaId = '';
  let posts = 0;
  await page.route('**/api/v1/sales', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    posts++;
    const resposta = await route.fetch();
    expect(resposta.status()).toBe(201);
    vendaId = (await resposta.json()).id;
    await route.abort('failed');
  });
  await novaVenda(page, '123,45');
  await expect(page.getByRole('button', { name: 'Consultar a mesma tentativa' })).toBeVisible();
  await page.reload();
  await entrar(page);
  await page.getByRole('link', { name: 'Nova venda · POS web' }).click();
  await page.getByRole('button', { name: 'Consultar a mesma tentativa' }).click();
  await expect(page).toHaveURL(/#\/operacoes\//);
  expect(posts).toBe(1);
  await page.getByRole('link', { name: 'Vendas', exact: true }).click();
  await page.getByLabel('Buscar venda').fill(vendaId);
  await expect(page.getByRole('link', { name: vendaId })).toHaveCount(1);
  const armazenamento = await page.evaluate(() => Object.keys(sessionStorage));
  expect(armazenamento.some((k) => k.startsWith('planner-intencao'))).toBe(false);
});
test('resposta de despesa perdida permite recuperação única depois de recarregar', async ({
  page,
}) => {
  await entrar(page);
  let posts = 0;
  await page.route('**/api/v1/expenses', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    posts++;
    const resposta = await route.fetch();
    expect(resposta.status()).toBe(201);
    await route.abort('failed');
  });
  const descricao = `E2E recuperação ${Date.now()}`;
  await novaDespesa(page, descricao);
  await expect(page.getByRole('button', { name: 'Recuperar despesa' })).toBeVisible();
  await page.reload();
  await entrar(page);
  await page.getByRole('link', { name: 'Despesas', exact: true }).click();
  await page.getByRole('button', { name: 'Recuperar despesa' }).click();
  await expect(page.getByText('Despesa confirmada. A consulta será atualizada.')).toBeVisible();
  await page.getByLabel('Buscar descrição').fill(descricao);
  await expect(page.getByRole('cell', { name: descricao, exact: true })).toHaveCount(1);
  expect(posts).toBe(1);
});
test('perfis, isolamento entre lojas e sessão expirada', async ({ page }) => {
  await entrar(page, 'operador1');
  await expect(page.getByRole('link', { name: 'Despesas', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Nova venda · POS web' })).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/dashboard';
  });
  await expect(page.getByText('Acesso não permitido', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await entrar(page, 'financeiro1');
  await expect(page.getByRole('link', { name: 'Nova venda · POS web' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  const token1 = await entrar(page);
  const vendas = await (
    await page.request.get('/api/v1/sales', { headers: { Authorization: `Bearer ${token1}` } })
  ).json();
  expect(vendas.items.length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  const token2 = await entrar(page, 'gerente2');
  expect(
    (
      await page.request.get(`/api/v1/sales/${vendas.items[0].id}`, {
        headers: { Authorization: `Bearer ${token2}` },
      })
    ).status(),
  ).toBe(404);
  await page.request.post('/api/v1/auth/logout', {
    headers: { Authorization: `Bearer ${token2}` },
  });
  await page.getByRole('link', { name: 'Vendas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrar no Planner' })).toBeVisible();
  await expect(page.getByText(/Sua sessão expirou/)).toBeVisible();
});
