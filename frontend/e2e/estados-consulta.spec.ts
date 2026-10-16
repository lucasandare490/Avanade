import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import axe from 'axe-core';
const senha=process.env.DEMO_PASSWORD||readFileSync('../backend/.local/demo-password','utf8').trim();
for(const width of [320,768]) {
 test(`estados de consulta: carregamento, erro e recuperação em ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await page.getByLabel('E-mail',{exact:true}).fill('gerente1@demo.local');
  await page.getByLabel('Senha',{exact:true}).fill(senha);
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.locator('main#conteudo')).toBeVisible();
  await page.addScriptTag({content:axe.source});
  async function verificar(){
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
   const result=await page.evaluate(async()=>await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   expect(result.violations.map((v:any)=>({id:v.id,nodes:v.nodes.map((n:any)=>n.target)}))).toEqual([]);
  }
  for(const config of [
   {route:'operacoes',api:'split-operations',loading:'Consultando operações',error:'Consulta indisponível',empty:'Nenhuma operação encontrada'},
   {route:'despesas',api:'expenses',loading:'Consultando despesas',error:'Consulta indisponível',empty:'Nenhuma despesa encontrada'},
   {route:'fluxo-caixa',api:'cash-flow',loading:'Consultando resumo',error:'Resumo indisponível',empty:null}
  ]){
   let release!:()=>void;
   const hold=new Promise<void>(resolve=>release=resolve);
   let fail=true;
   const pattern=`**/api/v1/${config.api}?*`;
   await page.route(pattern,async route=>{
    await hold;
    if(fail) await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'UNAVAILABLE',message:'Consulta temporariamente indisponível. Tente novamente.'})});
    else if(config.empty) await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:[],total:0,page:1,size:20})});
    else await route.continue();
   });
   await page.evaluate(r=>location.hash='/'+r,config.route);
   await expect(page.getByRole('heading',{name:config.loading,exact:true})).toBeVisible();
   await verificar();
   release();
   await expect(page.getByRole('heading',{name:config.error,exact:true})).toBeVisible();
   await verificar();
   fail=false;
   await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
   await expect(page.getByRole('heading',{name:config.error,exact:true})).toBeHidden();
   await expect(page.getByRole('heading',{name:config.empty||'Caixa por semana',exact:true})).toBeVisible();
   await verificar();
   await page.unroute(pattern);
  }
 });
}
