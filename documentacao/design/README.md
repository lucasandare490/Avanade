# Design do Planner Comercial

Design e prototipação de alta fidelidade: **Thayná Batista da Silva**.

| Arquivo | O que é |
|---|---|
| [DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.pdf](DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.pdf) / [.docx](DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.docx) | Documentação completa do frontend e do design system, gerada a partir de [`DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md`](../../DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md) |
| [CHECKLIST_DE_FIDELIDADE_VISUAL.md](CHECKLIST_DE_FIDELIDADE_VISUAL.md) | O que conferir para a implementação ficar fiel ao protótipo |
| [INVENTARIO_DE_TELAS.md](INVENTARIO_DE_TELAS.md) | Todas as telas do protótipo e seus estados |
| [INVENTARIO_DE_COMPONENTES.md](INVENTARIO_DE_COMPONENTES.md) | Componentes reutilizáveis e suas variações |
| [DESIGN_TOKENS.css](DESIGN_TOKENS.css) / [DESIGN_TOKENS.json](DESIGN_TOKENS.json) | Cores, tipografia, espaçamentos e raios medidos no protótipo |
| [capturas/](capturas/) | 158 capturas das telas do protótipo (desktop e celular) e `metrics.json` com as medidas |

O protótipo interativo está no [Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design). A implementação ajustou cinco tons de cor para atingir contraste WCAG AA; veja a seção 6 do [registro da entrega final](../ENTREGA-FINAL-2026-11-18.md).

Para gerar de novo o .docx e o .pdf depois de editar o .md:

```bash
cd documentacao/design && pandoc -f markdown-tex_math_dollars ../../DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md -o DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.docx && soffice --headless --convert-to pdf DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.docx
```
