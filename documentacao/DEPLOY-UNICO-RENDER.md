# Site e API num único deploy no Render

Autoria: Thayná Batista da Silva · 20/11/2026

O Planner Comercial é publicado num só lugar: o serviço **planner-api** do Render. Uma única imagem Docker monta o site em React e o entrega pela própria API em Java, no mesmo endereço.

**Endereço:** https://planner-api-tvmg.onrender.com

## Como funciona

- O `Dockerfile` da raiz do repositório monta tudo em três etapas:
  1. monta o site (`frontend/`);
  2. monta a API (`backend/`) com o site dentro de `static/`;
  3. gera uma imagem enxuta só com o Java 21.
- O site chama a API no próprio endereço. Por isso não usa `VITE_API_URL`.
- A API entrega o site em `/` e responde em `/api/v1/...`.
- As proteções de cabeçalho do Spring Security valem também para as páginas: `X-Frame-Options: DENY` e `X-Content-Type-Options: nosniff`.
- O `render.yaml` aponta para esse `Dockerfile`, com a raiz do repositório como contexto.
- Na subida, a API aplica sozinha as migrations pendentes do banco (Flyway). Elas só criam tabelas e colunas e nunca apagam dados.
- O certificado do Supabase continua no arquivo secreto do Render (`/etc/secrets/supabase-ca.crt`). A variável `SUPABASE_SSL_ROOT_CERT_PEM` é uma alternativa para provedores sem arquivo secreto.

## Publicar uma versão nova

1. Junte as mudanças ao `main` no GitHub.
2. No Render, abra **planner-api → Manual Deploy → Deploy latest commit**. O deploy desse serviço é manual.
3. Acompanhe até aparecer **Deploy succeeded**. No plano gratuito, a primeira visita depois de um tempo parado pode levar até 1 minuto.
4. Confira:

```bash
node scripts/auditoria/api-producao.mjs https://planner-api-tvmg.onrender.com
```

Deve responder `api em producao atualizada`.

## Se precisar voltar atrás

Em **planner-api → Deploys**, use **Rollback** no deploy anterior. As migrations aplicadas continuam no banco. A versão anterior da API ignora tabelas e colunas que ela não conhece.

## E o endereço antigo da Vercel?

O projeto da Vercel (`avanade-frontend-xi.vercel.app`, conta do Lucas) não serve mais o site. O `vercel.json` faz um redirecionamento permanente (308) de qualquer caminho para o mesmo caminho no Render. Quem tiver o link antigo cai no endereço oficial, e não existe uma segunda cópia do site. Se a equipe quiser, o Lucas pode desligar o projeto da Vercel de vez.

## Testado antes de publicar

- O site montado e servido pela API, localmente, no mesmo endereço.
- Navegador contra esse endereço único: login com aviso de tentativas e bloqueio, Lembrar de mim, capital de giro (contratação, parcela e quitação) e Reforma no caixa (NF-e e pacote do contador). Passaram 4 de 4.
- CI do GitHub: backend, Android, Docker, hospedagem e site.
