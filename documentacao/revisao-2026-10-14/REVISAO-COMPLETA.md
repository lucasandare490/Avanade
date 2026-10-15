# Revisão da entrega integrada — 14/10/2026

Base antiga: `C:/avanade`. Entrega recebida e revisada: `C:/Avanade-main`. A pasta antiga foi preservada como referência. A pasta recebida não contém `.git`: seu nome não prova branch ou commit. Não houve publicação nem merge nesta revisão.

## Resultado da comparação

Foram inventariados 210 arquivos da entrega, excluindo dependências e saídas de build: 81 novos, 27 com alteração de conteúdo, 39 com diferenças somente de quebra de linha/BOM e 63 idênticos. O inventário detalhado está em `comparacao-arquivos.json`. Este inventário cobre arquivos presentes na entrega nova, não representa remoção dos arquivos privados/artefatos locais da pasta antiga.

O backend é novo. O frontend recebeu contrato concreto, autenticação e recuperação de intenções. O código e os testes Android são iguais aos antigos após normalização de quebras de linha; não houve integração Android nesta entrega.

## Antes e agora

| Área | Entrega antiga | Entrega atual |
|---|---|---|
| Web | Demonstração em memória; contrato null | API como padrão; contrato `/api/v1` implementado; demo opcional |
| Sessão | Perfis/sessão fictícios | Bearer opaco, 60 minutos, revogação e permissões no servidor; token apenas em memória |
| Banco | Checklist e proposta | PostgreSQL 17.11, Flyway V1–V3, constraints e papéis distintos |
| Venda | Simulação no navegador | Venda persistida; pagamento e roteamento continuam mock |
| Recuperação | Cenários locais | Intenção persistida no banco e ponteiro na mesma aba via sessionStorage |
| Despesas | Memória | Registro pago, categoria consultável, efeito único no caixa e recuperação |
| Caixa | Dados fictícios locais | Agregado do servidor: abertura + líquido concluído − despesas pagas |
| IA | Texto determinístico local | MockAIProvider no servidor, com fatos persistidos; sem LLM externo |
| Tendências | Comparação demonstrativa | Demo preservada; servidor ainda não fornece comparação |
| Android | Kotlin demonstrativo e estrutura de API | Sem alteração funcional; falta mapear e testar o contrato concreto |

## Constatações que afetam a entrega

### 1. Integração não significa equivalência entre as telas demo e API

`TelaDashboard.tsx` apresenta bruto, tributos, taxas, líquido e gráfico no modo demo. `TelaResumoIntegrado.tsx` apresenta abertura, entradas, despesas e saldo no modo API. `/dashboard` e `/cash-flow` usam o mesmo agregado `FinanceService.cash`. Portanto, gráfico, composição tributária e comparações da demonstração não estão integralmente reproduzidos na tela integrada. Não somar só uma página de operações para preencher os totais ausentes. Backend deve fornecer os agregados/séries necessários; frontend deve mapeá-los e apresentá-los. FE-096/100/101 e requisitos de séries permanecem parciais no modo API.

### 2. Tendências continuam sendo uma pendência do MVP

A decisão recebida neste chat mantém análise de tendências por IA no MVP. Crédito e cancelamento são evolução futura. Documentos recebidos registram adiamento de implementação de tendências; isso não é evidência de retirada do requisito do MVP. O servidor devolve explicação de um período, não comparação entre dois períodos. A interface informa a ausência. Projeção de caixa é outro requisito e depende de premissas próprias.

### 3. Exportação e impressão precisam ser diferenciadas por modo

Exportação completa está disponível na demonstração local, mas não no contrato integrado. A tela de configurações trazia afirmação genérica que podia ser interpretada como disponibilidade em API; o texto foi corrigido. Não anunciar exportação real ou comprovante fiscal. Relatórios completos, classificação sugerida, alertas e administração de usuários/configurações permanecem sem entrega integral.

### 4. Android ainda não está integrado

O contrato agora existe no backend. Falta implementá-lo no cliente Kotlin, tratar venda sem operação, autenticação e recuperação persistente, configurar HTTPS e verificar aparelho/emulador. A existência de um APK e testes JVM antigos não prova comunicação com este servidor.

### 5. Documentação tinha estados de épocas diferentes

O relatório backend antigo contabiliza 28 testes; o resultado posterior recebido contabiliza 29. A devolutiva ainda dizia que web aguardava autorização. Matrizes do frontend ainda indicavam contrato ausente. A revisão mantém evidências históricas identificadas e atualiza os documentos de status. Não foram reescritos resultados antigos como se fossem testes novos.

## Código e banco examinados

Foram examinados controllers, sessão e permissões, transporte e adapters web, intenções, consultas, cálculo, split, recuperação, agregados, explicação, migrations e configuração. O backend utiliza consultas parametrizadas; contexto de loja deriva da sessão; FKs compostas impedem vínculos cruzados. Idempotência usa chave por loja/ação, hash da entrada, lock transacional e resposta persistida. Retomada usa lock na operação. A soma financeiro/parcelas tem constraints e gatilhos; o histórico é protegido contra alteração pelo runtime. Essas proteções são específicas do processamento demonstrativo síncrono, sem garantia equivalente para um PSP externo futuro.

O schema real possui 14 tabelas de domínio, incluindo sessão e interação de IA, além do controle Flyway. O backup histórico comparou 12 tabelas de negócio; isso não equivale a comprovar o conteúdo de todas as 14. Políticas de retenção, monitoramento operacional e ensaio de upgrade estrutural com dados continuam pendentes. O runtime tem privilégios de inserção usados pelo seed; a separação operacional de bootstrap/migrations e runtime deve ser revista antes de implantação real.

## Evidências e limites

Os 89 testes web e o build foram executados novamente neste Windows e passaram. Também passaram os 29 testes backend e os 4 cenários de navegador com API e PostgreSQL locais. A execução é registrada no arquivo `RESULTADOS-VALIDACAO.md`, que distingue resultado novo de evidência recebida. Android não foi executado novamente: os fontes não mudaram e a integração Android não foi implementada. Não houve auditoria jurídica das alíquotas, teste de PSP, aceite visual Figma, publicação ou certificação de segurança.

## Pendências por responsável

| Prioridade | Trabalho | Responsável funcional |
|---|---|---|
| MVP | Definir e entregar séries/comparação de tendências e interpretação, sem inventar base ausente | Produto + backend; frontend consome e valida |
| MVP | Completar agregados necessários à equivalência funcional do dashboard integrado | Backend + frontend |
| MVP | Conectar Kotlin ao contrato, tratar venda sem split e recuperar intenção | Android + backend + ambiente HTTPS |
| Aceite | Conferir Figma e escopo dos módulos adicionais | Equipe; adiado nesta revisão a pedido do usuário |
| Aceite | Leitor de tela e dispositivo POS; matriz completa dos estados integrados | Frontend/Android + equipe |
| Condicional | Exportação/relatórios completos, classificação, alertas, administração | Produto define escopo; backend e frontend implementam |
| Infraestrutura | Docker executado, HTTPS, CI, varredura de dependências, carga sustentada | Backend/infraestrutura |
| Operação | Upgrade com dados, retenção, backups recorrentes e responsáveis | Banco/backend + equipe |
| Futuro | Crédito simulado e cancelamento | Fora do MVP vigente |

Não há aceite integral do projeto. O avanço confirmado é a passagem do web demonstrativo isolado para um cliente com contrato implementado sobre API e persistência de operações simuladas.
