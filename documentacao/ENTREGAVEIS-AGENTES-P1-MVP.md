# Entregáveis dos agentes — P1: evolução do MVP

## Objetivo

Transformar a demonstração publicada em um MVP utilizável por uma equipe real,
sem alterar a arquitetura `Vercel → Render → Supabase`.

## Ordem obrigatória

1. Recuperação de acesso.
2. Convite de usuários.
3. Edição e exclusão controlada de despesas.
4. Feedback de cold start e indisponibilidade.
5. Testes públicos automatizados.

Cada item deve ser entregue com teste, documentação curta e sem credenciais no
repositório. O agente que editar um arquivo deve ser o único responsável por ele
durante a tarefa.

## Pacote P1-A — Recuperação de acesso

**Responsável sugerido:** desenvolvedor + revisor de segurança.

**Escopo:** criar fluxo de solicitação e conclusão de recuperação de senha com
token de uso único, expiração curta, armazenamento apenas do hash do token e
resposta que não revele se o e-mail existe. O envio real de e-mail pode começar
com um adapter de desenvolvimento/log controlado, mas a API deve estar pronta
para um provedor SMTP.

**Arquivos prováveis:**

- `backend/src/main/java/br/com/avanade/split/auth/`
- nova migration em `backend/src/main/resources/db/migration/`
- contratos em `frontend/src/servicos/`
- tela em `frontend/src/telas/`

**Aceite:**

- token expira e não pode ser reutilizado;
- senha antiga deixa de funcionar após conclusão;
- respostas não permitem enumeração de usuários;
- senha continua com 12–72 caracteres e BCrypt;
- testes cobrem token inválido, expirado, reutilizado e sucesso;
- frontend informa sucesso de forma genérica.

## Pacote P1-B — Convite de usuários

**Responsável sugerido:** desenvolvedor backend + testador de permissões.

**Escopo:** gerente convida usuário para o próprio estabelecimento, define
perfil permitido e o convidado aceita o convite uma única vez.

**Arquivos prováveis:**

- `backend/src/main/java/br/com/avanade/split/auth/`
- migration de convites;
- `frontend/src/telas/TelaConfiguracoes.tsx`;
- contratos e testes de integração.

**Aceite:**

- gerente só convida para a própria loja;
- financeiro e operador não criam convites;
- token é único, expirável e não aparece em logs;
- convite aceito não pode ser aceito novamente;
- testes cobrem isolamento entre lojas e permissões 403;
- UI mostra pendente, aceito, expirado e cancelado.

## Pacote P1-C — Despesas editáveis

**Responsável sugerido:** desenvolvedor financeiro + testador de invariantes.

**Escopo:** permitir edição e exclusão somente conforme permissão, preservando
histórico mínimo/auditoria e impedindo alteração entre estabelecimentos.

**Arquivos prováveis:**

- `backend/src/main/java/br/com/avanade/split/finance/FinanceController.java`;
- `backend/src/main/java/br/com/avanade/split/finance/FinanceService.java`;
- `frontend/src/telas/TelaDespesasIntegrada.tsx`;
- nova migration e testes.

**Aceite:**

- gerente/financeiro seguem a política definida; operador recebe 403;
- valor, categoria e data são validados;
- exclusão não permite apagar registro de outra loja;
- caixa e relatórios refletem a alteração;
- operações são idempotentes quando aplicável;
- UI pede confirmação antes de excluir.

## Pacote P1-D — Resiliência do frontend

**Responsável sugerido:** desenvolvedor frontend + revisor UX.

**Escopo:** diferenciar cold start do Render, timeout, 503 e erro de validação;
orientar o usuário sem duplicar venda ou despesa.

**Arquivos prováveis:**

- `frontend/src/servicos/transporteApi.ts`;
- `frontend/src/utilitarios/`;
- telas de entrada e operação;
- testes de interface.

**Aceite:**

- mensagem informa quando o serviço está acordando;
- retry é explícito e limitado;
- operações com idempotência não são reenviadas cegamente;
- mensagens não expõem stack trace ou segredo;
- acessibilidade continua aprovada.

## Pacote P1-E — Testes públicos

**Responsável sugerido:** testador.

**Escopo:** smoke automatizado contra as URLs públicas, sem usar credenciais
reais nem criar dados irreversíveis sem limpeza controlada.

**Aceite:**

- health, frontend e CORS continuam cobertos pelo workflow existente;
- fluxo de cadastro usa dados descartáveis e política explícita de limpeza;
- login/logout e uma consulta autenticada são cobertos;
- falha gera log suficiente para diagnóstico;
- não há tokens ou senhas nos artefatos do Actions.

## Fora do P1

Não implementar IA externa, novo provedor de IA ou alteração do adapter
`MockAIProvider`. A IA permanece demonstrativa até existir uma API autorizada.
