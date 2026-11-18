# Changelog

Mudanças relevantes do Planner Comercial. Datas no formato AAAA-MM-DD. A autoria de cada mudança está no histórico de commits.

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
