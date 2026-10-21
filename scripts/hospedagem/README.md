# Hospedagem do demonstrador

## Publicação simples com Render e Vercel

O repositório também contém `render.yaml` e `vercel.json` para publicar a API
Java no Render e o frontend Vite na Vercel. O backend continua neste repositório;
não é necessário criar uma cópia ou mover arquivos.

No Render, crie o serviço a partir do Blueprint e adicione o certificado CA do
Supabase como Secret File com o nome `supabase-ca.crt`. Em seguida, configure as
variáveis marcadas como `sync: false`, principalmente as duas senhas e
`CORS_ORIGINS`. O caminho do certificado já está definido como
`/etc/secrets/supabase-ca.crt`.

Na Vercel, importe o repositório, mantenha a raiz do projeto e configure
`VITE_API_URL` com a URL HTTPS do serviço Render. Depois de obter o domínio final
do frontend, atualize `CORS_ORIGINS` no Render com essa origem exata.

Pacote opcional para servidor Linux com Docker Compose. Não contrata serviços, não cria domínio e não publica automaticamente. Pagamentos e tributos continuam simulados. Contas demonstrativas exigem senha própria do ambiente.

## Preparar

1. Copiar `.env.example` para `.env` nesta pasta, fora do Git. Preencher três senhas distintas, domínio e origem HTTPS. Configurar DNS para o servidor e liberar apenas 80/443; SSH deve ter acesso restrito.
2. Banco no mesmo servidor: manter a URL `jdbc:postgresql://db:5432/split` e iniciar primeiro `docker compose --profile banco-local up -d --wait db`.
3. Banco gerenciado: não ativar o perfil banco-local. Informar URL JDBC com `sslmode=verify-full` e certificado confiável conforme o provedor; usar conexão direta compatível com migrations, não pool transacional. Provisionar os usuários de migration e runtime com os privilégios descritos em `backend/docs/BANCO.md`. Não colocar senha na URL.
4. Executar `docker compose up --build -d --wait api web`. A primeira compilação precisa de internet. Conferir `docker compose ps` e a página HTTPS. Caddy obtém o certificado quando o domínio resolve para o servidor e as portas estão alcançáveis.
5. Android usa a mesma origem HTTPS; validar login, venda e recuperação em aparelho. Não alterar a exigência de certificado válido.

O frontend é compilado em modo API e usa a mesma origem `/api`. Somente Caddy publica portas. A API e o banco não têm portas do host. O proxy mantém o caminho da API; `/actuator` e documentação interna não são encaminhados. Recursos estáticos recebem CSP e cabeçalhos de proteção. A sub-rede 172.30.19.0/24 deve estar livre no host; se alterada, atualizar também o IP do proxy e a lista de proxies confiáveis.

O endereço do cliente é aceito apenas do proxy de IP fixo para preservar o limite de tentativas. Não adicionar outros proxies confiáveis sem revisar a cadeia. Caddy substitui cabeçalhos encaminhados recebidos de clientes não confiáveis.

## Operação

Métricas e saúde ficam na porta interna 9090 da API, sem publicação pública. Para diagnóstico autorizado: `docker compose exec api curl -fsS http://127.0.0.1:9090/actuator/metrics`. Elas não devem ser expostas por um novo proxy. Coleta contínua e alertas ainda dependem do operador.

Definir responsáveis, retenção e destino criptografado de backups antes do uso compartilhado. Usar os procedimentos de backup/restore existentes e testar restauração em banco separado; não executar `down -v` no ambiente com dados. O volume de certificados também deve ser preservado. A rotação de senhas requer alteração no PostgreSQL; editar `.env` sozinho não troca a senha de um banco existente.

Atualizações: conferir backup e migrations, reconstruir imagens e verificar saúde/login/consulta após a troca. Se uma migration foi aplicada, não presumir que voltar o JAR reverte o schema; seguir forward fix documentado.

## Validação automatizada

`verificar.sh` usa um projeto Compose isolado e credenciais descartáveis, serve HTTP apenas em loopback para testar o pacote, verifica login pelo proxy, métricas internas, bloqueio de rotas administrativas e ausência de portas públicas da API/banco. Não prova emissão de certificado público, DNS ou configuração do provedor remoto. O teste preserva volumes; no CI eles pertencem ao executor descartável.

Referência técnica: https://caddyserver.com/docs/automatic-https e https://caddyserver.com/docs/caddyfile/directives/reverse_proxy.
