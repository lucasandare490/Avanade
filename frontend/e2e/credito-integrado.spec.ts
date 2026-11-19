import { test, expect } from '@playwright/test';

// Capital de giro contra a API real: loja com vendas, consentimento, simulação,
// contratação e crédito somado na projeção do caixa.
test('API real: contrata capital de giro e a projeção soma o crédito', async ({ page, request }) => {
  const email = `credito-e2e-${Date.now()}@example.invalid`, senha = 'Senha-teste-12345';
  expect((await request.post('/api/v1/auth/register', { data: { name: 'Pessoa', merchantName: 'Loja crédito', email, password: senha } })).status()).toBe(201);
  const login = await (await request.post('/api/v1/auth/login', { data: { email, password: senha } })).json();
  for (let i = 0; i < 2; i++) {
    const r = await request.post('/api/v1/sales', {
      headers: { Authorization: `Bearer ${login.accessToken}`, 'Idempotency-Key': crypto.randomUUID() },
      data: { amountCents: 300000, currency: 'BRL', paymentMethod: 'PIX', taxCategory: 'GENERAL' },
    });
    expect(r.status()).toBe(201);
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator('main#conteudo')).toBeVisible();
  await page.getByRole('link', { name: 'Capital de giro' }).click();
  await page.getByRole('checkbox', { name: 'Autorizo compartilhar esses dados com o parceiro financeiro' }).check();
  await page.getByRole('button', { name: 'Autorizar compartilhamento' }).click();
  await page.getByLabel('Valor do crédito (R$)', { exact: true }).fill('1000,00');
  await page.getByLabel('Número de parcelas', { exact: true }).selectOption('6');
  await page.getByRole('button', { name: 'Simular', exact: true }).click();
  await expect(page.getByText('R$ 181,49').first()).toBeVisible();
  await page.getByRole('checkbox', { name: 'Li e concordo com o valor total, a taxa de juros e o CET' }).check();
  await page.getByRole('button', { name: 'Contratar capital de giro' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Capital de giro contratado' })).toBeVisible();
  await page.getByRole('link', { name: 'Fluxo de Caixa' }).click();
  const ate = new Date(Date.now() + 40 * 86400_000).toISOString().slice(0, 10);
  await page.getByLabel('Planejar até', { exact: true }).fill(ate);
  await page.getByLabel('Entradas líquidas previstas (R$)', { exact: true }).fill('0');
  await page.getByLabel('Despesas previstas (R$)', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Calcular projeção' }).click();
  await expect(page.getByText('CAPITAL DE GIRO', { exact: true })).toBeVisible();
  await expect(page.getByText('PARCELAS ATÉ A DATA', { exact: true })).toBeVisible();
});
