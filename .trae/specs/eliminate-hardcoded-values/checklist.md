# Checklist

- [x] `config.json` contém `framework.version`, `commit_conventions.new_track_prefix`, `catalogs.core`, `catalogs.community`
- [x] Nenhum SKILL.md contém marcadores literais `[ ]`, `[~]`, `[x]` — todos usam `${config.enums.task_statuses.*}`
- [x] conductor-review não contém `[High]` nem `[Medium]` — usa `${config.enums.finding_severities}` com case lowercase
- [x] conductor-new-track não contém `FEATURE` nem `BUG` — usa `${config.enums.track_types}` com case PascalCase
- [x] conductor-revert não contém `conductor/` como prefixo hardcoded — usa `${config.directories.conductor_root}/`
- [x] workflow.md não contém `conductor-setup/assets/subagent-protocol.md` — usa `${config.protocols.subagent_dispatch.path}`
- [x] conductor-setup chama `resolveSubagentByCapability("read_files", config)` ou `("analysis", config)`, nunca sem argumentos
- [x] Nenhum SKILL.md contém `../../config.json` — usa `${CONDUCTOR_CONFIG}`
- [x] Nenhum arquivo contém `version: X.Y` hardcoded — usa `${config.framework.version}`
- [x] constitution.md não contém `ask_question` como string literal — usa `${config.user_interaction_tools[2]}`
- [x] subagent-protocol.md não contém paths literais `conductor/config.json` — usa `${config.directories.conductor_root}/config.json`
- [x] resume.py não contém strings literais `"conductor"`, `".conductor"`, `"config.json"` — usa walking-up
- [x] Catalog.md (setup) usa `${config.skills.names.*}` para nomes de skills e `${config.enums.trust_levels}` para party
- [x] Catalog.md (new-track) usa `${config.enums.trust_levels}` para party
- [x] Todos os 6 JSONs i18n de skills contêm chaves para `role`, `background`, `preferences`, `goals`, `constraints`, `skills`, `examples`, `output_format`, `initialization`
- [x] `workflow.json` e `constitution.json` i18n contêm o mesmo conjunto de chaves estruturadas
- [x] Nenhum SKILL.md, workflow.md ou constitution.md contém texto em inglês hardcoded nas seções Role, Background, Preferences, Goals, Constraints, Skills, Examples, OutputFormat, Initialization
- [x] Todos os 22 arquivos auditados passam em grep por padrões hardcoded conhecidos: `[ ]`, `[~]`, `[x]`, `[High]`, `[Medium]`, `FEATURE`, `BUG`, `conductor/` (como prefixo de path), `../../config.json`, `ask_question` (como literal), `version: 0.` ou `version: 1.`
