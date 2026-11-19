# Site e API num único deploy na Vercel

Autoria: Thayná Batista da Silva · 19/11/2026

O objetivo é colocar o site e a API no mesmo projeto da Vercel (`avanade-frontend`, conta do Lucas). Assim o deploy fica automático a cada atualização do `main` e não depende mais do deploy manual no Render.

## Como fica

- `vercel.json` define dois serviços no mesmo projeto:
  - **web:** o site em React e Vite, na pasta `frontend/`;
  - **api:** a API em Java, num contêiner montado pelo `backend/Dockerfile`.
- Tudo o que começa com `/api/` vai para a API. O resto vai para o site.
- O site chama a API no próprio endereço. Por isso não precisa mais da variável `VITE_API_URL`.
- A API ouve na porta que a Vercel informa (`PORT`).
- O certificado público do Supabase entra pela variável `SUPABASE_SSL_ROOT_CERT_PEM`.
- A API lê o IP real de quem acessa no cabeçalho `x-vercel-forwarded-for`, que a Vercel sobrescreve para impedir falsificação.
- O limite de tentativas de login por IP fica no banco (migration V12, que guarda só o hash do IP). Assim ele vale para todas as cópias da API.

**Testado:**
- Deploy de teste em outra conta Vercel: o site abriu e o contêiner da API subiu. Parou só por falta das variáveis do banco, que é o esperado.
- No CI do GitHub, o backend e a imagem Docker passaram.
- No projeto do Lucas, a prévia falhou. O motivo provável são as configurações antigas de build do projeto (comando de build, pasta de saída e framework Vite), que o passo 1 abaixo remove.

## Passo a passo (Lucas, no painel da Vercel)

### 1. Configurações gerais

Abra **Project `avanade-frontend` → Settings → Build and Deployment**:

- Em **Framework Preset**, escolha **Services**. Se essa opção não aparecer, deixe **Other**.
- Desligue os botões de **Override** de **Build Command**, **Output Directory** e **Install Command**. Assim vale o que está no `vercel.json`.
- Deixe **Root Directory** vazio, que é a raiz do repositório.

### 2. Variáveis de ambiente

Abra **Settings → Environment Variables**. Para cada variável abaixo, marque **Production** e **Preview**.

Os valores do banco são os mesmos que estão hoje no **Render**, em **planner-api → Environment**.

| Variável | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `supabase` |
| `DATABASE_URL` | mesmo valor do Render |
| `DATABASE_USER` | mesmo valor do Render |
| `DATABASE_PASSWORD` | mesmo valor do Render (marcar como **Sensitive**) |
| `MIGRATION_URL` | mesmo valor do Render |
| `MIGRATION_USER` | mesmo valor do Render |
| `MIGRATION_PASSWORD` | mesmo valor do Render (marcar como **Sensitive**) |
| `SUPABASE_SSL_ROOT_CERT_PEM` | o texto inteiro do certificado CA do Supabase, de `-----BEGIN CERTIFICATE-----` até `-----END CERTIFICATE-----`. No Render ele está em **Secret Files** como `supabase-ca.crt`. Também dá para baixar no Supabase, em **Project Settings → Database → SSL Configuration → Download certificate** |
| `CLIENT_IP_HEADER` | `x-vercel-forwarded-for` |
| `CORS_ORIGINS` | `https://avanade-frontend-xi.vercel.app` |
| `API_DOCS_ENABLED` | `false` |
| `DEMO_SEED_ENABLED` | `false` |
| `PASSWORD_RESET_LINK_BASE` | `https://avanade-frontend-xi.vercel.app` |

As variáveis abaixo são opcionais e servem para o e-mail de recuperação de senha. O guia está em `CONFIGURAR-EMAIL-RECUPERACAO.md`:

- `PASSWORD_RESET_FROM`
- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true`

**Apague a variável `VITE_API_URL`.** Hoje ela aponta para o Render. Sem ela, o site passa a usar a API no próprio endereço.

> Se o banco usar o **pooler** do Supabase, o `DATABASE_URL` do Render já está no formato certo. Não mude.

### 3. Testar na prévia

1. No GitHub, abra o PR **"Site e API num único deploy na Vercel"** e mande refazer o deploy de prévia. Na Vercel: **Deployments → … → Redeploy**.
2. Abra o link da prévia e confira:
   - `…/api/v1/auth/login` com senha errada responde que restam 4 tentativas;
   - o login funciona;
   - as telas **Capital de giro** e **Reforma no caixa** abrem sem o aviso de "servidor ainda não atualizado".
3. Na primeira subida, a API aplica no Supabase as migrations V7 a V12. Elas só criam tabelas e colunas novas e não apagam nada.

### 4. Publicar

- Junte o PR ao `main`. A Vercel publica sozinha.
- O Render pode ficar parado como reserva. Para voltar atrás, basta recriar a variável `VITE_API_URL` com o endereço do Render e refazer o deploy.

## O que conferir depois

```bash
node scripts/auditoria/api-producao.mjs https://avanade-frontend-xi.vercel.app
```

Deve responder `api em producao atualizada`.
