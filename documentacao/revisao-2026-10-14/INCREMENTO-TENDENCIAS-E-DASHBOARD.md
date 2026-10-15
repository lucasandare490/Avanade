# Incremento local — tendências e composição financeira

Atualização de 14/10/2026. Este documento complementa a revisão inicial; não representa encerramento de todas as pendências do MVP.

## Implementado

- GET /api/v1/trends: compara o período solicitado com o imediatamente anterior, de mesma duração. Isolamento por estabelecimento e permissão financeiro.
- Comparação de vendas brutas concluídas, entradas líquidas e despesas pagas, a partir do PostgreSQL. Ausência de registros permanece null, sem fabricar zeros.
- GET /api/v1/dashboard/details: totais e série diária por data de conclusão no fuso da loja, com dias sem movimento e leitura consistente na transação.
- Tela de análise consulta comparações separadamente da explicação. Falha textual não remove números; comparação pode ser repetida independentemente.
- Dashboard apresenta composição de bruto, tributos, taxas e líquido e tabela diária acessível.
- Cliente valida período, composição monetária, sequência diária completa e reconciliação entre série e totais.
- OpenAPI gerado atualizado com os novos schemas e rotas. O arquivo exportado anterior ainda precisa ser regenerado.

## Evidências desta etapa

- Build web aprovado após conectar os novos componentes.
- Suíte web anterior: 89 testes aprovados. Depois das adições, 30 testes direcionados de contrato e tendências aprovados, incluindo quatro novos casos. Não confundir a soma de execuções com quantidade de casos únicos.
- Suíte backend anterior: 29 testes aprovados. Após adições, 11 testes de QueryAndCashIntegrationTest aprovados, incluindo três novos casos com PostgreSQL real.
- Um erro de alias SQL foi encontrado pelo teste novo, corrigido e verificado na repetição aprovada.
- Sem teste em navegador contra o backend reiniciado nesta etapa. O processo já aberto pode executar a compilação anterior.

## Limites e próximas verificações

A interpretação textual continua no MockAIProvider; comparação numérica não equivale a IA externa homologada. A regra de comparação é a proposta demonstrativa já utilizada no cliente, sujeita ao aceite funcional. Android integrado, homologação HTTPS/dispositivo, execução Docker, publicação remota e demais pendências da revisão não foram concluídos por este incremento.
