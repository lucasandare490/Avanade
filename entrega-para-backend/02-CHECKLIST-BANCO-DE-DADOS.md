# Checklist — Banco de dados PostgreSQL

Objetivo: persistir o domínio com consistência, isolamento por estabelecimento, recuperação de tentativas e rastreabilidade. Este é um desenho proposto para ratificação, não migrations executadas. O banco é responsabilidade do backend; web e Android não recebem usuário/senha do PostgreSQL.

## Modelo lógico proposto

| Entidade | Campos principais | Integridade e uso |
|---|---|---|
| merchant | id, nome público, timezone, status, created_at | Referência obrigatória nos recursos da loja |
| app_user | id, e-mail normalizado, password_hash, status | Unicidade conforme política; hash nunca exposto |
| merchant_user | merchant_id, user_id, role, status | Par único; permite vínculo autorizado por loja |
| session | id, user_id, merchant_id, expires_at, revoked_at, token_hash quando aplicável | Nunca armazenar token cru se só o hash for necessário |
| rule_version | id, código, versão, vigência, modo, parâmetros e fonte | Versão imutável após uso; parâmetros demonstrativos identificados |
| sale | id, merchant_id, actor_id, gross_cents, currency, payment_method, category, created_at | Valor positivo; contexto autenticado; vínculo com intenção |
| payment | id, merchant_id, sale_id, state, provider_reference, confirmed_at | Pagamento separado do split; chave externa única quando aplicável |
| split_operation | id, merchant_id, sale_id, state, tax_cents, fee_cents, net_cents, rule_version_id, rule_snapshot, version | Composição consistente e atualização concorrente controlada |
| split_parcel | id, merchant_id, operation_id, kind, amount_cents, destination_ref, public_destination, state, confirmed_at | Identidade única por parcela; retomada não recria confirmado |
| operation_event | id, merchant_id, operation_id, sequence, event_type, occurred_at, public_description, correlation_id | Append-only; sequência única dentro da operação |
| ledger_entry | id, merchant_id, source_type, source_id, event_key, direction, amount_cents, recognized_at | Efeito financeiro único; distinguir evento descritivo de lançamento |
| expense_category | id, merchant_id ou catálogo global explícito, name, active | Categoria consultável; preservar referência histórica |
| expense | id, merchant_id, actor_id, category_id, description, amount_cents, paid_on, created_at | Escopo inicial: já paga; não inferir vencimento/recorrência |
| idempotency_request | merchant_id, action, key, request_hash, state, resource_id, response_status, response_body restrito, created_at, expires_at | UNIQUE(merchant_id, action, key); retenção definida |
| outbox_event (se assíncrono) | id, aggregate_id, type, payload mínimo, created_at, delivered_at, attempts | Commit junto ao domínio; consumidor idempotente |
| audit_event | id, actor_id, merchant_id, action, target_id, occurred_at, correlation_id | Auditoria de acesso/mudança; não substitui ledger |

Nomes são sugestões. O responsável deve entregar diagrama, dicionário, migrations e índices reais. A quantidade de entidades pode variar com o desenho adotado, mas as responsabilidades acima precisam estar cobertas.

Valores internos do cliente cabem em inteiros seguros de JavaScript. Se usar BIGINT no PostgreSQL, limitar ao intervalo acordado ou serializar como decimal textual e ajustar o adapter; BIGINT arbitrário não é automaticamente seguro como JSON number. Saldo pode ser negativo; valor de venda/parcela/despesa não. `timestamptz` representa instantes; `date` é apropriado para data de pagamento quando esse é o dado de negócio, com regra explícita de fuso para agregação.


## 01. Migrations e inicialização

- [ ] BD-001 — Fixar versão do PostgreSQL e extensão necessária; não exigir extensão sem justificativa.
- [ ] BD-002 — Escolher Flyway ou Liquibase e versionar todas as mudanças de schema.
- [ ] BD-003 — Não depender de ddl-auto=update como mecanismo de entrega/produção.
- [ ] BD-004 — Separar migrations estruturais de seeds demonstrativas e impedir seed em ambiente real por acidente.
- [ ] BD-005 — Criar esquema do zero com um comando reproduzível e validar nova execução sem duplicação.
- [ ] BD-006 — Documentar atualização de versão existente, compatibilidade e estratégia de rollback ou forward fix.
- [ ] BD-007 — Não editar migration já aplicada; criar versão nova.
- [ ] BD-008 — Entregar diagrama e dicionário com tipo, nullability, default, PK, FK, índices e regra de cada coluna.

## 02. Restrições e relações

- [ ] BD-009 — Criar PKs estáveis e FKs para vendas, operações, parcelas, eventos, despesas e usuários.
- [ ] BD-010 — Aplicar NOT NULL nos campos que o domínio exige, não apenas validação no DTO.
- [ ] BD-011 — Aplicar CHECK para valores não negativos/positivos e moeda suportada conforme contexto.
- [ ] BD-012 — Impedir vínculo de operação/parcela/despesa com loja divergente, usando chave composta/FK ou mecanismo equivalente.
- [ ] BD-013 — Documentar cardinalidade venda-operação e venda-pagamento; não presumir 1:1 se houver múltiplas tentativas.
- [ ] BD-014 — Garantir unicidade de chave idempotente por loja e ação.
- [ ] BD-015 — Garantir unicidade de evento financeiro/effect key para evitar dupla contabilização.
- [ ] BD-016 — Garantir unicidade da sequência do evento dentro da operação.
- [ ] BD-017 — Controlar estados válidos por constraints ou catálogo, com migration para evolução.
- [ ] BD-018 — Não usar cascata destrutiva que apague histórico financeiro ao excluir usuário/loja.
- [ ] BD-019 — Preservar regra histórica imutável e snapshot usado no cálculo.
- [ ] BD-020 — Validar composição dentro de transação; soma entre linhas de parcelas exige estratégia além de CHECK isolado por linha.

## 03. Transações e concorrência

- [ ] BD-021 — Definir fronteira transacional da criação: intenção, venda, operação, parcelas e eventos consistentes.
- [ ] BD-022 — Capturar conflito de unicidade e retornar a intenção existente ou conflito de entrada conforme contrato.
- [ ] BD-023 — Usar lock de linha, controle otimista/versionamento ou estratégia equivalente para transições concorrentes.
- [ ] BD-024 — Não executar chamada externa longa ou IA mantendo lock/transação aberta.
- [ ] BD-025 — Definir estados intermediários duráveis quando a integração externa ocorrer fora da transação.
- [ ] BD-026 — Usar outbox quando publicação de evento precisar acompanhar commit sem dupla escrita insegura.
- [ ] BD-027 — Implementar consumidor idempotente/inbox para mensagens duplicadas quando houver fila.
- [ ] BD-028 — Definir política limitada de repetição para deadlock/serialization failure; repetir a transação inteira quando necessário.
- [ ] BD-029 — Testar duas criações simultâneas com mesma chave usando conexões distintas.
- [ ] BD-030 — Testar duas retomadas simultâneas e confirmar que cada efeito/ledger ocorre uma vez.
- [ ] BD-031 — Testar queda antes do commit, depois do commit e antes da resposta HTTP.
- [ ] BD-032 — Garantir que consultar o estado de uma tentativa não crie novo efeito financeiro.

## 04. Ledger, caixa e histórico

- [ ] BD-033 — Definir se ledger é de eventos ou contábil; se contábil, documentar contas e regra de partidas conciliadas.
- [ ] BD-034 — Não confundir descrição de evento com entrada de caixa.
- [ ] BD-035 — Gravar momento de reconhecimento e identificador único da origem do movimento.
- [ ] BD-036 — Consultar somente lançamentos reconhecidos para saldo realizado.
- [ ] BD-037 — Derivar saldo inicial do histórico ou saldo de abertura formalmente registrado, nunca de constante oculta.
- [ ] BD-038 — Documentar ajuste de saldo e sua origem; não alterar saldo final manualmente sem evento.
- [ ] BD-039 — Não duplicar tributo/taxa como despesa após desconto na composição.
- [ ] BD-040 — Preservar histórico após atualização de nome/categoria/regra.
- [ ] BD-041 — Definir correção por compensação ou nova versão quando o escopo permitir; não apagar rastreabilidade.
- [ ] BD-042 — Definir reconciliação de soma de parcelas, venda, operação e movimentos.
- [ ] BD-043 — Testar agrupamentos com fuso de negócio, virada de dia/mês e períodos sem movimento.
- [ ] BD-044 — Definir consistência entre indicadores e listas quando há gravação concorrente.

## 05. Índices, consultas e desempenho

- [ ] BD-045 — Indexar listas por merchant_id, data de ordenação e ID de desempate.
- [ ] BD-046 — Adicionar índices para FKs e filtros frequentes conforme planos observados, não em toda coluna indiscriminadamente.
- [ ] BD-047 — Indexar busca por idempotência e referência de operação/pagamento.
- [ ] BD-048 — Indexar ledger por loja e recognized_at para períodos e saldo inicial.
- [ ] BD-049 — Indexar despesas por loja e paid_on e definir busca por descrição conforme necessidade.
- [ ] BD-050 — Limitar tamanho de páginas e consultas de período; evitar retornar toda a base.
- [ ] BD-051 — Revisar N+1 do ORM em listas e detalhes; retornar DTOs explícitos.
- [ ] BD-052 — Usar EXPLAIN ANALYZE em base sintética representativa e registrar plano/tempo, sem dados reais.
- [ ] BD-053 — Definir paginação estável; cursor pode ser necessário quando offset não atender o volume.
- [ ] BD-054 — Definir pool de conexões, timeout de statement e limites de recursos.
- [ ] BD-055 — Não criar cache/agregado materializado sem regra de atualização e reconciliação.

## 06. Acesso, backup e operação

- [ ] BD-056 — Separar usuário de migration do usuário de runtime, com privilégios mínimos.
- [ ] BD-057 — Não expor PostgreSQL para web/Android ou para internet aberta.
- [ ] BD-058 — Manter credenciais em configuração segura e nunca em código, imagem Docker, relatório ou dump público.
- [ ] BD-059 — Aplicar isolamento por loja em toda query; se usar RLS, documentar contexto por conexão e impedir vazamento pelo pool.
- [ ] BD-060 — Proteger backups com acesso restrito e retenção definida.
- [ ] BD-061 — Entregar comandos de backup e restore e executar restauração em banco descartável.
- [ ] BD-062 — Verificar que restauração conserva intenções, chaves, eventos e relacionamentos.
- [ ] BD-063 — Definir retenção/anonimização com responsáveis; não apagar registros fiscais/financeiros sem política aprovada.
- [ ] BD-064 — Monitorar locks, conexões, espaço, falhas de migration e tempo de consultas.
- [ ] BD-065 — Entregar seeds sintéticas com duas lojas, três perfis, operações em todos os estados e despesas em períodos diferentes.
- [ ] BD-066 — Não considerar testes em banco em memória como evidência suficiente de constraints/transações PostgreSQL.
- [ ] BD-067 — Entregar relatório de migrations, testes de concorrência e restore com versões e comandos executados.

## Referências técnicas

- [Constraints PostgreSQL](https://www.postgresql.org/docs/current/ddl-constraints.html): tipos de restrição e integridade.
- [Isolamento de transações](https://www.postgresql.org/docs/18/transaction-iso.html): concorrência, serialização e tratamento de conflitos.

As regras financeiras e de negócio deste projeto precisam de ratificação própria; estes links documentam o banco, não validam alíquotas ou legislação.
