# Pendências e critérios de encerramento — 16/10/2026

A referência individual vigente é a [matriz dos 516 critérios](../../documentacao/plano-de-finalizacao-2026-10-15/05-REVISAO-DOS-516-CRITERIOS.csv). [Resultados executados](../../documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md). As listas antigas preservam o planejamento, não o estado atual.

## Implementado e verificado localmente

Web com cadastro, sessão, loja, vendas/recuperação, despesas, dashboard, caixa semanal, simulação, projeção manual, relatórios e explicações. Contrato Kotlin, testes JVM, APK e lint. Backend persistente, idempotência, regras históricas, isolamento, Docker e restauração com evidências. Logs estruturados, métricas locais e diagnóstico de banco. Dependências Java/Android auditadas e correções aplicadas. Nenhum desses itens significa processamento financeiro real.

## O que ainda exige aceite ou ambiente

| Pendência | O que encerra | Dependência |
|---|---|---|
| Equivalência integral ao Figma | Conferir cada tela e estado contra versão acessível e obter aceite | Acesso ao protótipo e responsável de produto |
| Android integrado no alvo | Executar venda, recuperação, sessão e consulta por HTTPS em aparelho/emulador escolhido | Endpoint HTTPS e dispositivo |
| Leitor de tela/TalkBack e zoom nativo | Roteiro manual de todos os estados sem perda de foco/conteúdo | Ferramenta assistiva e validação humana |
| Desempenho em aparelho lento/carga sustentada | Medições reproduzíveis no ambiente alvo com limites acordados | Dispositivo/infraestrutura |
| Operação compartilhada | Hospedar API/banco; coletar métricas; proteger/rotacionar segredos; definir backups/retensão/responsáveis | Equipe e infraestrutura |
| Alertas Spring WebMVC | Reavaliar novas versões e uso de XSLT/SSE antes de liberar esses recursos | Manutenção de dependências; ver auditoria |

O seed inicial contém contas/lojas/regras. O cenário financeiro persistente agora é uma opção explícita para apresentação local, com duas lojas, estados diferentes e despesas em dois períodos. Veja [como carregar](../../backend/docs/CENARIO-DE-APRESENTACAO.md). Ele não é inserido no cadastro normal. Crédito e cancelamento continuam evolução futura.

Não tratar 516 itens revisados como 516 itens homologados. Os três níveis são implementação, teste técnico e aceite no ambiente de uso.
