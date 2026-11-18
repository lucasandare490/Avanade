# Planner Comercial — Split Tributário

**Português** · [English](README.en.md) · [Español](README.es.md)

Projeto da **Squad 19** da Residência Tecnológica **Grow Up 2026.2** (Porto Digital e Faculdade Senac de Pernambuco, Recife-PE), feito com a empresa parceira **Avanade**.

**Ver funcionando agora:** https://avanade-frontend-xi.vercel.app/ (a API no plano gratuito do Render pode levar até 1 minuto para acordar no primeiro acesso).

## Instalar e rodar

**Requisitos:** Git, JDK 21, Node.js 20.19+ (ou 22.12+), Python 3 e curl. Docker não é necessário.

**Linux ou macOS, um comando** (sobe a API com banco local e o site):

```bash
git clone https://github.com/lucasandare490/Avanade.git && cd Avanade && ./scripts/dev.sh
```

**Windows (PowerShell)**, em dois terminais, na pasta do projeto:

```powershell
.\scripts\iniciar-backend-local.ps1 -Jdk 'C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot'
```

```powershell
npm.cmd --prefix frontend ci; npm.cmd run dev
```

**Só a demonstração, sem Java** (dados fictícios no navegador):

```bash
cd frontend && npm ci && VITE_MODO_DADOS=demo npm run dev
```

**Como confirmar que funcionou**

1. Abra http://127.0.0.1:5173: aparece a tela de entrada do Planner Comercial.
2. Clique em **Entrar** e depois em **Cadastre-se** para criar uma loja vazia. Ou entre com `gerente1@demo.local` e a senha gerada em `backend/.local/demo-password`.
3. A API responde `{"status":"UP"}` em http://127.0.0.1:8080/actuator/health.

## O problema

A Reforma Tributária do consumo (Emenda Constitucional 132/2023 e Lei Complementar 214/2025) cria o IBS e a CBS e prevê o **split payment**. Com ele, a parte do imposto é separada automaticamente **no momento em que o cliente paga**, e o comerciante recebe só o valor líquido.

Hoje, o dinheiro do imposto entra no caixa junto com a venda e só sai semanas depois, na data de recolhimento. Nesse intervalo, ele funciona como **capital de giro**: paga fornecedor, estoque e salários. Com o split payment, esse dinheiro deixa de entrar. O pequeno e médio comerciante perde capital de giro de uma vez. Essa é a **descapitalização**. Sem planejamento, quem vende bem pode ficar sem caixa para pagar as contas.

O problema central, portanto, **não é como recolher o imposto de cada venda**, porque o split payment já faz isso sozinho. É **como manter o caixa saudável quando o imposto sai na hora da venda**.

## A solução

O **Planner Comercial** ajuda o comerciante a enxergar e a se antecipar à descapitalização:

- mostra, venda a venda, quanto foi para imposto, quanto foi para a taxa do meio de pagamento e quanto **de fato entrou no caixa**;
- calcula o caixa realizado (entradas líquidas menos despesas pagas) e o caixa por semana;
- projeta o caixa dos próximos dias e avisa quando o cenário indica déficit;
- simula vendas antes de acontecerem, para entender o impacto de cada percentual;
- explica os números em linguagem simples, com análise por regras, sem IA externa e sem alterar valores.

**Persistência real em PostgreSQL. Pagamentos, split e tributos são simulados:** não há transferência de dinheiro nem recolhimento fiscal. Percentuais de exemplo não são legislação. Crédito simulado e cancelamento ficam para evolução futura.

## O que o sistema tem

| Área | Como funciona |
|---|---|
| Login seguro | Bloqueio temporário de 15 minutos após 5 senhas erradas seguidas. A cada erro aparece quantas tentativas restam. Também tem recuperação de conta por e-mail, botão de olho para ver a senha, **Lembrar de mim** e **Ainda não tem uma conta? Cadastre-se** |
| Tema | Claro, escuro ou seguir o sistema, em todas as telas, escolhido no menu |
| Idiomas | Português, inglês e espanhol em todas as telas, escolhidos no menu |
| Explicações | Ícone **i** ao lado de cada informação. Mostra o que ela significa ao passar o mouse, com a tecla Tab ou com um toque no celular |
| Vendas e split | Pagamento simulado, divisão em imposto, taxa e líquido, regra histórica e retomada de falha parcial |
| Despesas | Registro de despesa paga, busca e sugestão de categoria confirmada pela pessoa |
| Caixa | Agregados do servidor, composição diária, caixa semanal, projeção manual com aviso de déficit |
| Relatórios | Vendas, despesas e composição tributária por período, com CSV completo |
| Android | Cliente Kotlin (POS) local e integrado por HTTPS. A homologação em aparelho físico está pendente |

## Equipe e o que cada pessoa fez

| Pessoa | Papel na squad | Contribuições registradas |
|---|---|---|
| **Thayná Batista da Silva** | Scrum Master; design e prototipação; pesquisa; documentação de requisitos; README em português, inglês e espanhol; testes | Protótipo de alta fidelidade no [Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design); pesquisa e levantamento de requisitos do Split Pay e do Planner Comercial; documentação de requisitos. Na entrega final: correção do problema central (descapitalização); login com bloqueio, aviso de tentativas, recuperação por e-mail, botão de olho, Lembrar de mim e Cadastre-se; temas claro, escuro e do sistema; idiomas PT/EN/ES; ícones **i** com explicações; verificadores de auditoria; testes novos de backend, unitários e de navegador |
| **Kássio Lima de Oliveira** | Código do projeto e deploy | Integração entre backend e frontend com persistência; recuperação de operações; fluxo seguro de recuperação de senha; configuração do Supabase; deploy no Render (API) e na Vercel (site); monitoramento e rotina de backup |
| **Lucas André Cardoso de Lima** | Código do front-end | Primeira entrega dos frontends web e Android; comparação de tendências; contratos de integração; revisão dos 516 critérios com evidências; caixa semanal, cadastro e relatórios |
| **Kleysson Teixeira da Cruz Junior** | Entrevistas com pessoas usuárias | Entrevistas com usuários; revisão do README do MVP; [repositório inicial](https://github.com/Kleyssonteixeirapf/projeto-split-tributario) do projeto |
| **Heitor Sette Couto de Melo** | Pitch | Apresentação do pitch deck |
| **James Bernardino da Silva Neto** | Integrante da squad | — |

Mentor: **Eryson Moreira** (Avanade). Turma: GROWUP-SENAC-N2. A autoria de cada mudança no código pode ser conferida no [histórico de commits](https://github.com/lucasandare490/Avanade/commits/main) e em [CHANGELOG.md](CHANGELOG.md).

## Documentos do projeto

- [Protótipo no Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design) e [documentação de design, tokens e capturas](documentacao/design/README.md)
- [Pasta de documentação da Squad 19](https://drive.google.com/drive/folders/1_4WXflZ5LvJ3yTbEgqiSV5Qw5S6jHoYp?usp=sharing)
- [Análise e levantamento de requisitos do Split Pay e do Planner Comercial](https://docs.google.com/document/d/1QoIXru-uVBmSDMy6YKjTAkVvk_0Q2kk5_WnfubFtVPU/edit?usp=sharing)
- [Documentação de requisitos (V2)](https://docs.google.com/document/d/13OdFEBoY3y_6TPt6pDJQwXycZW9mGdwy/edit?usp=sharing)
- [Entrega parcial](https://docs.google.com/document/d/16FiTQW6DRE6WRpWBlSeXzVHnP-lr3DfT/edit?usp=sharing)
- [Registro da entrega final](documentacao/ENTREGA-FINAL-2026-11-18.md): o que mudou, como foi testado e o que ficou pendente
- [Contrato da API](backend/docs/API.md) · [Integração com Supabase](scripts/supabase/README.md) · [Operação em produção](documentacao/OPERACAO-PRODUCAO.md)

## Testes e auditoria

| O que testar | Comando |
|---|---|
| Backend (Java, banco embutido) | `cd backend && ./mvnw test` |
| Frontend (unitários) | `cd frontend && npm test` |
| Tipos e build | `cd frontend && npm run build` |
| Navegador: login, tema, idiomas, ícones **i** e acessibilidade (sobe a demonstração sozinho) | `cd frontend && npm run test:e2e:entrega` |
| Navegador contra a API real | com `./scripts/dev.sh` rodando: `cd frontend && npx playwright test` |
| Toda frase da interface traduzida | `node scripts/auditoria/verificar-traducoes.mjs` |
| Nenhum crédito de IA no projeto | `node scripts/auditoria/verificar-sem-credito-ia.mjs` |
| Tema escuro em dia com o tema claro | `cd frontend && node scripts/gerar-tema-escuro.mjs --verificar` |
| Site e API publicados atualizados | `node scripts/auditoria/site-producao.mjs` e `node scripts/auditoria/api-producao.mjs` |

Os resultados da entrega final estão em [documentacao/ENTREGA-FINAL-2026-11-18.md](documentacao/ENTREGA-FINAL-2026-11-18.md). O sistema é auditável: cada mudança tem um commit com autoria, o [CHANGELOG](CHANGELOG.md) resume o que mudou e os verificadores acima podem ser rodados por qualquer pessoa.

## Segurança e privacidade

- Senhas com BCrypt. O token de acesso é opaco, revogável e expira. A senha nunca é guardada no navegador.
- O bloqueio de login fica no servidor, guarda só o hash do e-mail e responde igual para e-mails cadastrados e não cadastrados. Assim ninguém descobre quais contas existem.
- **Lembrar de mim** guarda o token neste aparelho até a sessão expirar. Não use em computador compartilhado.
- O link de recuperação vale por 30 minutos e uma vez só, e o token vai no fragmento `#` da URL, que não chega aos logs do servidor. O envio do e-mail exige SMTP configurado no servidor (`SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `PASSWORD_RESET_FROM`, `PASSWORD_RESET_LINK_BASE`). Sem isso, o pedido é aceito e nada é enviado. Passo a passo: [configurar o e-mail de recuperação](documentacao/CONFIGURAR-EMAIL-RECUPERACAO.md). Na demonstração local, o e-mail é simulado por um link na própria tela.
- Nenhuma senha, chave ou banco local entra no repositório (`.env`, `backend/.local` e afins estão no `.gitignore`).

## Pastas

- `frontend/`: site em React 19, TypeScript e Vite. Telas em `src/telas`, tema, idiomas e explicações em `src/preferencias`.
- `backend/`: API em Java 21, Spring Boot, PostgreSQL e Flyway (migrations V1–V8).
- `android-pos/`: aplicativo Kotlin do POS.
- `scripts/`: execução local, Supabase, hospedagem e `auditoria/`.
- `documentacao/`: estado, decisões, operação e histórico (inclui o [README anterior](documentacao/historico/README-antes-da-entrega-final-2026-11-18.md)).
