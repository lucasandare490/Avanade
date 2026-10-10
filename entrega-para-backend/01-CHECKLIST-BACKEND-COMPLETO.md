# Checklist de implementação — Backend e banco de dados do Planner Comercial

Objetivo: entregar uma API executável, persistente e documentada que atenda ao dashboard React/TypeScript e ao POS Kotlin, com separação entre pagamento, split, rastreabilidade, despesas e caixa. O MVP é experimental: processamento demonstrativo deve permanecer identificado. Não habilitar transferências, recolhimento fiscal ou crédito real.

Este documento é uma especificação de entrega proposta para o responsável backend, baseada nos materiais do projeto e no frontend existente. Itens não marcados são obrigações a implementar ou decisões a ratificar, não funcionalidades já disponíveis no servidor. Não é necessário copiar os nomes internos do frontend se houver um mapeamento explícito e exemplos equivalentes.

Referências do projeto: V2 e entrega parcial preservadas na auditoria; design/protótipo e pesquisa de Thayná Batista da Silva; requisitos de Thayná Batista da Silva e Kleysson Teixeira. A documentação aponta Java/Spring Boot, PostgreSQL, React/TypeScript e Kotlin. Versões finais devem ser fixadas pelo responsável, com compatibilidade registrada. Não herdar FastAPI/Firestore do exemplo de outro projeto.

## O frontend que você vai receber

- Web: React 19, TypeScript 5.7 e Vite 6; navegação por hash; serviço demonstrativo em memória e adapter de API injetável.
- Android: Kotlin nativo; formulário de venda, revisão, histórico, detalhe, perfis demonstrativos e tentativa preservada na recriação; serviço demonstrativo assíncrono e adapter de transporte HTTPS.
- Modo web `demo` é local; `api` exige `VITE_API_URL` e `ContratoServidor` em `integracaoConfigurada.ts`. Nenhuma falha de API deve ser mascarada por fixture.
- Tipos internos web usam centavos inteiros, data/período explícitos e estados conhecidos. O backend pode adotar decimal textual se acordado; o adapter deve fazer conversão exata. Não enviar ponto flutuante ambíguo.
- Perfis gestor/financeiro/operador e 30 minutos de sessão são DEMONSTRATIVOS. Ratificar política real; ocultar botão não autoriza recurso.
- Consultas paginadas de operações e despesas são independentes. Dashboard e caixa esperam agregados do servidor, não somatório da página.
- Detalhe aceita pagamento, regra histórica e parcelas separadas. Campos ausentes não podem ser inventados pelo frontend.
- Simulação não cria venda. Explicação envia período; o servidor busca os fatos. IA nunca calcula imposto autoritativo ou movimenta dinheiro.
- Venda mantém chave para a mesma intenção. Despesa com confirmação desconhecida bloqueia repetição; é necessária uma capacidade de recuperação/idempotência para completar esse fluxo.
- Não existe backend real conectado neste pacote. Testes com respostas simuladas validam cliente, não banco ou autorização do servidor.

## Como usar esta lista

Marque cada item somente com evidência: arquivo, comando, exemplo de resposta ou resultado de teste. Quando uma decisão estiver em aberto, informe responsável, proposta, impacto e data de resolução. Não retorne apenas “feito”. Ao terminar, preencha `04-DEVOLUTIVA-DO-BACKEND.md`.


## 01. Base do projeto e execução

- [ ] BE-001 — Criar o backend na organização/pasta acordada, preservando README e créditos existentes; não sobrescrever o frontend.
- [ ] BE-002 — Fixar versões de Java, Spring Boot, gerenciador Maven/Gradle e PostgreSQL; incluir wrapper e lock/versionamento aplicável.
- [ ] BE-003 — Organizar controller/DTO, aplicação, domínio, persistência e integrações; não concentrar regra fiscal no controller.
- [ ] BE-004 — Utilizar Spring Web, validação de entrada, segurança, persistência e OpenAPI conforme a stack documentada; justificar mudanças.
- [ ] BE-005 — Fornecer `.env.example` sem senhas reais e documentar todas as variáveis obrigatórias, opcionais e padrões.
- [ ] BE-006 — Criar perfis de desenvolvimento, teste e demonstração; modo simulado deve ser determinado pelo servidor.
- [ ] BE-007 — Entregar Dockerfile e Compose com API e PostgreSQL, healthcheck e volume; não expor banco publicamente por padrão.
- [ ] BE-008 — Permitir subir banco vazio, aplicar migrations e iniciar API com os comandos do README.
- [ ] BE-009 — Fornecer endpoint de saúde sem expor credenciais, queries ou estrutura interna.
- [ ] BE-010 — Garantir que reiniciar API/container não apague vendas, despesas, idempotência ou eventos.
- [ ] BE-011 — Documentar porta, base URL local e URL acessível ao Android; localhost no emulador não significa computador.
- [ ] BE-012 — Não colocar auditoria privada, conversas, imagens pessoais, `.env`, dumps reais ou tokens no repositório.


## 02. Contrato e compatibilidade com o frontend

- [ ] BE-013 — Entregar OpenAPI versionado com schemas completos de request, sucesso e erros, incluindo autenticação.
- [ ] BE-014 — Documentar cada rota existente e cada rota proposta, diferenciando o que está implementado do que está planejado.
- [ ] BE-015 — Definir identificadores distintos de venda, pagamento, operação, parcela, evento, despesa e tentativa; informar relações.
- [ ] BE-016 — Definir representação monetária, moeda BRL, limite máximo e escala; proibir NaN, infinitos e valores negativos onde não fazem sentido.
- [ ] BE-017 — Definir representação de percentuais: por exemplo basis points ou decimal textual; não misturar 10, 0.10 e 1000.
- [ ] BE-018 — Definir arredondamento por parcela e tratamento de resíduo para garantir bruto = tributo + taxa + líquido.
- [ ] BE-019 — Definir timestamps com offset/UTC, fuso de negócio por loja, datas de competência e pagamento.
- [ ] BE-020 — Definir período de consulta inclusivo/exclusivo; exemplo recomendado: início inclusivo e próximo dia final exclusivo no fuso da loja.
- [ ] BE-021 — Definir campos obrigatórios, opcionais, null e listas vazias; ausência de saldo não equivale a saldo zero.
- [ ] BE-022 — Definir estados oficiais e a conversão para os rótulos do cliente; estado novo não pode virar concluído por padrão.
- [ ] BE-023 — Definir paginação com ordem estável e desempate por ID, limites de página/tamanho e total do filtro.
- [ ] BE-024 — Definir se total e itens são lidos no mesmo snapshot ou informar consistência eventual.
- [ ] BE-025 — Fornecer exemplos sintéticos copiáveis para sucesso, lista vazia, recusa, pendência, falha parcial e resposta inválida.
- [ ] BE-026 — Registrar versão, breaking changes e compatibilidade; alinhar DTOs antes de pedir que os clientes sejam conectados.


## 03. Autenticação, sessão e autorização

- [ ] BE-027 — Implementar login validado no servidor e erro genérico para credencial inválida, sem enumeração de contas.
- [ ] BE-028 — Definir provisionamento de usuários de teste; cadastro público não está automaticamente incluído no MVP.
- [ ] BE-029 — Armazenar senhas somente com função de hash apropriada; nunca devolver senha, hash ou segredo na API.
- [ ] BE-030 — Definir cookie HttpOnly/Secure/SameSite ou tokens e justificar a estratégia para web e Android.
- [ ] BE-031 — Se usar cookies, implementar proteção CSRF onde aplicável; CORS não substitui CSRF nem autorização.
- [ ] BE-032 — Se usar token, definir expiração, renovação, revogação, rotação e detecção de reutilização conforme arquitetura.
- [ ] BE-033 — Entregar endpoint de logout/revogação e comportamento quando sessão já estiver encerrada.
- [ ] BE-034 — Retornar identificador de sessão/usuário, nome público, estabelecimento autorizado, permissões e instante de expiração.
- [ ] BE-035 — Diferenciar 401 (sessão inválida/expirada) de 403 (autenticado sem permissão).
- [ ] BE-036 — Validar loja e papel em cada operação, consulta, agregado, exportação e reprocessamento.
- [ ] BE-037 — Não confiar em merchantId, role ou permissões enviados pelo cliente como prova de autorização.
- [ ] BE-038 — Definir política para usuário associado a mais de uma loja; sessão deve indicar contexto inequívoco.
- [ ] BE-039 — Limitar tentativas de login e solicitações excessivas; documentar 429 e eventual Retry-After.
- [ ] BE-040 — Fornecer três contas sintéticas correspondentes aos papéis acordados, sem reutilizar credenciais reais.


## 04. Cadastro da venda e pagamento demonstrativo

- [ ] BE-041 — Receber somente entradas necessárias: valor bruto, meio permitido, categoria quando exigida e chave da intenção.
- [ ] BE-042 — Derivar contexto da loja da sessão e validar valor, moeda, meio e categoria no servidor.
- [ ] BE-043 — Não confiar em tributo, taxa, líquido, destino ou status enviados pelo navegador.
- [ ] BE-044 — Persistir intenção e estado inicial antes de comunicar resultado que possa ser recuperado.
- [ ] BE-045 — Separar identidade/estado do pagamento do estado do split; pagamento confirmado não significa todas as parcelas concluídas.
- [ ] BE-046 — Implementar cenários demonstrativos controlados: sucesso, recusa, pendência, falha parcial e resposta perdida.
- [ ] BE-047 — Garantir que seletores de cenário de teste não permitam alterar processamento em ambiente real.
- [ ] BE-048 — Definir recusa: rastrear tentativa sem gerar split concluído nem entrada de caixa.
- [ ] BE-049 — Definir pagamento pendente e consulta posterior; não concluir apenas porque o tempo passou.
- [ ] BE-050 — Retornar venda/operationId e representação suficiente para abrir o detalhe após criação.
- [ ] BE-051 — Não acoplar confirmação de venda ao sucesso da IA, do dashboard ou de uma segunda requisição de leitura.
- [ ] BE-052 — Não implementar SDK de adquirente ou transferências reais sem escopo, credenciais, ambiente homologado e autorização próprios.


## 05. Idempotência, concorrência e recuperação

- [ ] BE-053 — Definir escopo da chave por loja, tipo de ação e intenção; documentar cabeçalho ou campo utilizado.
- [ ] BE-054 — Persistir chave, hash canônico da entrada, estado, recurso associado e resposta recuperável.
- [ ] BE-055 — Mesma chave e mesma entrada devem recuperar a mesma intenção/recurso; não criar duas vendas.
- [ ] BE-056 — Mesma chave com entrada diferente deve retornar conflito de domínio documentado, sem efeitos adicionais.
- [ ] BE-057 — Garantir exclusão concorrente no banco com unicidade/transação; verificar antes de inserir sem constraint não basta.
- [ ] BE-058 — Definir resposta enquanto primeira solicitação está em andamento; não usar 409 indiscriminadamente para toda repetição.
- [ ] BE-059 — Fornecer consulta por chave autorizada para recuperar resultado após timeout, recarga ou reinício do aplicativo.
- [ ] BE-060 — Não tratar timeout do cliente como prova de falha ou de cancelamento da gravação.
- [ ] BE-061 — Definir validade/retenção da chave e impedir reaproveitamento que possa duplicar efeitos após expiração.
- [ ] BE-062 — Aplicar política equivalente a despesas e retomadas; o formulário de despesa precisa resolver confirmação desconhecida.
- [ ] BE-063 — Cobrir falha entre commit e envio HTTP, reinício de processo e duas requisições concorrentes.
- [ ] BE-064 — Não repetir chamada externa de resultado incerto antes de reconciliar com o provedor ou referência idempotente.
- [ ] BE-065 — Em integrações futuras, usar outbox/inbox ou mecanismo equivalente para não perder eventos entre banco e fila.
- [ ] BE-066 — Documentar retries limitados, backoff e filas de erro; nenhum retry pode ignorar a semântica financeira.


## 06. Regras, split, parcelas e rastreabilidade

- [ ] BE-067 — Implementar TaxEngine e SplitEngine determinísticos no backend; IA não define alíquota ou destino.
- [ ] BE-068 — Manter regras demonstrativas explicitamente identificadas e versionadas, separadas de regras oficiais futuras.
- [ ] BE-069 — Congelar snapshot da regra usada na venda: versão, parâmetros, percentuais, cálculo e referência temporal.
- [ ] BE-070 — Não recalcular operação histórica com regra atual após mudança de configuração.
- [ ] BE-071 — Persistir cada parcela com identidade, tipo, valor, destino público e estado próprio.
- [ ] BE-072 — Validar conservação de valores e impedir parcelas negativas ou confirmação acima do bruto.
- [ ] BE-073 — Criar máquina de estados explícita para pagamento, split e parcelas, com transições permitidas.
- [ ] BE-074 — Gravar eventos ordenados com instante, correlação e descrição pública; manter detalhe técnico restrito.
- [ ] BE-075 — Na falha parcial, identificar exatamente quais parcelas estão confirmadas e quais estão pendentes.
- [ ] BE-076 — Retomar apenas etapas elegíveis, preservando parcelas já confirmadas e eventos anteriores.
- [ ] BE-077 — Definir comportamento para operação concluída, pendente, inexistente, de outra loja e em retomada concorrente.
- [ ] BE-078 — Não alterar ou apagar ledger histórico para corrigir valores; definir evento compensatório quando esse escopo for aprovado.
- [ ] BE-079 — Distinguir comprovante demonstrativo de documento fiscal ou prova de recolhimento real.
- [ ] BE-080 — Caso haja processamento assíncrono, fornecer estado consultável e critérios de término; WebSocket não é obrigatório.


## 07. Listas, detalhe e exportação

- [ ] BE-081 — Implementar lista de operações com busca por referência, período, status, meio, paginação e ordem definida.
- [ ] BE-082 — Validar parâmetros de filtros e retornar erro legível para intervalo invertido ou paginação inválida.
- [ ] BE-083 — Retornar detalhe pelo identificador correto com bruto, tributo, taxa, líquido, datas, pagamento e split.
- [ ] BE-084 — Incluir regra histórica, parcelas e destinos quando disponíveis; documentar ausência e exposição permitida.
- [ ] BE-085 — Entregar eventos/ledger públicos em ordem estável e com paginação se necessário.
- [ ] BE-086 — Proteger detalhe e eventos contra acesso cruzado entre estabelecimentos mesmo com ID conhecido.
- [ ] BE-087 — Garantir lista vazia com estrutura válida, sem transformar ausência de dados em erro interno.
- [ ] BE-088 — Se exportação for incluída, usar o filtro completo e a permissão correta, não apenas a página atual.
- [ ] BE-089 — Definir formato, limite, charset, moeda, fuso, processamento assíncrono e validade do download quando aplicável.
- [ ] BE-090 — Não incluir dados privados, segredos ou informações internas nas exportações.


## 08. Despesas

- [ ] BE-091 — Implementar criação e consulta paginada de despesas pagas, escopo atual do frontend.
- [ ] BE-092 — Fornecer catálogo/valores de categoria autorizados; não exigir categorias que o cliente não consegue consultar.
- [ ] BE-093 — Validar descrição, comprimento, valor, data de pagamento e categoria no servidor.
- [ ] BE-094 — Definir data mínima/máxima e correções; o limite temporal do cenário fictício não é regra oficial.
- [ ] BE-095 — Persistir estabelecimento, autor, chave de intenção, valor, moeda, data de pagamento e criação.
- [ ] BE-096 — Retornar recurso criado e referência recuperável, não apenas sucesso sem identificação.
- [ ] BE-097 — Definir idempotência e consulta de confirmação para uma despesa com resposta perdida.
- [ ] BE-098 — Não descontar novamente taxas que já foram incluídas na composição do split.
- [ ] BE-099 — Garantir efeito único no caixa do período correto e atualização consistente após cadastro.
- [ ] BE-100 — Não inventar vencido/pendente com base apenas na data; definir modelo antes de ampliar além de despesas pagas.
- [ ] BE-101 — Recorrência, edição, exclusão lógica, estorno e categorias sugeridas exigem regras e contratos próprios antes da implementação.
- [ ] BE-102 — Quando IA sugerir categoria, devolver sugestão revisável; não persistir mudança automaticamente.


## 09. Dashboard, caixa e simulação

- [ ] BE-103 — Entregar agregados por estabelecimento e período sem exigir que o cliente carregue todas as vendas.
- [ ] BE-104 — Definir quando líquido entra no caixa: pagamento, confirmação de parcela ou liquidação; documentar a escolha.
- [ ] BE-105 — Entregar saldo inicial, entradas reconhecidas, saídas, ajustes explícitos e saldo final conciliável.
- [ ] BE-106 — Não incluir pendências e previsões como dinheiro já disponível.
- [ ] BE-107 — Não contabilizar bruto e líquido da mesma venda duas vezes.
- [ ] BE-108 — Usar os mesmos filtros e regras em indicadores, gráfico, tabela e exportação.
- [ ] BE-109 — Definir agrupamentos diários/semanais, semanas parciais, intervalos vazios e saldo negativo.
- [ ] BE-110 — Retornar período aplicado, fuso, instante de atualização e regra de reconhecimento utilizada.
- [ ] BE-111 — Para projeções futuras, retornar horizonte, premissas, base e dados insuficientes; não vender previsão como certeza.
- [ ] BE-112 — Implementar simulação sem efeitos em venda, split persistido ou ledger.
- [ ] BE-113 — Validar parâmetros de simulação; retornar bruto, tributo, taxa, líquido, regra e inclusão de taxa.
- [ ] BE-114 — Cobrir a diferença documental de 150 − 15 = 135 sem taxa e 150 − 15 − 3 = 132 com taxa fictícia.
- [ ] BE-115 — Não expor dados de outra loja em agregados, mesmo quando não houver IDs individuais.


## 10. Explicações e IA

- [ ] BE-116 — Manter MockAIProvider e eventual provedor externo atrás de interface, com indicação clara da origem.
- [ ] BE-117 — Buscar fatos financeiros no servidor pelo período/ID autorizado; não aceitar totais do cliente como fonte confiável.
- [ ] BE-118 — Enviar ao provedor apenas dados necessários, sem credenciais e sem informação pessoal não requerida.
- [ ] BE-119 — Manter chaves do provedor somente em configuração de servidor e fora do Git/logs.
- [ ] BE-120 — Retornar texto, referência da consulta, origem, data e limitações quando aplicáveis.
- [ ] BE-121 — Não executar comandos, links, SQL ou ações financeiras contidos na resposta do modelo.
- [ ] BE-122 — Definir timeout, resposta vazia, dados insuficientes, indisponibilidade e limite de chamadas.
- [ ] BE-123 — Manter vendas, consulta e caixa funcionando quando a IA falhar.
- [ ] BE-124 — Não gerar benchmark ou recomendação fiscal sem fonte e regra aprovadas.
- [ ] BE-125 — Se houver cache, isolar por loja, período, versão dos dados e provedor; invalidar após mudança relevante.


## 11. Erros, segurança e operação

- [ ] BE-126 — Padronizar envelope de erro com código estável, mensagem pública, erros por campo e correlationId.
- [ ] BE-127 — Mapear 400/422, 401, 403, 404, 409, 429 e 5xx conforme contrato; não entregar stack trace, SQL ou segredo.
- [ ] BE-128 — Definir quais erros são definitivos e quais deixam resultado financeiro desconhecido.
- [ ] BE-129 — Configurar CORS para origens autorizadas; credenciais não podem depender de origem curinga.
- [ ] BE-130 — Usar HTTPS no ambiente compartilhado; fornecer caminho de desenvolvimento compatível com a política Android.
- [ ] BE-131 — Validar tamanho de payload, paginação, limites de busca e conteúdo de campos; usar queries parametrizadas.
- [ ] BE-132 — Aplicar timeouts de banco e integrações e não manter transações abertas esperando IA ou usuário.
- [ ] BE-133 — Proteger Actuator/Swagger administrativos conforme ambiente sem bloquear documentação de desenvolvimento acordada.
- [ ] BE-134 — Produzir logs estruturados com correlação e status, sem senha, token, payload financeiro completo ou dados pessoais desnecessários.
- [ ] BE-135 — Medir falhas, latência, pendências e retomadas; distinguir observabilidade técnica de ledger de negócio.
- [ ] BE-136 — Documentar backup/restore, retenção e acesso operacional; não prometer conformidade jurídica apenas pela existência do código.
- [ ] BE-137 — Configurar pipeline com testes, validação de migrations e análise de dependências; registrar versões e evidências.


## 12. Testes e entrega conjunta

- [ ] BE-138 — Testar cálculo e arredondamento com valores mínimos, limites, resíduos e composição de parcelas.
- [ ] BE-139 — Testar repetição idêntica, chave divergente, solicitações concorrentes e recuperação após commit sem resposta.
- [ ] BE-140 — Testar login válido/inválido, expiração, revogação, 401 e 403.
- [ ] BE-141 — Testar isolamento entre pelo menos duas lojas em lista, detalhe, ledger, despesa, exportação e agregados.
- [ ] BE-142 — Testar recusa, pagamento pendente, sucesso, falha parcial e retomada concorrente.
- [ ] BE-143 — Testar que a mesma parcela não é registrada ou confirmada duas vezes.
- [ ] BE-144 — Testar mudança de regra sem alteração de operações históricas.
- [ ] BE-145 — Testar despesa afetando caixa uma vez, exclusão de pendências e taxa não duplicada.
- [ ] BE-146 — Testar paginação estável, filtro vazio, limites de datas e horários próximos à meia-noite.
- [ ] BE-147 — Testar simulação sem escrita e IA indisponível sem interromper o núcleo.
- [ ] BE-148 — Testar migrations em banco vazio e atualização de banco com dados; não usar apenas H2 para provar comportamento PostgreSQL.
- [ ] BE-149 — Testar reinício da aplicação preservando dados e tentativa idempotente.
- [ ] BE-150 — Entregar relatório com comando, versão, ambiente, quantidade de testes, falhas e limitações, não só captura de tela verde.
- [ ] BE-151 — Executar roteiro conjunto com os dois clientes quando o contrato estiver mapeado; mocks do frontend não substituem essa etapa.
- [ ] BE-152 — Entregar todos os itens do formulário de devolutiva e relacionar cada pendência a um responsável.


Total: 152 critérios backend. Banco de dados detalhado em `02-CHECKLIST-BANCO-DE-DADOS.md`. Contratos e devolutiva nos documentos 03 e 04.

## Atualização obrigatória: tendências no MVP

Análise de tendências por IA faz parte do MVP. Crédito simulado e cancelamento ficam na evolução futura. O resumo textual de um período disponível hoje não encerra esse requisito. Incluir na implementação/devolutiva as séries de origem, períodos comparados, indicadores, tratamento de base zero/insuficiente, interpretação segura e contrato para a tela. As definições específicas precisam de alinhamento. Ver [decisão e critérios de aceite](../frontend/documentacao/DECISAO-ESCOPO-MVP.md). Os 219 critérios anteriores permanecem; este adendo acrescenta os critérios específicos da decisão.
