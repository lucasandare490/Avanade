> **Atualização de implementação:** comparação de tendências demonstrativa e apresentação de comparações remotas implementadas. A integração com dados e IA do servidor continua pendente. Esta atualização substitui os trechos anteriores sobre ausência da interface de comparação. Veja [implementação de tendências](frontend/documentacao/TENDENCIAS-IMPLEMENTADAS.md).

# 💰 Planner Comercial — Split Tributário

Solução experimental para ajudar pequenos estabelecimentos a compreender a separação dos valores de suas vendas, acompanhar o valor líquido e consultar o histórico das operações com transparência e rastreabilidade.

O projeto nasceu como **Split Tributário** e é apresentado nas interfaces e no protótipo como **Planner Comercial**. Reúne um dashboard web e um aplicativo Android para o fluxo de Smart POS.

**Estado da entrega — 10/10/2026:** os clientes web e Android estão implementados em modo demonstrativo, com testes locais e builds executados. A estrutura de integração está preparada; o backend e o banco ainda precisam ser implementados, entregues e conectados. Nenhuma transferência financeira ou arrecadação tributária real é realizada.

## 📌 Sobre o projeto

Pequenos comerciantes frequentemente têm pouco tempo e recursos para compreender e acompanhar os tributos de cada venda. A proposta é tornar visíveis o valor bruto, as parcelas destinadas a tributos e taxas e o valor líquido disponível ao estabelecimento, seguindo regras previamente definidas.

Na solução integrada planejada, o servidor identifica os valores, aplica regras determinísticas, registra a separação e o direcionamento demonstrativo das parcelas e mantém o histórico consultável. As interfaces apresentam o resultado de forma simples, sem exigir cálculos manuais do usuário.

O caráter atual é acadêmico e experimental, no contexto GrowUp/Senac com Avanade. Regras tributárias e integrações financeiras precisam de validação específica antes de qualquer uso real.

## 🎯 Problema

- Dificuldade para entender quanto de cada venda corresponde a tributos e taxas.
- Necessidade de cálculos e controles manuais.
- Dificuldade para conciliar valores brutos e líquidos.
- Falta de rastreabilidade sobre o destino e o estado de cada parcela.
- Dificuldade para acompanhar vendas, despesas e impacto no fluxo de caixa.
- Risco de erros de lançamento durante o atendimento.
- Informações financeiras apresentadas de forma complexa.

## 💡 Solução e fluxo principal

O sistema deve permitir registrar a venda, identificar e separar os valores, acompanhar o processamento, registrar eventos e consultar o resultado posteriormente.

```text
Venda
  → identificação dos valores
  → aplicação das regras tributárias e de taxas
  → separação das parcelas
      ├─ tributos → destino definido
      ├─ taxa → destino definido, quando aplicável
      └─ líquido → estabelecimento
  → registro da operação e dos eventos
  → consulta, conferência e acompanhamento financeiro
```

Pagamento confirmado e split concluído são estados diferentes. Uma operação pode estar pendente, ter falha parcial ou ficar com resposta desconhecida após uma interrupção. A interface deve mostrar essa diferença e permitir recuperação segura, sem criar uma nova venda por engano.

## 👥 Personas

| Persona | Papel | Necessidades | Dificuldades |
|---|---|---|---|
| **Carlos** | Pequeno comerciante, proprietário | Saber para onde foi cada parcela; entender o dinheiro disponível; acompanhar vendas e despesas | Pouco tempo, conhecimento financeiro/tributário limitado e dados complexos |
| **Mariana** | Responsável financeira | Conferir operações de split; conciliar entradas e saídas líquidas; comparar períodos; projetar caixa e identificar riscos | Conciliação entre bruto e líquido e falta de rastreabilidade |
| **João** | Operador do Smart POS | Registrar venda rapidamente; acompanhar confirmação; consultar histórico e evitar erros | Pressão durante o atendimento e risco de digitação |

> Carlos: “Quero saber para onde foi cada parcela do tributo sem ter que fazer tudo manualmente.”

> Mariana: “Preciso conseguir conferir cada operação e entender exatamente como os valores chegaram ao resultado líquido.”

> João: “Preciso registrar a venda rapidamente e ter certeza de que o split foi concluído.”

As necessidades das personas orientam o produto; não significam que todos os recursos, como projeção de caixa, já estejam implementados ou aprovados para o MVP.

## 🚀 MVP e escopo

O núcleo do MVP continua sendo **venda → identificação → separação → direcionamento → registro → consulta**. O objetivo inicial é validar esse fluxo com pagamentos e regras demonstrativos.

| Recurso | Objetivo | Estado atual |
|---|---|---|
| Registro de venda | Criar uma intenção de venda com revisão dos dados | Demonstrativo em web e Android |
| Identificação e separação | Apresentar tributo, taxa e líquido de forma consistente | Cenário fictício; motor autoritativo depende do backend |
| Direcionamento | Mostrar destino e estado das parcelas | Demonstrativo; não há transferência real |
| Confirmação e recuperação | Distinguir sucesso, recusa, pendência, falha parcial e resposta perdida | Fluxos locais implementados; recuperação durável depende do servidor |
| Histórico e detalhe | Consultar operações diferentes por ID, filtros e páginas | Demonstrativo e estrutura de consulta remota preparados |
| Rastreabilidade | Conferir parcelas, composição e eventos | Histórico local; ledger persistente pendente |
| Dashboard, despesas e caixa | Acompanhar indicadores e movimentos realizados | Complementos web demonstrativos |
| Simulação | Comparar composição sem registrar venda | Implementada; não altera o caixa |
| Explicações e tendências por IA | Interpretar informações e tendências temporais | Resumo demonstrativo preparado; análise de tendências do MVP pendente |

Crédito simulado e cancelamento de operações/compra ficam na evolução futura, fora do MVP atual, conforme atualização comunicada pela equipe. **Análise de tendências por IA faz parte do MVP e ainda precisa ser implementada além do resumo textual atual.** Recorrência de despesas, projeções com regras não aprovadas, PWA, SDK de fabricante, impressão física e publicação em loja continuam condicionados à definição de escopo. Veja a [decisão de escopo](frontend/documentacao/DECISAO-ESCOPO-MVP.md).

## ✅ O que já foi feito

### Descoberta, pesquisa e planejamento

Foram reunidos materiais de requisitos, pesquisa, personas, jornada do usuário, mapa de navegação e protótipo. A documentação original também registra análise de riscos, avaliação do uso da IA e uma entrevista com agente inteligente como apoio à descoberta. Essa atividade não substitui validação com comerciantes reais.

O checklist de frontend preserva **297 critérios** e diferencia implementação local, preparação para integração e aceite pendente. Também foi criado um pacote para orientar a implementação do backend e do banco.

### Frontend web

- React/TypeScript com navegação por rotas hash e layout responsivo.
- Entrada demonstrativa e formulário de login por perfil, expiração de sessão e saída com limpeza dos dados locais.
- Dashboard com período, indicadores, gráfico e alternativa textual baseados na mesma massa de dados.
- Operações com busca, status, datas, paginação, detalhe pelo identificador, parcelas e eventos.
- Venda demonstrativa com revisão, bloqueio de clique duplo, recusa, pendência, falha parcial e recuperação da mesma tentativa após perda de resposta.
- Cadastro e consulta de despesas pagas, validação de campos e atualização financeira.
- Caixa realizado com saldo inicial, entradas líquidas, saídas e saldo final.
- Simulação com e sem taxa, sem persistência financeira.
- Explicações demonstrativas e estados de erro, indisponibilidade e ausência de dados.
- Componentes reutilizáveis, foco e semântica acessível, estados de carregamento, erro e lista vazia.
- Transporte HTTP centralizado, validação de respostas, cancelamento de consultas antigas e telas preparadas para capacidades remotas.
- Exportação local e impressão demonstrativa como complementos de interface.

### Aplicativo Android

- Cliente Kotlin nativo separado do site, com login demonstrativo, início, venda, revisão, histórico e detalhe.
- Comunicação assíncrona separada da construção das telas e do estado visual.
- Validação de valores em centavos, proteção contra toque duplo e recuperação usando a mesma tentativa.
- Cenários de pagamento pendente, recusa, falha parcial, indisponibilidade e resposta perdida.
- Preservação de tentativa e chaves durante recriação da Activity, sem envio automático ao reabrir.
- Cliente de API e transporte HTTPS preparados para contrato e autenticação futuros.
- Gradle wrapper, build debug, APK e testes locais disponíveis.

**Persistência da demonstração:** o web utiliza dados em memória; recarregar ou sair restaura o cenário. O Android pode restaurar dados fictícios pelo estado da Activity, mas isso não é armazenamento financeiro durável. Nenhum dos clientes está conectado ao PostgreSQL.

## 🧪 Validações executadas

Resultados registrados na entrega de 10/10/2026:

| Verificação | Resultado |
|---|---|
| Testes web | **59 aprovados, 0 falhas** |
| Tipos e build web | Concluídos |
| Testes Android unitários e Robolectric | **14 aprovados, 0 falhas** |
| Build Android | APK debug gerado |
| Análise estática Android | 0 erros e 0 avisos |
| Consulta de dependências npm | 0 vulnerabilidades conhecidas no relatório daquela consulta |

Os testes incluem consistência de valores, fluxos de interface, sessão, respostas fora de ordem, falhas de rede, recuperação demonstrativa e acessibilidade estrutural. No Android, incluem repositório e ciclo de vida com Robolectric.

Esses resultados comprovam os cenários locais testados. Não comprovam persistência do backend, isolamento entre lojas no servidor, execução em maquineta, acessibilidade completa ou fidelidade integral ao Figma. A consulta de dependências também não é uma auditoria completa de segurança.

Consulte o [relatório de validação e evidências](frontend/documentacao/RELATORIO-VALIDACAO-ATUAL.md) e o [estado individual do checklist](frontend/documentacao/STATUS-CHECKLIST.md).

## 🤖 Uso da inteligência artificial

A análise de tendências por IA integra o MVP. A implementação atual cobre resumo textual demonstrativo e preparação de integração; as comparações temporais e sua interpretação ainda estão pendentes. A IA deve apoiar a interpretação: explicar o split, resumir movimentações, responder dúvidas sobre dados apresentados e sinalizar padrões ou possíveis inconsistências. Atualmente, as explicações são demonstrativas; não há provedor externo conectado.

O cálculo e a separação dos valores devem seguir regras determinísticas, versionadas e previamente estabelecidas pelo sistema. A IA não deve:

- Definir sozinha alíquotas ou inventar regras tributárias.
- Alterar valores financeiros ou decidir o destino de parcelas.
- Executar transferências, reprocessamentos ou outras ações financeiras por meio do texto gerado.
- Substituir validações do sistema.
- Apresentar conclusões sem contexto ou esconder ausência de dados e incerteza.

**Exemplo exclusivamente demonstrativo:** uma venda de R$150,00, com tributo fictício de 10% e taxa fictícia de 2%, resulta em R$15,00 de tributo, R$3,00 de taxa e R$132,00 líquidos. Sem essa taxa, seriam R$135,00 líquidos. Esses percentuais não representam legislação validada.

## 🔐 Rastreabilidade e responsabilidades

Cada operação deve permitir conferir identificadores, data, valor bruto, tributos, taxas, líquido, estado do pagamento, estado do split, parcelas, destinos e eventos relevantes.

O frontend apresenta e valida o formato dos dados recebidos. O backend será responsável por autorização, regras de negócio, persistência, integridade e recuperação. Ocultar um botão não substitui autorização do servidor; impedir clique duplo não substitui idempotência persistente.

Informações financeiras ausentes não devem ser inventadas como zero. Uma falha de API não deve mudar silenciosamente a aplicação para dados fictícios. Simulações não devem produzir lançamentos no caixa realizado.

## 🏗️ Arquitetura

```text
Dashboard web (React/TypeScript)      POS Android (Kotlin)
              │                              │
              └──── interfaces de serviço ────┘
                              │
                 ┌────────────┴────────────┐
                 │                        │
          Modo demonstrativo       Integração preparada
          Dados fictícios          Adapters + HTTPS
          em memória                      │
                                  API Java/Spring Boot
                                  [a implementar/conectar]
                                          │
                    Autenticação e contexto de loja
                    Vendas e pagamentos simulados
                    TaxEngine / SplitEngine
                    Idempotência e rastreabilidade
                    Despesas, caixa e explicações
                                          │
                                  PostgreSQL
                                  [a implementar]
```

A camada de serviço permite desenvolver os clientes sem depender de uma API pronta. Na integração, os adapters deverão traduzir o contrato aprovado para os modelos internos. O frontend não deve acessar o banco diretamente nem carregar credenciais de banco ou de provedor de IA.

## 🛠️ Tecnologias

| Camada | Tecnologia | Situação |
|---|---|---|
| Web | React 19, TypeScript 5.7, Vite 6, CSS próprio, Lucide | Implementada |
| Tipografia | DM Sans e Manrope, arquivos locais | Implementada |
| Android | Kotlin 2.2.21, AGP 8.7.3, Gradle 8.9 | Implementada; compile/target SDK 35 e mínimo 24 |
| Testes web | Vitest, Testing Library, jsdom e axe-core | Executados localmente |
| Testes Android | JUnit e Robolectric | Executados em JVM |
| Backend | Java/Spring Boot | Stack documentada; implementação e versões finais pendentes |
| Banco | PostgreSQL | Planejado; migrations e instância da aplicação pendentes |
| IA | Explicação demonstrativa; provedor futuro no backend | Integração externa pendente |
| Contrato da API | Tipos internos e exemplos; OpenAPI solicitado ao backend | A ratificar e implementar |
| Versionamento | Git/GitHub previstos para colaboração | Repositório desta entrega indicado abaixo; processo de revisão da equipe a definir |

As tecnologias do backend que estavam “a definir” no README inicial foram conciliadas com a documentação de planejamento. Isso registra a direção técnica; não significa que o servidor já tenha sido desenvolvido.

## 📋 Requisitos originais

| ID | Requisito funcional |
|---|---|
| RF01 | Registrar uma venda |
| RF02 | Identificar os valores tributários |
| RF03 | Separar valores conforme regras definidas |
| RF04 | Calcular o valor líquido |
| RF05 | Registrar a operação |
| RF06 | Exibir o status do split |
| RF07 | Permitir consulta ao histórico |
| RF08 | Permitir conferência dos valores |

| ID | Requisito não funcional |
|---|---|
| RNF01 | Garantir rastreabilidade das operações |
| RNF02 | Proteger informações financeiras |
| RNF03 | Apresentar informações de forma simples |
| RNF04 | Minimizar erros de operação |
| RNF05 | Possibilitar evolução da solução |
| RNF06 | Manter separação entre regras de negócio e IA |

Esses IDs preservam o README inicial e não substituem a numeração da documentação V2 ou os critérios FE, BE e BD. A realização demonstrativa de um requisito não comprova sua execução integrada e persistente.

## 📁 Estrutura atual

```text
README.md                         Visão geral do projeto e estado da entrega
LEIA-ME-ENTREGA-FRONTEND.md         Índice rápido da entrega
frontend/
  README.md                       Instalação e funcionamento do web
  src/
    telas/                        Telas identificadas por finalidade
    componentes/                  Elementos reutilizáveis de interface
    servicos/                     Demonstração, sessão, contratos e transporte
    dados/                        Cenário fictício
    utilitarios/                  Formatação e funções compartilhadas
    testes/                       Testes de fluxos; há outros *.test.* junto ao código
  documentacao/                   Checklist, guias, evidências e histórico
  dist/                           Build web gerado
android-pos/
  README.md                       Ambiente, execução e limites do Android
  app/src/main/                   Código Kotlin, manifesto e recursos
  app/src/test/                   Testes unitários e de Activity
  gradle/                         Wrapper para compilação reproduzível
entrega-para-backend/
  LEIA-ME-PARA-O-RESPONSAVEL-BACKEND.md
  01-CHECKLIST-BACKEND-COMPLETO.md
  02-CHECKLIST-BANCO-DE-DADOS.md
  03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md
  04-DEVOLUTIVA-DO-BACKEND.md
```

A estrutura substitui a árvore conceitual do README inicial. Não há pastas de backend ou banco implementados nesta entrega. No ambiente local também existem fontes privadas em `auditoria/`, ferramentas e pacotes antigos; esses materiais não devem ser publicados junto ao código. Os pacotes compartilháveis excluem a auditoria privada e caches de ferramentas.

## ▶️ Como executar

### Web

Com Node 22.12 ou superior da série 22 e npm, partindo da raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Abra a URL apresentada no terminal. Para validar ou gerar a versão estática, dentro de `frontend/`:

```powershell
npm test
npm run build
npm run preview
```

O modo padrão é demonstrativo. É possível usar a entrada **Explorar demonstração**. No formulário, as contas fictícias são `gestor@exemplo.invalid`, `financeiro@exemplo.invalid` e `operador@exemplo.invalid`, com senha `demo`. Os perfis e a duração de sessão de 30 minutos são parâmetros demonstrativos a ratificar.

Consulte o [README web](frontend/README.md) e o [roteiro de demonstração](frontend/documentacao/ROTEIRO-DE-DEMONSTRACAO.md).

### Android

Configure Android SDK 35, JDK compatível e o caminho local do SDK em `local.properties`. A validação registrada usou Temurin 21.0.4. Partindo da raiz:

```powershell
cd android-pos
.\gradlew.bat assembleDebug testDebugUnitTest lintDebug
```

O APK é gerado em `android-pos/app/build/outputs/apk/debug/app-debug.apk`. É uma compilação debug demonstrativa. Instalação no aparelho escolhido e homologação de maquineta permanecem pendentes. Detalhes no [README Android](android-pos/README.md).

### Modo integrado

No web, `.env.example` documenta `VITE_MODO_DADOS` e `VITE_API_URL`. O modo `api` também exige preencher `contratoServidor` em `frontend/src/servicos/integracaoConfigurada.ts`, atualmente sem contrato configurado. Alterar somente a URL não conecta um backend desconhecido.

No Android, a composição ativa usa `ClientePosDemonstrativo`. A substituição por `ClientePosApi` exige contrato, autenticação, requisições e mapeamentos aprovados. A URL precisa ser alcançável pelo dispositivo; localhost no Android aponta para o próprio Android.

Veja [sessão e integração](frontend/documentacao/SESSAO-E-INTEGRACAO.md). A conexão com a API e seus testes conjuntos ainda envolverão trabalho nos dois clientes.

## 🔧 Trabalho atual e próximas etapas

| Etapa | Situação | Próxima ação |
|---|---|---|
| Descoberta e materiais de referência | Materiais reunidos | Complementar validação com usuários e registrar decisões |
| Planejamento de produto | Base documentada | Ratificar permissões, regras financeiras e funcionalidades condicionais |
| Desenvolvimento web | Demonstração implementada e testada localmente | Aceite visual/acessível e integração quando a API chegar |
| Desenvolvimento Android | APK e testes JVM disponíveis | Executar no alvo escolhido e conectar o serviço real do projeto |
| Backend e banco | Especificação de entrega preparada | Implementar API, persistência, regras e testes |
| Integração ponta a ponta | Pendente | Validar clientes, servidor e banco no mesmo cenário |
| Publicação | Pendente | Definir ambiente, processo de revisão e distribuição |

### O backend e o banco precisam entregar

- API executável e documentada com OpenAPI, exemplos de sucesso/erro e configuração reproduzível.
- Autenticação, sessão, permissões e isolamento entre estabelecimentos.
- Vendas e pagamentos simulados, regras determinísticas e estados de split.
- Idempotência persistente: repetir a mesma tentativa deve recuperar o resultado, sem duplicar venda ou parcela.
- Operações, parcelas, eventos e ledger consultáveis com filtros e paginação.
- Despesas, agregações financeiras e simulação com regras e unidades explícitas.
- Explicações associadas aos dados consultados, sem dar poder financeiro ao texto da IA.
- Modelo de banco, migrations, restrições, índices, dados fictícios e estratégia de backup/restauração.
- Testes de autorização, integridade, concorrência, recuperação e persistência após reinício.

O pacote contém **152 critérios de backend e 67 de banco**. Comece pelo [guia para o responsável](entrega-para-backend/LEIA-ME-PARA-O-RESPONSAVEL-BACKEND.md) e devolva o [formulário preenchido](entrega-para-backend/04-DEVOLUTIVA-DO-BACKEND.md) junto ao código e às evidências.

### Aceites que não dependem somente do backend

- Conferência integral das telas e estados com o Figma e registro das diferenças aceitas.
- Execução em aparelho Android/maquineta escolhida: teclado, rotação, retorno ao app e TalkBack.
- Fluxo web com leitor de tela real e revisão visual de contraste/zoom.
- Definição de repositório, branch, revisão, hospedagem e publicação pela equipe.

Essas verificações podem exigir novos ajustes de frontend. A lista detalhada está em [pendências objetivas](frontend/documentacao/PENDENCIAS-OBJETIVAS.md).

## 👥 Autoria e colaboração

| Material | Autoria informada |
|---|---|
| Design e prototipação de alta fidelidade | Thayná Batista da Silva |
| Pesquisa e levantamento sobre Split Payment | Thayná Batista da Silva |
| Documentação de requisitos | Thayná Batista da Silva e Kleysson Teixeira |
| Responsáveis futuros por desenvolvimento/revisão de cada camada | A confirmar pela equipe |

Conforme informado pela equipe, os materiais foram compartilhados no grupo de WhatsApp para consulta e discussão. O compartilhamento não é tratado como aceite formal de todas as decisões. A autoria dos materiais não implica atribuição automática de tarefas futuras nem autoria de todo o código desta entrega.

O protótipo está no [Figma — Planner Comercial MVP Design](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design). Há também a [pesquisa compartilhada](https://docs.google.com/document/d/1QoIXru-uVBmSDMy6YKjTAkVvk_0Q2kk5_WnfubFtVPU/edit) e a [documentação de requisitos compartilhada](https://docs.google.com/document/d/13OdFEBoY3y_6TPt6pDJQwXycZW9mGdwy/edit). O acesso depende das permissões dos respectivos documentos.

Repositório desta entrega: [lucasandare490/Avanade](https://github.com/lucasandare490/Avanade). Referência anterior informada pela equipe: [projeto-split-tributario](https://github.com/Kleyssonteixeirapf/projeto-split-tributario). Os dois repositórios são distintos; esta publicação não altera o repositório anterior.

## 📚 Documentação de apoio

- [Guia geral da entrega](LEIA-ME-ENTREGA-FRONTEND.md).
- [Checklist completo de frontend](frontend/documentacao/CHECKLIST-FRONTEND-COMPLETO.md) e [estado de cada critério](frontend/documentacao/STATUS-CHECKLIST.md).
- [Relatório de testes e limites](frontend/documentacao/RELATORIO-VALIDACAO-ATUAL.md).
- [Mapa de telas e arquivos](frontend/documentacao/GUIA-TELAS-E-ARQUIVOS.md).
- [Escopo e referência visual](frontend/documentacao/ESCOPO-E-REFERENCIA-VISUAL.md).
- [Checklist de backend](entrega-para-backend/01-CHECKLIST-BACKEND-COMPLETO.md).
- [Checklist de banco de dados](entrega-para-backend/02-CHECKLIST-BANCO-DE-DADOS.md).
- [Contratos e exemplos para integração](entrega-para-backend/03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md).
- [Preparação da publicação web](frontend/documentacao/PUBLICACAO-WEB.md).

Projeto desenvolvido para estudo, inovação e aplicação de tecnologia. O estado atual é de **demonstração local validada nos cenários registrados, com integração e aceites externos pendentes**.
