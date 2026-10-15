> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> **Registro histórico de uma etapa anterior.** Os avisos de não realização de testes abaixo descrevem aquela etapa. Para o estado vigente, consulte [RELATORIO-VALIDACAO-ATUAL.md](RELATORIO-VALIDACAO-ATUAL.md).

> **Estado atual:** houve alterações posteriores aos testes registrados. As novas implementações não foram testadas nem compiladas nesta rodada, a pedido do usuário. Consulte AMPLIACAO-FRONTEND.md.

# Registro de entrega — 09/10/2026

## Resultado

Frontend web demonstrativo em React e TypeScript, seguindo a referência visual consultada do Planner Comercial. Navegação, dashboard, histórico/detalhe, despesas, caixa realizado, simulação, explicação determinística e venda demonstrativa estão disponíveis. Os dados são fictícios e ficam em memória; recarregar ou sair restaura o cenário.

## Verificação executada

- 32 testes aprovados em cinco arquivos com Vitest 5.0.3: dinheiro em centavos, conservação de parcelas, filtros, caixa, validação de despesas, cliente HTTP, idempotência local, recusa, retomada, resposta perdida e fluxos de interface.
- Testes de interface incluem preservação de filtros ao voltar do detalhe, despesa refletida no caixa, limpeza ao sair, gráfico respeitando período, simulação sem mutação financeira e formulário preservado em erro.
- Verificação axe estrutural em oito telas. Contraste e teste real de leitor de tela não são cobertos pelo jsdom; esta evidência não certifica acessibilidade completa.
- Build TypeScript/Vite aprovado. JavaScript principal: 282,93 kB / 85,52 kB gzip; CSS aproximadamente 19,6 kB / 5,22 kB gzip. Fontes locais; sem requisição ao Google Fonts.
- Auditoria npm após atualização do executor: zero vulnerabilidades conhecidas reportadas na consulta de 09/10/2026. Não equivale a garantia de segurança absoluta.
- Dashboard e detalhe OP-0184 conferidos no navegador: bruto R$487,50, tributo R$48,75, taxa R$9,75, líquido R$429,00. Operação OP-0183 tem valores próprios (150/15/3/132).
- Venda web com falha parcial e retomada exercitada no navegador; verificação automatizada cobre recuperação sem duplicação local.
- Navegação nas oito telas inspecionada em desktop de 1280 px e celular de 390 px. Corrigido transbordamento do cabeçalho acessível da tabela. Medições em verificacao-navegador.json.
- Menu móvel fecha com Escape e devolve foco ao botão de abertura; foco contido no menu enquanto aberto. Contrastes de textos secundários ajustados durante revisão.
- Nenhum erro de console registrado nas navegações finais verificadas.

## Estado por frente

| Frente | Estado |
|---|---|
| Web e venda demo | Implementados e testados no ambiente local |
| Backend/API/banco | Não implementados nesta entrega; contrato de integração documentado |
| Login e autorização por loja | Entrada demo; integração pendente |
| IA | Explicação determinística, sem provedor externo |
| Projeção, recorrência, crédito e estorno | Dependem de decisões e implementação próprias |
| Kotlin/Android | Base de código separada em ../android-pos; não compilada nem validada |
| Figma | Referência consultada; exportação pelo conector indisponível, sem certificação pixel a pixel |
| GitHub e hospedagem | Sem envio remoto ou publicação pública |

## Pendências para entrega integrada

Ratificar contratos e regras de caixa com o responsável pelo backend; implementar adapter, autenticação e autorização reais; testar persistência, isolamento por loja e recuperação no servidor. Confirmar responsável/dispositivo Android e escopo de projeção, recorrência e edição. Executar leitor de tela real e matriz ampliada de dispositivos. Revisar fidelidade com acesso/exportação integral do design.

Consulte STATUS-CHECKLIST.md para o estado dos 297 critérios. Os testes do mock não comprovam segurança, persistência, isolamento entre estabelecimentos nem concorrência do backend.
