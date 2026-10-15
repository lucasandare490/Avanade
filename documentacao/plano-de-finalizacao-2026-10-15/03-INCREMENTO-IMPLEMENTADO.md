# Continuação da implementação — 15/10/2026

Este registro acompanha mudanças reais em C:/Avanade-main. Não substitui nem declara encerrados todos os 516 critérios originais. Alterações deste incremento ainda não publicadas no GitHub.

## Funcionalidades acrescentadas

- Cadastro real de nova loja e responsável, com senha protegida, validação e retorno ao login. Cadastro de uma loja nova não concede acesso a outra loja.
- Edição do nome do estabelecimento pelo gerente. Fuso e histórico financeiro permanecem preservados.
- Simulação com percentual hipotético, sem alteração da regra usada em vendas nem gravação financeira.
- Fim exclusivo de vigência da regra por migration V4; permissão de alteração do nome pela migration V5. Migrations anteriores preservadas.
- Projeção manual de caixa com premissas explícitas e aviso de déficit. É cenário informado pelo usuário, não previsão automática ou saldo disponível.
- Sugestão demonstrativa de categoria de despesa, aplicada somente com confirmação do usuário.
- Interfaces separadas para pagamento e roteamento demonstrativos.
- Recuperação de split ausente por falta de regra, usando o pagamento original. A regra deve cobrir a data original da venda. Servidor protege concorrência, loja e permissão; web e Android oferecem a ação. Motivo histórico da falha é preservado.
- Limite de espera e de concorrência das explicações. Validação conservadora e resposta estruturada acrescentadas; a tela apresenta atenção, recomendações e limitações, preservando o texto compatível.
- Android integrado: espaçamento em unidades de densidade, campos/botões com área mínima e rolagem. Não equivale a homologação física.

## Evidências desta continuação

- Backend: suíte completa com 47 testes aprovada antes do último incremento de validação textual; testes adicionais de texto e integração registrados nos relatórios Maven. Não somar execuções repetidas como testes diferentes.
- Cadastro/estabelecimento: testes de permissões, isolamento, ausência de loja órfã e preservação do histórico aprovados. Upgrade V1→V5 com dados aprovado.
- Recuperação: duas solicitações concorrentes resultaram no mesmo split, com um pagamento e uma entrada no caixa; acesso de outra loja e operador bloqueados.
- Web: 96 testes de regressão aprovados; um teste adicional de chave preservada após resposta perdida aprovado. Build aprovado.
- Navegador com API local: cadastro, novo login, alteração persistente do nome, simulação hipotética, projeção com déficit e sugestão de categoria aprovados.
- Android: testes JVM/Robolectric, assembleDebug e lintDebug aprovados após recuperação. Ferramentas emitiram aviso de versão de XML do SDK; compilação concluída. HTTPS/aparelho físico ainda não homologados.

## Ainda não encerrado

Revisão individual dos 516 critérios; comparação completa do Figma; renomeação geral e organização gradual; explicações completas de split/tendências; relatórios adicionais; matriz completa de acessibilidade e responsividade; restauração atual de backup, carga e Docker; execução Android em HTTPS/dispositivo; consolidação dos documentos finais e publicação deste incremento.

O pagamento continua SIMULADO. Crédito e cancelamento continuam evolução futura. Serviço externo de IA é opcional; não é necessário contratar um modelo para executar a demonstração local.

