# Checklist

- [x] Campo `language` usa `${config.i18n.default_language}` em todos os 6 SKILL.md, constitution.md e workflow.md
- [x] Diretório `i18n/` existe com `registry.json` e fallback chain configurada
- [x] Todos os 7 arquivos JSON de skills (setup, implement, review, revert, new-track, status) + constitution + workflow existem em `i18n/pt-BR/`
- [x] Nenhum SKILL.md contém strings de saudação ou exemplo hardcoded — todas usam `${i18n.t(...)}`
- [x] `config.json` contém `skills.names` com todos os 6 nomes canônicos
- [x] `config.json` contém `protocols.subagent_dispatch.path`
- [x] Nenhum SKILL.md contém string mágica de nome de skill (ex: `conductor-review` como literal)
- [x] Nenhum SKILL.md contém caminho hardcoded para Subagent Protocol (apenas `${config.protocols.subagent_dispatch.path}`)
- [x] `conductor-setup/assets/catalog.md` não é mais um stub de 4 linhas
- [x] Catálogos de `conductor-setup` e `conductor-new-track` seguem o mesmo formato estrutural
