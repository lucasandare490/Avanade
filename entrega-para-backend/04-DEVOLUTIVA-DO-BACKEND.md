# Devolutiva obrigatória — Backend e banco de dados

Preencher e devolver junto ao código. Usar “não implementado” quando faltar algo e explicar o impacto. Não enviar senhas reais, tokens privados ou dump de dados pessoais.

## Identificação da entrega

- Responsável:
- Repositório e branch:
- Commit/tag exato:
- Data:
- Versão do contrato:
- Java / Spring Boot / PostgreSQL:
- Modo de pagamentos: demonstrativo ou outro escopo explicitamente aprovado:

## Pacote que deve acompanhar esta ficha

- [ ] Código completo, wrapper e versões fixadas.
- [ ] README com instalação, execução, testes e solução de erros comuns.
- [ ] Dockerfile e Compose com API/banco/volume/healthcheck.
- [ ] `.env.example` com cada variável explicada e sem credenciais reais.
- [ ] OpenAPI YAML/JSON exportado e endereço do Swagger local.
- [ ] Coleção HTTP/Postman/Bruno ou comandos curl com exemplos sintéticos.
- [ ] Exemplos de todos os estados, erros, listas vazias e páginas.
- [ ] Migrations, seeds de demonstração e instrução de execução.
- [ ] Diagrama e dicionário do banco com constraints e índices.
- [ ] Contas de teste e permissões, exclusivas do ambiente demonstrativo.
- [ ] Relatório de testes unitários, PostgreSQL, concorrência e isolamento entre lojas.
- [ ] Evidência de reinício com persistência e de backup/restore em ambiente descartável.
- [ ] Lista de decisões ratificadas, limitações e pendências.
- [ ] Checklist BE e BD preenchidos com evidência, não apenas checkboxes.

## Como executar do zero

```text
1. Comando para configurar:
2. Comando para subir banco:
3. Comando para migrations:
4. Comando para seed:
5. Comando para iniciar API:
6. Comando para testes:
7. Comando para desligar sem apagar dados:
```

- URL local da API:
- Origem web autorizada:
- URL alcançável pelo emulador/aparelho:
- HTTPS ou configuração de desenvolvimento acordada:
- Healthcheck:

## Contratos que preciso receber sem lacunas

| Tema | Decisão/valor adotado | Arquivo ou exemplo |
|---|---|---|
| Login/logout/renovação | | |
| Cookie/token/CSRF/CORS | | |
| Loja e permissões | | |
| Dinheiro, percentuais e arredondamento | | |
| Fuso, datas e limite do período | | |
| Estados pagamento/split/parcelas | | |
| Chave, repetição e consulta da intenção | | |
| Retomada e concorrência | | |
| Categorias e confirmação de despesa | | |
| Caixa/saldo inicial/reconhecimento | | |
| Paginação/ordenação/total | | |
| Simulação com/sem taxa | | |
| Explicação/IA indisponível | | |
| Erros públicos e por campo | | |
| Exportação, se incluída | | |

## Matriz de endpoints realmente executáveis

| Método e rota | Implementado? | Autenticação/permissão | Exemplo request/response | Erros | Teste/evidência |
|---|---|---|---|---|---|
| Preencher uma linha por endpoint | | | | | |

## Resultados de validação

| Verificação | Comando/ambiente | Resultado | Evidência |
|---|---|---|---|
| Build | | | |
| Testes unitários | | | |
| PostgreSQL real de teste | | | |
| Concorrência/idempotência | | | |
| Isolamento entre lojas | | | |
| Migration banco vazio/atualização | | | |
| Reinício sem perda | | | |
| Backup e restore | | | |

## Pendências declaradas

| Pendência | Impacto no web/Android | Responsável | O que falta receber/fazer | Prazo acordado |
|---|---|---|---|---|
| | | | | |

## Critério para aceitar a entrega para integração

Outro integrante deve conseguir partir de uma cópia limpa, subir banco e API pelos comandos fornecidos, executar os exemplos e reproduzir o roteiro do documento 03. Toda lacuna deve estar declarada. Uma API que só funciona no computador do autor sem configuração reproduzível ainda não está pronta para repasse.

## Atualização obrigatória: tendências no MVP

Análise de tendências por IA faz parte do MVP. Crédito simulado e cancelamento ficam na evolução futura. O resumo textual de um período disponível hoje não encerra esse requisito. Incluir na implementação/devolutiva as séries de origem, períodos comparados, indicadores, tratamento de base zero/insuficiente, interpretação segura e contrato para a tela. As definições específicas precisam de alinhamento. Ver [decisão e critérios de aceite](../frontend/documentacao/DECISAO-ESCOPO-MVP.md). Os 219 critérios anteriores permanecem; este adendo acrescenta os critérios específicos da decisão.
