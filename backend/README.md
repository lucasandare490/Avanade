# Backend Split — incrementos 0.1 e 0.2

Backend demonstrativo Java/Spring/PostgreSQL. Pagamentos, destinos e tributo são **simulados**. Frontend web conectado em 14/10/2026; Android permanece separado. [Guia da integração web](../frontend/documentacao/INTEGRACAO-BACKEND.md). Para iniciar o conjunto, execute `./scripts/dev.sh` na raiz do repositório.

## Executar localmente sem Docker

Requisitos: Linux/macOS suportado pelo binário PostgreSQL do Zonky, Java 21, Bash e acesso ao Maven Central na primeira execução. Não executar PostgreSQL como root.

```bash
cd backend
read -rsp 'Senha para as contas demo (12–72 caracteres): ' DEMO_PASSWORD; echo
export DEMO_PASSWORD
./scripts/run-local.sh
```

API: http://127.0.0.1:8080 — Swagger: http://127.0.0.1:8080/swagger-ui/index.html — health: http://127.0.0.1:8080/actuator/health.

O launcher de desenvolvimento está no source set de testes e usa PostgreSQL **real 17.11**, porta local54329, dados em `.local/postgres`. Não entra no JAR de produção. Usa autenticação trust do binário de teste, exclusivamente loopback: não usar em servidor compartilhado ou produção. `Ctrl+C` encerra; executar novamente preserva dados/seeds. Não apagar `.local` para parar.

Contas sintéticas: `gerente1@demo.local`, `financeiro1@demo.local`, `operador1@demo.local`; sufixo `2` para segunda loja. Todas recebem a senha informada apenas na primeira criação. Na sessão de desenvolvimento atual, foi gerada uma senha local em `.local/demo-password` (arquivo privado e ignorado pelo Git). Gerente: consultar/vender/financeiro/despesa/retomar; financeiro: consultar/financeiro/despesa; operador: consultar/vender. A API não anuncia exportação não implementada.

## Docker Compose

```bash
cp .env.example .env
# Preencha MIGRATION_PASSWORD, DATABASE_PASSWORD e DEMO_PASSWORD com valores distintos.
docker compose up --build -d
docker compose logs -f api
docker compose down
```

Volume `pgdata` persiste; `down` sem `-v` preserva dados. Banco não publica porta. Runtime `split_app` separado de migration `split_owner`. Compose/Dockerfile fornecidos, mas execução Docker não validada neste ambiente sem Docker. Nunca reutilizar credenciais demo em produção.

## Executar com PostgreSQL gerenciado localmente

Provisionar banco vazio, proprietário de migrations e role `split_app` conforme `docker/init-runtime.sh`. Exportar variáveis descritas em `.env.example` (Spring não lê `.env` sozinho); então:

```bash
./mvnw verify
java -jar target/split-backend-0.1.0-SNAPSHOT.jar
```

Flyway aplica migrations e Hibernate valida, sem `ddl-auto=update`. Para popular contas demo, definir `SPRING_PROFILES_ACTIVE=demo` e `DEMO_PASSWORD`. Sem demo, não são criadas contas/regra fictícia; onboarding público não está implementado. Executar alterações futuras via novas migrations, nunca editar arquivos aplicados. Em produção futura, separar execução de migrations do processo runtime e habilitar TLS/proxy após aprovação.

## Testar e reproduzir

```bash
./mvnw verify
# Com API local ativa e DEMO_PASSWORD exportada:
python3 scripts/smoke.py
```

Validação atual: **29 testes aprovados**, incluindo consultas em lote, limites de datas e queda após commit antes da resposta HTTP. [Relatório histórico do incremento 0.2](docs/INCREMENTO-02.md) e [integração web atual](../frontend/documentacao/INTEGRACAO-BACKEND.md).

JUnit usa PostgreSQL17.11 descartável, porta aleatória, sem Docker/H2. Testa cálculo, HTTP/MockMvc, tenants, permissões, idempotência, concorrência, falhas, despesas, constraints e fallback. Resultados em `target/surefire-reports`; relatório resumido em `docs/VALIDACAO.md`. O smoke usa HTTP real e não imprime tokens/senha.

## Documentação

- [Contratos e exemplos](docs/API.md), [OpenAPI exportado](docs/openapi.json), [decisões](docs/DECISOES.md).
- [Modelo e dicionário](docs/BANCO.md), [validação e pendências](docs/VALIDACAO.md), [checklist do incremento](docs/CHECKLIST.md).
- Backup: `scripts/backup.sh novo-arquivo.dump` com variáveis padrão do PostgreSQL; restore: `scripts/restore.sh arquivo.dump` apontando `PGDATABASE` para banco descartável vazio. Scripts não apagam banco existente. Backup deve ter acesso restrito e armazenamento protegido; retenção/responsáveis ainda precisam de definição.

## Limitações conhecidas

Projeção/tendências mantidas pendentes pelo usuário. Sem provedor IA externo, PSP real, créditos, cancelamentos, exportação, cadastro público ou integração do cliente Android. Pagamento mock PENDING não possui confirmação posterior automática. Falta de regra permanece consultável, mas exige futuro fluxo operacional para nova avaliação. Não declarar aceite integral do MVP por esta entrega.
