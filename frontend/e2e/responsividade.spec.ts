import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const senha = process.env.DEMO_PASSWORD || readFileSync('../backend/.local/demo-password','utf8').trim();
for (const largura of [320,390,768,1024,1440]) {
 test(`telas integradas sem transbordamento em ${largura}px`, async ({page}) => {
  await page.setViewportSize({width:largura,height:800});
  await page.goto('/');
  await page.getByLabel('E-mail',{exact:true}).fill('gerente1@demo.local');
  await page.getByLabel('Senha',{exact:true}).fill(senha);
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.locator('main#conteudo')).toBeVisible();
  const problemas:string[]=[];
  for (const [rota, titulo] of Object.entries({dashboard:'Dashboard',operacoes:'Operações',vendas:'Vendas',despesas:'Despesas','fluxo-caixa':'Fluxo de caixa',simulacao:'Simulação Split',analise:'Análise com IA',configuracoes:'Configurações e sessão'})) {
   await page.evaluate(r=>{location.hash='/'+r},rota);
   await expect(page.getByRole('heading', {name:titulo,exact:true})).toBeVisible();
   await page.waitForLoadState('networkidle');
   await expect(page.getByText(/Consultando resumo|Consultando operações|Consultando composição/).first()).toBeHidden();
   if (rota === 'simulacao') {
    await page.getByLabel('Valor bruto (R$)').fill('999999,99');
    await page.getByRole('button', {name:'Calcular simulação'}).click();
    await expect(page.getByRole('heading', {name:'Resultado para a entrada informada'})).toBeVisible();
   }
   await page.locator('.indicador strong').evaluateAll(es => es.forEach(e => {e.textContent = 'R$ 999.999.999,99';}));
   const erro=await page.evaluate(()=>{
    const w=document.documentElement.clientWidth;
    const elementos=[...document.querySelectorAll('main *')].filter(e=>{
     const r=e.getBoundingClientRect();
     if(!r.width||!r.height||getComputedStyle(e).visibility==='hidden') return false;
     let pai=e.parentElement;
     while(pai && pai!==document.body){if(['auto','scroll'].includes(getComputedStyle(pai).overflowX)) return false;pai=pai.parentElement;}
     return r.right>w+1 || r.left< -1;
    }).map(e=>`${e.tagName}.${e.className}`).slice(0,8);
    return {pagina:document.documentElement.scrollWidth>w+1,elementos};
   });
   if(erro.pagina||erro.elementos.length) problemas.push(`${rota}: ${JSON.stringify(erro)}`);
  }
  if (largura < 720) {
   await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
   await expect(page.locator('#menu-principal')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(page.getByRole('button',{name:'Abrir menu',exact:true})).toBeFocused();
  }
  expect(problemas).toEqual([]);
 });
}
