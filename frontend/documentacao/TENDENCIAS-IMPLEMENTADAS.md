# Tendências — implementação e validação incremental

## O que foi implementado

A tela demonstrativa compara vendas brutas concluídas, entradas líquidas e despesas pagas entre o período selecionado e o intervalo imediatamente anterior de mesma duração. Os períodos usam datas inclusivas; a proposta limita a seleção a 366 dias. Essa escolha é exploratória e precisa de ratificação para o contrato definitivo.

A tabela acessível mostra os valores de origem, aumento, queda, estabilidade e ausência de base. Um período sem registros não é tratado como zero. Base zero não produz percentual infinito. A comparação permanece visível no demonstrador quando a explicação simulada falha. Nenhuma previsão, venda, despesa ou movimentação é criada por essa análise.

No modo integrado, `ExplicacaoPeriodo.tendencias` aceita agregados fornecidos pelo backend. O adapter valida períodos e valores. A tela mostra a comparação mesmo quando o texto retorna vazio, avisa quando o servidor não fornece tendências e remove resultados antigos ao editar as datas. O texto continua escapado pelo React.

## Organização

- `src/utilitarios/tendencias.ts`: períodos, comparação exploratória e validação da extensão interna.
- `src/componentes/PainelTendencias.tsx`: apresentação compartilhada dos valores e variações.
- `src/telas/TelaAnalise.tsx`: demonstração com a base existente.
- `src/telas/TelaAnaliseIntegrada.tsx`: apresentação dos dados retornados pelo servidor.
- `src/testes/tendencias.test.tsx`: testes novos da comparação e interface.

## Validações

Antes desta alteração já haviam passado 59 testes web e 14 Android. Nesta atualização foram executados somente os testes novos de tendências e os testes existentes de consultas/sessão e integração afetados pela mudança, além da compilação web. Não foi repetida a suíte Android nem a bateria completa antiga.

Resultados desta revisão: `testes-tendencias.json` e `build-tendencias.txt`. Os resultados anteriores permanecem separados, sem somar execuções repetidas como novos testes. Não houve nova inspeção visual no navegador nesta revisão.

## O que depende do backend e produto

A interpretação por IA ainda não está conectada. Ratificar indicadores, janelas, cobertura dos dados, fuso e amostra mínima; fornecer agregados autorizados e interpretação fundamentada. A tabela mostra variação aritmética, não significância estatística nem previsão.

O contrato atual recebe texto e agregados na mesma capacidade: falha HTTP da explicação impede receber novos agregados nessa tela remota. Para manter agregados remotos disponíveis independentemente da IA, definir capacidades separadas com o backend. Não há simulação silenciosa nessa situação. O caixa continua acessível.

Consulte a extensão documentada em `../../entrega-para-backend/03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md`. Crédito simulado e cancelamento continuam na evolução futura.
