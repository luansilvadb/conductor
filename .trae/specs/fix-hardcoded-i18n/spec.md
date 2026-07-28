# Correção de Hardcoded e Ambiguidades de Idioma no Fluxo Conductor

## Why
O fluxo atual do Conductor em `src/internal/templates/data/` contém 37 hardcodes distintos e ambiguidades de idioma que causam comportamento intermitente: triggers que às vezes disparam e às vezes não. A causa-raiz são valores hardcoded (idioma, paths, referências entre skills) que divergem conforme o skill ativo, quebrando a consistência do sistema.

## What Changes
- Unificar campo `language` para BCP-47 (`pt-BR`) em todos os 6 SKILL.md
- Extrair todas as strings de idioma (inicialização, exemplos, descrições) para um sistema i18n dinâmico com templates JSON
- Substituir placeholders hardcoded nos SKILL.md por referências dinâmicas (`${i18n.t(...)}`)
- Centralizar cross-references de skills em `config.json` sob `skills.names`
- Centralizar caminho do Subagent Dispatch Protocol em `config.json` sob `protocols.subagent_dispatch.path`
- Unificar `catalog.md` de `conductor-setup` (stub de 4 linhas) com padrão do `conductor-new-track`

## Impact
- Affected specs: conductor-setup, conductor-implement, conductor-review, conductor-revert, conductor-new-track, conductor-status
- Affected code: `src/internal/templates/data/config.json`, todos os `skills/*/SKILL.md`, `skills/conductor-setup/assets/catalog.md`, `rules/constitution.md`

## ADDED Requirements

### Requirement: Idioma resolvido dinamicamente via i18n
O sistema SHALL resolver o idioma em runtime usando o código BCP-47 `pt-BR` como valor canônico, eliminando strings hardcoded de idioma nos SKILL.md.

#### Scenario: Campo language unificado
- **WHEN** qualquer skill é carregado
- **THEN** o campo `language` em todos os SKILL.md usa o valor canônico `pt-BR`

#### Scenario: String de saudação resolvida por template
- **WHEN** um agente precisa emitir saudação inicial
- **THEN** a string é resolvida do template i18n correspondente ao idioma ativo, NUNCA hardcoded no SKILL.md

#### Scenario: Exemplos resolvidos por idioma
- **WHEN** um agente referencia exemplos de diálogo
- **THEN** os exemplos correspondem ao idioma resolvido em runtime, não a strings literais em inglês

### Requirement: Referências entre skills centralizadas
O sistema SHALL referenciar nomes de skills exclusivamente via `config.json` → `skills.names`, nunca como strings mágicas nos SKILL.md.

#### Scenario: Invocação cross-skill
- **WHEN** um skill precisa invocar outro (ex: conductor-implement referencia conductor-review)
- **THEN** o nome do skill alvo é resolvido de `${config.skills.names.review}`, não da string literal `conductor-review`

### Requirement: Caminho do Subagent Protocol centralizado
O sistema SHALL usar um único caminho canônico para o Subagent Dispatch Protocol, definido em `config.json`.

#### Scenario: Referência ao protocolo
- **WHEN** qualquer skill referencia o Subagent Dispatch Protocol
- **THEN** usa `${config.protocols.subagent_dispatch.path}`, eliminando as duas variantes sintáticas atuais (`assets/subagent-protocol.md` e `conductor-setup/assets/subagent-protocol.md`)

### Requirement: Catálogos de skills unificados
O sistema SHALL ter catálogos de skills com estrutura consistente entre `conductor-setup` e `conductor-new-track`.

#### Scenario: Catálogo do conductor-setup
- **WHEN** o catálogo de conductor-setup é carregado
- **THEN** ele contém as skills relevantes no mesmo formato do catálogo de conductor-new-track, não um stub de 4 linhas

## MODIFIED Requirements

### Requirement: SKILL.md com conteúdo dinâmico
**Before**: Cada SKILL.md contém ~70-90 linhas com strings hardcoded em inglês, exemplos fixos, e referências literais a paths e skills.
**After**: SKILL.md usa placeholders `${i18n.t(...)}` para strings de idioma e `${config.*}` para paths e referências. O conteúdo permanece completo, mas parametrizado.

## REMOVED Requirements

(Nenhum)
