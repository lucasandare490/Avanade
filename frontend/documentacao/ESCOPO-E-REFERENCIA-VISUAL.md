> **Atualização de escopo:** análise de tendências por IA pertence ao MVP e está pendente além do resumo atual. Crédito simulado e cancelamento ficam na evolução futura. Esta decisão prevalece sobre classificações anteriores desses temas. Consulte [DECISAO-ESCOPO-MVP.md](DECISAO-ESCOPO-MVP.md).

# Escopo por tela e referência visual

## Conciliação das fontes

O README remoto informado pelo usuário deixava frontend/backend/banco a definir. V2 e entrega parcial documentam React/TypeScript web, Kotlin Android, Java/Spring backend e PostgreSQL. A implementação local adotou React/TypeScript/Vite e Kotlin separado; isso é proposta de conciliação, não alteração do README remoto. Design e pesquisa: Thayná Batista da Silva; requisitos: Thayná e Kleysson Teixeira. Não se atribui autoria do código local aos autores dos documentos.

## Classificação

| Tela/recurso | Classificação |
|---|---|
| Dashboard, operações, detalhe e parcelas | Núcleo do incremento web |
| Despesas pagas, caixa realizado e simulação | Complementos documentados implementados no cenário |
| Explicação determinística | Complemento demonstrativo; sem IA externa |
| POS web | Complemento de demonstração; não substitui Kotlin |
| POS Kotlin | Cliente demonstrativo compilado; testes JVM executados; aparelho físico pendente |
| Login/perfis fictícios e estados de acesso | Preparação de UX e integração, sem autenticação real |
| Prévia de cadastro | Proposta de campos, depende de provisionamento |
| Ajuda, exportação local e impressão demo | Complementos de interface adicionados a pedido do usuário |
| Projeção/recorrência/crédito/estorno | Aguardam regras e corte de escopo |
| Usuários, notificações e integrações editáveis | Aguardam contrato e permissões |
| SDK de maquineta, impressão física, loja e PWA | Condicionais; não fazem parte da entrega validada |

## Inventário visual disponível

Base visual consultada: protótipo navegável de Thayná e imagens fornecidas. Azul-marinho para identidade/indicadores, fundo cinza claro, cartões claros, verde para líquido e amarelo para tributo. Tipografia local DM Sans e Manrope; ícones Lucide; tabelas com rolagem; sidebar responsiva. Tokens existentes: --azul, --borda, --muted, --verde e --fundo em estilos.css. Esses valores são interpretação implementada, não medidas extraídas por acesso completo ao arquivo Figma.

Diferenças deliberadas: entrada demo sem senha obrigatória, parâmetros fictícios identificados, estados financeiros coerentes, funções sem contrato explicadas em vez de botões sem efeito. Ajustes pixel a pixel aguardam acesso/exportação e revisão visual. Não há certificação de fidelidade ou acessibilidade da versão nova.
