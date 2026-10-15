> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Integração web com o backend — 14/10/2026

O frontend React está conectado ao backend Spring/PostgreSQL pelo contrato `/api/v1`. O modo padrão é `api`; não há substituição por dados locais quando uma chamada falha. Pagamentos, tributos e provedor de explicações continuam simulados. Android, implantação pública e tendências/projeções do servidor têm escopo separado.

## Executar o conjunto

Na raiz de `Avanade`, com Java 21, Node/npm, Python 3 e curl disponíveis:

```bash
./scripts/dev.sh
```

Abra http://127.0.0.1:5173. O comando inicia a API na porta 8080, reutiliza o PostgreSQL local deste projeto quando já está ativo e inicia o Vite com proxy `/api`. Se a API já estiver saudável, ela é reutilizada. `Ctrl+C` encerra apenas os processos iniciados pelo comando; os dados em `backend/.local/postgres` são preservados. Logs: `backend/.local/server.log`.

Contas: `gerente1@demo.local`, `financeiro1@demo.local` e `operador1@demo.local`; sufixo `2` para outra loja. A senha local está em `backend/.local/demo-password`, arquivo privado ignorado pelo Git. Em uma instalação nova o comando gera esse arquivo; também é possível fornecer `DEMO_PASSWORD` no ambiente. A senha de contas existentes não é alterada pelo seed: use a senha definida na primeira execução.

Para executar separadamente, inicie `backend/scripts/run-local.sh` com `DEMO_PASSWORD` e rode `npm run dev` dentro de `frontend`. O frontend usa a mesma origem por padrão. Configure `API_PROXY_TARGET` para outro backend local ou `VITE_API_URL` para um endereço explícito. HTTP remoto é rejeitado; para uma publicação futura, sirva `/api` por um proxy HTTPS ou configure a URL HTTPS e o CORS do backend. O proxy do Vite é apenas de desenvolvimento/preview e não é incluído no build estático.

Para o cenário antigo somente no navegador, defina `VITE_MODO_DADOS=demo` em `frontend/.env.local`. O script `dev.sh` força `api`; para demo, use `npm run dev` diretamente.

## Fluxos conectados

- Login bearer, expiração, permissões por perfil e logout com revogação. O token fica somente em memória; recarregar exige novo login.
- Dashboard e caixa com totais do servidor, período inicial do mês corrente no fuso da loja, entradas líquidas, despesas e saldo negativo quando aplicável.
- Operações paginadas, pesquisa, datas, meio de pagamento, status, detalhe com parcelas/eventos/regra e retomada idempotente.
- Filtro web `pendente` usa o grupo `PENDENTE` no backend: CRIADA, SEPARADA e ROTEADA. O agrupamento ocorre antes da paginação.
- Vendas e detalhes consultáveis mesmo com pagamento pendente/recusado ou sem regra de split. A interface não inventa operação, parcelas ou entrada no caixa para esses casos.
- Despesas com categorias consultadas no servidor, validação de campos e recuperação idempotente.
- Simulação calculada pelo servidor e explicação demonstrativa baseada no período solicitado. Nenhuma chave de IA ou cálculo fiscal autoritativo fica no frontend.

## Resposta perdida e recuperação

Antes de enviar venda, despesa ou retomada, a interface registra chave, caminho e payload da intenção em `sessionStorage`, separados por loja/usuário e ação. Não armazena senha ou token. Após confirmação válida, remove a intenção. Falha de rede, timeout, 5xx ou resposta inválida preservam a chave. Uma tentativa com dados diferentes é bloqueada enquanto a anterior estiver sem confirmação.

Venda: escolha **Consultar a mesma tentativa** no POS. Despesa: escolha **Recuperar despesa** na tela de despesas. É possível recarregar a mesma aba e entrar com a mesma conta. A recuperação consulta `/requests/{action}/{key}`; se ainda não houver registro visível, reenvia exatamente a mesma intenção/chave. Retomadas reutilizam a chave pendente ao repetir a ação.

Limite: `sessionStorage` pertence à aba. Fechar a aba ou limpar o armazenamento pode remover o ponteiro local. Os registros confirmados permanecem no servidor e no histórico, mas não há recuperação automática da intenção em outro dispositivo. A interface não trata falha de comunicação como pagamento recusado.

## Verificação

Resultado: **89 testes do frontend, 29 do backend e 4 cenários de navegador aprovados**, além de build de produção aprovado. [Resumo das evidências](integracao-backend-resultados.json). O último `mvnw verify` foi em 13/10/2026; os testes web e build finais foram em 14/10/2026. A suíte do backend cobre o novo agrupamento de estados antes da paginação; as suítes web cobrem também vendas sem split e a preservação de chave na retomada.

```bash
# Na raiz, com o conjunto local ativo:
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
# Em backend:
./mvnw verify
```

Os testes de navegador usam Google Chrome instalado; `PLAYWRIGHT_CHANNEL` permite escolher outro canal instalado. Alternativamente, instale o navegador do Playwright e ajuste a configuração. `DEMO_PASSWORD` pode fornecer a senha de teste; por padrão ela é lida do arquivo local privado. Os testes E2E geram vendas/despesas simuladas nas lojas demo do banco local. Não execute contra dados de produção. `E2E_URL` permite indicar outro frontend de teste.

Os cenários de navegador incluem login, venda, consulta, despesas, caixa, simulação, explicação, perfis, isolamento entre lojas e logout. Interceptações de rede descartam a resposta **depois** que a API real gravou a venda/despesa, para testar recuperação sem duplicar o POST. O relatório local é gerado em `frontend/test-results/integracao.json`, sem traces de autenticação.

## Limites preservados

Sem PSP real, arrecadação real, IA externa, exportação completa, crédito, cancelamento, confirmação posterior automática de pagamento PENDING ou tendências/projeções no backend. Esses itens não são anunciados como entregues por esta integração. O aplicativo Android não foi alterado nesta etapa. A documentação de entregas anteriores descreve o estado histórico; este documento registra a integração web atual.
