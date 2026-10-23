# Entregáveis dos agentes — P5: evolução posterior

## Objetivo

Definir a próxima camada de produto depois do MVP, sem incluir melhoria de IA.
Esses itens não devem bloquear a demonstração atual nem alterar o contrato
estável sem migration e compatibilidade documentada.

## Ordem recomendada

1. Auditoria operacional.
2. Relatórios avançados.
3. Regras financeiras configuráveis.
4. Notificações.
5. Cancelamento e estorno.
6. Integração com PSP real.

## Pacote P5-A — Auditoria operacional

Registrar ator, loja, ação, entidade, resultado, correlação e horário para
alterações sensíveis. Dados financeiros não devem ser apagados sem trilha.

**Aceite:** consulta restrita ao gerente, paginação, retenção definida,
mascaramento de dados sensíveis e testes de isolamento.

## Pacote P5-B — Relatórios avançados

Evoluir relatórios atuais com filtros, exportação controlada, paginação e
comparação de períodos, mantendo valores em centavos e limites de consulta.

**Aceite:** totais reconciliam com operações e despesas; exportação respeita
permissão, período máximo e limite de registros.

## Pacote P5-C — Regras financeiras configuráveis

Permitir regras por categoria/estabelecimento com vigência, versionamento e
snapshot aplicado à venda. Nunca alterar uma regra histórica já utilizada.

**Aceite:** regra futura não muda venda passada; conflitos de vigência são
recusados; gerente é o único perfil autorizado; migration e testes históricos.

## Pacote P5-D — Notificações

Notificar eventos relevantes, como convite, recuperação, falha de operação e
resultado de processamento. Começar por adapter de e-mail/webhook configurável.

**Aceite:** retry limitado, idempotência, ausência de senha/token em mensagem e
registro de falha para reprocessamento.

## Pacote P5-E — Cancelamento e estorno

Modelar cancelamento como novo evento imutável, nunca como edição destrutiva da
venda. Definir permissões, janela temporal e impacto no caixa.

**Aceite:** operação original preservada, evento compensatório reconciliável,
idempotência, autorização e testes de concorrência.

## Pacote P5-F — PSP real

Somente iniciar quando houver provedor, credenciais de homologação, contrato de
webhook, política de segurança e ambiente de testes. Pagamentos reais não
devem ser simulados silenciosamente.

**Aceite:** adapter isolado, webhook autenticado, reconciliação, retry seguro,
logs sem dados sensíveis e chave de idempotência ponta a ponta.

## Explicitamente fora deste pacote

Não criar integração, prompt, adapter ou melhoria de IA. A explicação atual
continua identificada como demonstrativa/Mock até existir uma API autorizada.

## Critério para iniciar P5

P1-A a P1-E devem estar aceitos, backup/restauração testados, monitoramento
verde por pelo menos uma semana e uma release versionada publicada.
