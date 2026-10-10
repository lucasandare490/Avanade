> **Registro histórico de uma etapa anterior.** Os avisos de não realização de testes abaixo descrevem aquela etapa. Para o estado vigente, consulte [RELATORIO-VALIDACAO-ATUAL.md](RELATORIO-VALIDACAO-ATUAL.md).

# Continuação: consultas web e preparação Android

## Estado desta revisão

Código alterado em 09/10/2026, sem testes, build, checagem de tipos, navegador ou execução Android, conforme pedido do usuário. Formatação de fonte não comprova funcionamento. Os resultados de 32 testes anteriores são históricos e não validam estes arquivos.

## Web: implementação acrescentada

- Histórico remoto com busca, período, status, pagamento, paginação pelo total informado, vazio, carregamento e nova tentativa.
- Detalhe consultado por ID, sem copiar percentuais fictícios nem deduzir pagamento/parcelas pelo estado geral. Campos opcionais de pagamento, regra histórica e parcelas são apresentados somente se recebidos e validados.
- Simulação remota com entrada e resultado separados, cancelamento e descarte de resposta obsoleta; nenhum resultado altera vendas ou caixa.
- Explicação remota por período, texto sem HTML executável, estados de erro/vazio/carregamento e identificação de origem.
- Dashboard e caixa consomem indicadores consolidados do serviço. O frontend não calcula totais gerais usando uma página de operações.
- Despesas remotas paginadas, cadastro com categorias fornecidas pelo contrato, prevenção de envio concorrente e bloqueio de nova submissão quando o resultado é desconhecido. Desbloqueio/reconciliação exige a semântica de recuperação do backend; não há falsa confirmação.
- Modo API deixou de carregar toda a base na entrada. Cada tela consulta a própria capacidade; o método legado carregar permanece no adapter para compatibilidade, mas não é usado pela aplicação nesse modo.
- Venda conectada sem seletor de falhas demonstrativas; chave mantida na mesma tentativa. Não há habilitação de modo real por parâmetro de URL.
- Sessão intercepta 401 nas capacidades injetadas; novo login aguarda o encerramento anterior. Respostas de sessão anterior não atualizam a sessão nova.
- Formulário local de despesas associa erro ao campo e agenda o foco após habilitação. Valores simulados e configurações demonstrativas não são usados como respostas substitutas de API.

## Organização dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| src/servicos/contratosConsultas.ts | Tipos internos por capacidade; não é um OpenAPI aprovado |
| src/servicos/adapterApi.ts | Injeção do contrato e validação das respostas mapeadas |
| src/servicos/validarContratoInterno.ts | Valores inteiros, composição, estados, eventos e sessão |
| src/utilitarios/useConsultaRemota.ts | Cancelar consultas antigas e descartar respostas obsoletas |
| src/telas/TelaOperacoesRemotas.tsx | Lista paginada e detalhe do servidor |
| src/telas/TelaResumoIntegrado.tsx | Indicadores do dashboard e do caixa |
| src/telas/TelaDespesasIntegrada.tsx | Lista/cadastro de despesas pelo serviço |
| src/telas/TelaSimulacaoIntegrada.tsx | Solicitação da simulação e resultado |
| src/telas/TelaAnaliseIntegrada.tsx | Explicação vinculada ao período |

## Android: implementação acrescentada

- Controles e espaçamento em dp; títulos identificados para acessibilidade em versões compatíveis.
- Sessão verificada antes das ações; saída limpa perfil, período de sessão e filtros.
- Botão Voltar diferencia entrada, login, sessão expirada, detalhe e início.
- Transporte HTTPS classifica 401, 403, 404, 409, 422, 429 e falhas de rede sem expor detalhes internos; não entrega callbacks após encerramento do transporte.
- ServicoPosIntegrado.kt define adapter injetável para registrar, consultar, listar e retomar, verificando identidade, centavos, composição e paginação. Não escolhe endpoints ou alíquotas.

As telas Android continuam ligadas ao repositório demonstrativo. O adapter remoto NÃO foi conectado ao fluxo nativo: faltam sessão/autorização e DTOs reais. A existência do arquivo não significa app integrado ou APK gerado.

## O que precisa ser fornecido para ativar

1. Contrato versionado com requisições, respostas, paginação e categorias; mapeamento em integracaoConfigurada.ts. Continua null intencionalmente.
2. Autenticação/cookie ou token, revogação, loja/perfis e estratégia de CSRF se aplicável.
3. Regras de período/fuso e reconhecimento financeiro, indicadores e estados de pagamento/parcelas.
4. Recuperação por chave de venda e de despesa, estados de retomada, erros e confirmação de mutação.
5. Alvo Android e ferramentas para compilação; integração nativa com sessão e contrato.
6. Figma integral para ajustes que a referência acessível não permite confirmar.

Ainda haverá código específico no frontend ao receber essas definições. Não há integração de produção, certificação visual ou prova de funcionamento desta revisão. Validações adiadas podem revelar correções adicionais. Funcionalidades condicionais como crédito, recorrência, estorno, PWA, push e SDK de maquineta não foram inventadas.
