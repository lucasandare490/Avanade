# Auditoria Java e Android — 16/10/2026

Inventário de 168 bibliotecas resolvidas, incluindo dependências de teste. Consulta à API pública OSV; somente coordenadas e versões foram enviadas. Os relatórios brutos preservam todos os alertas.

## Correções aplicadas e verificadas

| Biblioteca | Antes | Depois |
|---|---|---|
| Jackson BOM | 2.21.4 | 2.21.7 |
| Tomcat | 10.1.55 | 10.1.59 |
| PostgreSQL JDBC | 42.7.11 | 42.7.12 |
| Log4j API | 2.24.3 | 2.25.5 |
| Commons Lang | 3.17.0 | 3.18.0 |
| Bouncy Castle, testes Robolectric | 1.78.1 | 1.85 |

Maven Central não disponibilizou Tomcat 10.1.58; foi usada 10.1.59, da mesma série. Backend: 59 testes aprovados e JAR gerado. Android: testes, APK e lint aprovados. A atualização não migrou Spring Boot 3.5 para outra versão principal.

## Alertas que permanecem no inventário

Spring WebMVC 6.2.19: GHSA-j9f9-w8pj-32f8 e GHSA-pc63-qcmh-9cmg. O primeiro envolve fragmentos de renderização por SSE; o segundo, XsltView. A inspeção do código não encontrou XsltView, SseEmitter, FragmentsRendering ou rotas text/event-stream. A aplicação usa controllers REST/JSON, sem templates XSLT. Portanto, não foi identificada a condição de exploração descrita no código atual; isso não significa que a biblioteca não tenha alertas.

Não foi encontrada versão 6.2 posterior a 6.2.19 no Maven Central consultado. A versão 7 requer avaliação de migração do framework. Reavaliar antes de acrescentar XSLT/SSE ou mudar o framework, e na próxima atualização das dependências. Não há supressão silenciosa no scanner: ele continua retornando falha quando OSV encontra alertas.

## Reprodução

Backend: `mvnw.cmd dependency:tree -DoutputType=json -DoutputFile=target/dependency-tree.json`.
Android: `gradlew.bat :app:inventariarDependencias`.
Na raiz: `python scripts/auditar-dependencias.py --maven-tree backend/target/dependency-tree.json --gradle-list android-pos/app/build/reports/dependencias-resolvidas.txt --output resultado-auditoria.json`.

Ausência de alerta não garante ausência de vulnerabilidade desconhecida. Inventário de runtime/testes não cobre automaticamente todas as ferramentas de build, sistema operacional ou infraestrutura.

Fontes: https://google.github.io/osv.dev/post-v1-querybatch/ e os IDs dos avisos em `evidencias/detalhes-alertas-dependencias.json`.
