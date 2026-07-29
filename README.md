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
| `conductor-review`    | **Principal SWE**              | Revisa contra guidelines e plano, aplica fixes e atualiza a track.                                     |
| `conductor-status`    | **Reporter**                   | Mostra progresso do projeto (phases, tasks, %, blockers).                                              |
| `conductor-revert`    | **Git-aware**                  | Reverte tracks/phases/tasks localizando e revertendo commits associados.                               |
| `conductor-archive`   | **Archivist**                  | Limpa a área de trabalho arquivando tracks finalizadas sob demanda.                                    |

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
│   └── archive/              ← Tracks concluídas e arquivadas

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

- Node.js 20.11+.

## Uso sem clonar (npx)

A forma mais simples: baixe e execute o Conductor em um único comando, sem clonar o repositório.

```bash
# sem subcomando: inicializa + gera tudo automaticamente
npx github:luansilvadb/conductor

# equivalente explícito
npx github:luansilvadb/conductor generate
```

Repositório: https://github.com/luansilvadb/conductor

O Conductor é distribuído como um **single-file bundle**: as dependências (`commander`, `chalk`, `@clack/prompts`) e todos os templates `.md` são embutidos diretamente em [dist/index.cjs](dist/index.cjs). Por isso o `package.json` declara `dependencies: {}` — o `npx` baixa apenas o tarball, **sem instalar nada no cache `_npx`**. Isso elimina a classe inteira de problemas de `EPERM` no Windows causados por file watchers de IDEs sobre o cache do `npx`.

> **Problema com `EALLOWSCRIPTS`?** Se o seu `~/.npmrc` tem `allow-scripts` em modo estrito, o `npx github:...` pode falhar na preparação do git dep. Alternativa: instale o tarball da [última release](https://github.com/luansilvadb/conductor/releases) diretamente:
> ```bash
> npx https://github.com/luansilvadb/conductor/releases/latest/download/conductor.tgz
> ```
>
> **Nota:** esta URL exige que exista uma release publicada com o asset `conductor.tgz` anexado. Enquanto não houver releases, use a [instalação a partir do código-fonte](#instalação-a-partir-do-código-fonte).
>
> Dica: para evitar a digitação longa, crie um alias no seu shell:
> `alias conductor="npx github:luansilvadb/conductor"`.

## Solução de problemas

### Windows + IDE file watcher (EPERM)

> **Resolvido na versão single-file bundle.** A partir da refatoração que embute todas as dependências e templates em `dist/index.cjs`, o `npx` não precisa mais instalar nada no cache `_npx` — portanto não há arquivos para o file watcher travar. Esta seção permanece como referência histórica e para usuários em versões anteriores.

Em versões anteriores (com `dependencies` runtime como `@clack/prompts`, `chalk`, `commander`), no Windows quando uma IDE com file watcher ativo (ex.: **Trae IDE**, **VS Code** com watcher agressivo, **WebStorm**) estava aberta sobre o workspace, o `npx github:luansilvadb/conductor` podia falhar antes de executar o binário com `exit code 1` e mensagens do tipo:

```
npm warn cleanup Failed to remove some directories [
npm warn cleanup   [ Error: EPERM: operation not permitted, rmdir
npm warn cleanup     '...\AppData\Local\npm-cache\_npx\<hash>\node_modules\@clack\prompts' ] ]
```

**Causa raiz:** o file watcher da IDE abria handles sobre os arquivos de `node_modules` assim que o npm os criava dentro do cache temporário `_npx\<hash>\`. Na fase de cleanup, o `rmdir` do npm falhava com `EPERM` porque os handles ainda estavam sendo usados. O npm tratava a falha de cleanup como fatal e abortava antes de invocar o binário — o diretório alvo ficava vazio.

**Para versões antigas**, o workaround era clone + `npm ci` + execução direta do binário:

```powershell
git clone --depth 1 https://github.com/luansilvadb/conductor.git D:\conductor-src
cd D:\conductor-src
npm ci --omit=dev --no-audit --no-fund

# a partir do diretório do projeto alvo
node D:\conductor-src\dist\index.cjs generate --tool trae
```

Se você ainda assim encontrar `EPERM` em algum cenário, as alternativas são:

- Fechar a IDE (ou desabilitar o file watcher) antes de rodar o `npx`.
- Limpar o cache `_npx` antes de tentar de novo: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"` (o npm recria sob demanda).
- Para uso recorrente, fazer `npm link` a partir do clone (ver abaixo) e usar o binário `conductor` diretamente.

## Instalação a partir do código-fonte

```bash
npm install
npm run build      # gera dist/index.cjs (single-file bundle)
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

O build é um pipeline em 4 passos (definido no `scripts` do `package.json`):

```bash
npm install        # instala devDeps (esbuild, typescript, @clack/prompts, chalk, commander)
npm run build      # clean + embed + typecheck + bundle
node dist/index.cjs  # testa localmente
```

| Passo | Script | O que faz |
|-------|--------|-----------|
| `clean` | `scripts/clean-dist.mjs` | Limpa `dist/` renomeando para `dist.old/` (robusto a EPERM de file watchers em dev). |
| `embed` | `scripts/embed-templates.mjs` | Lê os `.md` de `src/internal/templates/data/` e gera `src/internal/templates/embedded.ts` com todos os conteúdos como strings TS. |
| `typecheck` | `tsc -p tsconfig.json` | Apenas type-check (`noEmit: true`); não produz JS. |
| `bundle` | `esbuild src/index.ts --bundle --format=cjs ...` | Compila TS + inlines deps + embedded templates em um único `dist/index.cjs` (~296kb) + sourcemap. |

> **Importante:** os templates `.md` são lidos pelo `scripts/embed-templates.mjs` no build e viram strings embutidas no bundle. Nunca edite `src/internal/templates/embedded.ts` (ele é gerado e está no `.gitignore`). Para alterar um template, edite o `.md` correspondente em `src/internal/templates/data/` e rode `npm run build`.
>
> **Commit de mudanças em `src/`:** sempre rode `npm run build` antes de commitar, para que `dist/index.cjs` reflita o source. O `dist/` é versionado exatamente porque o `npx` **não** executa build.

## Licença

MIT.
