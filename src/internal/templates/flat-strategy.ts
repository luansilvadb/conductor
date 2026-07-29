import { join } from 'node:path';
import { type TemplateMeta, type GenerateResult, type GenerationStrategy } from './types.js';
import { AIToolType, findDescriptor } from '../tool-registry.js';
import { type EmbeddedTemplateManager } from './manager.js';

export class FlatMarkdownStrategy implements GenerationStrategy {
  constructor(
    private toolKey: string,
    private manager: EmbeddedTemplateManager,
  ) {}

  generateAll(workingDir: string, force: boolean, outputDir?: string, locale?: string): GenerateResult[] {
    const tmpls = this.manager.listAvailable(this.toolKey as AIToolType);
    const results: GenerateResult[] = [];
    for (const t of tmpls) {
      results.push(...this.generateOne(workingDir, t, force, outputDir, locale));
    }
    return results;
  }

  generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean, outputDir?: string, locale?: string): GenerateResult[] {
    const toolType = this.toolKey as AIToolType;
    const descriptor = findDescriptor(toolType);

    if (!descriptor && !outputDir) {
      return [{
        success: false,
        message: 'Cannot generate templates for unknown tool without an explicit --output directory',
      }];
    }

    // Resolve output subdirectory via descriptor's categoryMapping (if any).
    // Falls back to the source category name unchanged.
    const categoryMapping = descriptor?.categoryMapping ?? {};
    const outputSubdir = categoryMapping[tmpl.sourceDir] ?? tmpl.sourceDir;

    // configBaseDir is already the resolved base directory — no regex needed.
    const configBaseDir = descriptor?.configBaseDir ?? '';
    const base = outputDir ?? (configBaseDir ? join(workingDir, configBaseDir) : workingDir);

    const targetDir = outputSubdir
      ? join(base, outputSubdir, tmpl.subpath)
      : join(base, tmpl.subpath);

    const targetPath = join(targetDir, `${tmpl.id}${tmpl.ext}`);

    return [
      this.manager.generate({
        templateName: tmpl.name,
        targetPath,
        force,
        content: tmpl.content,
        locale,
        baseDir: base,
      }),
    ];
  }
}

