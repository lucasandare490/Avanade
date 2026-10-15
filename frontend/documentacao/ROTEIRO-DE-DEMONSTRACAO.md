> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Roteiro de validação do frontend

Dados fictícios, referência 09/10/2026. Recarregar ou sair restaura o cenário. Nenhuma movimentação real.

1. Abrir a aplicação e escolher **Explorar demonstração**.
2. Conferir dashboard inicial: bruto 4.498,40; tributo 449,84; taxa 89,97; líquido 3.958,59; despesas 1.360,40; saldo 2.598,19. São 16 operações concluídas entre 18 registros.
3. Alternar Hoje/7 dias/30 dias. Abrir a tabela do gráfico: a soma corresponde às entradas líquidas do mesmo intervalo.
4. Abrir OP-0184: bruto 487,50 e líquido 429,00. Abrir OP-0183: bruto 150,00 e líquido 132,00.
5. Buscar uma operação, abrir detalhe e voltar. A busca/página permanece. Limpar os filtros e testar intervalo invertido.
6. Em Despesas, cadastrar “Teste de despesa” por 10,01 em 09/10. Conferir o registro, filtrar por descrição e verificar saldo final de 2.588,18 no caixa.
7. Simular 150,00 com taxa (132,00) e sem taxa (135,00). Voltar ao caixa: simular não altera o saldo.
8. No modo POS web, criar 150,00 em cenário de falha parcial. Tributo confirmado; líquido fora do caixa. Retomar e conferir a mesma operação concluída com 15/3/132.
9. Criar outra tentativa em cenário de recusa. Nenhuma operação é criada.
10. Criar tentativa com resposta perdida. A mensagem não afirma recusa. Usar **Consultar a mesma tentativa** e conferir uma única operação.
11. Na análise, alternar explicação disponível, indisponível e dados insuficientes. Os valores financeiros continuam acessíveis.
12. Em celular, abrir menu, navegar por teclado, usar Escape e conferir retorno ao botão de abertura. Navegar entre telas sem transbordamento horizontal da página.
13. Sair, entrar novamente e confirmar o cenário inicial. Preferências de filtros são limpas junto com os dados locais.

## Evidência e limites

Rodar `npm test` e `npm run build`. Guardar resultados na pasta `documentacao`. Os testes não comprovam backend, banco, login real, instalação Android, publicação, conformidade fiscal ou homologação de POS. Inspeção automatizada de acessibilidade não substitui teste com usuários e leitor de tela.
