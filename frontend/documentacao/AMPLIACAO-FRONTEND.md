> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> **Registro histórico de uma etapa anterior.** Os avisos de não realização de testes abaixo descrevem aquela etapa. Para o estado vigente, consulte [RELATORIO-VALIDACAO-ATUAL.md](RELATORIO-VALIDACAO-ATUAL.md).

# Ampliação do frontend — código ainda não verificado

Esta rodada atende ao pedido de avançar em tudo que é possível no frontend e preparar partes compartilhadas. Não foram executados testes, build, auditoria de dependências ou revisão no navegador. Os resultados anteriores foram preservados como histórico e não se aplicam automaticamente às alterações.

## Implementação web adicionada

| Frente | Arquivos | Comportamento |
|---|---|---|
| Transporte | servicos/transporteApi.ts | GET/POST/PUT/PATCH/DELETE, AbortSignal, timeout 15s, validação da resposta, mensagem por status, sem retry de gravação e sem fallback para mock |
| Capacidades documentadas | servicos/capacidadesApi.ts | Login, lista/detalhe, ledger, venda, retomada, despesa, caixa, simulação e explicação; request/response genéricos porque schema não foi ratificado |
| Ambiente | .env.example, servicos/configuracaoAmbiente.ts | URL central preparada, sem ativação automática |
| Consulta e arquivo | TelaOperacoes.tsx, exportarRelatorio.ts | Todas as parcelas na tabela, CSV do filtro completo, valores em centavos e proteção contra fórmula de planilha |
| Comprovante | TelaOperacoes.tsx, estilos.css | Impressão do detalhe com identificação de simulação; sem valor fiscal |
| Recuperação | Aplicacao.tsx, TelaVendaDemonstrativa.tsx | Mantém tela de venda montada entre rotas; guarda a mesma chave; avisa antes de descarregar página em resultado desconhecido |
| Acesso | TelaEstadosAcesso.tsx | Prévia isolada de login, cadastro, sessão expirada, acesso negado e indisponível; sem API ou armazenamento de senha |
| Estados gerais | Aplicacao.tsx, TelaConfiguracoes.tsx | Alternância controlada de cenários sem apagar registros; restauração da visualização normal |
| Análise | TelaAnalise.tsx | Período, ausência de dados, carregamento e tempo excedido |
| Ajuda | TelaAjuda.tsx | Termos, recuperação, diferenças entre caixa/simulação e guia de teclado |
| Acessibilidade | ElementosInterface.tsx, estilos.css, TelaDespesas.tsx | Tabelas focáveis, associação adicional de erros, Escape no formulário, alvos móveis maiores |
| Rede | AvisoConexao.tsx | Informa estado offline sem interpretar navigator.onLine como prova de API disponível |

## Android

Foi criada a pasta irmã android-pos, com Activity Kotlin nativa, modelos, repositório exclusivamente demonstrativo, tema, manifest e configuração Gradle. Inclui entrada sem senha, valor, revisão, cenários, confirmação, histórico, detalhe e retomada. Mantém tentativa e registros fictícios no estado salvo para recriação da Activity; não equivale a persistência financeira. Consulte ../android-pos/README.md a partir da pasta frontend.

Não há wrapper, APK, execução em emulador, fidelidade visual validada ou integração de maquineta. A seleção de Android mínimo/target é proposta técnica, não decisão ratificada da equipe.

## O que não se resolve exclusivamente com mais código de interface

- Contrato e API executável: schemas, paginação, agregações, autorização por loja e erros de campo.
- Sessão: cookie/token, renovação, revogação, CSRF/CORS e provisionamento do cadastro.
- Operação: identidade, estados, chave de idempotência, regras e recuperação persistente.
- Produto: reconhecimento de caixa, saldo inicial, projeções, recorrência, crédito e estorno.
- Distribuição: repositório/branch, revisão, domínio/servidor, dispositivo Android e homologação.
- Evidência: novos testes, build, teclado/leitor de tela e dispositivo; adiados pelo pedido do usuário.

Não é correto marcar os 297 itens concluídos. Os itens preparados nesta rodada foram sinalizados no STATUS-CHECKLIST.md como ampliados e não verificados.

## Atenções para revisão posterior

Revisar navegação enquanto envio está em andamento, fluxo de saída, cenários de visualização vazia com gravação, impressão/CSV em diferentes navegadores e restauração Android. A venda permanece apenas na memória da página web; sair ou recarregar reinicia o cenário. A prévia de acesso nunca deve ser usada como autenticação de produção.

## Complementos finais desta rodada

Consulta de operações agora oferece filtro de pagamento e ordenação por data/valor; o CSV respeita a seleção completa. Despesas e movimentos de caixa também possuem exportação filtrada demonstrativa. As parcelas restantes de operação com falha aparecem como pendentes, preservando a parcela tributária confirmada. Código novo ainda não verificado.
