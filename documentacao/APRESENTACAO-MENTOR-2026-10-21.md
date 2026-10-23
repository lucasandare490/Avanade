# Planner Comercial — material para apresentação ao mentor

## Resumo executivo

O Planner Comercial é uma aplicação web para acompanhamento de vendas,
despesas, fluxo de caixa e composição demonstrativa de split. O sistema possui
login, cadastro de estabelecimento, perfis de acesso, operações simuladas,
relatórios e simulação financeira.

A entrega atual está preparada para demonstração web. A integração com a
maquininha/Android não é necessária para apresentar o produto nesta etapa.

## Estado atual da entrega

### Funcionando

- Frontend React/Vite executado localmente.
- API Java Spring Boot publicada no Render.
- PostgreSQL Supabase conectado à API.
- TLS do banco configurado com certificado CA.
- Cinco migrations Flyway aplicadas e validadas.
- Cadastro e login pela API.
- Controle de sessão e permissões por estabelecimento.
- Vendas e split demonstrativo.
- Registro e consulta de despesas.
- Fluxo de caixa.
- Relatórios e simulação.
- Layout da tela de login revisado para manter o padrão UX/UI do produto.

### API publicada

```text
https://planner-api-tvmg.onrender.com
```

Health check validado:

```text
https://planner-api-tvmg.onrender.com/actuator/health/readiness
```

Resposta esperada:

```json
{"status":"UP"}
```

### Frontend

O frontend público ainda não foi publicado na Vercel porque a conta GitHub
conectada à Vercel é `kassio8`, enquanto o repositório pertence a
`lucasandare490`. A Vercel está oferecendo criar uma cópia do repositório.

Enquanto isso, a demonstração pode ser executada localmente em:

```text
http://127.0.0.1:5173
```

Essa instância local já foi configurada para consumir a API pública do Render.

## Arquitetura

```text
Navegador React/Vite
        |
        | HTTPS / JSON
        v
API Java Spring Boot no Render
        |
        | JDBC TLS / Session Pooler
        v
PostgreSQL Supabase
```

O frontend e o Android não usam SDK Supabase. A API Java é responsável por:

- autenticação;
- sessões;
- autorização por perfil;
- isolamento entre estabelecimentos;
- regras financeiras;
- migrations e acesso ao banco.

## Supabase

O projeto Supabase foi criado e conectado ao backend. Foram configuradas duas
roles separadas:

- `split_app`: execução normal da aplicação;
- `split_owner`: execução das migrations.

O banco usa o Session Pooler na porta 5432 e certificado CA com `verify-full`.
As migrations Flyway V1–V5 foram validadas no PostgreSQL remoto.

Nenhuma senha ou chave privada deve ser colocada nesta documentação ou no
repositório.

## Render

O backend é construído a partir de:

```text
backend/Dockerfile
```

O Blueprint está em:

```text
render.yaml
```

O serviço utiliza o plano gratuito. Como consequência, o Render pode suspender
temporariamente a aplicação após período de inatividade. O primeiro acesso
depois disso pode levar aproximadamente um minuto.

Variáveis sensíveis são cadastradas diretamente no painel do Render. O
certificado do Supabase é cadastrado como Secret File:

```text
supabase-ca.crt
```

## Vercel — próximo passo

Para publicar o frontend sem criar uma cópia do repositório:

1. Entrar na conta GitHub `lucasandare490` ou adicionar essa conta como Git Scope
   na Vercel.
2. Importar o repositório `Avanade` diretamente.
3. Usar o `vercel.json` já versionado.
4. Configurar:

```text
VITE_API_URL=https://planner-api-tvmg.onrender.com
```

5. Publicar o frontend.
6. Copiar o domínio gerado pela Vercel.
7. Atualizar `CORS_ORIGINS` no Render com o domínio final.

## Roteiro de demonstração

1. Abrir o frontend.
2. Criar uma conta e um estabelecimento vazio, ou entrar com uma conta de
   demonstração.
3. Mostrar o dashboard.
4. Registrar uma venda simulada.
5. Mostrar os valores bruto, tributo, taxa e líquido.
6. Registrar uma despesa.
7. Abrir o fluxo de caixa.
8. Abrir relatórios e simulação de split.
9. Encerrar a sessão e demonstrar novo login.

## Limites da demonstração

- Pagamentos e tributos são simulados.
- Não há movimentação financeira real.
- A maquininha Android não está incluída nesta apresentação.
- O Render Free pode apresentar atraso no primeiro acesso após inatividade.
- A publicação definitiva do frontend depende da conta GitHub com acesso ao
  repositório original.
- O ambiente atual é uma demonstração funcional, não um aceite de produção,
  carga ou conformidade fiscal.

## Operação pós-publicação

O workflow `Monitoramento público` verifica a cada 30 minutos a saúde da API,
o carregamento do frontend e o CORS entre os dois serviços. Também pode ser
executado manualmente no GitHub Actions.

O backup de dados continua sendo uma operação controlada: usar
`backend/scripts/backup.sh` com `pg_dump`, `.pgpass` e destino novo com permissão
restrita. O backup deve ser armazenado fora do repositório e sua restauração
deve ser testada em banco separado. Não colocar senhas no workflow nem executar
rotinas de limpeza automática sem uma política aprovada.

Para agendar em um servidor seguro, usar `scripts/operacao/backup-agendado.sh`
com `BACKUP_DIR` apontando para armazenamento protegido. O script não apaga
backups antigos nem sobrescreve destinos; retenção e cópia externa devem ser
definidas pelo responsável operacional.

## Commits relacionados

```text
fe4391e  chore: preparar deploy no Render e Vercel
e268a72  chore: usar plano gratuito no Render
05a5a9e  docs: registrar roteiro de demonstracao ao supervisor
```
