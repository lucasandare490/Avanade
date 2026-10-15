# Estado atual da implementação — 14/10/2026

Este arquivo complementa a auditoria da entrega recebida. Use-o para o estado posterior aos incrementos locais, sem substituir as evidências históricas por resultados novos.

## Avanços implementados

- Web integrado ao backend e PostgreSQL, com tendências históricas independentes da explicação e composição diária do dashboard.
- Android: nova entrada “Conectar ao servidor HTTPS”, login real por bearer em memória, permissões, criação/revisão de venda, histórico paginado, detalhe, venda sem split e retomada de parcelas. Demonstração local preservada.
- Intenção Android persistida antes de enviar, isolada por endereço do servidor e identidade da conta. Falha ou fechamento não gera nova chave. Recuperação consulta o servidor; resultado ausente permite reenviar a mesma intenção por ação explícita. Erros definitivos de validação liberam revisão.
- Contrato Android valida estados, moeda/modo, composição, parcelas, relação venda/split, paginação e sessão. Senha e token não são gravados em preferências ou estado salvo.
- Pipeline preparado em `.github/workflows/validacao.yml`: web, backend e Android. Execução remota ainda não realizada.
- Teste de upgrade V1 → V3 em banco descartável com registros existentes. Compara as 14 tabelas, preservando conteúdo e verificando proteção de intenção após atualização. Algumas tabelas da massa estão vazias; não é ensaio de todas as operações possíveis de upgrade.
- OpenAPI exportado novamente da API atual em execução.
- Atalho `npm run dev` na raiz e guia [Como apresentar](../../COMO-APRESENTAR.md).

## Validação nova

- Android: APK debug compilado, 22 testes aprovados, lint sem erros bloqueadores. Existem avisos de internacionalização/depreciação; não declarar relatório sem avisos.
- 8 testes Android novos de contrato, incluídos no total acima.
- Web: cinco cenários E2E contra API/PostgreSQL passaram entre a execução inicial e a repetição dos dois testes ajustados. Falhas iniciais decorreram de clicar após a sessão já ter sido encerrada e de não abrir o menu móvel; repetição dirigida aprovada.
- Dashboard e comparação histórica conferidos em navegador com largura 390 px; comparação permanece visível quando a chamada textual é interrompida.
- Upgrade: `MigrationUpgradeTest` aprovado após corrigir a preparação dos dados sintéticos.
- `npm audit --omit=dev`: zero vulnerabilidades reportadas para dependências de produção do frontend nesta consulta. Não cobre backend, Android, dependências de desenvolvimento ou segurança geral.
- Site HTTP 200, saúde API UP, login e logout demonstrativos conferidos ao preparar apresentação.

## Decisões e dependências confirmadas pelo usuário

Ainda não existe endereço HTTPS compartilhado. A equipe ainda não escolheu provedor/modelo de IA. Por isso, o POS integrado está implementado e compilado, mas falta validação com servidor HTTPS em aparelho/emulador. A explicação continua no MockAIProvider. A comparação histórica usa PostgreSQL; isso não significa IA externa conectada.

## O que permanece aberto

- Escolha/configuração do provedor de IA, credenciais por canal seguro, avaliação com exemplos e aceite da equipe.
- Ambiente HTTPS, Android em dispositivo, TalkBack e eventual maquineta.
- Docker em ambiente que o tenha disponível, CI remoto, análise de dependências backend/Android e carga sustentada.
- Novo ensaio de backup/restore de todas as 14 tabelas: tentativa local não executada por ausência de `psql`, `pg_dump` e `pg_restore` na distribuição embarcada. Evidência antiga de 12 tabelas continua histórica. Upgrade não substitui restore.
- Relatórios ampliados, classificação de despesas, alertas e administração permanecem abertos e exigem definição dos contratos correspondentes. A exportação de operações descrita abaixo já foi entregue.
- Políticas operacionais e responsáveis por retenção, backup, implantação e aceite visual. Crédito e cancelamento continuam evolução futura.

A pasta atual não contém `.git`. Não houve publicação dessas mudanças no GitHub. Não há aceite integral dos 219 critérios backend/banco nem dos 297 critérios frontend.

## Exportação integrada de operações

Implementada em GET /api/v1/exports/operations, com período obrigatório de até 366 dias, filtros completos e limite de 2.000 registros. Gerente e financeiro usam a permissão financeiro; operador recebe 403. O servidor lê todas as páginas em uma transação com snapshot consistente, isolada por estabelecimento. Acima do limite retorna 422 EXPORT_LIMIT sem truncar silenciosamente.

A tela Operações baixa CSV com cabeçalhos, valores em centavos BRL, indicação SIMULADO e neutralização de fórmulas. Exporta todo o filtro, não apenas a página. Documento sem valor fiscal. Não inclui exportação de despesas ou relatórios personalizados.

Evidências dirigidas: 13 testes de QueryAndCashIntegrationTest aprovados (incluindo exportação de 101 registros e isolamento), 1 teste de limite numérico, 15 testes do contrato web, build web e 1 cenário Playwright de download completo e bloqueio do operador aprovados. A primeira tentativa do navegador encontrou arquivos antigos servidos pelo Vite; reinício e repetição resolveram. Não houve repetição integral de todas as suítes.

O iniciador local detecta API já ativa na porta 8080 e evita uma segunda inicialização. Porta ocupada por serviço não reconhecido gera orientação sem encerrar esse processo.
