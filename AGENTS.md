<!-- trail:start -->
## Trail — repo context graph

The structural index lives in `.trail/cache/`: file/symbol signatures, exact
file:line spans and dependency edges. Semantic summaries are optional; pending
summaries or a missing concept manifest do not invalidate the structural graph.

Prefer Trail before broad searches or source reads when the task needs project
code discovery, API exploration or dependency analysis. Do not query the graph
just to satisfy a ritual: direct questions, known small files, instructions,
unindexed configuration and external-tool setup may be handled directly.
Classify the task first and reuse relevant context already returned this session.

Choose one tool for the next information gap:

- Unknown source location: `trail ask "<task or identifier>" --source --limit 3`.
  Narrow with `--in <scope>/` when the module is known. Results are ranked
  candidates, not proof of relevance or an exhaustive list.
- Known file/API: `trail skeleton <file>`; open only the needed definition if
  its body is required. A small known configuration file can be read directly.
- Every occurrence of a pattern: `trail grep "<pattern>"`, optionally scoped.
- Dependencies: `trail callers <symbol>`; use `--direction out` for callees.
  Before a multi-file refactor or rename, inspect the connected blast radius
  with `--depth all`, scoped when appropriate. For direct callers, depth 1 suffices.
- Unfamiliar repository structure: `trail map` once when orientation is useful;
  do not repeat it while the structure and task scope remain unchanged.

The corresponding MCP tools are `trail_find_code`, `trail_file_api`,
`trail_find_all`, `trail_trace_calls` and `trail_repo_map`. Prefer an already
available interface; do not repeat the same query through both CLI and MCP.

Do not rephrase unsuccessful queries repeatedly. If results are irrelevant,
switch to the structural tool that fits the known identifier, or use targeted
`rg`/direct reads for unindexed files. Share short paths/symbols/spans with
other agents so they do not repeat completed discovery.

Use returned source spans when sufficient; do not reopen the whole file.
If a necessary definition is truncated, read that exact range or request
`--full` for that definition, rather than loading unrelated source.

Keep structural mode: queries need no model API key. Do not run
`trail build --deep`, enable model-backed naming or add a paid service without
explicit authorization. Never create `graft/manifest.json` manually.
Refresh the structural index only when indexed source changes require it and
the task permits it; configuration/documentation-only work does not require a
full rebuild. Respect read-only and no-rebuild restrictions over maintenance
suggestions. Use `trail_check_freshness` for a read-only drift check.
<!-- trail:end -->

## Referência visual do frontend

`DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md` é a referência oficial para
alterações de design e UX/UI do Planner Comercial. Consulte esse documento
antes de modificar layout, cores, tipografia, espaçamento, componentes,
responsividade ou estados visuais. Diferencie as regras confirmadas no
protótipo das recomendações e registre qualquer desvio necessário para a
implementação atual.

## Delegação Codex no Avanade

- Os agentes do projeto estão registrados em `.codex/config.toml`, com instruções
  em `.codex/agents/`. O limite inicial é de dois subagentes simultâneos, além do
  coordenador. Mantenha a autenticação, os hooks e o MCP herdados da sessão.
- Execute tarefas pequenas diretamente. Delegue somente quando houver benefício
  claro de investigação, implementação delimitada ou validação independente;
  não acione os quatro agentes automaticamente nem repita o trabalho delegado.
- `explorador`: investiga e levanta dependências sem editar; `desenvolvedor`:
  implementa o escopo atribuído; `revisor`: revisa tecnicamente sem editar;
  `testador`: executa validações focadas sem alterar código-fonte.
- Antes de delegar, informe objetivo, caminhos/símbolos/trechos já conhecidos,
  restrições, resultado esperado e arquivos que podem ser editados. Compartilhe
  as descobertas curtas para preservar a política Trail acima e evitar consultas
  MCP repetidas. Os subagentes não devem criar outros subagentes.
- Atribua cada arquivo editável a um único responsável por vez, inclusive em
  relação ao coordenador. Serialize tarefas com arquivos sobrepostos e inicie
  revisão/testes sobre uma versão estável; redistribua a responsabilidade antes
  de ampliar o escopo. Preserve alterações preexistentes e segredos.
- O coordenador integra os resultados, verifica as evidências e informa agentes
  utilizados, validações e pendências; delegação não substitui essa verificação.
