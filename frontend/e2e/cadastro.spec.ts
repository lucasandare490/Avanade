import {test,expect} from '@playwright/test';
test('cadastro integrado, loja vazia e simulação hipotética',async({page})=>{
 const email=`cadastro-${Date.now()}@example.invalid`,senha='Senha-teste-12345';
 await page.goto('/');
 await page.getByRole('button',{name:'Criar minha conta'}).click();
 await page.getByLabel('Seu nome',{exact:true}).fill('Pessoa de teste');
 await page.getByLabel('Nome do estabelecimento',{exact:true}).fill('Loja de teste de cadastro');
 await page.getByLabel('E-mail',{exact:true}).fill(email);
 await page.getByLabel('Senha',{exact:true}).fill(senha);
 await page.getByLabel('Confirmar senha',{exact:true}).fill(senha);
 await page.getByRole('button',{name:'Criar conta',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Conta e estabelecimento criados');
 await page.getByLabel('Senha',{exact:true}).fill(senha);
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.locator('main#conteudo')).toBeVisible();
 await page.evaluate(()=>location.hash='/configuracoes');
 await page.getByLabel('Nome da loja',{exact:true}).fill('Loja com nome atualizado');
 await page.getByRole('button',{name:'Salvar nome da loja'}).click();
 await expect(page.getByText('Nome do estabelecimento atualizado.',{exact:true})).toBeVisible();
 await page.reload();
 await page.getByLabel('E-mail',{exact:true}).fill(email);
 await page.getByLabel('Senha',{exact:true}).fill(senha);
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.locator('main#conteudo')).toBeVisible();
 await page.evaluate(()=>location.hash='/configuracoes');
 await expect(page.getByLabel('Nome da loja',{exact:true})).toHaveValue('Loja com nome atualizado');
 await page.evaluate(()=>location.hash='/simulacao');
 await page.getByLabel('Valor bruto (R$)',{exact:true}).fill('150,00');
 await page.getByLabel('Percentual hipotético de tributo (%)').fill('20');
 await page.getByLabel('Solicitar inclusão da taxa').uncheck();
 await page.getByRole('button',{name:'Calcular simulação'}).click();
 await expect(page.getByRole('heading',{name:'Resultado para a entrada informada'})).toBeVisible();
 await expect(page.locator('.indicador').filter({hasText:'LÍQUIDO'})).toContainText('120,00');

 await page.evaluate(()=>location.hash='/fluxo-caixa');
 const future=new Date();future.setDate(future.getDate()+7);
 await page.getByLabel('Planejar até',{exact:true}).fill(future.toISOString().slice(0,10));
 await page.getByLabel('Entradas líquidas previstas (R$)',{exact:true}).fill('100,00');
 await page.getByLabel('Despesas previstas (R$)',{exact:true}).fill('150,00');
 await page.getByRole('button',{name:'Calcular projeção'}).click();
 await expect(page.getByRole('heading',{name:'Atenção: déficit previsto'})).toBeVisible();
 await expect(page.locator('.indicador').filter({hasText:'SALDO PROJETADO'})).toContainText('50,00');
 await page.evaluate(()=>location.hash='/analise');
 await page.getByLabel('Análise de',{exact:true}).fill('2026-10-01');
 await page.getByLabel('Análise até',{exact:true}).fill('2026-10-15');
 await page.getByRole('button',{name:'Solicitar explicação'}).click();
 await expect(page.getByText('Saldo realizado zerado',{exact:true})).toBeVisible();
 await expect(page.getByText('Saldo histórico não é previsão nem garantia de disponibilidade futura.',{exact:true})).toBeVisible();
 await page.evaluate(()=>location.hash='/despesas');
 await page.getByRole('button',{name:'Registrar despesa'}).click();
 await page.getByLabel('Descrição',{exact:true}).fill('Reposição de estoque');
 await page.getByRole('button',{name:'Sugerir categoria'}).click();
 await expect(page.getByRole('button',{name:/Usar categoria/})).toBeVisible();
 await page.getByRole('button',{name:/Usar categoria/}).click();
 await expect(page.getByRole('button',{name:'Salvar despesa'})).toBeVisible();
});



