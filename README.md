# Conductor

> Spec-Driven Development (SDD) direto do terminal.

O **Conductor** é uma CLI em TypeScript/Node.js que detecta automaticamente a
ferramenta de codificação com IA que você já usa no projeto e gera os
templates de **comandos**, **regras**, **agentes** e **skills** no diretório de
configuração correto de cada uma.

## Ferramentas suportadas

| Ferramenta    | Diretório de configuração | Assinaturas detectadas            |
|---------------|---------------------------|-----------------------------------|
| Cursor        | `.cursor/commands`        | `.cursor`, `.cursorrules`         |
| Claude Code   | `.claude/commands`        | `.claude`, `CLAUDE.md`            |
| Antigravity   | `.agents`                 | `.antigravity`                    |
| Trae          | `.trae/commands`          | `.trae`                           |

> Para o Antigravity, a categoria `commands` é escrita em `workflows/`
> (convenão da IDE).

## Requisitos

- Node.js 20+ (uso de `import.meta.dirname`).

## Instalação

```bash
# a partir do código-fonte
npm install
npm run build
npm link
```

## Uso

```bash
conductor [comando] [opções]
```

### Comandos

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
# detecta automaticamente e gera tudo
conductor generate

# força a ferramenta como Cursor e sobrescreve
conductor generate --tool cursor --force

# lista templates de uma categoria
conductor list --category skills

# gera apenas um template específico
conductor generate conductor-setup
```

Caso nenhuma ferramenta seja detectada e a flag `--tool` não seja informada,
um prompt interativo (`@clack/prompts`) permite escolher a ferramenta.

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
│   │   └── data/        # commands, rules, agents, skills
│   ├── ui/              # Renderer (terminal estilizado)
│   └── errors.ts
└── index.ts             # Entry point
```

### Templates embarcados

Localizados em [src/internal/templates/data](src/internal/templates/data):

- **rules** — `constitution.md` (padrões visuais e UX das skills).
- **skills** — fluxos de SDD: `conductor-setup`, `conductor-implement`,
  `conductor-new-track`, `conductor-revert`, `conductor-review`,
  `conductor-status`.
- **assets** — catálogos de skills de terceiros e guias de estilo de código
  (`cpp`, `csharp`, `dart`, `go`, `html-css`, `javascript`, `python`,
  `typescript`, etc.).

Cada template usa YAML frontmatter (`name`, `id`, `category`, `description`)
para metadados.

## Desenvolvimento

```bash
npm run build     # compila src/ -> dist/ (ES2022, NodeNext)
node dist/index.js <comando>
```

## Licença

Ver repositório de origem.
