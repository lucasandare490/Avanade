# Planner Comercial — Split Tributário

Projeto acadêmico da Squad 19, GrowUp/Senac com Avanade. O comerciante acompanha o valor bruto, tributo demonstrativo, taxa e líquido de cada venda; a pessoa responsável pelo financeiro consulta despesas, caixa e comparações; o operador registra vendas pelo POS.

**Persistência real em PostgreSQL; pagamentos, tributos, roteamento e explicações demonstrativos.** Não há transferências reais nem recolhimento fiscal. Percentuais de exemplo não são legislação. Crédito e cancelamento permanecem evolução futura.

## Comece aqui

- Para executar: [Como apresentar](COMO-APRESENTAR.md).
- Para localizar código: [mapa de nomes](documentacao/plano-de-finalizacao-2026-10-15/04-MAPA-DE-NOMES-APLICADOS.md).
- Para acompanhar entrega: [estado e pendências](documentacao/plano-de-finalizacao-2026-10-15/03-INCREMENTO-IMPLEMENTADO.md).
- Para revisar requisitos: [516 critérios, com ressalvas de aceite](documentacao/plano-de-finalizacao-2026-10-15/05-REVISAO-DOS-516-CRITERIOS.csv).
- Para integrar: [contrato](backend/docs/API.md) e [novas capacidades](backend/docs/INCREMENTO-FUNCIONAL-2026-10-15.md).

## O que está no código

| Área | Funcionamento | Limite |
|---|---|---|
| Cadastro e sessão | Nova loja e gerente, login, perfis, logout e expiração | Sem recuperação por e-mail ou convite de usuários |
| Estabelecimento | Consulta e edição autorizada do nome | Não altera fuso nem regra financeira |
| Venda e split | Pagamento simulado, parcelas, regra histórica e eventos | Sem PSP real; pendência não se confirma automaticamente |
| Recuperação | Mesma intenção após perda de resposta, retomada parcial e recuperação de regra ausente | Exige permissões e regra aplicável à data original |
| Despesas | Registro de despesa paga, consulta e sugestão de categoria confirmada pelo usuário | Recorrência, edição/exclusão e contas a pagar não foram assumidas |
| Caixa e painel | Agregados do servidor, composição diária e saldo reconhecido | Previsão não é saldo disponível |
| Projeção | Cenário manual com horizonte, entradas/despesas previstas e aviso de déficit | Não é previsão estatística nem garantia |
| Simulação | Percentual hipotético e inclusão opcional de taxa | Não cria venda nem movimentação |
| Explicações | Texto do caixa, comparação de tendências e explicação de split | Mock determinístico; serviço externo é opcional |
| Relatórios | Vendas, despesas e composição tributária por período; CSV completo | Até 2.000 registros por consulta; excedentes são recusados sem truncar |
| Android | Cliente Kotlin local e integrado por HTTPS, com recuperação de intenção | Execução física/HTTPS compartilhado ainda precisa de homologação |

As mudanças passaram pelas verificações locais descritas no [relatório de validação](documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md). A tabela descreve implementação, não aprovação integral dos 516 critérios. Relatórios anteriores mantêm suas datas e não representam o estado atual automaticamente.

## Tecnologias e pastas

- `frontend/`: painel React 19, TypeScript, Vite, CSS e fontes locais. Telas em `src/telas`; partes reutilizáveis em `src/componentes`; comunicação com servidor em `src/servicos`.
- `backend/`: Java 21, Spring Boot, Maven Wrapper, PostgreSQL e Flyway. `auth` cuida de acesso; `core`, de vendas e split; `finance`, de despesas/caixa/relatórios/explicações; `shared`, de erros e idempotência.
- `android-pos/`: aplicativo Kotlin. `TelaPosIntegradoActivity.kt` é a tela ligada ao servidor; `TelaPrincipalActivity.kt` é a demonstração local.
- `scripts/`: comandos de execução. `entrega-para-backend/`: requisitos e devolutiva. `documentacao/`: estado, decisões e histórico.

Nomes técnicos obrigatórios das ferramentas, como package.json, pom.xml e AndroidManifest.xml, são preservados. O mapa de nomes mostra os módulos internos renomeados.

## Executar no Windows

Instale JDK 21 e Node/npm. Na raiz, em um terminal PowerShell:

```powershell
.\scripts\iniciar-backend-local.ps1 -Jdk 'C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot'
```

Em outro terminal, também na raiz:

```powershell
npm.cmd --prefix frontend ci
npm.cmd run dev
```

Abra http://127.0.0.1:5173. API: http://127.0.0.1:8080. Se já houver serviço reconhecido na porta, use a instância existente; alterações Java exigem reiniciar a API pelo terminal de origem.

Clique em **Criar minha conta** para iniciar uma loja vazia. Contas seed de demonstração também existem; sua senha é configuração local e nunca deve ser publicada. O token permanece em memória e recarregar a página exige novo login.

O banco fica em `backend/.local/postgres`, preservado ao reiniciar. É ambiente local, não hospedagem de produção. O frontend não recebe credenciais PostgreSQL. Para compartilhar o projeto, ainda é necessário hospedar backend e banco, configurar HTTPS e segredos e validar esse ambiente. Supabase é uma possibilidade de hospedagem do PostgreSQL, não substitui automaticamente o backend Java.

## Contratos e segurança

Dinheiro em centavos inteiros BRL; percentuais em pontos-base. Uma venda fictícia de R$ 150,00 gera 15/3/132 no cenário padrão. Sem taxa, 15/0/135. Regras são versionadas e o snapshot histórico é preservado. Flyway V1–V5 mantém a evolução do schema; não editar migrations já aplicadas.

O servidor valida loja e papel em cada ação. Senhas usam BCrypt; bearer opaco é revogável. Idempotência associa loja, ação e chave com entrada e resposta persistidas. Eventos do ledger não equivalem a contabilidade de partidas dobradas.

A IA não escolhe alíquota, não calcula valores autoritativos e não movimenta dinheiro. As explicações são produzidas a partir de fatos autorizados, com limite de espera, fallback e identificação demonstrativa.

## Validação e publicação

Os testes locais foram executados após as alterações funcionais. O relatório registra resultados, correções e limitações. Docker e restauração foram verificados no GitHub, com 15 tabelas conferidas. Os 516 critérios têm revisão individual, com pendências e limites explícitos. Homologação física, aceite visual e implantação continuam abertos. O caixa semanal recebeu testes adicionais locais; consulte o relatório para identificar o commit de cada evidência.

A publicação autorizada usa https://github.com/lucasandare490/Avanade. Esta pasta de trabalho é uma cópia sem `.git`; a publicação deve comparar o remoto para preservar contribuições dos colegas. Excluir `.local`, senhas, banco, caches, conversas e fontes privadas.

## Créditos

Design, prototipação de alta fidelidade e pesquisa: **Thayná Batista da Silva**. Documentação de requisitos: **Thayná Batista da Silva e Kleysson Teixeira**, conforme materiais fornecidos. Autoria de commits não é inferida a partir do nome de uma pasta.

[Protótipo Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design). [README anterior preservado](documentacao/historico/README-antes-da-consolidacao-2026-10-15.md).

## Revisão operacional de 16/10/2026

Logs JSON, métricas locais e recuperação de falhas temporárias foram reforçados. [Auditoria Java/Android e alertas remanescentes](documentacao/plano-de-finalizacao-2026-10-15/07-AUDITORIA-DE-DEPENDENCIAS.md). Testes web atuais: 100 aprovados; consulte o relatório para backend, Android e limites de cada ambiente. Não confundir resultado verde do CI com ausência de avisos de segurança.

## Dados para apresentação local

Há uma opção explícita para carregar vendas e despesas sintéticas em duas lojas, sem duplicar registros ao repetir. Consulte o [guia do cenário de apresentação](backend/docs/CENARIO-DE-APRESENTACAO.md).

Preparação para servidor compartilhado: [guia de hospedagem](scripts/hospedagem/README.md). Inclui configuração e teste isolado; domínio, certificado público e banco remoto precisam do ambiente escolhido.
