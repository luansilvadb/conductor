# Eliminação Completa de Hardcoded e Consistência Dinâmica no Fluxo Conductor

## Why
O scan recursivo em `src/internal/templates/data/` revelou 103 issues distribuídas entre 22 arquivos. Embora o spec `fix-hardcoded-i18n` tenha resolvido a base i18n (saudações, campo `language`, nomes de skills e formato de catálogos), ~86% do conteúdo textual permanece em inglês hardcoded e dezenas de valores críticos (marcadores de status, severidades, tipos de track, paths, versões) são literais que quebram se `config.json` mudar. A arquitetura SDP já define o isolamento de contexto, mas os SKILL.md não o seguem totalmente.

## What Changes
- Substituir marcadores de status de task hardcoded (`[ ]`, `[~]`, `[x]`) por `${config.enums.task_statuses.*}` nos 6 SKILL.md + workflow.md
- Substituir severidades de finding hardcoded (`[High]`, `[Medium]`) por `${config.enums.finding_severities}` (case-sensitive) no conductor-review
- Substituir tipos de track hardcoded (`FEATURE`, `BUG`) por `${config.enums.track_types}` (case-sensitive) no conductor-new-track
- Corrigir `conductor/` hardcoded em paths do conductor-revert para `${config.directories.conductor_root}`
- Corrigir assinatura de `resolveSubagentByCapability()` no conductor-setup (adicionar argumentos `capability` e `config`)
- Adicionar `framework.version` e `commit_conventions.new_track_prefix` ao config.json
- Substituir `ask_question` hardcoded em constitution.md por `${config.user_interaction_tools[0]}`
- Adicionar `catalogs` ao config.json para unificar referência aos dois catalog.md
- Substituir `../../config.json` por referência de bootstrap único (caminho resolvido em runtime)
- Substituir paths hardcoded em resume.py por referências dinâmicas do config.json
- Unificar versões dos skills para `${config.framework.version}`
- **Substituir TODO o conteúdo textual em inglês hardcoded nos SKILL.md por `${i18n.t(...)}`** (Roles, Background, Goals, Constraints, Skills, Examples, OutputFormat, Initialization — cobrindo os ~86% restantes)

## Impact
- Affected specs: conductor-setup, conductor-implement, conductor-review, conductor-revert, conductor-new-track, conductor-status, workflow, constitution
- Affected code: `config.json`, 6× `SKILL.md`, `workflow.md`, `constitution.md`, `resume.py`, `subagent-protocol.md`, 2× `catalog.md`, todos os 9 JSONs i18n

## ADDED Requirements

### Requirement: Marcadores de status resolvidos de config
O sistema SHALL resolver todos os marcadores de status de task exclusivamente de `config.enums.task_statuses.*`, nunca como strings literais.

#### Scenario: Marcação de task pendente
- **WHEN** um skill referencia status de task pendente
- **THEN** usa `${config.enums.task_statuses.pending}`, não o literal `[ ]`

#### Scenario: Marcação de task em progresso
- **WHEN** um skill referencia status de task em andamento
- **THEN** usa `${config.enums.task_statuses.in_progress}`, não o literal `[~]`

#### Scenario: Marcação de task concluída
- **WHEN** um skill referencia status de task concluída
- **THEN** usa `${config.enums.task_statuses.done}`, não o literal `[x]`

### Requirement: Enums resolvidos com case consistente
O sistema SHALL resolver todos os valores de enum (track_types, finding_severities, finding_categories, trust_levels) de `config.enums.*` com o case exato definido no config.json.

#### Scenario: Severidade de finding
- **WHEN** conductor-review gera um relatório com severidade alta
- **THEN** usa o valor exato de `config.enums.finding_severities` (`high`), não `High` ou `[High]`

#### Scenario: Tipo de track
- **WHEN** conductor-new-track classifica um novo track
- **THEN** usa o valor exato de `config.enums.track_types` (`Feature`, `Bug`), não `FEATURE` ou `BUG`

### Requirement: Paths dinâmicos sem raiz hardcoded
O sistema SHALL resolver todos os paths compostos usando `${config.directories.conductor_root}` como prefixo, nunca a string literal `conductor/`.

#### Scenario: Resolução de artifact path
- **WHEN** qualquer skill resolve o caminho de um artifact (index, tracks_registry, plan, spec, etc.)
- **THEN** usa `${config.directories.conductor_root}/${config.files.artifacts.*}`, não `conductor/` + nome do arquivo

### Requirement: Assinatura uniforme de resolveSubagentByCapability()
O sistema SHALL chamar `resolveSubagentByCapability(capability, config)` com ambos os argumentos em todos os skills, nunca sem argumentos.

#### Scenario: Dispatch no conductor-setup
- **WHEN** conductor-setup precisa resolver tipo de subagente
- **THEN** chama `resolveSubagentByCapability("read_files", config)` ou `resolveSubagentByCapability("analysis", config)`, nunca `resolveSubagentByCapability()`

### Requirement: Conteúdo textual 100% i18n
O sistema SHALL externalizar TODO o conteúdo textual dos SKILL.md, workflow.md e constitution.md para os JSONs i18n, usando `${i18n.t(...)}` para todas as seções (Role, Background, Goals, Constraints, Skills, Examples, OutputFormat, Initialization).

#### Scenario: Seção de Background
- **WHEN** um skill carrega sua seção Background
- **THEN** o texto é resolvido de `${i18n.t("skills.<skill-name>.background")}`, nunca hardcoded

#### Scenario: Seção de Constraints
- **WHEN** um skill carrega suas Constraints
- **THEN** cada constraint é resolvida de `${i18n.t("skills.<skill-name>.constraints.N")}`, nunca hardcoded

### Requirement: Framework version centralizada
O sistema SHALL definir a versão do framework em `config.framework.version` e todos os skills SHALL referenciá-la em vez de hardcodar `version: X.Y` no frontmatter.

#### Scenario: Declaração de versão
- **WHEN** qualquer SKILL.md declara sua versão
- **THEN** usa `${config.framework.version}`, não um número literal

### Requirement: Catálogos unificados via config
O sistema SHALL referenciar ambos os catálogos via `config.catalogs.core` e `config.catalogs.community`, em vez de depender de paths implícitos.

#### Scenario: Leitura de catálogo
- **WHEN** um skill precisa consultar skills disponíveis
- **THEN** resolve o caminho do catálogo de `config.catalogs.core` ou `config.catalogs.community`

## MODIFIED Requirements

### Requirement: config.json — chaves adicionadas
**Before**: config.json tem `skills.names`, `protocols.subagent_dispatch.path`, `thresholds`, `enums`, mas faltam `framework.version`, `commit_conventions.new_track_prefix`, `catalogs`.
**After**: config.json contém todas as chaves necessárias para que nenhum valor seja hardcoded em qualquer arquivo do framework.

### Requirement: SKILL.md — conteúdo totalmente parametrizado
**Before**: ~14% do conteúdo textual usa i18n (apenas welcome messages). O restante (~86%) é inglês hardcoded.
**After**: 100% do conteúdo textual é resolvido via `${i18n.t(...)}`. Os SKILL.md tornam-se templates puros com placeholders, sem nenhuma string de idioma fixa.

### Requirement: resume.py — paths dinâmicos
**Before**: resume.py usa `os.path.join("conductor", "config.json")` e `os.path.join(".conductor", "config.json")` como strings literais.
**After**: resume.py resolve os search paths de `config.directories.conductor_root` ou usa walking-up a partir do diretório corrente, eliminando as strings `"conductor"` e `".conductor"`.

## REMOVED Requirements

(Nenhum)
