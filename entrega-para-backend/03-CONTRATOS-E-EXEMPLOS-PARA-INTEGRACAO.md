> **Estado atual:** consulte o [incremento de integração e validação](../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Contratos e exemplos para integrar os clientes

Este documento descreve o modelo interno já implementado e as decisões que o backend precisa devolver. As URLs da primeira tabela vêm da entrega parcial; as capacidades adicionais não têm URL aprovada. Os JSON abaixo são exemplos sintéticos de objetos internos do frontend, NÃO uma alegação de que a API já responde assim. O responsável pode propor outro DTO, acompanhado do mapeamento inequívoco.

## Capacidades e ligações

| Capacidade | Rota de referência | Cliente consumidor | Retorno/decisão necessária |
|---|---|---|---|
| Login | POST /api/v1/auth/login | TelaLogin / sessão POS | Sessão, loja, permissões, expiração e mecanismo de autenticação |
| Logout/renovação | A definir | ServicoSessao | Revogação, renovação opcional e sessão já expirada |
| Venda | POST /api/v1/sales | TelaVendaDemonstrativa / ClientePos | Chave, entrada, saleId/operationId e estado retornado |
| Vendas | GET /api/v1/sales | Uso a ratificar | Não confundir venda com operação de split |
| Operações | GET /api/v1/split-operations | TelaOperacoesRemotas | Filtros, página, total, itens e ordenação |
| Detalhe | GET /api/v1/split-operations/{id} | TelaDetalheRemoto / POS | Composição, pagamento, regra, parcelas, eventos |
| Retomada | POST /api/v1/split-operations/{id}/reprocess | Web/POS | Idempotência, elegibilidade, resposta síncrona ou assíncrona |
| Ledger | GET /api/v1/ledger?saleId= | Detalhe e rastreabilidade | Identidade usada, eventos públicos, ordem e paginação |
| Consulta por chave | A definir | Recuperação web/POS | Resultado existente, processamento ou ausência confirmada |
| Criar despesa | POST /api/v1/expenses | TelaDespesasIntegrada | Recurso criado, chave e consulta de confirmação |
| Listar/categorias despesa | A definir | TelaDespesasIntegrada | Paginação, filtro e categorias autorizadas |
| Caixa | GET /api/v1/cash-flow?period= | TelaResumoIntegrado | Traduzir período para from/to ou formato aprovado; totais consolidados |
| Dashboard | A definir ou capacidade de caixa | TelaResumoIntegrado | Indicadores e origem, sem somatório da página |
| Simulação | POST /api/v1/split-payment/simulate | TelaSimulacaoIntegrada | Regra, taxa incluída, valores, sem persistência financeira |
| Explicação | POST /api/v1/ai/cash-analysis | TelaAnaliseIntegrada | Período, origem, texto, ausência de dados e timeout |
| Exportação | A definir, condicional | A integrar | Filtro completo, autorização e tipo do arquivo |

## Tipos internos web e unidades

`src/tipos.ts`, `src/servicos/contratosConsultas.ts` e `src/servicos/adapterApi.ts` são a referência de código. Números monetários abaixo são CENTAVOS. O exemplo 15000 significa R$ 150,00. O adapter rejeita composição divergente, IDs duplicados, página incoerente e estados não mapeados. Não usar essa rejeição para esconder um estado novo: ampliar contrato e interface em conjunto.

### Sessão após mapeamento

```json
{
  "id": "sessao-sintetica-1",
  "nome": "Operador de demonstração",
  "loja": "Loja A · demonstração",
  "permissoes": ["consultar", "vender"],
  "expiraEm": 1791597600000
}
```

`expiraEm` é timestamp em milissegundos no cliente; o exemplo é fixo e não deve ser usado como sessão vigente. Permissões internas: consultar, financeiro, vender, despesa, retomar, exportar. O servidor precisa validar autorização independentemente desses nomes. O DTO não carrega token: transporte/sessão devem ser configurados segundo a estratégia acordada. Cookie requer CSRF/origem; token requer retenção e renovação seguras.

### Entrada de venda

O modelo local `NovaVenda` contém chave, bruto, meio e cenario. **cenario pertence ao demonstrador** e deve ser removido pelo mapper para um endpoint que não o aceite. Meios internos: PIX, Débito, Crédito. Se o servidor usar CARD, precisa explicar como débito/crédito são representados. A documentação menciona taxCategory: GENERAL; o cliente não permite categoria arbitrária sem catálogo/contrato.

```json
{"chave":"intencao-sintetica-001","bruto":15000,"meio":"PIX"}
```

Proposta: `Idempotency-Key: intencao-sintetica-001`. Confirmar nome, escopo, validade e consulta da intenção. Bruto, meio e chave não autorizam a loja; a sessão define o contexto.

### Operação após mapeamento

```json
{
  "id": "OP-DEMO-001",
  "data": "2026-10-09T15:00:00Z",
  "bruto": 15000,
  "tributo": 1500,
  "taxa": 300,
  "liquido": 13200,
  "meio": "PIX",
  "status": "falha",
  "pagamento": "confirmado",
  "regraHistorica": "DEMO-v1: tributo fictício 10%; taxa fictícia 2%",
  "parcelas": [
    {"id":"p1","titulo":"Tributo","destino":"Destino demonstrativo","valor":1500,"status":"concluida"},
    {"id":"p2","titulo":"Taxa","destino":"Processamento demonstrativo","valor":300,"status":"pendente"},
    {"id":"p3","titulo":"Líquido","destino":"Estabelecimento demonstrativo","valor":13200,"status":"pendente"}
  ],
  "eventos": [
    {"instante":"2026-10-09T15:00:00Z","descricao":"Pagamento demonstrativo confirmado."},
    {"instante":"2026-10-09T15:00:01Z","descricao":"Parcela tributária confirmada; demais parcelas pendentes."}
  ]
}
```

Status interno do split/parcela: concluida, pendente, falha. Pagamento: confirmado, pendente, recusado. Campos pagamento/regraHistorica/parcelas são opcionais; quando não fornecidos, o cliente não inventa confirmação. Se parcelas estiverem presentes, o validador exige lista completa cuja soma seja o bruto. Eventos ausentes devem ser `[]`. Estado geral não basta para afirmar parcela confirmada ou saldo disponível.

### Paginação

```json
{"itens":[],"total":0,"pagina":1,"tamanho":20}
```

Operações: busca, inicio, fim, status, meio, pagina e tamanho. Despesas: busca, inicio, fim, pagina e tamanho. Nomes de query string serão mapeados para os nomes aprovados. Total representa TODOS os registros do filtro, não o comprimento da página. O cliente não assume total geral de dinheiro a partir disso.

### Despesa paga e categorias

```json
{"id":"despesa-demo-1","descricao":"Reposição de estoque","valor":10000,"categoria":"Estoque","data":"2026-10-09"}
```

Criar usa os campos sem id. O adapter atual recebe sucesso sem necessitar do corpo; o contrato definitivo deve fornecer ID e recuperação para confirmar resultado após timeout. `categoriasDespesa` no serviço interno é um array configurado pelo contrato; um catálogo remoto pode exigir carga assíncrona ao preparar a sessão. Não inserir valores desconhecidos silenciosamente. O cliente integrado não herda datas fixas de 2026 do demonstrador.

### Indicadores do dashboard/caixa

```json
{
  "periodo":{"inicio":"2026-10-01","fim":"2026-10-09"},
  "atualizadoEm":"2026-10-09T15:10:00Z",
  "indicadores":[
    {"id":"abertura","titulo":"Saldo inicial","valor":0,"descricao":"Saldo reconhecido antes do período"},
    {"id":"entradas","titulo":"Entradas líquidas","valor":13200,"descricao":"Somente movimentos reconhecidos"},
    {"id":"saidas","titulo":"Despesas pagas","valor":10000,"descricao":"Pagamentos do período"},
    {"id":"saldo","titulo":"Saldo final","valor":3200,"descricao":"Inicial + entradas − saídas"}
  ]
}
```

Indicadores permitem saldo negativo. Títulos/descrições são texto, nunca HTML. O servidor define reconhecimento, período e saldo de abertura. Gráficos, projeções e outras séries exigem extensão acordada; o tipo atual não afirma que esses dados já estejam conectados.

### Simulação e explicação

```json
{"bruto":15000,"incluirTaxa":true}
```

```json
{"bruto":15000,"tributo":1500,"taxa":300,"liquido":13200,"regra":"DEMO-v1 · taxa incluída"}
```

```json
{"inicio":"2026-10-01","fim":"2026-10-09"}
```

```json
{"periodo":{"inicio":"2026-10-01","fim":"2026-10-09"},"texto":"No período demonstrativo, as entradas líquidas foram...","origem":"demonstrativa"}
```

Origem interna: demonstrativa ou servidor. O período retornado deve corresponder ao solicitado. O servidor consulta fatos por sessão; não recebe “saldo confiável” calculado no navegador. A indisponibilidade da explicação não bloqueia consultas financeiras.

### Erro proposto para ratificação

```json
{
  "code":"VALIDATION_ERROR",
  "message":"Revise os campos informados.",
  "fieldErrors":{"valor":"Informe um valor positivo."},
  "correlationId":"correlacao-sintetica-1"
}
```

O callback `interpretarCampos` transforma o envelope aprovado em um mapa como `{valor: mensagem}`. Não copiar texto interno de exceções. 401 encerra sessão local; 403 preserva distinção de acesso; 409 exige semântica de conflito; 422 indica validação; 429 espera; falha de rede/5xx após gravação pode significar resultado desconhecido. O servidor precisa especificar se uma gravação ocorreu, quando isso puder ser conhecido.

## Arquivos que o responsável de frontend preencherá com sua entrega

- `frontend/src/servicos/integracaoConfigurada.ts`: contrato real, atualmente null.
- `frontend/src/servicos/adapterApi.ts`: mapeamento de respostas e capacidades.
- `frontend/src/servicos/transporteApi.ts`: mecanismo de sessão acordado, sem segredos de provedor.
- `android-pos/.../ContratoApiPos` em `ServicoPosIntegrado.kt`: caminhos e parser dos DTOs.
- `android-pos/.../ClientePos.kt`: seleção do cliente integrado após sessão e contrato ratificados.

Definir uma interface não equivale a essa configuração já estar realizada. Envie dados e exemplos executáveis para evitar que o frontend tenha de adivinhar.

## Roteiro de aceite conjunto obrigatório

1. Subir banco vazio com migrations, aplicar seed sintética e iniciar API.
2. Entrar como operador da loja A; consultar vazio; registrar venda de 150,00 no modo demonstrativo acordado.
3. Conferir retorno, detalhe, pagamento, parcelas, regra histórica e eventos.
4. Repetir mesma chave/entrada e confirmar mesmo recurso e apenas um efeito persistido.
5. Repetir chave com entrada divergente e confirmar conflito sem alteração.
6. Simular resposta perdida, recuperar intenção e conferir ausência de duplicação.
7. Executar falha parcial e retomada concorrente; conferir parcelas anteriores intactas.
8. Registrar despesa e conferir efeito único no caixa; repetir cenário de resposta perdida.
9. Consultar outra página e confirmar que totais financeiros não mudam por causa da paginação.
10. Tentar acessar IDs da loja B com sessão A e confirmar bloqueio em todas as capacidades.
11. Expirar/revogar sessão e confirmar 401; usar papel sem permissão e confirmar 403.
12. Reiniciar API e confirmar persistência, incluindo idempotência.
13. Derrubar IA e manter consultas/vendas funcionando; simulação não escreve ledger.
14. Executar o mesmo fluxo no web e no Android e anexar evidências independentes.

## Atualização obrigatória: tendências no MVP

Análise de tendências por IA faz parte do MVP. Crédito simulado e cancelamento ficam na evolução futura. O resumo textual de um período disponível hoje não encerra esse requisito. Incluir na implementação/devolutiva as séries de origem, períodos comparados, indicadores, tratamento de base zero/insuficiente, interpretação segura e contrato para a tela. As definições específicas precisam de alinhamento. Ver [decisão e critérios de aceite](../frontend/documentacao/DECISAO-ESCOPO-MVP.md). Os 219 critérios anteriores permanecem; este adendo acrescenta os critérios específicos da decisão.

## Extensão interna implementada: tendências

`ExplicacaoPeriodo` aceita agora `tendencias?: ComparacaoTendencias`. O campo é opcional para compatibilidade com explicações antigas, mas necessário para concluir o requisito de tendências. Ausência exibe aviso explícito, sem fabricar comparação.

```json
{
  "anterior": {"inicio": "2026-10-04", "fim": "2026-10-06"},
  "indicadores": [
    {"titulo": "Entradas líquidas", "atual": 13200, "anterior": 11000},
    {"titulo": "Despesas pagas", "atual": null, "anterior": 0}
  ]
}
```

O exemplo corresponde ao pedido de 07 a 09/10/2026. Valores são centavos inteiros não negativos ou null (sem informação). Zero deve ser zero confirmado. A preparação atual compara o intervalo imediatamente anterior, de mesma quantidade de dias inclusivos, limitado a 366 dias. Essa é uma proposta demonstrativa a ratificar, não uma regra financeira já aprovada. A tela deriva apenas a variação de apresentação; agregação e autorização são do servidor. Não enviar saldo negativo nessa coleção de indicadores não negativos.

O adapter rejeita período divergente, valores inválidos e lista vazia. Se não houver dados, envie indicadores com null e explicação apropriada. A tela mantém a comparação disponível quando houver retorno com indicadores e texto vazio. Contratos que precisem carregar agregados independentemente de uma falha HTTP da IA devem separar as capacidades no próximo acordo; não apresentar essa independência remota como já implementada.
