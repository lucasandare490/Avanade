> **Estado atual:** consulte o [incremento de integração e validação](../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Pacote para o responsável pelo backend e banco

Leia nesta ordem:

1. **01-CHECKLIST-BACKEND-COMPLETO.md** — 152 critérios; estado dos clientes e responsabilidades do servidor.
2. **02-CHECKLIST-BANCO-DE-DADOS.md** — 67 critérios; modelo lógico, integridade, transações, índices, backup e operação.
3. **03-CONTRATOS-E-EXEMPLOS-PARA-INTEGRACAO.md** — capacidades, tipos internos, exemplos JSON e roteiro de aceite.
4. **04-DEVOLUTIVA-DO-BACKEND.md** — formulário e arquivos que devem voltar junto ao código.

Total: **219 critérios de backend e banco**, além da ficha de devolutiva. São especificações propostas para desenvolvimento e ratificação, não uma declaração de backend implementado. As rotas de referência são distinguíveis das capacidades ainda sem URL acordada.

O frontend web e o Android acompanham o pacote de código principal. Testes de frontend e a compilação do APK não comprovam persistência, autorização ou processamento do backend. Manter os pagamentos demonstrativos e não tratar percentuais de exemplo como legislação.

## Atualização obrigatória: tendências no MVP

Análise de tendências por IA faz parte do MVP. Crédito simulado e cancelamento ficam na evolução futura. O resumo textual de um período disponível hoje não encerra esse requisito. Incluir na implementação/devolutiva as séries de origem, períodos comparados, indicadores, tratamento de base zero/insuficiente, interpretação segura e contrato para a tela. As definições específicas precisam de alinhamento. Ver [decisão e critérios de aceite](../frontend/documentacao/DECISAO-ESCOPO-MVP.md). Os 219 critérios anteriores permanecem; este adendo acrescenta os critérios específicos da decisão.
