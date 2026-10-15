# Backend do Planner Comercial — estado de 15/10/2026

Backend demonstrativo Java/Spring/PostgreSQL. Pagamentos, destinos e tributo são **simulados**. Frontend web conectado em 14/10/2026; O contrato Android está implementado, mas a homologação em aparelho com HTTPS permanece pendente. [Guia da integração web](../frontend/documentacao/INTEGRACAO-BACKEND.md). Para iniciar o conjunto, execute `./scripts/dev.sh` na raiz do repositório.

## Windows

Na raiz do projeto, com JDK 21 instalado:

```powershell
.\scripts\iniciar-backend-local.ps1 -Jdk 'C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot'
```

Ajuste o caminho para o JDK instalado. O launcher reconhece uma API já ativa sem encerrar processos. Código Java alterado exige encerrar a instância anterior pelo terminal de origem e reiniciar. Em outro terminal, use `npm.cmd run dev` na raiz para abrir o frontend.

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

Contas sintéticas: `gerente1@demo.local`, `financeiro1@demo.local`, `operador1@demo.local`; sufixo `2` para segunda loja. Todas recebem a senha informada apenas na primeira criação. Na sessão de desenvolvimento atual, foi gerada uma senha local em `.local/demo-password` (arquivo privado e ignorado pelo Git). Gerente: consultar/vender/financeiro/despesa/retomar; financeiro: consultar/financeiro/despesa; operador: consultar/vender. Relatórios financeiros e exportação possuem autorização própria, validada pelo servidor.

## Docker Compose

```bash
cp .env.example .env
# Preencha MIGRATION_PASSWORD, DATABASE_PASSWORD e DEMO_PASSWORD com valores distintos.
docker compose up --build -d
docker compose logs -f api
docker compose down
```

Volume `pgdata` persiste; `down` sem `-v` preserva dados. Banco não publica porta. Runtime `split_app` separado de migration `split_owner`. Compose, reinício e restauração foram validados no GitHub: 15 tabelas tiveram conteúdo comparado. Docker não foi executado neste Windows. Veja o relatório atual para o commit validado. Nunca reutilizar credenciais demo em produção.

## Executar com PostgreSQL gerenciado localmente

Provisionar banco vazio, proprietário de migrations e role `split_app` conforme `docker/init-runtime.sh`. Exportar variáveis descritas em `.env.example` (Spring não lê `.env` sozinho); então:

```bash
./mvnw verify
java -jar target/split-backend-0.1.0-SNAPSHOT.jar
```

Flyway aplica migrations e Hibernate valida, sem `ddl-auto=update`. Para popular contas demo, definir `SPRING_PROFILES_ACTIVE=demo` e `DEMO_PASSWORD`. Sem demo, não são criadas contas/regra fictícia; o cadastro público de loja/gerente existe, mas não fabrica uma regra financeira quando o servidor não a possui. Executar alterações futuras via novas migrations, nunca editar arquivos aplicados. Em produção futura, separar execução de migrations do processo runtime e habilitar TLS/proxy após aprovação.

## Testar e reproduzir

```bash
./mvnw verify
# Com API local ativa e DEMO_PASSWORD exportada:
python3 scripts/smoke.py
```

Validação atual e resultados por commit: [relatório consolidado](../documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md).

JUnit usa PostgreSQL17.11 descartável, porta aleatória, sem Docker/H2. Testa cálculo, HTTP/MockMvc, tenants, permissões, idempotência, concorrência, falhas, despesas, constraints e fallback. Resultados em `target/surefire-reports`; relatório resumido em `docs/VALIDACAO.md`. O smoke usa HTTP real e não imprime tokens/senha.

## Documentação

- [Contratos e exemplos](docs/API.md), [OpenAPI exportado](docs/openapi.json), [decisões](docs/DECISOES.md).
- [Modelo e dicionário](docs/BANCO.md), [validação e pendências](docs/VALIDACAO.md), [checklist do incremento](docs/CHECKLIST.md).
- Backup: `scripts/backup.sh novo-arquivo.dump` com variáveis padrão do PostgreSQL; restore: `scripts/restore.sh arquivo.dump` apontando `PGDATABASE` para banco descartável vazio. Scripts não apagam banco existente. Backup deve ter acesso restrito e armazenamento protegido; retenção/responsáveis ainda precisam de definição.

## Capacidades e limites atuais

Cadastro, edição do nome da loja, recuperação de split sem regra, relatórios, interpretação de tendências, explicação específica, projeção manual, sugestão revisável de categoria e caixa semanal estão implementados. [Contrato dessas capacidades](docs/INCREMENTO-FUNCIONAL-2026-10-15.md).

Pagamentos permanecem simulados. Pagamento pendente não é confirmado automaticamente pelo tempo. Não há PSP real, crédito ou cancelamento. IA externa é opcional; o padrão é MockAIProvider identificado. Faltam homologação física Android, implantação HTTPS, carga sustentada e decisões operacionais de retenção/monitoramento. Testes locais e pipeline não são aceite de produção.
