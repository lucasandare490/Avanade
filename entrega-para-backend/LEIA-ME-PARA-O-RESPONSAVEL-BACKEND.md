# Backend e banco — guia de continuidade

Atualizado em 16/10/2026. O backend já existe em `backend`; o dashboard web consome a API e o cliente Android tem contrato implementado. O banco é PostgreSQL real; pagamentos, tributos e explicações são demonstrativos.

## Leia primeiro

1. [Estado e evidências vigentes](../documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md).
2. [Matriz individual dos 516 critérios](../documentacao/plano-de-finalizacao-2026-10-15/05-REVISAO-DOS-516-CRITERIOS.csv): filtre BE e BD para os 219 critérios do servidor/banco.
3. [Execução backend](../backend/README.md), [API](../backend/docs/API.md) e [exemplos executados](../backend/docs/examples/README.md).
4. [Operação e recuperação](../backend/docs/OPERACAO-E-RECUPERACAO.md) e [auditoria de dependências](../documentacao/plano-de-finalizacao-2026-10-15/07-AUDITORIA-DE-DEPENDENCIAS.md).
5. [Mapa de arquivos](../ONDE-ENCONTRAR-CADA-PARTE.md).

## Documentos originais preservados

01-CHECKLIST-BACKEND-COMPLETO.md e 02-CHECKLIST-BANCO-DE-DADOS.md mantêm os 152 e 67 critérios originais. O documento 03 registra o contrato proposto à época; o contrato implementado vigente é backend/docs/API.md e openapi.json. O documento 04 registra devolutivas históricas. Não interpretar afirmações antigas como “backend não conectado” ou “tendências pendentes” como estado vigente: consultar a matriz e evidências acima.

## Continuidade sem quebrar os clientes

Preservar valores inteiros em centavos, contexto de loja derivado da sessão, separação pagamento/split, snapshots históricos e chaves idempotentes. Nunca usar fixtures para ocultar falha de API. Mudança de DTO exige atualização coordenada dos adapters web/Kotlin e testes. Tendências pertencem ao MVP; crédito/cancelamento são futuros. Projeção atual é cenário manual, não previsão estatística.

Restam homologação Android HTTPS/aparelho, aceite visual/assistivo e implantação operacional. Dois avisos Spring WebMVC permanecem registrados na auditoria; CI verde não significa ausência de vulnerabilidades. Responsáveis e prazos precisam de acordo da equipe.

Design/protótipo e pesquisa: Thayná Batista da Silva. Requisitos: Thayná Batista da Silva e Kleysson Teixeira, conforme materiais fornecidos.
