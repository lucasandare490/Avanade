> **Atualização de implementação:** comparação de tendências demonstrativa e apresentação de comparações remotas implementadas. A integração com dados e IA do servidor continua pendente. Esta atualização substitui os trechos anteriores sobre ausência da interface de comparação. Veja [implementação de tendências](TENDENCIAS-IMPLEMENTADAS.md).

> **Atualização de escopo:** análise de tendências por IA pertence ao MVP e está pendente além do resumo atual. Crédito simulado e cancelamento ficam na evolução futura. Esta decisão prevalece sobre classificações anteriores desses temas. Consulte [DECISAO-ESCOPO-MVP.md](DECISAO-ESCOPO-MVP.md).

# Validação e entrega — 10/10/2026

Este relatório substitui os avisos antigos de revisão não testada. O pedido mais recente autorizou expressamente os testes. O checklist de planejamento não é um certificado de conclusão do sistema.

## Escopo entregue

Web React/TypeScript com login demonstrativo por perfil, dashboard, operações, detalhes, venda simulada, despesas pagas, caixa realizado, simulação, explicações demonstrativas, configuração informativa e ajuda. Cliente Android Kotlin separado com venda, recuperação, histórico, detalhe, sessão demonstrativa e estados de rede. Ambos mantêm pagamentos identificados como simulados.

Os cálculos de 10% de tributo e 2% de taxa são cenários fictícios. Não representam legislação. O frontend não acessa PostgreSQL e não implementa o motor tributário autoritativo.

## Correções desta validação

- Saída da sessão volta ao dashboard antes de abrir nova sessão, evitando conservar uma rota sem permissão do perfil seguinte.
- Testes web executados com um worker para evitar colisões de arquivos temporários no ambiente utilizado.
- Consultas obsoletas são canceladas/ignoradas; erro de API não muda silenciosamente para dados fictícios.
- Indicadores ausentes continuam ausentes, sem conversão para zero. Tabela remota usa identificação compatível com seu modo.
- Transporte web exige HTTPS fora do computador local, rejeita credenciais na URL e não segue redirecionamentos de requisições autenticadas.
- POS Android separa cliente de dados, estado e interface; histórico, detalhe, venda e retomada passam pelo cliente assíncrono. Recriação preserva tentativa e chaves de retomada, sem envio automático.
- Ambiente Android, wrapper e APK debug preparados. Backup dos dados foi desativado; ícone e regras de extração adicionados; target/compile SDK 35.

## Evidências reproduzíveis

Resultado final: **59/59 testes web e 14/14 testes Android aprovados**. Análise lint Android: zero erros e zero avisos. A primeira repetição completa dos testes web sofreu timeouts na máquina compartilhada; o relatório está preservado em historico/testes-timeout-maquina-2026-10-10.json. A configuração de testes ampliou o prazo de fluxos e verificações axe, mantendo as mesmas asserções. A rodada final passou integralmente.

| Verificação | Registro |
|---|---|
| Testes web: resultado e nomes de cada caso | `testes-atualizados.json` |
| Tipos e build web | `resultado-build-atual.txt` |
| Testes Android unitários e Robolectric | `evidencias-android/TEST-*.xml` |
| Compilação, testes e lint Android | `evidencias-android/validacao-android-final.log` |
| Análise estática Android | `evidencias-android/lint-results-debug.xml` |
| Dependências web | `auditoria-dependencias-atualizada.json` |

Os testes web incluem valores, serviço demonstrativo, fluxos de interface, acessibilidade estrutural, validação de respostas, erros HTTP, sessão, autorização visual e chamadas com serviços substitutos. Os testes Android incluem repositório e ciclo de vida com Robolectric. Serviços substitutos exercitam o cliente; não comprovam persistência, isolamento de lojas ou idempotência no servidor.

A auditoria npm registrou zero vulnerabilidades conhecidas no momento da consulta. Isso não equivale a auditoria completa de segurança. A conferência de interface no navegador realizada nesta tarefa incluiu dashboard, navegação móvel, filtro, detalhe e retorno preservado; não equivale a homologação integral contra cada tela do Figma.

## Limites de aceite

1. API executável, DTOs, autenticação, regras financeiras, persistência e recuperação após encerramento definitivo dependem do backend. A estrutura de integração está escrita, mas precisa ser adaptada ao contrato aprovado e testada com o servidor.
2. Android: o APK foi compilado e os testes de framework executados em JVM. Não houve instalação/homologação em maquineta ou aparelho físico. Robolectric não é essa homologação.
3. Acessibilidade: verificações automatizadas e semântica/foco cobrem parte do trabalho. Leitor de tela real, TalkBack e teclado virtual no aparelho escolhido exigem execução nesse ambiente.
4. Fidelity visual: referência e autoria do Figma preservadas; aceite de todas as diferenças com a designer permanece pendente.
5. Hospedagem pública, publicação em loja, push e merge não foram realizados. Crédito, estorno, recorrência, PWA e SDK de maquineta não foram inventados como requisitos aprovados.

## Material para integração

`../../entrega-para-backend/` contém checklist de backend, checklist de banco, contratos internos/exemplos e formulário de devolutiva. O responsável deve devolver código reproduzível, OpenAPI, migrations, dados fictícios, testes, instruções e decisões preenchidas. A lista foi criada para orientar a implementação; não afirma que o backend já existe.
