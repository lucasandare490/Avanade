> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Sessão e integração — estado atual

O modo padrão é demo. A sessão é demonstrativa e mantida em memória, com perfis ilustrativos e validade de 30 minutos. Ao sair, a aplicação limpa a base e filtros da sessão e retorna à rota inicial antes do próximo login.

## Web

Aplicacao recebe dependências de autenticação e serviço. O wrapper encerra sessão diante de 401. A autorização visual esconde/bloqueia telas incompatíveis; o backend precisa validar cada recurso e loja. A camada adapterApi recebe ContratoServidor: versão, credenciais, login/logout, mapeamento de sessão, requisições/mapeamentos de venda, despesa e retomada. Consultas opcionais são agrupadas em contratosConsultas: lista paginada, detalhe, despesas/categorias, resumo, simulação e explicação. A configuração concreta continua null em integracaoConfigurada.ts.

No modo API, a entrada não baixa toda a base. TelaOperacoesRemotas, TelaResumoIntegrado, TelaDespesasIntegrada, TelaSimulacaoIntegrada e TelaAnaliseIntegrada consultam suas capacidades. Uma capacidade não configurada é explicitamente indisponível. useConsultaRemota cancela/ignora respostas antigas. Dados inválidos são rejeitados, sem fallback silencioso para mock.

transporteApi centraliza prazo, AbortSignal, erros e identificação idempotente. Não repete gravações automaticamente. HTTPS é exigido fora do computador local. Credenciais na URL e redirecionamentos de chamadas são rejeitados. Segredos de banco/provedor não pertencem ao cliente. O mecanismo final de cookie/token, renovação e CSRF depende de acordo.

## Android

ClientePos define venda, retomada, histórico e detalhe assíncronos, com cancelamento. ClientePosDemonstrativo é a composição ativa. ClientePosApi e ServicoPosIntegrado estão prontos para receber ContratoApiPos com requisições e parsers aprovados. TransporteApiPos mantém rede fora da interface, exige HTTPS e não segue redirecionamentos. Callbacks de tela destruída são descartados.

EstadoTelaPos guarda estado visual. O Bundle contém apenas a demonstração e sua tentativa/chaves; isso cobre recriação da Activity, não recuperação financeira durável. Sessão real e recuperação após encerramento definitivo precisam do backend.

## O que o backend deve enviar

Consulte ../../entrega-para-backend/03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md e preencha ../../entrega-para-backend/04-DEVOLUTIVA-DO-BACKEND.md. Depois disso ainda haverá trabalho de integração nos clientes: implementar mapeamentos concretos, autenticar no servidor, validar erros e executar os fluxos com persistência real. A estrutura preparada reduz esse trabalho, mas não substitui o contrato aprovado.
