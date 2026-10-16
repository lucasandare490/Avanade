# Operação e recuperação

## Conflitos temporários do banco

O servidor não repete automaticamente transações financeiras: limite de repetição interna zero. Deadlock, falha de serialização e aquisição de lock classificados como falha transitória retornam 503 DATABASE_BUSY, sem SQL ou detalhes internos. A transação controlada pelo Spring é encerrada antes da resposta. O cliente deve consultar a intenção; se a ausência for confirmada, pode reenviar a entrada original com a mesma chave. Não criar chave nova por timeout. Cada repetição passa pela transação inteira e pelas restrições de unicidade. Não repetir apenas uma instrução SQL de uma transação abortada. Integrações futuras com PSP exigirão reconciliação própria.

Falha de banco durante autenticação retorna 503 DATABASE_UNAVAILABLE, não 401: indisponibilidade não deve ser confundida com senha inválida. Não há retries ilimitados ou filas silenciosas.

## Logs e métricas

Console no formato JSON ECS nativo do Spring Boot. Cada requisição API registra identificador de correlação gerado no servidor, método de conjunto limitado, modelo da rota, status e duração. Não registra query string, corpo, token, e-mail, loja ou identificador financeiro. Rota sem correspondência vira unmatched para evitar cardinalidade ilimitada.

Micrometer registra planner.http.requests com essas dimensões limitadas. Actuator continua expondo apenas saúde; métricas não são publicadas anonimamente. A conexão do coletor no ambiente compartilhado deve ser autenticada e decidida na implantação. O registro local não substitui alertas operacionais ou plantão.

Referência: https://docs.spring.io/spring-boot/3.5/reference/features/logging.html

## Diagnóstico do PostgreSQL

`psql -X -v ON_ERROR_STOP=1 -f scripts/diagnosticar-banco.sql` utiliza as variáveis padrão PGHOST, PGPORT, PGDATABASE e PGUSER e o mecanismo local de senha. Não colocar senha na linha de comando nem publicar saída com identificadores privados. O script usa transação somente leitura, limite de cinco segundos e retorna tamanho, conexões por estado, locks agregados, bloqueios e migrations. Não encerra conexões nem modifica registros. Permissões do usuário podem limitar a visão operacional; isso não equivale a ausência de bloqueios. Monitoramento contínuo e alertas dependem do ambiente de implantação.

O diagnóstico de migrations exige uma conta operacional com SELECT em flyway_schema_history; não ampliar os privilégios de split_app para isso. O teste usa conta administrativa apenas no PostgreSQL descartável e confirma execução dos cinco resultados sem alteração na quantidade de vendas.
