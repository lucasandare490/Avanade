# Checklist completo — Frontend do Planner Comercial

Versão de planejamento: 09/10/2026. Base: V2, entrega parcial, personas, mapa de navegação, protótipo de Thayná e auditoria das fontes. Este documento não atesta implementação nem atribui tarefas a integrantes sem aceite. O exemplo do “e aí, marcou?” foi usado apenas como referência de detalhamento.

**Objetivo:** desenvolver o dashboard web React/TypeScript e a interface Android/Smart POS Kotlin, seguindo o protótipo, integrados à API documentada em Java/Spring Boot. Demonstrar vendas e split simulados, consulta de operações e gestão financeira com dados coerentes. PostgreSQL é acessado pelo backend, nunca diretamente pelos clientes.

**Como usar:** cada checkbox deve ter evidência antes de ser marcado: tela, teste, contrato, revisão ou execução. Concluir com dados fictícios não equivale a integrar à API real. “API real” aqui significa backend executável do projeto; os pagamentos continuam simulados.

**Legenda por seção:** BASE = comportamento documentado; TÉCNICA = recomendação de implementação/qualidade; DECISÃO = preparação possível, comportamento definitivo depende de acordo; CONDICIONAL = implementar somente se mantido no escopo. P1 = primeiro fluxo e dependências; P2 = complementos documentados; P3 = desejáveis. Cada seção informa sua base; esses códigos não substituem os IDs dos documentos originais.

## 1. Escopo, autoria e divisão de trabalho — P1 / BASE + DECISÃO

- [ ] FE-001 — Adotar V2 e entrega parcial como referência de trabalho, preservando V1 como histórico.
- [ ] FE-002 — Registrar divergências do README e propor sua conciliação com a stack documentada.
- [ ] FE-003 — Preservar os créditos do design/protótipo e pesquisa a Thayná e dos requisitos a Thayná e Kleysson.
- [ ] FE-004 — Separar entregas do dashboard web das entregas do aplicativo Kotlin; uma não comprova a conclusão da outra.
- [ ] FE-005 — Definir quem desenvolve e revisa cada cliente, sem presumir disponibilidade de alguém pela autoria anterior.
- [ ] FE-006 — Identificar cada tela como primeiro incremento, complemento, proposta ou fora do MVP.
- [ ] FE-007 — Registrar que crédito, cancelamento/estorno e tendências ampliadas continuam pendentes de definição.
- [ ] FE-008 — Confirmar o dispositivo Android de demonstração e os critérios de entrega com a equipe.
- [ ] FE-009 — Manter o rótulo SIMULADO nas experiências que representam pagamento, split e comprovante.
- [ ] FE-010 — Não transportar do outro projeto FastAPI, Firestore, identidade visual, requisitos de idosos, PWA obrigatória ou endpoints de agendamento.

**Aceite:** escopo por cliente e registro de pendências legíveis; nenhuma proposta aparece como decisão já aprovada.

## 2. Base do dashboard web — P1 / BASE + TÉCNICA

- [ ] FE-011 — Criar a aplicação web com React e TypeScript, conforme documentação.
- [ ] FE-012 — Registrar a escolha da ferramenta de build; Vite é uma sugestão, não uma exigência encontrada nas fontes.
- [ ] FE-013 — Selecionar uma solução de rotas compatível com a aplicação e registrar a escolha.
- [ ] FE-014 — Organizar páginas, componentes, serviços de dados, tipos e recursos visuais com responsabilidades claras.
- [ ] FE-015 — Configurar checagem de tipos e scripts de execução, build e testes pertinentes.
- [ ] FE-016 — Centralizar a URL da API por ambiente; usar VITE_API_URL somente se Vite for escolhido.
- [ ] FE-017 — Criar arquivo de exemplo de configuração sem credenciais.
- [ ] FE-018 — Separar explicitamente modo demonstrativo com fixtures e modo integrado à API.
- [ ] FE-019 — Impedir que uma falha da API faça a aplicação trocar silenciosamente para dados fictícios.
- [ ] FE-020 — Manter os mesmos contratos de dados nos adapters de demonstração e integração.
- [ ] FE-021 — Implementar página de endereço inexistente e recuperação de falha inesperada de renderização.
- [ ] FE-022 — Garantir que acesso direto e atualização de uma rota interna funcionem no ambiente escolhido.
- [ ] FE-023 — Fixar dependências no arquivo de lock e documentar requisitos do ambiente.
- [ ] FE-024 — Não tornar Tailwind, Lucide ou outra biblioteca obrigatórios apenas por aparecerem na lista de referência.

**Aceite:** aplicação inicia e gera build; os dois modos são identificáveis; estrutura permite trocar o fornecedor de dados sem reescrever as telas.

## 3. Identidade visual e componentes — P1 / BASE + TÉCNICA

- [ ] FE-025 — Inventariar cores, tipografia, espaçamentos, ícones, cartões, tabelas e estados do Figma.
- [ ] FE-026 — Definir tokens visuais reutilizáveis, preservando a identidade do Planner Comercial.
- [ ] FE-027 — Criar componentes de botão primário, secundário, destrutivo e somente ícone, com nomes acessíveis.
- [ ] FE-028 — Criar campos de texto, senha, valor monetário, seleção e período com rótulo e erro associado.
- [ ] FE-029 — Criar cartões de indicador com título, valor, período e estado de carregamento.
- [ ] FE-030 — Criar tabela/lista de operações com versão utilizável em tela pequena.
- [ ] FE-031 — Criar badges de status com texto e ícone; cor não deve ser a única informação.
- [ ] FE-032 — Criar mensagens de sucesso, erro, aviso e informação com linguagem consistente.
- [ ] FE-033 — Criar estados de carregamento, lista vazia, acesso negado e serviço indisponível.
- [ ] FE-034 — Criar modal ou painel de detalhe com fechamento por teclado e restauração de foco.
- [ ] FE-035 — Criar apresentação consistente de moeda, percentuais, datas e identificadores.
- [ ] FE-036 — Reutilizar os padrões visuais sem copiar dados incoerentes do protótipo.

**Aceite:** componentes cobrem estados normais e de erro; uma mudança de token é refletida nas telas relacionadas.

## 4. Navegação, sessão e acesso web — P1 / BASE + DECISÃO

- [ ] FE-037 — Implementar navegação para dashboard, operações, financeiro, despesas, simulação e explicações, conforme a fase entregue.
- [ ] FE-038 — Destacar a página atual e manter navegação utilizável em celular e desktop.
- [ ] FE-039 — Implementar login com rótulos, validação de preenchimento e envio protegido contra clique duplo.
- [ ] FE-040 — Exibir erro de credencial inválida sem revelar detalhes internos da conta.
- [ ] FE-041 — Diferenciar login demonstrativo de autenticação validada pelo backend.
- [ ] FE-042 — Preparar cadastro básico documentado; alinhar campos, criação da loja e provisionamento antes de integrar.
- [ ] FE-043 — Definir com o backend o mecanismo de sessão, expiração e renovação, se houver.
- [ ] FE-044 — Implementar proteção de navegação para páginas autenticadas, sem tratá-la como autorização de servidor.
- [ ] FE-045 — Exibir estabelecimento e usuário do contexto autenticado, quando disponíveis no contrato.
- [ ] FE-046 — Tratar sessão expirada levando ao login e evitando ciclos de redirecionamento.
- [ ] FE-047 — Distinguir sessão inválida de usuário autenticado sem permissão.
- [ ] FE-048 — Implementar saída e limpeza de dados da sessão na interface e no cache do cliente.
- [ ] FE-049 — Impedir que dados de uma sessão anterior reapareçam após entrada de outro usuário.
- [ ] FE-050 — Alinhar matriz mínima de permissões para consulta, venda, despesa e reprocessamento.
- [ ] FE-051 — Ocultar ou desabilitar ações sem permissão, mantendo a validação obrigatória no backend.
- [ ] FE-052 — Não oferecer recuperação de senha, convites ou administração de usuários como funcionais sem fluxo e API definidos.

**Aceite:** login, expiração e logout funcionam no modo avaliado; troca de sessão não reapresenta informações da conta anterior.

## 5. Dados demonstrativos e consistência — P1 / TÉCNICA

- [ ] FE-053 — Criar conjunto fictício único para operações, parcelas, despesas e indicadores.
- [ ] FE-054 — Atribuir identificadores únicos e relacionamentos coerentes entre os registros.
- [ ] FE-055 — Usar datas coerentes e período de demonstração visível; não apresentar 2024 como dados atuais.
- [ ] FE-056 — Incluir operações concluídas, em processamento e com falha, conforme estados propostos e depois ratificados.
- [ ] FE-057 — Separar status do pagamento de status do split e das parcelas.
- [ ] FE-058 — Incluir cenário de R$150,00, tributo demonstrativo R$15,00, taxa R$3,00 e líquido R$132,00.
- [ ] FE-059 — Identificar 10% e 2% como parâmetros fictícios do cenário, sem apresentá-los como alíquotas oficiais.
- [ ] FE-060 — Incluir lista vazia, dados insuficientes, erro, lentidão e acesso negado como cenários reproduzíveis.
- [ ] FE-061 — Derivar indicadores demonstrativos dos mesmos registros usados em listas e detalhes.
- [ ] FE-062 — Garantir igualdade exata entre bruto e soma das parcelas nas fixtures.
- [ ] FE-063 — Não usar dados pessoais, contatos ou conversas reais do grupo como massa demonstrativa.
- [ ] FE-064 — Documentar que fixtures não são persistência real nem evidência de backend concluído.

**Aceite:** abrir qualquer registro conserva identidade e valores; filtros e totais representam o mesmo conjunto.

## 6. Histórico de operações — P1 / BASE

- [ ] FE-065 — Exibir lista com identificação, data, bruto, tributo, taxa, líquido e status, conforme disponibilidade do contrato.
- [ ] FE-066 — Permitir abrir o detalhe pelo identificador da operação selecionada.
- [ ] FE-067 — Implementar filtro por período com validação de início e fim.
- [ ] FE-068 — Alinhar filtros adicionais de status e meio de pagamento com a API antes de exibi-los como funcionais.
- [ ] FE-069 — Definir fuso e limites do período com o backend para evitar perda de vendas na mudança de dia.
- [ ] FE-070 — Implementar paginação ou carregamento incremental conforme contrato.
- [ ] FE-071 — Reiniciar paginação quando o filtro mudar.
- [ ] FE-072 — Distinguir ausência de operações de ausência de resultado para os filtros.
- [ ] FE-073 — Permitir limpar filtros e recuperar a consulta inicial.
- [ ] FE-074 — Evitar que resposta antiga sobrescreva uma busca mais recente.
- [ ] FE-075 — Mostrar atualização ou carregamento sem permitir ações sobre registros de outro filtro por engano.
- [ ] FE-076 — Preservar filtro e posição de navegação ao retornar do detalhe, quando viável.
- [ ] FE-077 — Não calcular total geral somando apenas a página carregada; usar agregação correspondente ao filtro.

**Aceite:** lista, filtro, paginação e detalhe mantêm relação correta com a consulta e o estabelecimento.

## 7. Detalhe, parcelas e reprocessamento — P1 / BASE + DECISÃO

- [ ] FE-078 — Buscar o detalhe pelo ID da rota, sem fixture fixa para todas as operações.
- [ ] FE-079 — Exibir bruto, tributo, taxa e líquido da operação consultada.
- [ ] FE-080 — Exibir datas, referência da venda e meio de pagamento quando definidos no contrato.
- [ ] FE-081 — Mostrar cada parcela e seu destino demonstrativo sem insinuar recolhimento real.
- [ ] FE-082 — Exibir regra e percentuais históricos retornados pela operação, sem aplicar regras atuais à venda antiga.
- [ ] FE-083 — Apresentar etapas e eventos do histórico de forma cronológica e compreensível.
- [ ] FE-084 — Distinguir pagamento confirmado de split concluído.
- [ ] FE-085 — Apresentar falha parcial indicando parcelas confirmadas e pendentes, se disponibilizadas.
- [ ] FE-086 — Mostrar resposta desconhecida após timeout sem concluir automaticamente que a operação falhou.
- [ ] FE-087 — Oferecer consulta/atualização do estado antes de sugerir novo envio.
- [ ] FE-088 — Exibir reprocessamento somente para estado e perfil autorizados pelo contrato.
- [ ] FE-089 — Explicar a ação de retomada e impedir cliques repetidos durante a solicitação.
- [ ] FE-090 — Atualizar detalhe, histórico e indicadores pertinentes após retorno confirmado.
- [ ] FE-091 — Não remover visualmente o histórico anterior após reprocessamento.
- [ ] FE-092 — Não reenviar individualmente parcelas confirmadas a partir de decisões locais do frontend.
- [ ] FE-093 — Tratar operação inexistente, acesso negado e indisponibilidade como estados diferentes.
- [ ] FE-094 — Não oferecer edição ou exclusão de eventos do ledger.

**Aceite:** uma operação de R$487,50 não abre o detalhe de R$150,00; falha e retomada são representadas sem sucesso fictício nem repetição financeira pelo cliente.

## 8. Dashboard financeiro — P2 / BASE + DECISÃO

- [ ] FE-095 — Apresentar período de referência e estabelecimento dos indicadores.
- [ ] FE-096 — Exibir vendas brutas, tributos, taxas e líquido como grandezas distintas.
- [ ] FE-097 — Usar “entradas líquidas” quando o indicador representar líquido elegível para o caixa.
- [ ] FE-098 — Alinhar o momento de reconhecimento da entrada antes da integração financeira definitiva.
- [ ] FE-099 — Distinguir ausência de informação de valor zero.
- [ ] FE-100 — Conciliar cartões, gráficos e tabelas com a mesma fonte e filtros.
- [ ] FE-101 — Permitir navegar de um indicador para a lista correspondente quando esse vínculo estiver implementado.
- [ ] FE-102 — Exibir comparações somente quando existirem dois períodos compatíveis.
- [ ] FE-103 — Tratar base anterior zero ou ausente sem percentual infinito ou crescimento inventado.
- [ ] FE-104 — Identificar dado desatualizado quando a atualização falhar; não apresentá-lo como consulta recente.
- [ ] FE-105 — Fornecer alternativa textual aos gráficos e rótulos que não dependam só de cores.
- [ ] FE-106 — Não incorporar saldo de simulações gerenciais aos indicadores de vendas realizadas.

**Aceite:** cada número pode ser explicado pelos registros e pela regra de agregação; o erro de bruto apresentado como líquido não se repete.

## 9. Despesas — P2 / BASE + DECISÃO

- [ ] FE-107 — Criar formulário com campos acordados para descrição, valor, categoria e data.
- [ ] FE-108 — Validar valor positivo, formato de data e campos obrigatórios antes do envio.
- [ ] FE-109 — Preservar campos preenchidos após falha recuperável.
- [ ] FE-110 — Exibir envio, confirmação e erro sem criar registro definitivo antes do retorno da API.
- [ ] FE-111 — Atualizar lista e consultas financeiras afetadas após cadastro confirmado.
- [ ] FE-112 — Permitir consultar despesas por período conforme API.
- [ ] FE-113 — Alinhar se edição e exclusão pertencem ao MVP; não presumir esses endpoints.
- [ ] FE-114 — Definir vencimento, pagamento e estados antes de reproduzir pago/pendente/vencido do Figma.
- [ ] FE-115 — Implementar recorrência somente após definição de campos, geração e efeitos no caixa.
- [ ] FE-116 — Diferenciar taxa já deduzida no split de despesa independente para evitar desconto duplicado.
- [ ] FE-117 — Não deduzir automaticamente despesa prevista do caixa realizado.
- [ ] FE-118 — Preparar sugestão de categoria como valor revisável, se a funcionalidade P3 for mantida.

**Aceite:** a despesa cadastrada aparece uma vez e afeta o período correto; estados adicionais não são inventados a partir da data sem regra acordada.

## 10. Fluxo de caixa e projeção — P2 / BASE + DECISÃO

- [ ] FE-119 — Apresentar saldo inicial, entradas, saídas e saldo final com período explícito.
- [ ] FE-120 — Alinhar fórmula, fuso, reconhecimento financeiro e fonte do saldo inicial com o backend.
- [ ] FE-121 — Separar movimentos realizados de previstos.
- [ ] FE-122 — Conciliar saldo final com saldo inicial mais entradas menos saídas e eventuais ajustes identificados.
- [ ] FE-123 — Garantir que a soma das semanas concilie com o total do mesmo intervalo.
- [ ] FE-124 — Tratar semanas parciais e intervalos sem movimento.
- [ ] FE-125 — Exibir projeção como estimativa, com horizonte, premissas e data de referência.
- [ ] FE-126 — Mostrar dados insuficientes quando não houver base para projetar.
- [ ] FE-127 — Não extrapolar previsão localmente com fórmula escolhida sem alinhamento.
- [ ] FE-128 — Exibir saldo negativo claramente sem depender só de vermelho.
- [ ] FE-129 — Diferenciar alerta determinístico de caixa de explicação textual por IA.
- [ ] FE-130 — Manter consulta financeira utilizável quando o serviço de explicação estiver indisponível.

**Aceite:** nenhum saldo exige adivinhar ajustes; previsão nunca aparece como dinheiro disponível confirmado.

## 11. Simulação gerencial — P2 / BASE + DECISÃO

- [ ] FE-131 — Criar tela separada do registro efetivo de venda demonstrativa.
- [ ] FE-132 — Identificar explicitamente que a simulação não cria venda, split persistido ou entrada de caixa.
- [ ] FE-133 — Validar valor e parâmetros permitidos pelo contrato.
- [ ] FE-134 — Informar se taxa de pagamento está incluída no resultado.
- [ ] FE-135 — Explicar a diferença entre R$135,00 sem a taxa do exemplo e R$132,00 com taxa demonstrativa de 2%.
- [ ] FE-136 — Exibir entrada e resultado juntos para permitir conferência do cenário.
- [ ] FE-137 — Marcar resultado anterior como desatualizado quando os parâmetros forem alterados.
- [ ] FE-138 — Tratar solicitação inválida, indisponibilidade e ausência de regra com mensagens específicas.
- [ ] FE-139 — Evitar que uma resposta antiga apareça como resultado de parâmetros novos.
- [ ] FE-140 — Não transformar simulação em apuração tributária oficial ou recomendação fiscal.

**Aceite:** simular não modifica históricos financeiros; o resultado informa exatamente quais parcelas considera.

## 12. Explicações e IA — P2/P3 / BASE + CONDICIONAL

- [ ] FE-141 — Exibir explicação do split e dos indicadores somente sobre dados identificados da operação/período.
- [ ] FE-142 — Diferenciar resposta demonstrativa do MockAIProvider de resposta produzida por provedor externo.
- [ ] FE-143 — Implementar carregamento, resposta vazia, erro, timeout e dados insuficientes.
- [ ] FE-144 — Manter valores oficiais da aplicação visíveis quando a explicação falhar.
- [ ] FE-145 — Evitar que explicação de consulta anterior apareça junto de outro período ou outra operação.
- [ ] FE-146 — Renderizar texto recebido sem execução de HTML ou código arbitrário.
- [ ] FE-147 — Não permitir que texto da IA execute reprocessamento, altere despesa ou movimente valores.
- [ ] FE-148 — Não enviar totais editáveis pelo cliente como fonte financeira confiável para o servidor.
- [ ] FE-149 — Identificar comparações com os dados que as sustentam; não reproduzir benchmark “ideal” sem fonte.
- [ ] FE-150 — Permitir corrigir categoria sugerida caso a funcionalidade P3 seja mantida.
- [ ] FE-151 — Mostrar alertas somente a partir de condições definidas e dados do backend.
- [ ] FE-152 — Manter chaves de provedor externo exclusivamente no backend.

**Aceite:** explicação ajuda a ler os números, mas não os substitui nem altera; o núcleo funciona sem API paga de IA.

## 13. Configurações e itens do mapa — P3 / DECISÃO + CONDICIONAL

- [ ] FE-153 — Classificar perfil da loja, usuários, notificações, integrações e exportação quanto ao escopo efetivamente aceito.
- [ ] FE-154 — Exibir somente dados de configuração disponíveis e autorizados pelo backend.
- [ ] FE-155 — Não oferecer botão Salvar funcional sem persistência e tratamento de erro.
- [ ] FE-156 — Não permitir alterar regime ou alíquota por controle visual sem regra, permissão e contrato definidos.
- [ ] FE-157 — Se exportação for aprovada, definir formato, campos, período, permissões e origem dos dados.
- [ ] FE-158 — Garantir que exportação represente o filtro completo, não apenas a página visível, conforme escopo acordado.
- [ ] FE-159 — Identificar conteúdo indisponível ou retirar a ação da navegação da entrega, evitando botão sem efeito.
- [ ] FE-160 — Não apresentar integração bancária, crédito ou recolhimento real como ativos no MVP.

**Aceite:** menus e controles descrevem capacidades existentes, sem prometer funções que apenas aparecem no mapa.

## 14. Cliente Android/Smart POS — P1 / BASE + TÉCNICA + DECISÃO

Esta é uma frente própria. Pode ser entregue por outra pessoa sem bloquear a estrutura inicial do dashboard web. A implementação Android não é uma PWA nem é comprovada por uma moldura de iPhone no protótipo.

- [ ] FE-161 — Criar o cliente Kotlin conforme documentação e definir versões compatíveis do ambiente Android.
- [ ] FE-162 — Confirmar Android mínimo, emulador/aparelho e orientação de demonstração.
- [ ] FE-163 — Organizar interface, estado das telas e comunicação HTTP em responsabilidades separadas.
- [ ] FE-164 — Configurar endereço da API conforme emulador/dispositivo, sem presumir que localhost aponta para o computador.
- [ ] FE-165 — Implementar login, saída, sessão expirada e acesso negado.
- [ ] FE-166 — Implementar início com acesso à nova venda e histórico.
- [ ] FE-167 — Implementar entrada de valor com teclado apropriado e leitura correta de vírgula decimal.
- [ ] FE-168 — Validar vazio, zero, negativo e limites acordados.
- [ ] FE-169 — Exibir meios e categorias realmente permitidos pelo contrato demonstrativo.
- [ ] FE-170 — Não tratar categorias 8%, 10% e 12% do protótipo como legislação validada.
- [ ] FE-171 — Mostrar resumo antes de enviar a venda, com identificação de simulação.
- [ ] FE-172 — Enviar os campos de entrada acordados; receber cálculos e estados do backend.
- [ ] FE-173 — Gerar/manter identificador de tentativa conforme contrato de idempotência.
- [ ] FE-174 — Reutilizar a mesma chave ao consultar/repetir a mesma tentativa após perda de resposta.
- [ ] FE-175 — Gerar nova chave apenas para uma nova intenção de venda.
- [ ] FE-176 — Proteger contra toque duplo sem considerar essa proteção suficiente para idempotência financeira.
- [ ] FE-177 — Mostrar pagamento aguardando confirmação, confirmado ou recusado conforme estado recebido.
- [ ] FE-178 — Mostrar andamento e resultado do split separadamente do pagamento.
- [ ] FE-179 — Tratar timeout como resultado possivelmente desconhecido e permitir recuperação segura do estado.
- [ ] FE-180 — Exibir parcelas e comprovante demonstrativo sem afirmar recolhimento fiscal real.
- [ ] FE-181 — Implementar histórico e detalhe pelo identificador correto.
- [ ] FE-182 — Reutilizar critérios de falha parcial e reprocessamento das seções anteriores.
- [ ] FE-183 — Preservar ou recuperar tentativa ativa após retorno à tela, rotação ou recriação do aplicativo, conforme estratégia acordada.
- [ ] FE-184 — Não reenviar cobrança automaticamente ao reabrir ou recompor uma tela.
- [ ] FE-185 — Garantir que o teclado não esconda valor, erro ou ação principal.
- [ ] FE-186 — Apresentar falta de rede e permitir consulta posterior sem fabricar confirmação local.
- [ ] FE-187 — Não criar fila de pagamentos offline sem projeto específico e contrato correspondente.
- [ ] FE-188 — Produzir build instalável e validar no alvo escolhido.
- [ ] FE-189 — Registrar que funcionamento em Android comum não comprova homologação em maquineta física.
- [ ] FE-190 — Manter SDK de fabricante, impressão física e publicação em loja fora da primeira entrega, salvo inclusão explícita.

**Aceite:** login → venda mock → confirmação → parcelas → histórico funciona no dispositivo definido, incluindo recusa e perda de resposta, sem duplicidade observada.

## 15. Contrato de integração com backend — P1 / BASE + DECISÃO

Os nomes abaixo são capacidades, não URLs aprovadas. Usar os contratos da entrega parcial como ponto de partida, conciliando divergências antes de fixar rotas e códigos HTTP.

- [ ] FE-191 — Manter cliente HTTP centralizado e tipos de requisição/resposta por capacidade.
- [ ] FE-192 — Definir com o backend autenticação, provisionamento e contexto de loja.
- [ ] FE-193 — Definir criação/consulta da venda e relação entre saleId e operationId.
- [ ] FE-194 — Definir lista, filtros, paginação, detalhe, parcelas e eventos da operação.
- [ ] FE-195 — Definir reprocessamento, estados elegíveis e comportamento de operação já concluída.
- [ ] FE-196 — Definir cadastro/consulta de despesas e operações adicionais aprovadas.
- [ ] FE-197 — Definir agregações de caixa, projeção, simulação e explicações.
- [ ] FE-198 — Fixar representação de dinheiro: centavos inteiros ou decimal textual conforme acordo; evitar valores ambíguos.
- [ ] FE-199 — Fixar representação de percentuais e escala; distinguir 10 de 0,10 no contrato.
- [ ] FE-200 — Fixar datas, timestamps, fuso e limites inclusivos/exclusivos dos filtros.
- [ ] FE-201 — Definir campos obrigatórios, opcionais, nulos e listas vazias.
- [ ] FE-202 — Mapear estados recebidos para rótulos; valor desconhecido deve ter fallback seguro.
- [ ] FE-203 — Definir chave de idempotência, escopo e resposta para repetição idêntica e conteúdo divergente.
- [ ] FE-204 — Resolver a divergência entre recuperar operação existente e responder conflito; não adotar 409 para toda repetição.
- [ ] FE-205 — Definir erros de validação, autenticação, autorização, inexistência, conflito e indisponibilidade.
- [ ] FE-206 — Associar erros de campo aos respectivos controles quando a API fornecer essa informação.
- [ ] FE-207 — Definir estratégia de consulta de andamento, intervalo e encerramento; não presumir WebSocket obrigatório.
- [ ] FE-208 — Cancelar ou ignorar consultas obsoletas após troca de tela, filtro ou sessão.
- [ ] FE-209 — Invalidar consultas afetadas após mutações confirmadas, sem atualizar apenas uma das telas relacionadas.
- [ ] FE-210 — Limitar repetição automática a ações seguras; não repetir gravação sem semântica idempotente acordada.
- [ ] FE-211 — Não aceitar merchantId editável como autorização; o backend valida o contexto de acesso.
- [ ] FE-212 — Documentar exemplos de sucesso e falha que possam ser usados igualmente no mock e na API.
- [ ] FE-213 — Registrar a versão do contrato e discrepâncias encontradas durante integração.

**Aceite:** frontend e backend conseguem executar os mesmos exemplos; divergência não é mascarada por fixture.

## 16. Responsividade, acessibilidade e linguagem — P1/P2 / TÉCNICA

- [ ] FE-214 — Testar layouts estreitos, intermediários e desktop sem cortes de conteúdo essencial.
- [ ] FE-215 — Adaptar tabelas extensas sem tornar valores e ações inacessíveis.
- [ ] FE-216 — Permitir navegação por teclado com foco visível e ordem previsível.
- [ ] FE-217 — Usar títulos, regiões, botões, links e rótulos semanticamente adequados.
- [ ] FE-218 — Associar mensagens de erro aos campos e indicar como corrigi-los.
- [ ] FE-219 — Anunciar mudanças relevantes de status sem excesso de mensagens para leitores de tela.
- [ ] FE-220 — Verificar contraste de texto, foco e controles; registrar problemas e correções.
- [ ] FE-221 — Testar ampliação de texto/zoom sem impedir o fluxo principal.
- [ ] FE-222 — Garantir áreas de toque adequadas e separação entre ações sensíveis.
- [ ] FE-223 — Fornecer texto alternativo útil para imagens informativas e ignorar decoração no leitor de tela.
- [ ] FE-224 — Não depender de hover para revelar ações essenciais.
- [ ] FE-225 — Respeitar preferência de movimento reduzido nas animações adotadas.
- [ ] FE-226 — Usar linguagem clara para comerciante, responsável financeiro e operador.
- [ ] FE-227 — Explicar tributo, taxa, líquido e simulação sem exigir conhecimento técnico.
- [ ] FE-228 — Testar pelo menos um fluxo web com leitor de tela e o fluxo Android com recursos de acessibilidade do dispositivo escolhido.

**Aceite:** o fluxo principal pode ser concluído sem mouse no web e sem depender exclusivamente de cor ou animação.

## 17. Segurança e limites de responsabilidade — P1 / BASE + TÉCNICA

- [ ] FE-229 — Manter senha, token, chave de provedor e dados privados fora de logs, URLs e repositório.
- [ ] FE-230 — Definir armazenamento de sessão conforme mecanismo acordado; não adotar armazenamento persistente por conveniência sem avaliação.
- [ ] FE-231 — Coordenar proteção de sessão, CORS e eventual CSRF com o backend; não tentar resolver autorização apenas no cliente.
- [ ] FE-232 — Não conectar os clientes diretamente ao PostgreSQL nem distribuir credencial de banco.
- [ ] FE-233 — Não reproduzir TaxEngine, SplitEngine ou ledger autoritativos no frontend.
- [ ] FE-234 — Tratar validação de formulário como ajuda ao usuário; validação de negócio permanece no servidor.
- [ ] FE-235 — Não permitir que parâmetros do navegador habilitem modo REAL.
- [ ] FE-236 — Não apresentar stack trace, resposta interna sensível ou credencial em mensagens de erro.
- [ ] FE-237 — Limpar caches de dados financeiros ao encerrar ou trocar sessão.
- [ ] FE-238 — Não aplicar cache offline persistente de respostas financeiras sem escopo e política definidos.
- [ ] FE-239 — Manter WhatsApp, imagens pessoais e pacote privado de auditoria fora do Git público.
- [ ] FE-240 — Revisar dependências e resultados de verificações de segurança disponíveis, sem prometer ausência absoluta de vulnerabilidades.

**Aceite:** interface não expõe segredos nem assume a responsabilidade de validar acesso ou produzir registros financeiros oficiais.

## 18. Rede, desempenho e distribuição — P2 / TÉCNICA + DECISÃO

- [ ] FE-241 — Exibir erro de rede com possibilidade segura de recuperação.
- [ ] FE-242 — Não usar apenas um indicador de conexão para concluir que a API está acessível.
- [ ] FE-243 — Preservar consulta/dados anteriores com indicação de desatualização quando apropriado.
- [ ] FE-244 — Evitar múltiplas requisições equivalentes causadas por renderização da tela.
- [ ] FE-245 — Encerrar consultas periódicas ao sair da página ou encerrar a sessão.
- [ ] FE-246 — Tratar grandes listas pela paginação contratada, sem carregar toda a base por padrão.
- [ ] FE-247 — Verificar carregamento inicial, tamanho de recursos e travamentos nas telas principais.
- [ ] FE-248 — Definir hospedagem/demonstração web e configurar rotas e API para esse ambiente.
- [ ] FE-249 — Utilizar transporte seguro no ambiente publicado e tratar incompatibilidade de conteúdo misto.
- [ ] FE-250 — Não incluir PWA, service worker ou transações offline como exigências herdadas do outro projeto.
- [ ] FE-251 — Se PWA for posteriormente aprovada, planejar instalação, cache, atualização e privacidade como escopo adicional.

**Aceite:** perda de rede não gera confirmação fictícia; ambiente de demonstração reproduz o fluxo previsto.

## 19. Verificações funcionais e integração — P1/P2 / TÉCNICA

Registrar ambiente, modo, entrada, resultado esperado, resultado observado e evidência. Automatizar principalmente regressões e estados críticos; não criar testes que apenas repitam o código.

- [ ] FE-252 — Testar login válido, inválido, expiração, logout e nova sessão.
- [ ] FE-253 — Testar navegação, acesso direto, atualização de rota e página inexistente.
- [ ] FE-254 — Testar lista → detalhe de pelo menos duas operações com valores diferentes.
- [ ] FE-255 — Testar filtro, paginação, retorno do detalhe e ausência de resultados.
- [ ] FE-256 — Testar chegada fora de ordem de respostas após mudança rápida de filtro.
- [ ] FE-257 — Testar reconciliação de indicadores, tabela, gráfico e detalhes no conjunto demonstrativo.
- [ ] FE-258 — Testar operação de R$150,00 com parcelas demonstrativas 15/3/132.
- [ ] FE-259 — Testar campos monetários com vírgula, centavos, vazio, zero, negativo e limite acordado.
- [ ] FE-260 — Testar pagamento recusado sem interface de split concluído.
- [ ] FE-261 — Testar falha parcial preservando parcelas já confirmadas.
- [ ] FE-262 — Testar perda de resposta após envio e recuperação do estado, sem criar outra intenção de venda.
- [ ] FE-263 — Testar toque/clique duplo e retomada; verificar com backend que os registros não duplicaram.
- [ ] FE-264 — Testar repetição de mesma chave com dados diferentes conforme contrato de conflito.
- [ ] FE-265 — Testar encerramento/retorno do aplicativo Android durante tentativa ativa.
- [ ] FE-266 — Testar despesa válida, rejeitada e erro de envio preservando formulário.
- [ ] FE-267 — Testar caixa realizado versus previsto e ausência de dedução duplicada de taxa.
- [ ] FE-268 — Testar projeção sem dados suficientes e comparação com base zero.
- [ ] FE-269 — Testar simulação sem criação de venda ou alteração de caixa.
- [ ] FE-270 — Testar IA mock, indisponível, vazia e resposta de período anterior.
- [ ] FE-271 — Testar conteúdo textual recebido sem execução de marcação insegura.
- [ ] FE-272 — Testar acesso negado a operação de outra loja em conjunto com backend; esconder botão não conta como prova.
- [ ] FE-273 — Testar erro de API sem substituição silenciosa por mock.
- [ ] FE-274 — Testar celular, desktop, zoom, teclado e leitura acessível dos estados críticos.
- [ ] FE-275 — Testar instalação e execução do Android no alvo definido.
- [ ] FE-276 — Rodar checagem de tipos, build e testes configurados; corrigir falhas relevantes.
- [ ] FE-277 — Revisar console/logs sem erros relevantes nem dados sensíveis.
- [ ] FE-278 — Executar novamente o fluxo principal com a API do projeto, registrando versão e ambiente.

**Aceite:** passar com mock não marca FE-278 nem testes de persistência/isolamento como concluídos. A integração depende de evidência conjunta com o backend.

## 20. Git, documentação e entrega — P1/P2 / BASE + TÉCNICA + DECISÃO

- [ ] FE-279 — Confirmar repositório e branch de trabalho com a equipe; não presumir branch frontend existente ou obrigatória.
- [ ] FE-280 — Preservar trabalho de outros integrantes e evitar sobrescrever alterações compartilhadas.
- [ ] FE-281 — Fazer commits delimitados com descrição do comportamento entregue.
- [ ] FE-282 — Abrir revisão com escopo, evidências, dependências e limitações reais.
- [ ] FE-283 — Publicar commits no remoto conforme o fluxo acordado e autorização de trabalho no repositório.
- [ ] FE-284 — Integrar na branch compartilhada somente conforme processo de revisão combinado.
- [ ] FE-285 — Documentar instalação, configuração, execução, build e escolha do modo mock/API.
- [ ] FE-286 — Documentar como executar os cenários demonstrativos sem API paga.
- [ ] FE-287 — Registrar contratos pendentes, rotas implementadas e recursos indisponíveis.
- [ ] FE-288 — Atualizar README de acordo com código e capacidades efetivamente presentes.
- [ ] FE-289 — Preparar roteiro de demonstração com caso normal, falha, retomada e consulta.
- [ ] FE-290 — Entregar evidências separadas de web, Android, integração e validações do backend.
- [ ] FE-291 — Revisar arquivos incluídos na entrega para excluir segredos e fontes privadas.
- [ ] FE-292 — Marcar conclusão por recurso e ambiente, sem declarar todo o sistema pronto porque o build passou.

## 21. Ordem recomendada para começar

| Etapa | Entrega | Pode avançar com autonomia? | Dependência para conclusão integrada |
|---|---|---|---|
| 1 | Estrutura web, identidade, componentes e navegação | Sim, escolhas técnicas registradas | Revisão visual e escopo |
| 2 | Fixtures coerentes, histórico e detalhe | Sim | Contrato de lista/detalhe |
| 3 | Dashboard com números reconciliados | Sim em demonstração | Agregações e regra de caixa |
| 4 | Login e troca do adapter mock pela API | Interface e adapter podem ser preparados | Sessão, autorização e API executável |
| 5 | Kotlin: login, nova venda e histórico | Em paralelo se houver responsável | Estados, idempotência, API e dispositivo |
| 6 | Despesas, caixa, projeção e simulação | Telas e exemplos podem ser preparados | Contratos e decisões financeiras |
| 7 | Explicação mock e P3 aceitos | Após números consistentes | Provider, dados e corte de escopo |
| 8 | Integração, acessibilidade e demonstração final | Testes acompanham todas as etapas | Ambiente e revisão conjunta |

**Primeira entrega recomendada:** dashboard web navegável, histórico e detalhe de operações, com fixtures consistentes, estados de erro/vazio/carregamento e camada de integração preparada. Não depende de esperar todo o backend nem de implementar crédito, banco real ou IA externa.

## 22. O que solicitar ao responsável pelo backend

| Entrega do backend | Necessidade do frontend | Limite de responsabilidade |
|---|---|---|
| Contrato revisado e exemplos | Campos, estados, filtros, erros e paginação | Front pode propor; integração exige acordo |
| Sessão e autorização por loja | Login e acesso aos recursos | Backend garante isolamento |
| Cálculo e snapshot das regras | Exibir parcelas e histórico | Front não calcula tributo autoritativo |
| Idempotência e recuperação | Repetir/consultar com segurança | Botão desabilitado não garante unicidade |
| Persistência e eventos | Histórico e detalhe verdadeiros | Fixture não substitui banco |
| Consultas financeiras | Indicadores e projeção coerentes | Regras de reconhecimento precisam ser explícitas |
| Mocks controláveis | Demonstrar recusa, falha parcial e timeout | Backend simula efeitos; cliente apresenta estados |
| Ambiente executável e dados fictícios | Teste integrado reproduzível | Não exigir credenciais reais de pagamento |

## 23. Rastreabilidade e critérios finais

| Seções | Base principal |
|---|---|
| 1–4, 14 | V2 §5/13/17/23; entrega US01; protótipo; decisões DEC-001/005/007/008 |
| 5–7, 15 | RF-002/003/004, RN-001/002/003/004/007/008, API-001 e UX-A01/05/08 da auditoria |
| 8–11 | RF-005/006/007/008, RN-005, conflitos C08/C10, achados UX-A02/03/04/07 |
| 12 | RF-009/010/011, RN-006, C09 e UX-A06 |
| 13 | Mapa de navegação e lacunas de contrato; não equivale a aprovação de todos os módulos |
| 16–20 | UX-002, SEC-001/002, RNF-001, documentação de processo e recomendações técnicas explícitas |

- [ ] FE-293 — **Pronto visual:** telas e estados revisados contra o Figma, com diferenças justificadas.
- [ ] FE-294 — **Pronto em demonstração:** fluxo funciona com dados fictícios consistentes e identificação de simulação.
- [ ] FE-295 — **Pronto para integração:** contrato, adapter, erros e configuração estão documentados e alinhados.
- [ ] FE-296 — **Integrado:** fluxo executado com backend real do projeto, incluindo persistência e recuperação verificadas em conjunto.
- [ ] FE-297 — **Pronto para entrega:** build, testes pertinentes, acessibilidade, roteiro, documentação e limitações registrados para cada cliente entregue.

Referências da auditoria privada: RELATORIO.md, CHECKLISTS.md e INVENTARIO.md, preservados em C:/avanade/auditoria e não incluídos neste pacote. Este checklist detalha a frente de interfaces; não substitui as tarefas de backend e banco desses documentos.
