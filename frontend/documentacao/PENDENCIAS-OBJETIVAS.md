> **Atualização de escopo:** análise de tendências por IA pertence ao MVP e está pendente além do resumo atual. Crédito simulado e cancelamento ficam na evolução futura. Esta decisão prevalece sobre classificações anteriores desses temas. Consulte [DECISAO-ESCOPO-MVP.md](DECISAO-ESCOPO-MVP.md).

# Pendências objetivas — 10/10/2026

O frontend demonstrativo e os testes locais foram ampliados. A tabela abaixo distingue a preparação feita das condições para concluir a integração e o aceite. Não deve ser lida como tarefas de backend já implementadas.

| Pendência | Preparado no frontend | Quem/entrada necessária | Como encerrar |
|---|---|---|---|
| Contrato e autenticação | Adapters, perfis, 401/403, transporte e configuração | Backend/equipe: OpenAPI, DTOs, sessão, CORS/CSRF, contexto de loja | Preencher contrato, conectar login/logout e executar com API |
| Venda e recuperação durável | Chave estável, bloqueio de repetição e recuperação demo | Backend: idempotência persistida, consulta por tentativa, estados e elegibilidade | Perder resposta e reabrir ambos os clientes, provando uma venda no banco |
| Financeiro | Tipos, telas de resumo/despesa/simulação e ausência explícita de dados | Backend/produto: reconhecimento, fuso, categorias, saldo inicial e arredondamento | Conciliar API, ledger, banco e telas no mesmo período |
| Despesa com resultado incerto | Formulário preservado e novo envio bloqueado | Backend: chave e consulta de reconciliação | Recuperar a despesa existente ou liberar nova tentativa com prova |
| Cadastro e configuração persistente | Prévia de campos e estados; ações indisponíveis identificadas | Equipe/backend: provisionamento e endpoints aprovados | Salvar, reler e comprovar autorização |
| IA externa | Tela textual segura e cenários de falha/ausência | Backend: provider, limites, dados de origem e contrato | Resposta contextual sem alterar números ou executar ações |
| Android no alvo | APK debug, wrapper, testes JVM e controles acessíveis | Equipe: aparelho/maquineta e condições de uso | Instalar, vender, consultar, retomar, girar, usar teclado e TalkBack |
| Leitor de tela web | Semântica, foco e testes axe estruturais | Ambiente com leitor e usuário avaliador | Executar login → venda → detalhe por leitura/teclado |
| Aceite visual Figma | Referência de design e autoria preservadas | Designer/equipe: versão aprovada e revisão das diferenças | Registrar telas/estados aceitos, diferenças e ajustes específicos |
| Publicação e Git | Código, build e guias locais | Equipe: repositório/branch, hospedagem e autorização de publicação | Revisar, publicar e conferir URL/HTTPS no destino |

Crédito, estorno/cancelamento, recorrência, PWA, SDK e impressão de maquineta só avançam após definição de escopo. Não são funcionalidades silenciosamente prometidas. Não há backend executável nesta entrega; a pasta entrega-para-backend descreve integralmente o que deve ser devolvido.
