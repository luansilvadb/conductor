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
  /** @internal Lazy cache — built once on first listAll() call. */
  private _allCache: TemplateMeta[] | null = null;

  listAvailable(tool: AIToolType): TemplateMeta[] {
    // Unknown tool or no filter — return everything
    if (tool === AIToolType.Unknown) return this.listAll();
    return this.listAll().filter((t) => {
      // No tools field (or empty) means compatible with all tools
      if (!t.tools || t.tools.length === 0) return true;
      return t.tools.includes(tool);
    });
  }

  /** Lista todos os templates a partir dos dados embutidos no bundle. */
  listAll(): TemplateMeta[] {
    if (!this._allCache) {
      this._allCache = TEMPLATES.map((t) => toMeta(t));
    }
    return this._allCache;
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

    const locale = req.locale || DEFAULT_LOCALE;
    const finalContent = resolveContent(rawContent, locale, req.toolDir, req.toolKey);

    writeFileSync(req.targetPath, finalContent, 'utf-8');
    return {
      success: true,
      filePath: req.targetPath,
      message: 'Template generated successfully',
    };
  }
}

/**
 * Resolve placeholders in a single short frontmatter value (never a whole file).
 *
 * Frontmatter such as `description:` may hold `${i18n.t("...")}` so the text that
 * drives agent routing stays localisable. `generate()` resolves the full body on
 * its own; metadata is resolved here only for display purposes, one short string
 * at a time, so listAll() never expands ~43 template bodies just to fill a table.
 *
 * Failures are swallowed on purpose: buildI18nMap() throws on namespace collision,
 * and `conductor list` must not die on a catalogue defect. The same call inside
 * generate() still surfaces that error, which is where it is actionable.
 */
function resolveMetaValue(value: string): string {
  if (!value.includes('${')) return value;
  try {
    return resolveContent(value, DEFAULT_LOCALE);
  } catch {
    // Keep the raw placeholder visible rather than hiding the defect
    return value;
  }
}

/**
 * NOTE: metadata is always resolved with DEFAULT_LOCALE. `_allCache` has no locale
 * key, so honouring a per-call locale here would let the first locale used stick
 * for every later caller. Displayed descriptions are therefore default-locale only;
 * generated files still respect `req.locale`.
 */
function toMeta(t: (typeof TEMPLATES)[number]): TemplateMeta {
  const meta = parseFrontmatter(t.content);
  meta.description = resolveMetaValue(meta.description);
  meta.name = resolveMetaValue(meta.name);
  meta.sourceDir = t.category;
  meta.subpath = t.subpath;
  meta.ext = t.ext;
  
  const fileNameFull = t.sourcePath.split(/[\\/]/).pop() || '';
  meta.fileName = parse(fileNameFull).name;

  if (!meta.id) {
    meta.id = meta.fileName;
    meta.name = meta.name || meta.id;
  }
  return meta;
}
