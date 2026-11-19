import { test, expect } from '@playwright/test';

// Reforma no caixa contra a API real (Thayná Batista da Silva): a NF-e de compra
// vira despesa com crédito de IBS/CBS no servidor, e o resumo da reforma soma o
// imposto retido nas vendas e o crédito. O pacote do contador sai com os mesmos números.
test('API real: NF-e com crédito de IBS/CBS entra no resumo da reforma e no pacote do contador', async ({ page, request }) => {
  const email = `reforma-e2e-${Date.now()}@example.invalid`, senha = 'Senha-teste-12345';
  expect((await request.post('/api/v1/auth/register', { data: { name: 'Pessoa', merchantName: 'Loja reforma', email, password: senha } })).status()).toBe(201);
  const login = await (await request.post('/api/v1/auth/login', { data: { email, password: senha } })).json();
  const venda = await request.post('/api/v1/sales', {
    headers: { Authorization: `Bearer ${login.accessToken}`, 'Idempotency-Key': crypto.randomUUID() },
    data: { amountCents: 300000, currency: 'BRL', paymentMethod: 'PIX', taxCategory: 'GENERAL' },
  });
  expect(venda.status()).toBe(201);
  // Ontem no fuso da loja (UTC-3), para a data nunca ficar no futuro.
  const ontem = new Date(Date.now() - 3 * 3600_000 - 86400_000).toISOString().slice(0, 10);
  const nfe = `<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe1" versao="4.00"><ide><nNF>881</nNF><dhEmi>${ontem}T09:00:00-03:00</dhEmi></ide><emit><xNome>Atacado Exemplo</xNome></emit><total><ICMSTot><vNF>400.00</vNF></ICMSTot><IBSCBSTot><gIBS><vIBS>7.08</vIBS></gIBS><gCBS><vCBS>35.40</vCBS></gCBS></IBSCBSTot></total></infNFe></NFe></nfeProc>`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator('main#conteudo')).toBeVisible();

  await page.getByRole('link', { name: 'Despesas' }).click();
  await page.getByRole('button', { name: 'Registrar despesa' }).click();
  await page.getByLabel('Importar XML da NF-e', { exact: true }).setInputFiles({ name: 'nota.xml', mimeType: 'application/xml', buffer: Buffer.from(nfe) });
  await expect(page.getByRole('textbox', { name: 'Descrição', exact: true })).toHaveValue('NF-e 881 · Atacado Exemplo');
  await expect(page.getByLabel('Crédito de IBS/CBS da nota (R$)', { exact: true })).toHaveValue('42,48');
  await page.getByRole('button', { name: 'Salvar despesa' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Despesa registrada' })).toBeVisible();

  await page.getByRole('link', { name: 'Reforma no caixa' }).click();
  await expect(page.locator('.indicador').filter({ hasText: 'CRÉDITOS DAS COMPRAS' })).toContainText('R$ 42,48');
  await expect(page.locator('.indicador').filter({ hasText: 'IMPOSTO RETIDO NAS VENDAS' })).toContainText('1 venda concluída');
  await expect(page.getByRole('region', { name: 'Compras do período e créditos' })).toContainText('NF-e 881 · Atacado Exemplo');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar pacote do contador (CSV)' }).click();
  const csv = await (await (await download).createReadStream())!.toArray().then((p) => Buffer.concat(p).toString('utf8'));
  expect(csv).toContain('"42,48"');
  expect(csv).toContain('"3000,00"');
  expect(csv).toContain('"Venda"');
});
