> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Integração do frontend — proposta para revisão conjunta

Fonte: entrega parcial §3.2 e tabela de endpoints, cotejadas com V2 e auditoria. Este documento prepara a integração; não comprova API disponível e não impõe alterações ao responsável pelo backend.

## Fronteira de responsabilidade

O frontend envia entradas de formulário e identifica a intenção do usuário. O servidor autentica, autoriza por estabelecimento, calcula valores, aplica regras vigentes, persiste eventos e garante idempotência. As funções de cálculo no frontend atual pertencem exclusivamente à demonstração local.

| Capacidade | Referência documentada | Lacuna antes de conectar |
|---|---|---|
| Login | `POST /api/v1/auth/login` | Sessão, renovação, revogação, perfis e loja autorizada |
| Venda | `POST /api/v1/sales` | Estados iniciais, categorias, meios aceitos, idempotência de criação |
| Lista de vendas | `GET /api/v1/sales` | Schema, filtros, ordenação, paginação e totais |
| Operações | `GET /api/v1/split-operations?from=&to=` | Schema de coleção, fuso, limites do período e paginação |
| Detalhe | `GET /api/v1/split-operations/{id}` | Datas, histórico, meio de pagamento, regras históricas e todos os estados |
| Retomada | `POST /api/v1/split-operations/{id}/reprocess` | Permissão, resposta, conflito e confirmação desconhecida |
| Eventos | `GET /api/v1/ledger?saleId=` | Ordem, paginação, campos públicos e correlação |
| Simulação | `POST /api/v1/split-payment/simulate` | Inclusão da taxa; exemplo documentado retorna 135, não 132 |
| Despesas | `POST /api/v1/expenses` | Request/response e endpoint de consulta não detalhados na tabela |
| Caixa | `GET /api/v1/cash-flow?period=` | Realizado/previsto, saldo inicial, reconhecimento e agregações |
| Explicação | `POST /api/v1/ai/cash-analysis` | Servidor deve recuperar fatos; não confiar nos totais enviados pelo cliente |

## Dados internos do frontend

`Operacao` usa centavos inteiros e três estados de demonstração (`concluida`, `pendente`, `falha`). Esses nomes não são uma lista completa de estados da API. O adapter deve converter a resposta validada para o modelo da interface e preservar estados adicionais necessários. Um estado desconhecido nunca deve virar concluído por padrão.

O exemplo documental usa números decimais (`grossAmount: 150.00`). A conversão entre decimal e centavos deve ser acordada e testada: preferir centavos inteiros ou decimal textual no contrato definitivo; não presumir mudança unilateral no servidor. `paymentMethod: CARD` não define a distinção entre débito e crédito presente na demonstração. `taxCategory: GENERAL` não autoriza inventar categorias adicionais.

## Sequência de conexão

1. Receber URL local, mecanismo de sessão e OpenAPI/exemplos realmente executáveis.
2. Validar login, credencial inválida, expiração e 403 por recurso.
3. Implementar adapter real ao lado de `servicoDemonstrativo.ts`; nunca chamar o mock após falha de rede.
4. Conectar lista e detalhe, validando forma da resposta e identidade da operação.
5. Conectar criação/retomada usando a mesma chave para a mesma intenção após timeout.
6. Conectar despesas e caixa somente após fechar reconhecimento financeiro.
7. Conectar simulação e explicação mantendo seus efeitos separados do núcleo.
8. Executar os testes conjuntos de persistência, acesso por loja e concorrência no backend.

## Casos de aceite compartilhados

- Venda 150,00 com regra demonstrativa 10% e taxa 2% retorna 15,00 + 3,00 + 132,00.
- Repetição da mesma chave e entrada recupera a mesma operação; mesma chave com entrada diferente produz conflito definido.
- Resposta perdida depois de confirmar não resulta em uma segunda venda.
- Recusa não gera split concluído ou entrada líquida.
- Retomada preserva parcelas já confirmadas e histórico anterior.
- Uma conta não acessa operação de outra loja por ID, filtros ou reprocessamento.
- Mudança de regra não recalcula operação histórica.
- Despesa paga afeta uma vez o período correto; taxa já separada não é deduzida novamente.
- Paginação não transforma total parcial em total geral.
- IA indisponível não impede consultar saldos e operações.

## Decisões que não podem ser fechadas só pelo frontend

Sessão e permissões; composição IBS/CBS; arredondamento; data de reconhecimento; saldo inicial; projeção; venda a prazo; recorrência; cancelamento; taxa por meio; reprocessamento com efeito desconhecido; duração e escopo da chave de idempotência; formato de implantação. Registrar responsável, data e exemplos quando houver acordo.

## Estrutura de implementação disponível

O adapterApi.ts e os validadores internos já foram escritos e ligados à seleção de ambiente. Falta preencher ContratoServidor com os schemas e o mecanismo de sessão realmente ratificados. Não presumir que isso equivale a integração executada. Ver SESSAO-E-INTEGRACAO.md.
