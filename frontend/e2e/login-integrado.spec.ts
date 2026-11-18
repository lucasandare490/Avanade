import { test, expect } from '@playwright/test';

// Login contra a API real (VITE_MODO_DADOS=api + backend local): contagem de
// tentativas, bloqueio e recuperação de senha sem estar logado.
test('API real: avisa tentativas, bloqueia na quinta e aceita pedido de recuperação', async ({ page }) => {
  const email = `bloqueio-e2e-${Date.now()}@example.invalid`;
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  for (const restantes of [4, 3, 2, 1]) {
    await page.getByLabel('Senha', { exact: true }).fill('Senha-errada-123');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText(restantes === 1 ? 'Resta 1 tentativa' : `Restam ${restantes} tentativas`);
  }
  await page.getByLabel('Senha', { exact: true }).fill('Senha-errada-123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('bloqueado temporariamente');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Enviar instruções' }).click();
  await expect(page.getByText('Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.')).toBeVisible();
});

test('API real: lembrar de mim mantém a sessão depois de recarregar', async ({ page }) => {
  const email = `lembrar-e2e-${Date.now()}@example.invalid`, senha = 'Senha-teste-12345';
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button', { name: 'Cadastre-se' }).click();
  await page.getByLabel('Seu nome', { exact: true }).fill('Pessoa lembrada');
  await page.getByLabel('Nome do estabelecimento', { exact: true }).fill('Loja lembrada');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByLabel('Confirmar senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Conta e estabelecimento criados');
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('checkbox', { name: 'Lembrar de mim' }).check();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator('main#conteudo')).toBeVisible();
  await page.reload();
  await expect(page.locator('main#conteudo')).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(senha);
  await page.getByRole('button', { name: /^Sair$/ }).first().click();
  expect(await page.evaluate(() => localStorage.getItem('planner:sessao-lembrada'))).toBeNull();
});
