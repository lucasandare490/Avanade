> **Atualização vigente - 15/10/2026:** [funcionalidades e resultados](documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md) e [mapa dos arquivos](ONDE-ENCONTRAR-CADA-PARTE.md). Cadastro, projeção manual, relatórios e explicações de tendências/split foram acrescentados. As seções datadas abaixo registram entregas anteriores; não use suas pendências antigas como estado atual.

> **Estado atual:** consulte o [incremento de integração e validação](documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> **Atualização de implementação:** comparação de tendências demonstrativa e apresentação de comparações remotas implementadas. A integração com dados e IA do servidor continua pendente. Esta atualização substitui os trechos anteriores sobre ausência da interface de comparação. Veja [implementação de tendências](frontend/documentacao/TENDENCIAS-IMPLEMENTADAS.md).

# Planner Comercial — entrega de frontend e orientação do backend

Revisão: 10/10/2026. Comece por este arquivo. Há dois clientes: dashboard web e POS Android. Os dois são demonstrativos; a API do projeto ainda precisa ser entregue e conectada.

## Abrir e executar

- [Frontend web: instalação, telas e arquitetura](frontend/README.md).
- [Android: compilação, APK e estrutura](android-pos/README.md).
- [Validação atual e limites](frontend/documentacao/RELATORIO-VALIDACAO-ATUAL.md).
- [Estado dos 297 critérios originais](frontend/documentacao/STATUS-CHECKLIST.md).
- [Pendências com responsável e critério de encerramento](frontend/documentacao/PENDENCIAS-OBJETIVAS.md).

## Enviar ao responsável pelo backend

A pasta [entrega-para-backend](entrega-para-backend/LEIA-ME-PARA-O-RESPONSAVEL-BACKEND.md) reúne cinco documentos: instruções, 152 critérios de backend, 67 critérios de banco, contratos/exemplos e formulário de devolutiva. Envie o pacote completo. Ele explica o cliente atual, as decisões abertas e o que o servidor deve entregar para integrar.

## Autoria e privacidade

Design/protótipo e pesquisa: Thayná Batista da Silva. Requisitos: Thayná Batista da Silva e Kleysson Teixeira, conforme materiais fornecidos. A implementação usa essas referências; não substitui o aceite da designer nem atribui tarefas a integrantes sem acordo.

A pasta auditoria contém fontes privadas e não integra o pacote compartilhável. Ferramentas locais, caches, credenciais e node_modules também ficam fora. Arquivos ZIP antigos foram preservados como histórico; use a entrega de 10/10/2026.

## Atualização de escopo do MVP

Análise de tendências por IA faz parte do MVP, mas não está concluída pelo resumo textual atual. Crédito simulado e cancelamento de operações/compra ficam na evolução futura. Veja a [decisão e critérios de aceite](frontend/documentacao/DECISAO-ESCOPO-MVP.md).
