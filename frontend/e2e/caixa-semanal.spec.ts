import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import axe from 'axe-core';
const senha=readFileSync('../backend/.local/demo-password','utf8').trim();
test('caixa semanal integrado: tabela, responsividade e acessibilidade',async({page})=>{
 await page.goto('/');
 await page.getByLabel('E-mail',{exact:true}).fill('gerente1@demo.local');
 await page.getByLabel('Senha',{exact:true}).fill(senha);
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.locator('main#conteudo')).toBeVisible();
 await page.evaluate(()=>location.hash='/fluxo-caixa');
 await expect(page.getByRole('heading',{name:'Caixa por semana'})).toBeVisible();
 const region=page.getByRole('region',{name:'Caixa semanal'});
 await expect(region.getByRole('table')).toBeVisible();
 expect(await region.locator('tbody tr').count()).toBeGreaterThan(0);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 await page.addScriptTag({content:axe.source});
 const result=await page.evaluate(async()=>await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 expect(result.violations.map((v:any)=>({id:v.id,nodes:v.nodes.map((n:any)=>n.target)}))).toEqual([]);
});
