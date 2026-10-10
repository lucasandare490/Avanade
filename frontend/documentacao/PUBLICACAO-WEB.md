# Preparação de publicação web

Não houve deploy ou push nesta rodada. O projeto é uma aplicação estática com rotas hash; o servidor distribui index.html e assets. O endereço local 127.0.0.1 só funciona no próprio computador enquanto o processo está ativo.

## Publicar a versão validada no ambiente escolhido

1. Usar Node 22.12 ou superior compatível com as dependências e instalar com npm ci.
2. Executar os scripts de verificação e build; só publicar o diretório dist produzido pela versão verificada.
3. Escolher hospedagem e domínio da equipe. Servir por HTTPS, sem expor servidor de desenvolvimento à internet.
4. Conferir base de publicação se houver subpasta; Vite usa raiz por padrão.
5. Configurar cache longo apenas para assets com hash; index.html precisa receber atualizações.
6. Conectar a API somente após definir URL, sessão, CORS/CSRF, contratos e isolamento por loja.
7. Não publicar auditoria privada, conversas, anexos pessoais, .env ou chaves. .env.example contém somente exemplo de URL.

Não foi incluído service worker ou PWA obrigatória. Não existe sincronização de pagamentos offline. Os resultados atuais estão em RELATORIO-VALIDACAO-ATUAL.md; arquivos expressamente históricos descrevem versões anteriores.

## Integração no repositório da equipe

Confirmar branch e estrutura com os responsáveis. Copiar frontend e, se aceito, android-pos como frentes separadas. Manter lock do npm; não incluir node_modules, cache de build, local.properties ou chaves Android. Criar revisão antes de integrar à branch compartilhada. Nenhum comando de publicação automática é executado por este projeto.
