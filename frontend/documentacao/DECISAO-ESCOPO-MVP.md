> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> **Atualização de implementação:** comparação de tendências demonstrativa e apresentação de comparações remotas implementadas. A integração com dados e IA do servidor continua pendente. Esta atualização substitui os trechos anteriores sobre ausência da interface de comparação. Veja [implementação de tendências](TENDENCIAS-IMPLEMENTADAS.md).

# Decisão de escopo — atualização recebida em 10/10/2026

Fonte: captura de conversa enviada pelo usuário nesta data, com mensagem atribuída a Thayná. A captura informa alterações nas páginas 5 e 6 da documentação de planejamento; essas páginas revisadas não foram fornecidas nesta atualização. A data de recebimento não é uma afirmação sobre a data original da mensagem. A imagem privada não integra o repositório.

## Decisão comunicada

| Recurso | Escopo |
|---|---|
| Crédito mockado/simulado | Evolução futura, fora do MVP atual |
| Cancelamento de operações / cancelamento de compra | Evolução futura, fora do MVP atual |
| Análise de tendências por IA | Parte do MVP |

Isso atualiza os trechos anteriores que tratavam esses três temas genericamente como decisões abertas. Outros recursos condicionais mantêm sua classificação. O meio de pagamento Crédito já presente no demonstrador não é o produto de concessão de crédito adiado. A retomada de split com falha parcial também não é cancelamento e permanece no fluxo atual.

## Impacto no que foi implementado

Não é necessário remover os fluxos existentes. A separação entre frontend, regras financeiras e IA permanece válida. A tela `TelaAnalise.tsx` apresenta um resumo determinístico de um período; `TelaAnaliseIntegrada.tsx` recebe texto contextualizado pelo período através da capacidade `explicar`. Isso é uma base para evolução, não evidência de análise de tendências concluída.

**A análise de tendências é uma pendência do MVP.** Não há hoje comparação temporal completa ou provedor de IA integrado. Os 59 testes web e 14 Android já registrados validam a implementação anterior a esta definição; não certificam esse recurso adicional.

## Próxima implementação e critérios de aceite

- [ ] Produto/backend: definir quais indicadores serão analisados, janelas comparadas, granularidade e quantidade mínima de dados. Essas definições não aparecem na captura.
- [ ] Backend: obter séries e agregados a partir dos registros autorizados da loja, com moeda, fuso, filtros e reconhecimento financeiro explícitos.
- [ ] Backend: calcular comparações determinísticas; diferenciar alta, queda, estabilidade e ausência de base, sem dividir por zero ou inventar percentual.
- [ ] Backend/IA: produzir interpretação ancorada nos dados, identificar origem mock/provedor, período e limitações; impedir recomendações ou ações financeiras automáticas.
- [ ] Contrato: devolver períodos comparados, indicadores, valores de origem, variação quando calculável, estado de dados insuficientes e texto. O DTO final deve ser aprovado; não existe endpoint novo presumido.
- [ ] Frontend: ampliar a tela para exibir comparações e dados que sustentam cada tendência, com rótulos acessíveis, estado sem base e vínculo claro com o período solicitado.
- [ ] Frontend: manter as consultas financeiras utilizáveis quando a IA falhar, descartar respostas antigas e renderizar explicações como texto seguro.
- [ ] Testes conjuntos: aumento, queda, estabilidade, período vazio, base anterior zero, mudança de período durante carregamento, falha de IA e tentativa de acessar dados de outra loja.

Uma tendência histórica não equivale automaticamente a previsão de caixa. Horizonte, premissas e modelo de projeção precisam de definição própria caso sejam solicitados. Não inventar regras de previsão para considerar a análise de tendências concluída.
