# Planner Comercial — frontend web

React 19, TypeScript e Vite; CSS próprio, ícones Lucide e fontes locais DM Sans/Manrope. Revisão de 10/10/2026 com build e testes: [evidências](documentacao/RELATORIO-VALIDACAO-ATUAL.md). Referência de design e pesquisa: Thayná Batista da Silva; requisitos: Thayná e Kleysson.

## Executar

Use Node 22.12 ou superior da série 22 e npm. Abra o terminal nesta pasta, não na raiz da entrega.

```powershell
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Para a porta usada na demonstração: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175`. Abra a URL exibida pelo terminal. A versão compilada fica em dist. Não abra index.html diretamente pelo sistema de arquivos; use um servidor HTTP.

## Uso demonstrativo

Escolha o perfil na entrada demonstrativa. Os perfis gestor, financeiro e operador ilustram uma política de acesso; permissões definitivas precisam ser ratificadas. Quando usar o formulário demonstrativo: gestor@exemplo.invalid, financeiro@exemplo.invalid ou operador@exemplo.invalid, senha demo. Não utilize senhas reais.

Rotas no fragmento # permitem atualizar uma tela sem exigir reescrita no servidor estático. A sessão demonstrativa expira após 30 minutos. Sair limpa dados da sessão; recarregar reinicia a massa de demonstração. Não existe armazenamento financeiro definitivo no navegador.

| Tela | Como funciona |
|---|---|
| Dashboard | Período, cartões, composição e gráfico/tabela da mesma massa de operações |
| Operações | Busca, status, datas, paginação, detalhe por ID, parcelas, eventos e retomada elegível |
| Nova venda | Valor, revisão e cenários simulados; proteção contra clique duplo; mesma tentativa após perda de resposta |
| Despesas | Validação, cadastro de despesa paga e atualização da consulta financeira |
| Fluxo de caixa | Saldo inicial, entradas líquidas, despesas pagas e saldo final; ausência de previsão sem regra aprovada |
| Simulação | Comparação com/sem taxa, sem criar venda ou movimentar caixa |
| Explicações | Texto demonstrativo; erro/ausência não altera valores financeiros |
| Configurações e ajuda | Informações do ambiente, limites e proposta de acesso; sem persistência falsa |

Tributo de 10% e taxa de 2% são exclusivamente fictícios. A operação de R$150 resulta em R$15 de tributo, R$3 de taxa e R$132 líquidos no cenário com taxa. Sem taxa, R$135 líquidos. Nenhuma transferência bancária ou arrecadação acontece.

## Organização do código

| Local | Responsabilidade |
|---|---|
| src/Aplicacao.tsx | Sessão, rotas, perfil, composição de dependências e logout |
| src/telas | Telas por finalidade; nomes TelaOperacoes, TelaDespesas, TelaFluxoCaixa etc. |
| src/componentes | Botão, indicador, tabela, estrutura, estados e diálogo reutilizáveis |
| src/servicos/servicoDemonstrativo.ts | Cenários em memória e recuperação simulada |
| src/servicos/adapterApi.ts | Tradução e validação das respostas externas para os tipos internos |
| src/servicos/transporteApi.ts | HTTP, prazo, cancelamento, erros e cabeçalhos centralizados |
| src/servicos/integracaoConfigurada.ts | Ponto de preenchimento do contrato aprovado; atualmente null |
| src/servicos/contratosConsultas.ts | Consultas por capacidade e tipos paginados |
| src/testes e demais *.test.* | Testes de fluxos, serviços, valores e acessibilidade estrutural |
| documentacao | Checklist, guias, evidências e limites da entrega |

## Integração com backend

Copie .env.example para uma configuração local. O padrão VITE_MODO_DADOS=demo não faz chamadas ao servidor. O modo api exige VITE_API_URL e o preenchimento de contratoServidor em integracaoConfigurada.ts. Somente mudar a variável não conecta uma API desconhecida: o aplicativo informa a falta de contrato, sem trocar para dados fictícios.

As telas remotas consultam histórico/detalhe/despesas/resumo/simulação/explicações por capacidade. Não carregam toda a base ao entrar. Endpoints, DTOs, sessão e permissões precisam ser acordados. O cliente trata ausência de capacidade explicitamente. Valores autoritativos vêm do servidor; não implemente TaxEngine, SplitEngine, banco ou credenciais de provedor aqui.

As chamadas aceitam HTTPS; HTTP é permitido somente para desenvolvimento no computador local. Tokens não são persistidos por conveniência em localStorage. Sessão por cookie exige acordo de CORS/CSRF. Erros 401 encerram sessão; 403, 404, 409, 422, 429 e indisponibilidade possuem tratamento. Uma despesa com resposta incerta não é reenviada automaticamente; recuperação definitiva depende do contrato idempotente.

Leia [sessão e integração](documentacao/SESSAO-E-INTEGRACAO.md) e os [contratos para o backend](../entrega-para-backend/03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md).

## Qualidade e limites

Os testes usam serviços substitutos e dados fictícios. Não comprovam a API do projeto, persistência ou autorização de servidor. Acessibilidade automatizada não substitui leitor de tela real. A publicação e a comparação integral com o Figma ainda exigem os ambientes/aceites indicados em [pendências](documentacao/PENDENCIAS-OBJETIVAS.md). O aplicativo Android está em ../android-pos e tem validação separada.

## Atualização de escopo do MVP

Análise de tendências por IA faz parte do MVP, mas não está concluída pelo resumo textual atual. Crédito simulado e cancelamento de operações/compra ficam na evolução futura. Veja a [decisão e critérios de aceite](documentacao/DECISAO-ESCOPO-MVP.md).
