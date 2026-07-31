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

    // Where the generated skills land, project-relative. This is what
    // `${config.tool_dir}` resolves to, and it must stay relative: an absolute
    // path is baked into every generated file and breaks on the first clone.
    //
    // It is the TOOL directory for every category, including "config". A
    // generated config.json addresses the protocol and catalog assets, and those
    // sit beside the skills — resolving them against the conductor root instead
    // yields `conductor/skills/...`, a directory the installer never creates, so
    // the protocol that governs every dispatch becomes unreachable from the very
    // config that is supposed to be the single source of truth.
    const toolDir = outputDir ?? descriptor?.configBaseDir ?? '';

    // The "config" category is project-root data (conductor/config.json), not
    // tool-specific — every generated skill references it at a fixed path
    // regardless of which AI tool is targeted. It bypasses configBaseDir/categoryMapping.
    if (tmpl.sourceDir === 'config') {
      const base = outputDir ?? join(workingDir, 'conductor');
      const targetDir = join(base, tmpl.subpath);
      const targetPath = join(targetDir, `${tmpl.fileName}${tmpl.ext}`);
      return [
        this.manager.generate({
          templateName: tmpl.name,
          targetPath,
          force,
          content: tmpl.content,
          locale,
          toolDir,
          toolKey: this.toolKey,
        }),
      ];
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

    const targetPath = join(targetDir, `${tmpl.fileName}${tmpl.ext}`);

    return [
      this.manager.generate({
        templateName: tmpl.name,
        targetPath,
        force,
        content: tmpl.content,
        locale,
        toolDir,
        toolKey: this.toolKey,
      }),
    ];
  }
}

