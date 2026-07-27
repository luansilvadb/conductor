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
}

/** Parameters for template generation requests */
export interface GenerateRequest {
  templateName: string;
  targetPath: string;
  force: boolean;
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
  generateAll(workingDir: string, force: boolean): GenerateResult[];
  generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean): GenerateResult[];
}

/** Mapping of frontmatter keys to TemplateMeta setters */
const FRONTMATTER_SETTERS: Record<string, (meta: TemplateMeta, value: string) => void> = {
  name: (m, v) => (m.name = v),
  id: (m, v) => (m.id = v),
  category: (m, v) => (m.category = v),
  description: (m, v) => (m.description = v),
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
