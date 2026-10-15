# Resultados da revisão — 14/10/2026

## Executado nesta revisão, na pasta Avanade-main

| Verificação | Resultado |
|---|---|
| Instalação pelo lock npm | Concluída; sem atualização de versões |
| Frontend: npm test | 89 aprovados; zero falhas e ignorados |
| Frontend: npm run build | Aprovado; TypeScript e Vite, inclusive após correção textual |
| Backend: mvnw.cmd -B verify | Aprovado; 29 testes, zero falhas/erros/ignorados; JAR gerado |
| PostgreSQL | 17.11 real em Windows, descartável nas suítes; Flyway V1–V3 aplicado |
| Navegador: npm run test:e2e | 4 cenários aprovados, API HTTP e PostgreSQL local reais |

Backend: BackendIntegrationTest 16; QueryAndCashIntegrationTest 8; CrashRecoveryTest 1; TaxEngineTest 4. O teste de queda encerra uma JVM após commit antes do corpo HTTP e recupera a mesma intenção em outro processo.

Navegador: venda/despesa/caixa/simulação/explicação/logout; resposta de venda perdida com recuperação após recarga; resposta de despesa perdida; perfis/isolamento entre lojas/sessão expirada. Os testes gravam exclusivamente registros sintéticos no banco demonstrativo desta cópia. Não houve acesso a produção.

Ambiente local: Java 21.0.4 (Eclipse Adoptium), Spring Boot 3.5.16, PostgreSQL 17.11, Windows. O Java 8 encontrado inicialmente no PATH não foi usado no build. O launcher LocalDemo também funcionou neste Windows, embora o roteiro recebido descrevesse apenas Linux/macOS. Há script PowerShell próprio em `scripts/iniciar-backend-local.ps1`.

## Evidências

- `resultados-validacao.json`: consolidação desta execução.
- `../../frontend/documentacao/revisao-testes-2026-10-14.json`: resultado Vitest.
- `../../backend/target/surefire-reports`: XML/TXT originais da execução, saída local de build.
- `../../frontend/test-results/integracao.json`: resultado Playwright local, ignorado pelo Git.
- `../../frontend/documentacao/integracao-backend-resultados.json`: evidência recebida da execução anterior; preservada.

## Não executado novamente

Testes Android (fontes iguais após normalização de quebra de linha), Docker, backup/restore, carga sustentada, atualização estrutural em base existente, varredura de vulnerabilidades e testes com leitor de tela/dispositivo físico. Evidências recebidas de restore e EXPLAIN não foram promovidas a testes novos. Estes resultados não certificam legislação, PSP, IA externa, fidelidade ao Figma ou todos os critérios de aceite.
