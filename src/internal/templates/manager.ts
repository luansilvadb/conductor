import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { parse } from 'node:path';
import { AIToolType } from '../detector/types.js';
import { type TemplateMeta, type GenerateRequest, type GenerateResult, parseFrontmatter } from './types.js';
import { FileExistsError } from '../errors.js';
import { TEMPLATES } from './embedded.js';
import { resolveContent, DEFAULT_LOCALE } from '../i18n/resolver.js';

export interface TemplateManager {
  listAvailable(tool: AIToolType): TemplateMeta[];
  listAll(): TemplateMeta[];
  getByName(name: string): TemplateMeta | undefined;
  generate(req: GenerateRequest): GenerateResult;
}

export class EmbeddedTemplateManager implements TemplateManager {
  listAvailable(_tool: AIToolType): TemplateMeta[] {
    return this.listAll();
  }

  /** Lista todos os templates a partir dos dados embutidos no bundle. */
  listAll(): TemplateMeta[] {
    return TEMPLATES.map((t) => toMeta(t));
  }

  getByName(name: string): TemplateMeta | undefined {
    return this.listAll().find((t) => t.name === name || t.id === name);
  }

  generate(req: GenerateRequest): GenerateResult {
    const dir = parse(req.targetPath).dir;
    mkdirSync(dir, { recursive: true });

    if (existsSync(req.targetPath) && !req.force) {
      return {
        success: false,
        filePath: req.targetPath,
        message: 'File already exists (use --force to overwrite)',
        error: new FileExistsError(),
      };
    }

    // Use content from the request when available to avoid ambiguous
    // name-based lookups (templates across different categories may
    // share the same `name`, e.g. a skill and its i18n translation).
    const rawContent = req.content ?? this.getByName(req.templateName)?.content;
    if (!rawContent) {
      return {
        success: false,
        message: `Template not found: ${req.templateName}`,
      };
    }

    const locale = req.locale ?? DEFAULT_LOCALE;
    const content = resolveContent(rawContent, locale);

    writeFileSync(req.targetPath, content, 'utf-8');
    return {
      success: true,
      filePath: req.targetPath,
      message: 'Template generated successfully',
    };
  }
}

function toMeta(t: (typeof TEMPLATES)[number]): TemplateMeta {
  const meta = parseFrontmatter(t.content);
  meta.sourceDir = t.category;
  meta.subpath = t.subpath;
  meta.ext = t.ext;
  if (!meta.id) {
    const fileName = t.sourcePath.split(/[\\/]/).pop() || '';
    meta.id = parse(fileName).name;
    meta.name = meta.name || meta.id;
  }
  return meta;
}
