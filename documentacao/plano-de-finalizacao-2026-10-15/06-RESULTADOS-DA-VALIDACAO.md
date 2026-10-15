# Estado verificado do incremento - 15/10/2026

## O que mudou

Cadastro de loja e gerente; edição do nome da loja; simulação com percentual hipotético; vigência final da regra; recuperação de venda paga sem regra; projeção manual de caixa; sugestão revisável de categoria; explicação específica do split; interpretação de tendências; relatórios de vendas, despesas e tributos; nomes mais claros em dez módulos.

Caixa e comparação usados na explicação vêm de uma única leitura consistente do banco. A leitura termina antes de chamar o provedor. A interpretação não inventa causas ou percentuais quando faltam dados ou a base é zero. Pagamento e IA continuam demonstrativos.

## Verificação executada

| Área | Resultado | Evidência |
|---|---|---|
| Web | 97 testes aprovados e build concluído | evidencias/validacao-web.log.txt e build-web.log.txt |
| Backend/PostgreSQL | 54 testes executados; 53 passaram inicialmente. O teste novo de período inválido esperava 422, enquanto o contrato usa 400. Expectativa corrigida e cenário repetido com sucesso | evidencias/validacao-backend.log.txt e validacao-relatorios.log.txt |
| Android | testes JVM/Robolectric, assembleDebug e lintDebug concluídos | evidencias/validacao-android.log.txt |
| Navegador/API real local | 13 cenários aprovados | evidencias/validacao-navegador.log.txt |
| Relatórios | vazio, falha 503, recuperação, dados e download CSV aprovados | frontend/e2e/relatorios-acessibilidade.spec.ts |
| Responsividade | nove telas em 320, 390, 768, 1024 e 1440 px, com valores longos | frontend/e2e/responsividade.spec.ts |
| Acessibilidade automática | nove telas em 390 px; contraste das mensagens de estado corrigido e reteste aprovado | evidencias/reteste-contraste.log.txt |
| Concorrência de consultas | 120 solicitações, oito simultâneas, nenhuma falha; p95 17,13 ms neste computador | evidencias/consultas-concorrentes.json |

Comandos: frontend `npm test`, `npm run build`, `npm run test:e2e`; backend `mvnw.cmd -B clean verify` e repetição direcionada; Android `gradlew.bat --no-daemon testDebugUnitTest assembleDebug lintDebug`. Relatórios distintos não devem ser somados como testes únicos.

## O que ainda exige encerramento

- A matriz contém os 516 critérios, mas o vínculo individual entre cada requisito, implementação e teste ainda não está concluído. Não é uma certificação integral.
- Docker não está instalado neste computador. Foi preparado um job remoto com banco vazio, reinício, backup/restore e comparação do conteúdo de todas as tabelas; resultado ainda pendente de execução no GitHub.
- O teste de concorrência é curto e local; não homologa carga sustentada, capacidade de produção ou dispositivo lento.
- Falta homologação do Android por HTTPS em dispositivo, TalkBack e impressão física, se vier a entrar no escopo.
- A verificação automática de acessibilidade não substitui leitores de tela, zoom real em todas as telas/estados nem comparação visual completa com o Figma.
- Hospedagem, responsáveis operacionais, retenção e aceite funcional dependem da equipe. IA externa é opcional.
- Crédito e cancelamento permanecem evolução futura. Pagamento, roteamento e recolhimento reais não fazem parte desta entrega.

## Publicação

Remoto conferido antes da publicação: cc7b055ad6e1ac083fe6f2e42d5851c713e37f09. Nenhuma contribuição remota nova foi encontrada nessa conferência. O próximo commit e seus checks serão registrados após execução.
