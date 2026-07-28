# Tasks

- [x] Task 1: Criar estrutura i18n e strings para conductor-setup
  - Criar diretório `src/internal/templates/data/i18n/`
  - Criar `i18n/registry.json` com idiomas disponíveis e fallback chain
  - Criar `i18n/pt-BR/common.json` com strings compartilhadas (confirmações, erros)
  - Criar `i18n/pt-BR/skills/conductor-setup.json` com todas as strings do setup (saudação, passos, escolhas, mensagens de erro, conclusão)

- [x] Task 2: Extrair strings dos demais skills para i18n
  - Criar `i18n/pt-BR/skills/conductor-implement.json`
  - Criar `i18n/pt-BR/skills/conductor-review.json`
  - Criar `i18n/pt-BR/skills/conductor-revert.json`
  - Criar `i18n/pt-BR/skills/conductor-new-track.json`
  - Criar `i18n/pt-BR/skills/conductor-status.json`
  - Criar `i18n/pt-BR/constitution.json` (strings do constitution.md)
  - Criar `i18n/pt-BR/workflow.json` (strings do workflow.md)

- [x] Task 3: Substituir hardcodes nos 6 SKILL.md por placeholders dinâmicos
  - Atualizar `conductor-setup/SKILL.md`: unificar `language` para `${config.i18n.default_language}`, substituir strings por `${i18n.t(...)}`
  - Atualizar `conductor-implement/SKILL.md`: idem
  - Atualizar `conductor-review/SKILL.md`: idem
  - Atualizar `conductor-revert/SKILL.md`: idem
  - Atualizar `conductor-new-track/SKILL.md`: idem
  - Atualizar `conductor-status/SKILL.md`: idem

- [x] Task 4: Centralizar cross-references e paths em config.json
  - Adicionar `skills.names` ao `config.json` com nomes canônicos de todos os skills
  - Adicionar `protocols.subagent_dispatch.path` ao `config.json`
  - Substituir strings mágicas de nomes de skills nos SKILL.md por `${config.skills.names.*}`
  - Substituir caminho do Subagent Protocol nos SKILL.md por `${config.protocols.subagent_dispatch.path}`

- [x] Task 5: Atualizar constitution.md e workflow.md
  - Unificar `language` para `${config.i18n.default_language}` no `constitution.md`
  - Unificar `language` para `${config.i18n.default_language}` no `workflow.md`
  - Substituir strings hardcoded por referências i18n onde aplicável

- [x] Task 6: Unificar catálogos catalog.md
  - Substituir stub de 4 linhas em `conductor-setup/assets/catalog.md` por catálogo estruturado
  - Garantir consistência de formato com `conductor-new-track/assets/catalog.md`

# Task Dependencies
- Task 2 depende de Task 1 (estrutura i18n base precisa existir)
- Task 3 depende de Task 1 e Task 2 (strings i18n precisam estar criadas)
- Task 4 pode ser paralela com Task 1 e Task 2
- Task 5 pode ser paralela com Task 3
- Task 6 é independente
