# Explicação de caixa — cash-explanation-v2

Objetivo: explicar os valores históricos reconhecidos no caixa da loja autenticada. Implementação padrão: MockAIProvider. Não há chamada a modelo externo.

Entrada: CashFlow calculado pelo servidor (período, abertura, entradas, despesas e fechamento). Não recebe totais confiáveis do navegador, prompts livres ou dados de outra loja.

Saída: text para compatibilidade e structured com summary, attention, recommendations, limitations e templateVersion. Atenção e recomendações são determinísticas, calculadas pelo servidor a partir do sinal do saldo, não pela IA. Período e origem permanecem no envelope. Tendências também são devolvidas em campos estruturados. InterpretacaoTendencias acrescenta narrativa determinística de cada indicador, com base zero e ausência explícitas. ConsultaFatosParaExplicacao reúne caixa e comparação no mesmo snapshot, encerrado antes da chamada ao provedor.

Restrições: sem movimentação financeira, alíquotas sugeridas, links, HTML ou comandos. Valores no formato monetário brasileiro são conferidos contra os fatos de entrada. Essa validação conservadora não prova correção semântica de um modelo externo; a adoção de outro provedor exige contrato estruturado e avaliações adicionais.

Limites: espera de 3 segundos, dois trabalhos simultâneos e fila limitada a oito. Falha, saturação, texto vazio, texto maior que 4.000 caracteres ou resposta inválida acionam FALLBACK. Cancelamento solicita interrupção; qualquer futuro cliente HTTP deve também definir seu próprio timeout de conexão/leitura. Consultas financeiras não dependem do texto.

Avaliação executável: ConsultaExplicacaoLimitadaTest, ValidacaoExplicacaoFinanceiraTest e BackendIntegrationTest.invalidExplanationFallsBackWithStructuredFacts. Casos: retorno válido, falha, timeout/interrupção, saldo negativo, montante divergente, conteúdo com HTML/link/percentual e manutenção de fatos/tendências.

Explicação de split: GET /api/v1/ai/split-explanation/{id}, modelo split-explanation-v1. Usa somente composição, estado e regra histórica autorizados. BackendIntegrationTest verifica isolamento e ausência de escrita; InterpretacaoTendenciasTest verifica ausência, base zero e arredondamento. Validação semântica de eventual modelo externo continua fora desta evidência.

