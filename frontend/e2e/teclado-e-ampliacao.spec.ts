import {test,expect} from '@playwright/test';
// Executar com VITE_MODO_DADOS=demo, sem API ou gravações financeiras.
for (const width of [320,1280]) test(`teclado, espaçamento e ampliação em ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.goto('/');
 await page.getByRole('button',{name:'Explorar demonstração'}).click();
 await expect(page.locator('main#conteudo')).toBeVisible();
 await page.getByRole('link',{name:'Pular para conteúdo'}).focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#conteudo')).toBeFocused();
 const errors:string[]=[];
 for(const route of ['dashboard','operacoes','despesas','fluxo-caixa','simulacao','analise','configuracoes','ajuda','venda-demonstrativa']) {
  await page.evaluate(r=>location.hash='/'+r,route);
  await page.waitForTimeout(150);
  await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>n.setAttribute("open","")));
  // Espaçamento WCAG 1.4.12 e texto ampliado: não equivale a zoom nativo/TalkBack.
  await page.locator('main').evaluate(el=>{
   const sizes=[...el.querySelectorAll<HTMLElement>('*')].map(node=>({node,size:parseFloat(getComputedStyle(node).fontSize)}));
   for(const {node,size} of sizes) {
    node.dataset.oldStyle=node.getAttribute('style')||'';
    node.style.fontSize=`${size*2}px`;
    node.style.lineHeight='1.5';node.style.letterSpacing='.12em';node.style.wordSpacing='.16em';
   }
  });
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(overflow) errors.push(route+JSON.stringify(await page.locator("main").evaluate(el=>[...el.querySelectorAll("*")].filter(n=>{if(n.getBoundingClientRect().right<=innerWidth+1)return false;let p=n.parentElement;while(p){if(getComputedStyle(p).overflowX==="auto")return false;p=p.parentElement;}return true;}).map(n=>n.tagName+"."+n.className).slice(0,15))));
  await page.locator('main').evaluate(el=>{for(const n of el.querySelectorAll<HTMLElement>('[data-old-style]')){n.setAttribute('style',n.dataset.oldStyle||'');delete n.dataset.oldStyle;}});
 }
 expect(errors).toEqual([]);
 if(width===320){
  const open=page.getByRole('button',{name:'Abrir menu',exact:true});await open.focus();await page.keyboard.press('Enter');
  const close=page.locator('#menu-principal').getByRole('button',{name:'Fechar menu'});
  await expect(close).toBeFocused();await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Sair da demonstração'})).toBeFocused();
  await page.keyboard.press('Tab');await expect(close).toBeFocused();
  await page.keyboard.press('Escape');await expect(open).toBeFocused();
 }
});
test('diálogo de intenção pendente conserva foco e Escape cancela saída',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Explorar demonstração'}).click();
 await page.evaluate(()=>location.hash='/venda-demonstrativa');
 await page.getByLabel('Valor da venda (R$)').fill('150');
 await page.getByLabel('Cenário de demonstração').selectOption('resposta-perdida');
 await page.getByRole('button',{name:'Revisar venda'}).click();
 await page.getByRole('button',{name:'Confirmar venda simulada'}).click();
 await expect(page.getByRole('button',{name:'Consultar a mesma tentativa'})).toBeVisible();
 const exit=page.getByRole('button',{name:'Sair da demonstração'});await exit.click();
 await expect(page.getByRole('dialog')).toBeVisible();
 const stay=page.getByRole('button',{name:'Continuar na demonstração'});await expect(stay).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Encerrar e limpar cenário'})).toBeFocused();
 await page.keyboard.press('Tab');await expect(stay).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(exit).toBeFocused();
 await expect(page.getByRole('button',{name:'Consultar a mesma tentativa'})).toBeVisible();
});
