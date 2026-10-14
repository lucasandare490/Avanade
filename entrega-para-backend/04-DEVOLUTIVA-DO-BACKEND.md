> Atualização de 14/10/2026: integração web implementada; [guia atual e validação](../frontend/documentacao/INTEGRACAO-BACKEND.md). O conteúdo abaixo registra os incrementos anteriores do backend; o Android continua separado.

# Devolutiva — backend e banco, incrementos 0.1 e 0.2

## Identificação

- Implementação: Codex, sob autorização de desenvolvimento de12/10/2026; responsável humano pelo aceite ainda a definir.
- Repositório local: Avanade, branch main, base e45ffda. Alterações locais sem commit/tag/push.
- Contrato: HTTP `/api/v1`, OpenAPI1.0.0, aplicação0.1.0-SNAPSHOT.
- Java21 / Spring Boot3.5.16 / Maven3.9.11 / PostgreSQL17.11.
- Pagamentos, tributo e roteamento: exclusivamente SIMULADO.
- Frontend e Android preservados. Nenhuma integração de tela foi declarada pronta.

## Pacote entregue

- [x] Código backend e Maven Wrapper em [backend](../backend/README.md).
- [x] README, configuração e `.env.example` sem credenciais reais.
- [x] Dockerfile/Compose com volume e healthchecks; **execução Docker não validada** neste ambiente.
- [x] [OpenAPI exportado](../backend/docs/openapi.json), [contrato e matriz de endpoints](../backend/docs/API.md).
- [x] Smoke HTTP reproduzível e exemplo de venda sintética confirmada.
- [ ] Exemplos completos de todos os estados/erros para aceite dos parsers dos clientes.
- [x] Migrations V1–V3, seed controlada com duas lojas e três perfis.
- [x] [Diagrama/dicionário](../backend/docs/BANCO.md), constraints e índices.
- [x] [Relatório de validação](../backend/docs/VALIDACAO.md):28 testes aprovados, PostgreSQL real, concorrência e isolamento.
- [x] Reinício preservando intenção e backup/restore em banco descartável, com evidências.
- [x] [Decisões](../backend/docs/DECISOES.md), [checklist do incremento](../backend/docs/CHECKLIST.md) e marcações BE/BD com referência de evidência.

## Execução

Seguir [README](../backend/README.md). Sem Docker: Java21, exportar DEMO_PASSWORD (12–72 caracteres), `cd backend && ./scripts/run-local.sh`. Launcher sobe PostgreSQL real local, aplica Flyway, cria seed apenas quando habilitada e inicia API. Dados em `.local/postgres`, ignorados pelo Git. `Ctrl+C` encerra sem apagar dados; repetir comando preserva registros.

- API local: http://127.0.0.1:8080/api/v1.
- Swagger demo: http://127.0.0.1:8080/swagger-ui/index.html.
- Health: http://127.0.0.1:8080/actuator/health.
- CORS: http://127.0.0.1:5173 e http://localhost:5173.
- Contas: gerente1/financeiro1/operador1@demo.local; sufixo2 para outra loja; senha configurada localmente na primeira criação.
- Android: endpoint HTTPS compartilhado ainda não provisionado. `127.0.0.1` no aparelho não é o computador; o cliente atual exige HTTPS. Não houve bypass dessa política.
- Testes: `./scripts/check.sh`; HTTP: `python3 scripts/smoke.py`, reinício: `python3 scripts/smoke.py --recover`.

## Contratos devolvidos

| Tema | Decisão |
|---|---|
| Autenticação | Bearer opaco, hash no banco,60min, logout revogável; sem refresh/cookie |
| Loja/perfis | Contexto da sessão; GERENTE/FINANCEIRO/OPERADOR; isolamento no servidor e FKs |
| Dinheiro | BRL, centavos inteiros, limite individual100.000.000; pontos-base; HALF_UP/resíduo |
| Datas | Instantes UTC; datas civis/filtros inclusivos no fuso da loja; até366dias |
| Pagamento/split/parcelas | Estados separados; operação null sem cálculo; máquina documentada |
| Idempotência | Header Idempotency-Key; loja/ação/chave; mesma entrada recupera, divergência409 |
| Retomada | 200 com operação JSON; lock por operação e preservação de parcelas confirmadas |
| Despesas | Pagas; STOCK/SERVICES/OPERATING; ID e recuperação durável |
| Caixa | Líquido na conclusão; despesas uma vez; abertura pelo histórico, saldo negativo permitido |
| Listas | Página1, tamanho20/máximo100, data+UUID; snapshot por consulta |
| Simulação | Sem escrita financeira; exemplo15000/1500/300/13200 |
| Explicação | MockAIProvider local, fatos do servidor, fallback com indicadores |
| Erros | code/message/fieldErrors/correlationId; status documentados no contrato |
| Projeção/tendências | Pendentes por decisão expressa do usuário; resumo textual não substitui |
| Exportação/PSP real/crédito/cancelamento | Não implementados neste incremento |

As rotas/capacidades disponíveis, permissões, entradas/saídas e diferenças dos consumidores estão na [matriz HTTP](../backend/docs/API.md). IDs e resposta real em [sale-confirmed.json](../backend/docs/examples/sale-confirmed.json).

## Validação

| Verificação | Resultado / evidência |
|---|---|
| Build e testes |28 aprovados,0 falhas/erros; [resultado](../backend/docs/test-results.json) |
| PostgreSQL |17.11 real; migrations em base vazia; runtime sem DDL; constraints testadas |
| Concorrência | Venda com mesma chave e retomadas com chaves diferentes sem duplicação |
| Histórico | Mudança de regra preserva snapshot; trilha de hashes validada |
| Consultas e caixa | Lotes, snapshot concorrente, datas e EXPLAIN; [incremento 0.2](../backend/docs/INCREMENTO-02.md) |
| Queda após commit | JVM encerrada antes do corpo HTTP; replay sem duplicação; [evidência](../backend/docs/crash-recovery.json) |
| Reinício | Resposta recuperada integralmente igual; [evidência](../backend/docs/restart-evidence.json) |
| Backup/restore |12 tabelas com contagem e conteúdo idênticos; [evidência](../backend/docs/restore-evidence.json) |
| Upgrade estrutural com dados | Pendente; reinício revalidou mesmas migrations, não simula upgrade futuro |
| Web/POS real | Pendente de autorização para integração e aceite conjunto |

## Pendências e responsáveis

| Pendência | Impacto | Responsável a confirmar |
|---|---|---|
| Projeção/tendências e regras estatísticas | Requisito MVP ainda aberto conforme escolha do usuário | Responsável funcional + backend |
| Mapeamento de contratos/sessão web e Android | Telas permanecem demonstrativas; pagamento sem operação precisa tratamento | Equipes clientes; autorização específica do usuário |
| HTTPS/POS, Docker executado, ambiente compartilhado | Sem aceite em dispositivo real/infraestrutura | Infraestrutura + backend |
| Carga sustentada e upgrade com dados | Limites operacionais ainda não homologados | Backend |
| CI remoto e análise de vulnerabilidades | Verificação local pronta; automação hospedada/scan pendentes | Backend + responsável pelo repositório |
| Retenção/anonimização e backup operacional | Políticas e responsáveis não presumidos | Responsável do projeto |
| Classificação sugerida e alertas P3 | Fora deste incremento; exigem regras correspondentes | Produto + backend |

Não há prazo acordado para essas pendências. Esta é uma entrega funcional inicial do backend, não aceite integral do MVP nem implantação em produção.
