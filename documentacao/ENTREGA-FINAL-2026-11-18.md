# Entrega final — 18/11/2026

Responsável pelas mudanças desta entrega: **Thayná Batista da Silva** (branch `entrega-final-thayna`).

## 1. Correção pedida pelo mentor

O mentor Eryson Moreira apontou, na avaliação da entrega parcial, que o problema central tinha sido confundido com a solução. A documentação focava em *como o comerciante recolheria os impostos de cada venda*. Mas o problema é a **descapitalização** que o comerciante sofre com o desconto automático do imposto no momento do pagamento.

Ajuste feito:

| Antes | Agora |
|---|---|
| "O comerciante acompanha o valor bruto, tributo demonstrativo, taxa e líquido de cada venda" (descrição da solução no lugar do problema) | **Problema:** com o split payment, o imposto sai na hora do pagamento; o dinheiro que funcionava como capital de giro até a data de recolhimento deixa de entrar, e o comerciante se descapitaliza. **Solução:** o Planner mostra quanto de cada venda realmente entra no caixa, projeta o caixa e avisa sobre déficit, para o comerciante se antecipar |

O texto completo está no [README](../README.md#o-problema), também em [inglês](../README.en.md#the-problem) e [espanhol](../README.es.md#el-problema). A explicação do ícone **i** da tela de entrada repete esse problema em linguagem simples. Os documentos do Google Docs (requisitos V2 e entrega parcial) ficam fora do repositório e precisam receber o mesmo ajuste.

## 2. O que mudou no sistema

| Pedido | Onde está | Como foi testado |
|---|---|---|
| Bloquear após 5 tentativas | `AuthController.login`, `V7__login_attempts.sql` (servidor); `autenticacaoDemonstrativa` (demonstração) | `LoginBloqueioIntegrationTest` (4 testes); `entrega-final.test.tsx`; `entrega-final.spec.ts` |
| Aviso de quantas tentativas restam | `TelaLogin.tsx`, `transporteApi.mensagemLogin` | unitários e navegador (4, 3, 2, 1, bloqueio com relógio) |
| Recuperação de conta | `EnvioRecuperacaoSenha.java`, `TelaRedefinirSenha.tsx`, `SessionFilter` (rotas públicas) | `RecuperacaoSenhaIntegrationTest`, `RecuperacaoSenhaEmailTest`; navegador (pedido de recuperação) |
| Olhinho da senha | `TelaLogin.tsx` (`CampoSenha`), `TelaRedefinirSenha.tsx` | unitários e navegador |
| "Ainda não tem uma conta? Cadastre-se" | `TelaLogin.tsx` | unitários e navegador |
| Lembrar de mim | `TelaLogin.tsx`, `adaptarEValidarRespostasApi.ts` e `sessaoUsuario.ts` (`retomar`, `esquecer`), no MVP e na demonstração | unitários (guarda só e-mail e token; descarta sessão expirada, de outra API ou adulterada) |
| Tema claro, escuro e do sistema em todas as telas | `preferencias/tema.ts`, `tema-escuro.css` (gerado), `SeletorPreferencias.tsx` | navegador em 10 telas + telas públicas; contraste do tema escuro medido |
| Português, inglês e espanhol em todas as telas | `preferencias/idioma.ts`, `traducoes.ts` | `verificar-traducoes.mjs` (todo texto do código); navegador percorre 10 telas e as telas públicas nos dois idiomas sem sobrar texto sem tradução |
| Ícone "i" em cada informação | `preferencias/dicas.ts`, `glossario.ts` | navegador: toda informação das telas tem explicação; abre com mouse, teclado e toque; fecha com Esc; muda de idioma |
| README trilíngue com o que cada pessoa fez | `README.md`, `README.en.md`, `README.es.md` | `verificar-readme.mjs` |
| Capital de giro dentro do app (empréstimo com banco ou fintech parceira) | `credito/` no backend (`CreditoService`, `CreditoController`, `CreditoWebhookController`, migrations V9 e V10); `TelaCapitalGiro.tsx` e `servicos/credito.ts` no frontend | `CreditoIntegrationTest` (10 testes), `CreditoWebhookIntegrationTest`, `credito.test.ts`; navegador na demonstração (`entrega-final.spec.ts`) e contra a API real (`credito-integrado.spec.ts`): consentimento, comparação de ofertas, contratação, pagamento de parcela, quitação antecipada, desistência e projeção |
| Reforma no caixa (créditos de IBS/CBS, NF-e, preço, prazo, antecipação e contador) | `ReformaController`, migration V11, `FinanceService` (`taxCreditCents`); `TelaReforma.tsx`, `CamposNotaCompra.tsx` e `servicos/reforma.ts` | `ReformaIntegrationTest` (5 testes), `MigrationUpgradeTest`, `reforma.test.ts` (14 testes); navegador na demonstração e contra a API real (`reforma-integrado.spec.ts`) |
| Nenhum crédito de IA | todo o repositório e mensagens de commit | `verificar-sem-credito-ia.mjs` (com autoteste) |
| Autoria da Thayná | commits da branch | `verificar-autoria.mjs` |

## 3. Resultados dos testes

Os números abaixo foram medidos nesta entrega, no Linux (Node 20.20, JDK 21.0.13, Chromium do Playwright).

| Bateria | `main` antes da entrega | Esta entrega |
|---|---|---|
| Backend (`./mvnw test`, PostgreSQL embutido) | 61 testes, 1 falha por tempo de espera (`CrashRecoveryTest`, máquina ocupada) | **90 testes, 0 falhas** (29 novos: bloqueio, recuperação, e-mail, capital de giro, Reforma no caixa e limite de acesso no banco) |
| Frontend unitários (`npm test`) | 110 testes | **154 testes, 0 falhas** (44 novos) |
| Tipos e build de produção (`npm run build`) | passa | **passa**; o código de teste (`__planner`) não vai para o build |
| Navegador na demonstração (`npm run test:e2e:entrega`) | — | **25 de 25**: login, recuperação de senha completa, lembrar de mim, ciclo completo do capital de giro, Reforma no caixa, tema, idiomas, ícones "i", WCAG A/AA nos temas claro e escuro, teclado e ampliação |
| Navegador contra a API real (`npx playwright test`, com backend local) | **0 de 22** (testes desatualizados: esperavam o login na primeira tela) | **23 de 23** (19 do time, atualizados, 2 de login integrado, 1 do capital de giro e 1 da Reforma no caixa) |
| Traduções (`verificar-traducoes.mjs`) | — | 1.145 textos em EN/ES e 241 explicações em PT/EN/ES, nenhum faltando |
| Acessibilidade (axe, WCAG 2.1 A/AA, 12 telas) | violações de contraste no design | **0 violações** nos temas claro e escuro |
| Crédito de IA (`verificar-sem-credito-ia.mjs`) | 1 menção na documentação de design | **nenhum** (com autoteste do verificador) |

Teste manual contra a API local com `curl`: o pedido de recuperação sem login respondeu 202. Duas senhas erradas responderam 401 com `remainingAttempts` 4 e 3.

## 4. Revisão de segurança

Verificado:

- O bloqueio fica no servidor. Recarregar a página não zera a contagem. A contagem usa o SHA-256 do e-mail normalizado, e o e-mail em texto não é gravado.
- A resposta é igual para e-mail cadastrado e não cadastrado, inclusive o bloqueio. Assim ninguém descobre quais contas existem.
- Durante o bloqueio, nem a senha certa entra. Login certo ou redefinição de senha zeram a contagem.
- A mensagem de tentativas é montada no navegador só com números validados do servidor (inteiros de 0 a 20 e de 0 a 86400). Texto livre recebido não é exibido.
- O link de recuperação usa token aleatório de 256 bits, guardado só como hash, válido por 30 minutos e de uso único. Ele vai no fragmento `#` da URL, que não chega ao servidor nem aos logs. O e-mail é enviado fora da requisição, para o tempo de resposta não revelar se a conta existe. O endereço base do link precisa ser https.
- Lembrar de mim guarda só o token e os dados da sessão, ligados ao endereço da API, e descarta tudo ao sair ou expirar. A senha nunca é guardada.
- As traduções e explicações são aplicadas como texto (`textContent`/`nodeValue`), nunca como HTML.
- O nome acessível dos campos, títulos e cabeçalhos de tabela continua sendo só o rótulo: o ícone "i" não entra no que o leitor de tela anuncia.

Corrigido nesta revisão:

- Os testes de navegador do time falhavam todos no `main` (esperavam o login na primeira tela). Foram atualizados e passam.

- As rotas de recuperação de senha exigiam sessão, então a recuperação não funcionava para quem esqueceu a senha. Agora são públicas e usam o limite mais rígido por IP (20 por minuto).
- O papel do banco usado pela API não podia atualizar `app_user`, então a troca de senha falhava com erro 500. A migration V8 libera só a coluna `password_hash` (privilégio mínimo).
- Ciclo de atualização no ícone "i" que travava a página ao abrir a explicação.
- Crescimento da tabela de tentativas: registros com mais de um dia e sem bloqueio são apagados aos poucos.

Fica de fora (risco aceito ou depende de outra pessoa):

- Bloqueio por conta permite que alguém bloqueie a conta de outra pessoa por 15 minutos digitando senhas erradas. É o comportamento pedido. A recuperação de senha desbloqueia, e o limite por IP reduz o abuso.
- Lembrar de mim deixa o token no navegador (localStorage). Um script malicioso na página poderia lê-lo. O sistema não usa HTML vindo de fora, e o token expira.
- O envio real de e-mail depende de configurar um SMTP no Render (variáveis em `render.yaml`) e de um novo deploy, feito pelo responsável pelo deploy.

## 5. Pendências

- Produção atualizada em 20/11/2026: site e API num único deploy no Render (https://planner-api-tvmg.onrender.com), com as migrations aplicadas no banco. [Como publicar](DEPLOY-UNICO-RENDER.md).
- Configurar o SMTP no Render para o e-mail de recuperação sair de verdade: [passo a passo](CONFIGURAR-EMAIL-RECUPERACAO.md).
- Aplicar a correção do problema central também nos documentos do Google Docs.
- Homologação do aplicativo Android em aparelho físico.

## 6. Desvio do design

Para atingir o contraste mínimo de 4,5:1 (WCAG AA), cinco cores do design mudaram de tom: cinza secundário `#64748b` → `#5b6b82`, verde de texto `#16a34a` → `#15803d`, etiqueta `#7991ad` → `#5b6b82`, títulos dos grupos do menu `#4e7298` → `#7495bc` e selo de dados demonstrativos `#927320` → `#8a6500`. O desvio está anotado em `frontend/src/design-fidelidade.css` e pode ser revisto pela responsável pelo design.
