# Tasks

- [x] Task 1: Adicionar chaves faltantes ao config.json
  - Adicionar `framework.version: "1.1"`
  - Adicionar `commit_conventions.new_track_prefix: "conductor(track):"`
  - Adicionar `catalogs.core: "conductor-setup/assets/catalog.md"`
  - Adicionar `catalogs.community: "conductor-new-track/assets/catalog.md"`
  - Validar JSON com schema

- [x] Task 2: Substituir hardcoded de enums nos 6 SKILL.md + workflow.md
  - Substituir `[ ]`, `[~]`, `[x]` por `${config.enums.task_statuses.pending}`, `${config.enums.task_statuses.in_progress}`, `${config.enums.task_statuses.done}` em: conductor-implement, conductor-revert, workflow.md
  - Substituir `[High]`, `[Medium]` por `${config.enums.finding_severities}` com case correto em: conductor-review
  - Substituir `FEATURE`, `BUG` por `${config.enums.track_types}` com case correto em: conductor-new-track
  - Substituir `1p`, `3p` por `${config.enums.trust_levels}` em: catalog.md (setup), catalog.md (new-track)
  - Substituir versão hardcoded `version: X.Y` por `${config.framework.version}` nos 6 SKILL.md + workflow.md + constitution.md + subagent-protocol.md

- [x] Task 3: Corrigir paths hardcoded com raiz `conductor/`
  - Corrigir `conductor/${config.files.artifacts.index}` → `${config.directories.conductor_root}/${config.files.artifacts.index}` em: conductor-revert (L30)
  - Corrigir `conductor/${config.files.artifacts.tracks_registry}` → `${config.directories.conductor_root}/${config.files.artifacts.tracks_registry}` em: conductor-revert (L83)
  - Substituir `conductor-setup/assets/subagent-protocol.md` por `${config.protocols.subagent_dispatch.path}` em: workflow.md (L30, L57)
  - Substituir `../../config.json` por `${CONDUCTOR_CONFIG}` (bootstrap único) em todos os 6 SKILL.md
  - Substituir `conductor/config.json` e `.conductor/config.json` por `${config.directories.conductor_root}/config.json` em: subagent-protocol.md (L21), resume.py (L14-15)

- [x] Task 4: Corrigir assinatura de resolveSubagentByCapability() no conductor-setup
  - Adicionar argumentos `capability` e `config` em todas as chamadas do conductor-setup/SKILL.md
  - Garantir que passa `"read_files", config` ou `"analysis", config` como os outros 5 skills

- [x] Task 5: Substituir hardcoded de tool names e protocol strings
  - Substituir `ask_question` por `${config.user_interaction_tools[2]}` em: constitution.md
  - Substituir `Task` por `${config.dispatch_tool_aliases[0]}` onde aplicável (subagent-protocol.md, SKILL.md que referenciam dispatch)
  - Substituir `sdp`, `v1`, `sdp-v1` por `${config.protocol.*}` em: subagent-protocol.md

- [x] Task 6: Completar i18n para 100% de cobertura textual
  - Criar chaves estruturadas em todos os 6 JSONs i18n de skills para: `role`, `background`, `preferences`, `goals[]`, `constraints[]`, `skills[]`, `examples[]`, `output_format.steps[]`, `initialization`
  - Criar chaves em `workflow.json` para: `role`, `background`, `preferences`, `goals[]`, `constraints[]`, `skills[]`, `examples[]`, `output_format.steps[]`
  - Criar chaves em `constitution.json` para: `role`, `background`, `preferences`, `goals[]`, `constraints[]`, `skills[]`, `examples[]`, `output_format.steps[]`
  - Substituir TODO o texto em inglês dos 6 SKILL.md + workflow.md + constitution.md por `${i18n.t(...)}`
  - Substituir nomes hardcoded de skills em catalog.md (setup) por `${config.skills.names.*}`

- [x] Task 7: Corrigir resume.py — eliminar strings literais de paths
  - Substituir `os.path.join("conductor", "config.json")` e `os.path.join(".conductor", "config.json")` por função `find_config()` que faz walking-up a partir de `os.getcwd()`
  - Remover fallback com `__file__` chain (linhas 23-28) — o walking-up cobre todos os casos

# Task Dependencies
- Task 1 (config.json keys) é pré-requisito para Tasks 2, 3, 5, 6
- Tasks 2, 3, 4, 5, 7 podem ser paralelas entre si
- Task 6 (i18n 100%) depende de Task 1 (config keys criadas) e pode ser paralela com Tasks 2-5, 7
