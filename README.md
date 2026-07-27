# Conductor
> Spec-Driven Development (SDD) com IA: especifique, planeje, implemente, revise e reverta — com rastreabilidade total no Git.

O **Conductor** é um framework de Spec-Driven Development (SDD) que transforma a forma como você trabalha com ferramentas de IA para codificação. Em vez de começar a escrever código imediatamente, o Conductor força um fluxo disciplinado onde **a especificação e o plano são a fonte da verdade**, e cada tarefa é rastreada desde a concepção até o commit — com auditoria completa via Git notes.

## Por que SDD?

Sem um framework, o desenvolvimento com IA tende a:

- Scope creep (a IA "melhora" coisas fora do escopo).
- Código sem cobertura de testes adequada.
- Histórico Git opaco (commits gigantes, sem contexto).
- Difícil reversão quando algo dá errado.
- Drift entre o que foi decidido e o que foi implementado.

O Conductor resolve isso com **documentos vivos** e **checkpoints auditáveis**.

## Filosofia / Princípios

Os princípios abaixo (definidos em [workflow.md](src/internal/templates/data/skills/conductor-setup/assets/workflow.md)) regem todo o trabalho dentro do framework:

1. **O Plano é a Fonte da Verdade** — todo trabalho é rastreado em `plan.md`.
2. **O Tech Stack é Deliberado** — mudanças na stack devem ser documentadas *antes* da implementação.
3. **Test-Driven Development** — escreva testes antes da funcionalidade (Red → Green → Refactor).
4. **Cobertura Alta** — meta de >80% para novos módulos.
5. **UX em Primeiro Lugar** — toda decisão prioriza a experiência do usuário.
6. **CI-Aware** — comandos não-interativos, `CI=true` em ferramentas de watch.

## O Ciclo SDD

O Conductor implementa o SDD como um **ciclo de vida de tracks** (unidades lógicas de trabalho: features, bugs, chores). Cada skill é uma fase do ciclo:

```
   ┌──────────────┐
   │   setup      │  Inicializa o projeto (uma vez)
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │  new-track   │  ←─┐
   └──────┬───────┘    │
          ▼            │  próximo track
   ┌──────────────┐    │
   │  implement   │    │
   └──────┬───────┘    │
          ▼            │
   ┌──────────────┐    │
   │   review     │    │
   └──────┬───────┘    │
          ▼            │
   ┌──────────────┐    │
   │   status     │────┘
   │  / revert    │
   └──────────────┘
```

| Skill                 | Papel                          | O que faz                                                                                              |
|-----------------------|--------------------------------|--------------------------------------------------------------------------------------------------------|
| `conductor-setup`     | **Architect**                  | Inicializa o projeto, define visão, tech stack, style guides e workflow.                               |
| `conductor-new-track` | **Planner**                    | Especifica (`spec.md`) e planeja (`plan.md`) uma nova track.                                            |
| `conductor-implement` | **Implementer**                | Executa o plano seguindo TDD, registra progresso e commits.                                            |
| `conductor-review`    | **Principal SWE**              | Revisa contra guidelines e plano, aplica fixes, arquiva ou deleta a track.                              |
| `conductor-status`    | **Reporter**                   | Mostra progresso do projeto (phases, tasks, %, blockers).                                              |
| `conductor-revert`    | **Git-aware**                  | Reverte tracks/phases/tasks localizando e revertendo commits associados.                               |

### Estados de uma tarefa

Toda tarefa em um `plan.md` segue este ciclo de vida:

| Marcador | Estado        | Significado                                                       |
|----------|---------------|-------------------------------------------------------------------|
| `[ ]`    | Pending       | Ainda não iniciada.                                               |
| `[~]`    | In Progress   | Sendo trabalhada agora.                                           |
| `[x]`    | Complete      | Finalizada, com commit SHA registrado ao lado.                    |

Cada tarefa completa recebe um **commit SHA** anexo no plano, e cada fase completa recebe um **checkpoint SHA** com relatório de verificação em `git notes`. Isso significa que qualquer trabalho pode ser auditado ou revertido com precisão.

## Estrutura de artefatos

O Conductor cria uma pasta `conductor/` na raiz do projeto — a **fonte da verdade** do SDD:

```
projeto/
├── conductor/
│   ├── index.md              ← "Handshake": mapa de todos os artefatos
│   ├── product.md            ← Visão e escopo do produto
│   ├── product-guidelines.md ← Branding, voz, tom, UX
│   ├── tech-stack.md         ← Stack deliberada e documentada
│   ├── workflow.md           ← Regras operacionais (TDD, cobertura, gates)
│   ├── code_styleguides/     ← Guias de estilo por linguagem
│   ├── tracks.md             ← Registry: todas as tracks e status
│   ├── tracks/
│   │   └── <track_id>/
│   │       ├── index.md      ← Handshake local da track
│   │       ├── spec.md       ← Especificação (o "O Quê")
│   │       ├── plan.md       ← Plano de implementação (o "Como")
│   │       └── metadata.json ← ID, tipo, status, timestamps
│   └── archive/              ← Tracks revisadas e arquivadas
└── .agents/                  ← Skills recomendadas e instaladas
    └── skills/
```

## Ferramentas suportadas

O Conductor detecta automaticamente a ferramenta de IA que você já usa no projeto e gera os templates no diretório correto:

| Ferramenta    | Diretório de configuração | Assinaturas detectadas            |
|---------------|---------------------------|-----------------------------------|
| Cursor        | `.cursor/commands`        | `.cursor`, `.cursorrules`         |
| Claude Code   | `.claude/commands`        | `.claude`, `CLAUDE.md`            |
| Antigravity   | `.agents`                 | `.antigravity`                    |
| Trae          | `.trae/commands`          | `.trae`                           |

> Para o Antigravity, a categoria `commands` é escrita em `workflows/` (convenção da IDE).

## Requisitos

- Node.js 20.11+ (uso de `import.meta.dirname`).

## Uso sem clonar (npx)

A forma mais simples: baixe e execute o Conductor em um único comando, sem clonar o repositório.

```bash
# sem subcomando: inicializa + gera tudo automaticamente
npx github:luansilvadb/conductor

# equivalente explícito
npx github:luansilvadb/conductor generate
```

Repositório: https://github.com/luansilvadb/conductor

O `npx` baixa o tarball do repositório, instala as dependências declaradas em [package.json](package.json) e executa o binário registrado no campo `bin` ([dist/index.js](dist/index.js)). O `dist/` é versionado exatamente por isso — o `npx` **não** executa `postinstall`/build, então o JS (e os templates) precisam estar prontos.

> **Problema com `EALLOWSCRIPTS`?** Se o seu `~/.npmrc` tem `allow-scripts` em modo estrito, o `npx github:...` pode falhar na preparação do git dep. Alternativa: instale o tarball da [última release](https://github.com/luansilvadb/conductor/releases) diretamente:
> ```bash
> npx https://github.com/luansilvadb/conductor/releases/latest/download/conductor.tgz
> ```
>
> **Nota:** esta URL exige que exista uma release publicada com o asset `conductor.tgz` anexado. Enquanto não houver releases, use a [instalação a partir do código-fonte](#instalação-a-partir-do-código-fonte) ou o [workaround para Windows](#windows--ide-file-watcher-eperm).
>
> Dica: para evitar a digitação longa, crie um alias no seu shell:
> `alias conductor="npx github:luansilvadb/conductor"`.

## Solução de problemas

### Windows + IDE file watcher (EPERM)

No Windows, quando uma IDE com file watcher ativo (ex.: **Trae IDE**, **VS Code** com watcher agressivo, **WebStorm**) está aberta sobre o workspace, o `npx github:luansilvadb/conductor` pode falhar antes de executar o binário com `exit code 1` e mensagens do tipo:

```
npm warn cleanup Failed to remove some directories [
npm warn cleanup   [ Error: EPERM: operation not permitted, rmdir
npm warn cleanup     '...\AppData\Local\npm-cache\_npx\<hash>\node_modules\@clack\prompts' ] ]
```

**Causa:** o file watcher da IDE abre handles sobre os arquivos de `node_modules` assim que o npm os cria dentro do cache temporário `_npx\<hash>\`. Na fase de cleanup, o `rmdir` do npm falha com `EPERM` porque os handles ainda estão sendo usados. O npm trata a falha de cleanup como fatal e aborta antes de invocar o binário — o diretório alvo fica vazio.

Este é um problema conhecido de interação `npm` × Windows × file watchers, não um bug do Conductor em si. **Não ocorre** em Windows headless ou com o watcher desativado.

**Workaround recomendado** (clone + `npm ci` + execução direta do binário):

```powershell
git clone --depth 1 https://github.com/luansilvadb/conductor.git D:\conductor-src
cd D:\conductor-src
npm ci --omit=dev --no-audit --no-fund

# a partir do diretório do projeto alvo
node D:\conductor-src\dist\index.js generate --tool trae
```

A instalação acontece em um diretório de projeto estável (não no cache `_npx`), então não há handles externos e o `npm ci` conclui em ~550ms sem EPERM.

**Alternativas:**

- Fechar a IDE (ou desabilitar o file watcher) antes de rodar o `npx`.
- Limpar o cache `_npx` antes de tentar de novo: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"` (o npm recria sob demanda).
- Para uso recorrente, fazer `npm link` a partir do clone (ver abaixo) e usar o binário `conductor` diretamente.

## Instalação a partir do código-fonte

```bash
npm install
npm run build      # gera dist/
npm link           # disponibiliza `conductor` globalmente
```

## Comandos da CLI

```bash
conductor [comando] [opções]
```

**Sem subcomando** (fluxo padrão): executa `init` + `generate` automaticamente — inicializa o diretório de configuração e gera todos os templates em um passo.

| Comando                  | Alias    | Descrição                                                              |
|--------------------------|----------|------------------------------------------------------------------------|
| `init`                   | —        | Inicializa o diretório de configuração da ferramenta detectada.        |
| `generate [template]`    | `gen`,`g`| Gera todos os templates, ou um específico pelo nome.                   |
| `list`                   | `ls`     | Lista os templates disponíveis.                                        |
| `uninstall`              | —        | Remove o binário e a configuração do Conductor.                        |

### Opções globais

| Opção              | Descrição                                                              |
|--------------------|------------------------------------------------------------------------|
| `-v, --version`    | Exibe a versão e sai.                                                  |
| `-t, --tool <tool>`| Força uma ferramenta: `cursor`, `claude-code`, `antigravity`, `trae`.  |

### Opções de `generate`

| Opção                | Descrição                                              |
|----------------------|--------------------------------------------------------|
| `-f, --force`        | Sobrescreve arquivos existentes.                       |
| `-a, --all`          | Gera todos os templates disponíveis.                   |
| `-o, --output <path>`| Diretório de saída personalizado (sobrepõe a detecção).|

### Opções de `list`

| Opção                 | Descrição                                          |
|-----------------------|----------------------------------------------------|
| `-c, --category <cat>`| Filtra por categoria.                              |
| `-q, --quiet`         | Imprime apenas os nomes (útil para pipes).         |
| `--all`               | Lista templates de todas as categorias.            |

### Exemplos

```bash
# fluxo padrão (sem subcomando): init + generate
conductor

# com ferramenta forçada
conductor --tool cursor

# detecta automaticamente e gera tudo
conductor generate

# força a ferramenta como Cursor e sobrescreve
conductor generate --tool cursor --force

# lista templates de uma categoria
conductor list --category skills

# gera apenas um template específico
conductor generate conductor-setup
```

Caso nenhuma ferramenta seja detectada e a flag `--tool` não seja informada, um prompt interativo (`@clack/prompts`) permite escolher a ferramenta.

## Estrutura do projeto

```
src/
├── cmd/                 # Comandos da CLI (commander)
│   ├── root.ts          # Programa, detecção global e estado compartilhado
│   ├── init.ts          # `init`
│   ├── generate.ts      # `generate`
│   ├── list.ts          # `list`
│   ├── uninstall.ts     # `uninstall`
│   └── pathcheck.ts     # Aviso se o binário não estiver no PATH
├── internal/
│   ├── detector/        # Detecção de ferramenta por assinaturas
│   ├── templates/       # Manager, estratégias e templates embarcados
│   │   └── data/
│   │       ├── rules/        # constitution.md (padrões de UX das skills)
│   │       └── skills/       # As 6 skills do ciclo SDD
│   │           ├── conductor-setup/         # Architect
│   │           ├── conductor-new-track/     # Planner
│   │           ├── conductor-implement/     # Implementer
│   │           ├── conductor-review/        # Principal SWE
│   │           ├── conductor-status/        # Reporter
│   │           └── conductor-revert/        # Git-aware
│   ├── ui/              # Renderer (terminal estilizado)
│   └── errors.ts
└── index.ts             # Entry point
```

### Templates embarcados

Localizados em [src/internal/templates/data](src/internal/templates/data):

- **rules/constitution.md** — padrões visuais e UX para o agente renderizar prompts interativos (modal `ask_question` com fallback texto).
- **skills/** — as 6 skills que implementam o ciclo SDD.
- **skills/conductor-setup/assets/** — `workflow.md` (regras operacionais), `catalog.md` (skills de terceiros instaláveis), `code_styleguides/` (guias para `cpp`, `csharp`, `dart`, `go`, `html-css`, `javascript`, `python`, `typescript`, etc.).

Cada template usa YAML frontmatter (`name`, `id`, `category`, `description`) para metadados.

## Desenvolvimento

```bash
npm install        # instala deps (inclui cpy-cli para cópia de templates)
npm run build      # tsc (compila TS) + cpy (copia .md para dist/)
node dist/index.js # testa localmente
```

> **Importante:** o build copia os templates `.md` de `src/internal/templates/data/` para `dist/` (o `tsc` não copia assets). Sempre rode `npm run build` antes de commitar mudanças em `src/`.

## Licença

MIT.
