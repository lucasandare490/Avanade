# Supabase como banco do Planner

Registro para a equipe: [mudanças, evidências e pendências](../../documentacao/INTEGRACAO-SUPABASE-2026-10-19.md).

Integração: React/Android → API Java → PostgreSQL do Supabase. Login, sessões,
permissões por loja e regras financeiras continuam no backend existente.
Supabase Auth, Storage e Realtime não fazem parte desta configuração.
O frontend não precisa de SDK Supabase nem de chaves `anon`/`service_role`.

## Preparar um projeto novo

1. Crie um projeto Supabase dedicado ao Planner, com schema `public` vazio (sem
   tabelas ou funções próprias/extensões nesse schema). Esta instalação cria um banco
   lógico novo para a aplicação; não transfere os dados do PostgreSQL local.
2. Nas configurações de Data API, desative a Data API: os clientes usam a API Java.
   Não adicione grants para `anon`, `authenticated` ou `service_role` nas tabelas
   do Planner. O isolamento entre lojas é feito pelo Java, não por políticas RLS.
3. No SQL Editor, conectado como `postgres`, execute [bootstrap.sql](bootstrap.sql).
   Ele cria `split_owner` (migrations) e `split_app` (runtime) sem senha inicial.
   É um provisionamento único: se uma role já existir, pare e examine o ambiente.
4. Defina senhas distintas para as duas roles. Preferencialmente conecte `psql`
   como `postgres` pelo Session pooler e use `\password split_owner` e
   `\password split_app` (entrada oculta, sem senha no histórico). Alternativamente,
   execute `ALTER ROLE split_owner PASSWORD 'SENHA_NOVA';` e o equivalente de
   `split_app` no SQL Editor privado; isso pode ficar no histórico do painel.
   Nunca versione os comandos preenchidos ou envie senhas pelo chat.
5. Em **Connect → Session pooler**, copie host e referência do projeto. Use porta
   **5432**. O usuário é `split_app.PROJECT_REF` para a API e
   `split_owner.PROJECT_REF` para Flyway. Em conexão direta, use o host
   `db.PROJECT_REF.supabase.co` e usuários sem o sufixo; requer IPv6 ou IPv4 habilitado.
6. Baixe o certificado CA do banco nas configurações SSL e guarde-o localmente.

## Executar no Linux

Na raiz do repositório:

```bash
cp scripts/supabase/.env.example backend/.env.supabase
chmod 600 backend/.env.supabase
# Edite backend/.env.supabase com host, usuários, senhas e caminho do certificado.
cd backend
MAVEN_OPTS='-Xmx192m' ./mvnw -DskipTests package
cd ..
bash backend/scripts/run-supabase.sh
```

Em outro terminal, instale as dependências com `npm --prefix frontend ci` se
ainda não houver `frontend/node_modules` e execute `npm run dev`.
A interface continua usando `/api` e o proxy do
Vite. A API local responde em `http://127.0.0.1:8080`. Verifique a conexão usando
`curl --fail http://127.0.0.1:8080/actuator/health/readiness`, crie uma conta na
interface e teste login. Ctrl+C encerra a API; o banco remoto persiste.

O launcher usa heap máximo de 256 MB e o pool tem até três conexões, com zero
conexões ociosas mínimas. A JVM ainda consome memória fora do heap. Java continua
necessário para rodar o backend; desligar sua extensão no VS Code é independente.
O script carrega configuração Bash local confiável, não um arquivo recebido de terceiros.

Sem seeds por padrão: o cadastro cria uma loja vazia. Vendas exigem regra
financeira previamente cadastrada. Para uma apresentação com contas e regras
sintéticas, habilite explicitamente `DEMO_SEED_ENABLED=true` e defina
`DEMO_PASSWORD` (12–72 caracteres). Isso continua sendo um cenário demonstrativo.

## Migrações, TLS e hospedagem

O perfil `supabase` mantém V1–V5 sem alterações e usa `split_owner` como criador.
Assim, os grants automáticos de objetos criados por `postgres` no Supabase não
são herdados. O bootstrap concede somente leitura/inserção ao runtime; as próprias
migrations liberam as atualizações necessárias e protegem o histórico do Flyway.
As funções também não recebem o privilégio EXECUTE para PUBLIC.

O bootstrap recusa um `public` já ocupado antes de criar roles. A migration V3
original altera privilégios de todas as tabelas desse schema; por isso o projeto
deve ser dedicado e começar vazio. Os schemas gerenciados `auth`, `storage` etc.
permanecem separados. Baseline automático está desativado: todas as migrations,
inclusive V1, precisam ser aplicadas. Não execute migrations como `postgres`,
não habilite baseline para contornar conflitos e não apague objetos existentes.

TLS usa `verify-full` e o certificado configurado tanto no Hikari quanto no Flyway.
As URLs ficam sem parâmetros para não sobrescrever essas propriedades. Não use
o pooler transacional da porta 6543: o backend utiliza estado de sessão e Flyway.

Para um processo/container gerenciado, exporte as variáveis do exemplo e ative
`SPRING_PROFILES_ACTIVE=supabase` (ou `hospedagem,supabase` atrás do proxy existente).
Spring não carrega `.env` por conta própria. Monte o certificado no container e
use esse caminho em `SUPABASE_SSL_ROOT_CERT`. O Compose de hospedagem existente
não carrega este exemplo automaticamente; o launcher acima é o caminho local.
Mantenha `DATABASE_PASSWORD` e `MIGRATION_PASSWORD` no gerenciador de segredos.
O frontend e o backend ainda precisam de hospedagem para acesso público.

Dados locais existentes exigem uma transferência separada com backup/restore e
validação; esta integração não copia, apaga ou mescla os bancos.

## Validação local

`cd backend && MAVEN_OPTS='-Xmx192m' ./mvnw -Dtest=SupabaseDatabaseTest -DargLine=-Xmx256m test`
executa dois testes em PostgreSQL descartável: provisionamento, migrations V1–V5,
privilégios de runtime, ausência de acesso pelas roles da Data API e recusa de
schema ocupado sem alterações. Esses testes não verificam rede, certificado ou
credenciais de um projeto Supabase real; isso exige a configuração remota.

Referências: [conexões PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres),
[TLS](https://supabase.com/docs/guides/platform/ssl-enforcement) e
[proteção da Data API](https://supabase.com/docs/guides/api/securing-your-api).
