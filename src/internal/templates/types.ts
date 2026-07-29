/** Metadata parsed from template YAML frontmatter */
export interface TemplateMeta {
  name: string;
  id: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  /** Source category directory (commands, rules, agents, skills) */
  sourceDir: string;
  /** Relative subpath within the category (e.g. "teste" for skills/teste/SKILL.md) */
  subpath: string;
  /** Original file extension including the dot (e.g. ".md", ".py") */
  ext: string;
  /** Original filename without extension (e.g. "SKILL") */
  fileName: string;
  /**
   * Optional list of tool IDs this template is compatible with.
   * When absent or empty, the template is considered compatible with all tools.
   * Example frontmatter: `tools: [cursor, claude-code]`
   */
  tools?: string[];
}

/** Parameters for template generation requests */
export interface GenerateRequest {
  templateName: string;
  targetPath: string;
  force: boolean;
  /** Raw template content. When provided, bypasses the ambiguous name-based lookup
   *  (templates from different categories may share the same `name`). */
  content: string;
  /** BCP-47 locale override. Defaults to config.i18n.default_language (pt-BR). */
  locale?: string;
  /** Base output directory (e.g. .trae) */
  baseDir?: string;
}

/** Result of a template generation operation */
export interface GenerateResult {
  success: boolean;
  filePath?: string;
  message: string;
  error?: Error;
}

/** Strategy for rendering template content per tool */
export interface GenerationStrategy {
  /**
   * @param outputDir When provided, overrides the tool's default base dir
   *                  (used by `generate --output`).
   */
  generateAll(workingDir: string, force: boolean, outputDir?: string, locale?: string): GenerateResult[];
  /**
   * @param outputDir When provided, overrides the tool's default base dir
   *                  (used by `generate --output`).
   */
  generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean, outputDir?: string, locale?: string): GenerateResult[];
}

/** Mapping of frontmatter keys to TemplateMeta setters */
const FRONTMATTER_SETTERS: Record<string, (meta: TemplateMeta, value: string) => void> = {
  name: (m, v) => (m.name = v),
  id: (m, v) => (m.id = v),
  category: (m, v) => (m.category = v),
  description: (m, v) => (m.description = v),
  tags: (m, v) => {
    m.tags = v
      .replace(/[\[\]]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  },
  // Parses simple YAML list syntax: "[cursor, claude-code]" or "cursor, claude-code"
  tools: (m, v) => {
    m.tools = v
      .replace(/[\[\]]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  },
};

/** Parse YAML frontmatter from template content */
export function parseFrontmatter(content: string): TemplateMeta {
  const meta = createEmptyMeta(content);

  if (!content.startsWith('---')) return meta;

  const parts = content.split('---', 3);
  if (parts.length < 3) return meta;

  const lines = parts[1].split('\n');
  for (const line of lines) {
    applyFrontmatterLine(meta, line);
  }

  return meta;
}

function createEmptyMeta(content: string): TemplateMeta {
  return {
    name: '',
    id: '',
    category: '',
    description: '',
    content,
    tags: [],
    sourceDir: '',
    subpath: '',
    ext: '',
    fileName: '',
    tools: undefined,
  };
}

function applyFrontmatterLine(meta: TemplateMeta, line: string): void {
  const trimmed = line.trim();
  if (!trimmed) return;

  const colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return;

  const key = trimmed.slice(0, colonIdx).trim();
  const value = trimmed.slice(colonIdx + 1).trim();

  const setter = FRONTMATTER_SETTERS[key];
  if (setter) setter(meta, value);
}
