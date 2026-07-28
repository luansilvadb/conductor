import { join } from 'node:path';
import { type TemplateMeta, type GenerateResult, type GenerationStrategy } from './types.js';
import { AIToolType, getConfigDir } from '../detector/types.js';
import { type EmbeddedTemplateManager } from './manager.js';

/**
 * Resolve o subdiretório de saída a partir da categoria de origem.
 *
 * Padrão: o nome da categoria é preservado (commands → commands, rules → rules, etc.).
 * Antigravity: commands → workflows (convenção da IDE).
 */
function outputSubdir(sourceDir: string, toolType: AIToolType): string {
  if (!sourceDir) return '';
  if (toolType === AIToolType.Antigravity && sourceDir === 'commands') {
    return 'workflows';
  }
  return sourceDir;
}

/**
 * Resolve o diretório "base" da ferramenta a partir do configDir.
 *
 * Ferramentas cujo configDir termina com `/commands` (Cursor, Claude, etc.)
 * têm a base no diretório pai (ex: `.cursor/commands` → `.cursor`).
 * Ferramentas cujo configDir É a base (Antigravity = `.agents`)
 * permanecem como estão.
 */
function getBaseDir(configDir: string, workingDir: string): string {
  if (!configDir) return workingDir;
  const base = configDir.replace(/\/commands$/, '');
  return join(workingDir, base);
}

export class FlatMarkdownStrategy implements GenerationStrategy {
  constructor(
    private toolKey: string,
    private manager: EmbeddedTemplateManager,
  ) {}

  generateAll(workingDir: string, force: boolean, outputDir?: string): GenerateResult[] {
    const tmpls = this.manager.listAvailable(this.toolKey as AIToolType);
    const results: GenerateResult[] = [];
    for (const t of tmpls) {
      results.push(...this.generateOne(workingDir, t, force, outputDir));
    }
    return results;
  }

  generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean, outputDir?: string): GenerateResult[] {
    const toolType = this.toolKey as AIToolType;
    const configDir = getConfigDir(toolType);
    const sub = outputSubdir(tmpl.sourceDir, toolType);

    const base = outputDir ?? getBaseDir(configDir, workingDir);
    const targetDir = sub ? join(base, sub, tmpl.subpath) : join(base, tmpl.subpath);

    const targetPath = join(targetDir, `${tmpl.id}${tmpl.ext}`);

    return [
      this.manager.generate({
        templateName: tmpl.name,
        targetPath,
        force,
      }),
    ];
  }
}
