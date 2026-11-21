# Changelog

Mudanças relevantes do Planner Comercial. Datas no formato AAAA-MM-DD. A autoria de cada mudança está no histórico de commits.

## 2026-11-20 — Produção atualizada e site + API num único deploy no Render (Thayná Batista da Silva)

- Deploy da API nova no Render: o banco recebeu as migrations V6 a V11 (recuperação de senha, tentativas de login, capital de giro e créditos de IBS/CBS). Login com aviso de tentativas, recuperação sem sessão, capital de giro e Reforma no caixa funcionando em produção.
- Imagem única (`Dockerfile` da raiz): o site é montado e entregue pela própria API, no mesmo endereço (https://planner-api-tvmg.onrender.com). `render.yaml` aponta para ela. Guia em `documentacao/DEPLOY-UNICO-RENDER.md`.
- API pronta para rodar atrás de proxy: ouve em `0.0.0.0` e em `PORT`, aceita o certificado do Supabase também por `SUPABASE_SSL_ROOT_CERT_PEM` e lê o IP real num cabeçalho confiável só quando `CLIENT_IP_HEADER` é configurado.
- Limite de pedidos de acesso por IP guardado no banco (migration V12, só o hash do IP), igual em todas as cópias da API. Teste novo: `LimiteAcessoCompartilhadoTest` (4).
- `scripts/auditoria/api-producao.mjs` aceita o endereço a conferir.

## 2026-11-19 — Reforma no caixa (Thayná Batista da Silva)

- Tela **Reforma no caixa** (menu Financeiro), na demonstração e na versão com servidor, em PT/EN/ES, nos dois temas e com ícone "i" em cada informação.
- **Créditos de IBS/CBS das compras**: campo novo na despesa (`taxCreditCents`, migration V11 com `CHECK` de 0 até o valor da compra) e resumo do período com imposto retido, créditos, imposto líquido e crédito acumulado (`GET /api/v1/tax-reform/summary`).
- **Leitura do XML da NF-e** no formulário de despesa: preenche descrição, valor, data e crédito (grupo `IBSCBSTot`) para conferência; recusa DOCTYPE, entidades e arquivos acima de 1 MB.
- **Preço de venda** com IBS/CBS por fora, crédito da compra, taxa da maquininha e margem; **prazo com fornecedores** e quanto cobre da falta de caixa; **antecipação de recebíveis** comparada com o capital de giro.
- **Pacote do contador** em CSV (resumo, vendas e compras com crédito), com proteção contra fórmulas.
- Testes: `ReformaIntegrationTest` (5), `MigrationUpgradeTest` atualizado, `reforma.test.ts` (14), navegador na demonstração (2) e contra a API real (`reforma-integrado.spec.ts`). Especificação em `documentacao/REFORMA-NO-CAIXA.md`.
- Roteiro do pitch com o bloco da Reforma no caixa e prints novos nos READMEs.

## 2026-11-19 — README visual, roteiro do pitch e documentação atualizada (Thayná Batista da Silva)

- READMEs em português, inglês e espanhol com print de abertura, galeria de telas no idioma de cada versão (entrada, painel, fluxo de caixa, split, capital de giro, explicação "i", tema escuro e celular) e selos da tecnologia.
- `frontend/scripts/capturar-readme.mjs` refaz os 27 prints a partir da demonstração, sem dados reais (`documentacao/readme/`).
- Espaço "Pitch em vídeo" nos três READMEs, pronto para receber o link do YouTube.
- Roteiro do pitch em vídeo, com falas pausadas, tempo de cada bloco e o que mostrar na maquininha e no celular: `documentacao/pitch/ROTEIRO-PITCH.md` (também em DOCX e PDF).
- Entrega final e resumo da entrega com os números atuais dos testes, a linha do capital de giro e a pendência do deploy da API (migrations V7 a V10).

## 2026-11-18 — Capital de giro completo (Thayná Batista da Silva)

- **Diagnóstico da descapitalização**: imposto retido por mês pelo split, saldo, cobertura em dias, falta de caixa em 30 dias e recomendação responsável de valor e parcelas.
- **Vários parceiros** (fintech e banco simulados) com ofertas comparadas pelo CET e selo de menor CET.
- **Crédito responsável**: comprometimento da parcela sobre as entradas, com níveis e bloqueio acima de 50%.
- **Antes e depois do caixa** nas próximas 12 semanas, sem e com a oferta escolhida.
- **Gestão do contrato**: pagamento de parcela em ordem, quitação antecipada com desconto proporcional dos juros, desistência em 7 dias sem juros, resumo para impressão e histórico imutável (`credit_event`).
- **Webhook assinado (HMAC-SHA256)** e idempotente para o parceiro real confirmar pagamentos.
- Migration V10; especificação, regras, base regulatória e integração em `documentacao/INTEGRACAO-PARCEIRO-CREDITO.md`.
- Testes: `CreditoIntegrationTest` (10), `CreditoWebhookIntegrationTest`, `credito.test.ts` (12) e navegador (demonstração e API real).

## 2026-11-18 — Capital de giro com parceiro (Thayná Batista da Silva)

- Tela **Capital de giro** no menu: limite, autorização revogável para compartilhar dados agregados, simulação com parcela, total, juros, taxa e CET, aceite consciente e contratação sem ir ao banco. Funciona no MVP e na demonstração.
- Parceiro plugável (`ParceiroCredito`); hoje simulado. Guia: `documentacao/INTEGRACAO-PARCEIRO-CREDITO.md`.
- A projeção de caixa soma o capital de giro e desconta as parcelas; no déficit, oferece ver opções de capital de giro.
- Migration V9 e testes (`CreditoIntegrationTest`, `credito.test.ts`, e2e na demonstração e na API real).
- Limite de logins por IP configurável (`LOGIN_RATE_LIMIT_PER_MINUTE`, padrão 20).

## 2026-11-18 — Design e verificação da produção (Thayná Batista da Silva)

- Documentação de design publicada em `documentacao/design/`: checklist de fidelidade visual, inventários de telas e componentes, tokens de design, 158 capturas e o documento completo em .docx e .pdf (gerados de novo a partir do .md revisado).
- `scripts/auditoria/site-producao.mjs` e `api-producao.mjs` conferem se o site da Vercel e a API do Render estão na versão nova.

## 2026-11-18 — Entrega final (Thayná Batista da Silva)

### Problema central
- README em português, inglês e espanhol, reescrito a partir do problema apontado pelo mentor: a **descapitalização** do comerciante quando o imposto é descontado automaticamente no pagamento (split payment). Antes, o problema era confundido com a solução. O README anterior foi preservado em `documentacao/historico/`.

### Login e conta
- Bloqueio temporário de 15 minutos após 5 senhas erradas seguidas, controlado no servidor (migration `V7__login_attempts.sql`, só com o hash do e-mail).
- Aviso a cada erro com as tentativas que restam e relógio do tempo de bloqueio.
- Recuperação de conta: envio do link por e-mail (SMTP configurável) e tela **Criar nova senha**. Redefinir a senha desbloqueia o login.
- Correção: as rotas `password-reset/request` e `password-reset/complete` exigiam sessão, então quem esqueceu a senha não conseguia recuperá-la. Agora são públicas, com o mesmo limite por IP do login. Teste: `RecuperacaoSenhaIntegrationTest`.
- Correção: o banco não deixava a API trocar a senha (`permission denied for table app_user`), então criar a nova senha sempre dava erro 500. A migration `V8__password_reset_update_grant.sql` libera só a coluna `password_hash`.
- Botão de olho para mostrar ou esconder a senha.
- **Lembrar de mim**: mantém a sessão no aparelho até expirar. A senha nunca é guardada.
- **Ainda não tem uma conta? Cadastre-se** na tela de login.
- Demonstração local funcional: a recuperação de senha gera um link simulado que abre **Criar nova senha**, e **Lembrar de mim** mantém a sessão ao recarregar.
- Guia para ligar o e-mail de recuperação no Render: `documentacao/CONFIGURAR-EMAIL-RECUPERACAO.md`.

### Todas as telas
- Tema claro, escuro ou do sistema, no menu e nas telas públicas. O tema escuro é gerado a partir das cores do tema claro (`npm run tema:escuro`).
- Idiomas português, inglês e espanhol, no menu e nas telas públicas, incluindo datas, mensagens do servidor e explicações.
- Ícone **i** ao lado de cada informação, com explicação em linguagem simples. Abre com o mouse, com Tab ou com um toque, e fecha com Esc. O nome acessível dos campos e títulos continua sendo só o rótulo.

### Auditoria e testes
- Verificadores em `scripts/auditoria/`: README, traduções, ausência de crédito de IA, autoria dos commits e publicação.
- Testes novos: `LoginBloqueioIntegrationTest` e `RecuperacaoSenhaEmailTest` (backend), `src/testes/entrega-final.test.tsx` (unitários) e `e2e/entrega-final.spec.ts` (navegador).
- Removidas da documentação de design as menções que davam crédito a ferramenta de IA.
