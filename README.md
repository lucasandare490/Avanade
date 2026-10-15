> **Estado atual:** consulte o [incremento de integração e validação](documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> Para executar no VS Code e apresentar: [guia de execução](COMO-APRESENTAR.md).

> **Incremento local de tendências e dashboard:** comparação persistida, consulta independente da explicação e composição diária implementadas. Consulte [evidências e limites](documentacao/revisao-2026-10-14/INCREMENTO-TENDENCIAS-E-DASHBOARD.md). Esta atualização não encerra todas as pendências.

# Planner Comercial — Split Tributário

Projeto acadêmico da Squad 19, GrowUp/Senac com Avanade, voltado a pequenos estabelecimentos. A proposta é mostrar como o valor de uma venda se divide entre tributo, taxa e líquido, registrar o caminho de cada parcela e permitir acompanhar operações, despesas e fluxo de caixa.

## Problema e usuários

O comerciante precisa entender quanto recebeu e para onde foi cada parcela, sem fazer conciliações manuais complexas. A responsável financeira precisa consultar histórico, conferir o líquido e acompanhar o caixa. O operador do Smart POS precisa registrar vendas rapidamente e distinguir pagamento confirmado de split concluído.

As personas são Carlos (comerciante), Mariana (financeiro) e João (operador). A solução combina um painel web com um aplicativo Android. O fluxo principal é venda → pagamento → cálculo → separação e direcionamento → registro → consulta.

## Estado atual — revisão de 14/10/2026

Esta pasta contém backend e banco implementados e integração web. A revisão local aprovou **89 testes web, 29 backend e 4 cenários no navegador**, além dos builds. O Android ainda não está conectado a esta API. A pasta `Avanade-main` é uma cópia sem `.git`; não confundir o nome da pasta com evidência de branch ou publicação.

**Persistência no PostgreSQL é real; pagamento, roteamento, regras tributárias e explicações permanecem simulados.** Não há arrecadação real, PSP ou IA externa. Valores de 10% e 2% são fictícios. Uma venda de R$ 150,00 no cenário padrão gera R$ 15,00 de tributo, R$ 3,00 de taxa e R$ 132,00 líquidos. Sem taxa, o exemplo de simulação resulta em R$ 135,00.

| Área | Implementado | Limite atual |
|---|---|---|
| Acesso web | Login bearer, perfis, contexto de loja e logout | Contas provisionadas por seed; sem cadastro público/recuperação de senha |
| Vendas | Registro, pagamento mock, parcelas, eventos e consulta | Pagamento pendente sem confirmação automática posterior |
| Recuperação | Chave persistente no servidor, replay, conflito e retomada | Ponteiro web pertence à mesma aba; PSP externo não incluído |
| Financeiro | Despesas pagas, categorias e caixa por período | Sem recorrência/ajuste manual de saldo |
| Dashboard API | Abertura, entradas líquidas, despesas e saldo | Ainda não reproduz todos os gráficos e composição da demo |
| Explicações | MockAIProvider com fatos consultados no servidor | Tendências e interpretação por IA externa pendentes |
| Android | Kotlin demonstrativo, APK e testes JVM históricos | Contrato concreto, HTTPS e aceite em dispositivo pendentes |
| Relatórios/configurações | Consultas, detalhes e exportações demo | Exportação API e módulos administrativos completos não entregues |

## Tecnologias e organização

- `frontend/`: React 19, TypeScript, Vite, CSS próprio, ícones Lucide e fontes locais. `src/telas` reúne telas; `src/componentes`, elementos compartilhados; `src/servicos`, transporte, sessão, adapters e intenções.
- `backend/`: Java 21, Spring Boot 3.5.16, Maven Wrapper, PostgreSQL 17.11 e Flyway. Domínios `auth`, `core`, `finance`, `shared` e `config`. Controllers recebem entradas; serviços aplicam regras e persistem; clientes não acessam o banco diretamente.
- `android-pos/`: Kotlin nativo e Gradle. Código de interface, estado, repositório demonstrativo e transporte HTTPS separado.
- `entrega-para-backend/`: 152 critérios backend, 67 critérios banco, contratos e devolutiva.
- `frontend/documentacao/`: 297 critérios frontend, evidências e guias.
- `documentacao/revisao-2026-10-14/`: comparação entre entregas, matriz consolidada e resultados atuais.

## Banco, segurança e rastreabilidade

Migrations V1–V3 criam 14 tabelas de domínio. O modelo separa venda, pagamento, operação, parcelas, eventos e movimento de caixa. O líquido entra no caixa ao concluir o split; despesa paga produz uma única saída. FKs compostas ajudam a impedir vínculos entre lojas diferentes.

O servidor valida a sessão e as permissões. Senhas usam BCrypt; somente o hash do bearer fica no banco. Tokens do navegador ficam em memória. A idempotência combina chave por loja/ação, hash da entrada, lock e resposta persistida. A mesma intenção não deve gerar duas vendas. Trilha de eventos não equivale a contabilidade de partidas dobradas.

IA não calcula imposto autoritativo, define alíquota ou executa movimentações. O backend atual utiliza um provedor textual determinístico, identificado como demonstrativo.

## Executar no Windows

Requisitos: JDK 21, Node/npm e acesso às dependências na primeira instalação. Em um terminal PowerShell, a partir da raiz:

```powershell
# Ajuste o caminho ao JDK 21 instalado neste computador.
./scripts/iniciar-backend-local.ps1 -Jdk 'C:/Program Files/Eclipse Adoptium/jdk-21.0.4.7-hotspot'
```

Em outro terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev -- --port 5173 --strictPort
```

Abra http://127.0.0.1:5173. API em http://127.0.0.1:8080. O launcher utiliza PostgreSQL local em loopback, porta 54329, dados em `backend/.local/postgres`. Não apagar essa pasta para encerrar. O banco local usa autenticação trust de desenvolvimento; não utilizar em servidor compartilhado/produção.

Contas: `gerente1@demo.local`, `financeiro1@demo.local`, `operador1@demo.local`; sufixo `2` para outra loja. A senha gerada fica em `backend/.local/demo-password`, privado e ignorado pelo Git. Não compartilhar esse arquivo. O seed não redefine senhas de contas existentes. Também é possível informar `DEMO_PASSWORD` no ambiente.

Em Linux/macOS, permanece disponível `./scripts/dev.sh`. Docker Compose existe em `backend/`, mas não foi executado nesta revisão. A execução em produção requer configuração própria de HTTPS, banco, segredos e proxy; o proxy do Vite não acompanha os arquivos estáticos.

## Modo demonstrativo e API

O padrão web é `api`, com contrato concreto em `frontend/src/servicos/integracaoConfigurada.ts`. `VITE_API_URL` permite um endereço explícito; por padrão usa a origem atual e o proxy de desenvolvimento. Falhas não são substituídas por dados fictícios.

Para abrir o cenário antigo sem backend, configure `VITE_MODO_DADOS=demo` em `frontend/.env.local` e inicie o Vite diretamente. Os dois modos têm capacidades diferentes. Exportação, gráficos e tendências da demo não provam recursos equivalentes no servidor.

## Testes e evidências

```powershell
# frontend
npm.cmd test
npm.cmd run build
# com API e frontend locais ativos
npm.cmd run test:e2e
# backend, com JAVA_HOME apontando para JDK 21
./mvnw.cmd -B verify
```

Testes E2E criam operações sintéticas. Não executar contra produção. A revisão comprovou o fluxo web/HTTP/banco local, inclusive recuperação de resposta perdida. Não comprovou Figma, leitor de tela, Android integrado, PSP, IA externa ou implantação. Os testes Android antigos não foram repetidos porque o código não mudou funcionalmente.

## Próximas etapas

1. Entregar comparação de tendências no servidor e interpretação prevista no MVP.
2. Completar agregados e apresentação do dashboard API conforme o escopo acordado.
3. Mapear o contrato Android e validar HTTPS, dispositivo e recuperação.
4. Conferir Figma e os módulos adicionais com a equipe, em revisão posterior.
5. Concluir requisitos de infraestrutura e operação: Docker, carga, upgrade, backups e monitoramento.

Crédito simulado e cancelamento de operações permanecem evolução futura. Adiamento da implementação de tendências não significa retirada desse requisito do MVP. A matriz distingue implementação, demonstração, validação e aceite; não há declaração de conclusão integral.

## Documentos

- [Revisão e diferenças entre as entregas](documentacao/revisao-2026-10-14/REVISAO-COMPLETA.md)
- [Resultados executados nesta revisão](documentacao/revisao-2026-10-14/RESULTADOS-VALIDACAO.md)
- [Matriz dos 516 critérios originais](documentacao/revisao-2026-10-14/MATRIZ-CONSOLIDADA.md)
- [Guia da integração web](frontend/documentacao/INTEGRACAO-BACKEND.md)
- [Contrato da API](backend/docs/API.md) e [modelo do banco](backend/docs/BANCO.md)
- [Devolutiva do backend](entrega-para-backend/04-DEVOLUTIVA-DO-BACKEND.md)
- [README recebido, preservado como histórico](documentacao/historico/README-recebido-2026-10-14.md)

## Créditos e referências

Design, prototipação de alta fidelidade e pesquisa: Thayná Batista da Silva. Documentação de requisitos: Thayná Batista da Silva e Kleysson Teixeira, conforme os materiais fornecidos. O código desta entrega recebida acrescenta backend, banco e integração web; autoria individual de commits não é inferida de uma pasta sem Git.

[Protótipo Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design) · [Repositório informado](https://github.com/lucasandare490/Avanade)

As versões anteriores e materiais privados permanecem na pasta antiga. Os PDFs anteriores que descrevem ausência de backend são históricos e não devem ser usados como status desta entrega.
