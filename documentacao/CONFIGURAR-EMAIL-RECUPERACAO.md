# Ligar o e-mail de recuperação de senha (Render)

O código já envia o link de "Esqueci minha senha" por e-mail. Falta só dizer ao servidor **qual conta de e-mail usar**. Sem isso, o pedido é aceito e nada é enviado. Leva cerca de 10 minutos e pode ser feito no plano gratuito.

## 1. Escolha um serviço de e-mail (SMTP)

Qualquer serviço SMTP funciona. Duas opções sem custo:

| Opção | Servidor | Porta | Usuário e senha |
|---|---|---|---|
| **Brevo** (recomendado para o projeto) | `smtp-relay.brevo.com` | `587` | Login e chave SMTP gerados no painel do Brevo, em *SMTP & API* |
| **Gmail** de uma conta da equipe | `smtp.gmail.com` | `587` | O endereço Gmail e uma **senha de app** (exige verificação em duas etapas na conta). Nunca use a senha normal da conta |

Confira os limites do plano gratuito no site do serviço escolhido. Para o projeto, dezenas de e-mails por dia são suficientes.

## 2. Preencha as variáveis no Render

No painel do Render: serviço **planner-api** → **Environment** → adicione ou edite:

| Variável | Valor |
|---|---|
| `SPRING_MAIL_HOST` | servidor da tabela acima |
| `SPRING_MAIL_PORT` | `587` |
| `SPRING_MAIL_USERNAME` | usuário SMTP |
| `SPRING_MAIL_PASSWORD` | senha ou chave SMTP (fica só no Render, nunca no GitHub) |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE` | `true` |
| `PASSWORD_RESET_FROM` | remetente, por exemplo `Planner Comercial <seu-remetente@dominio>`. No Brevo, precisa ser um remetente verificado |
| `PASSWORD_RESET_LINK_BASE` | `https://avanade-frontend-xi.vercel.app` (já vem do `render.yaml`) |

Salve e faça **Manual Deploy → Deploy latest commit**. Esse deploy também aplica as migrations V7 (bloqueio de login) e V8 (permissão para trocar a senha).

## 3. Confirme que funcionou

1. Abra o site, clique em **Entrar** e depois em **Esqueci minha senha**.
2. Informe o e-mail de uma conta cadastrada e clique em **Enviar instruções**.
3. O e-mail chega em até alguns minutos (veja também o spam). O link abre a tela **Criar nova senha**.
4. Depois de salvar, entre com a senha nova.

Se o e-mail não chegar, veja em **Logs** do Render a linha `Falha ao enviar e-mail de recuperação de senha` (o motivo aparece só como tipo de erro; o token e o e-mail nunca vão para o log). Confira usuário, senha e remetente.

## Segurança

- A senha SMTP fica só nas variáveis do Render. Não coloque em arquivos do repositório.
- O link vale 30 minutos e uma vez só. O token viaja depois do `#` da URL, que não chega aos logs do servidor.
- O pedido de recuperação responde igual para e-mail cadastrado ou não, e o envio acontece em segundo plano, para ninguém descobrir quais contas existem.
