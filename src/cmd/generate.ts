import { Command } from 'commander';
import { cwd } from 'node:process';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { FlatMarkdownStrategy } from '../internal/templates/flat-strategy.js';
import { detectedResult, det, uiRenderer, templateManager, toolFlag } from './root.js';
import { selectToolInteractively } from './init.js';
import { AIToolType } from '../internal/detector/types.js';

export function createGenerateCommand(): Command {
  const cmd = new Command('generate')
    .aliases(['gen', 'g'])
    .description('Generate all command template files (or a specific one with [template-name])')
    .argument('[template-name]', 'Template name to generate')
    .option('-f, --force', 'Overwrite existing files')
    .option('-a, --all', 'Generate all available templates')
    .option('-o, --output <path>', 'Custom output directory (overrides detection)')
    .action(async (templateName: string | undefined, options: { force?: boolean; all?: boolean; output?: string }) => {
      await runGenerate({ templateName, force: options.force, output: options.output });
    });

  return cmd;
}

/** Resolve ferramenta, diretório-alvo e gera templates. */
export async function runGenerate(opts: {
  templateName?: string;
  force?: boolean;
  output?: string;
} = {}): Promise<void> {
  const force = opts.force ?? false;
  const output = opts.output ?? '';

  if (!output && !toolFlag) {
    const tool = await selectToolInteractively();
    if (tool === AIToolType.Unknown) {
      uiRenderer.renderError('No tool selected. Use --output or --tool flag.');
      return;
    }
    const workingDir = cwd();
    Object.assign(detectedResult, {
      toolType: tool,
      configPath: det.getConfigDirPath(tool, workingDir),
      isValid: true,
      message: `tool manually selected: ${tool}`,
    });
  }

  const targetDir = determineTargetDir(output);
  if (!targetDir) {
    uiRenderer.renderError('Could not determine target directory. Use --output or --tool flag.');
    return;
  }

  if (opts.templateName) {
    await generateSingleTemplate(opts.templateName, force, output);
    return;
  }

  await generateAllTemplates(targetDir, force, output);
}

function determineTargetDir(output: string): string {
  if (output) return output;
  if (detectedResult.isValid && detectedResult.configPath) return detectedResult.configPath;
  return '';
}

async function generateAllTemplates(_targetDir: string, force: boolean, output: string): Promise<void> {
  const workingDir = cwd();
  const mgr = templateManager as EmbeddedTemplateManager;

  const strategy = new FlatMarkdownStrategy(detectedResult.toolType, mgr);
  // So passa outputDir quando --output foi explicitamente usado;
  // caso contrario, a estrategia resolve o base via getBaseDir.
  const results = strategy.generateAll(workingDir, force, output || undefined);

  if (results.length === 0) {
    uiRenderer.renderWarning('No templates available');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      uiRenderer.renderSuccess(`Generated: ${result.filePath}`);
    } else {
      failCount++;
      uiRenderer.renderError(`Failed: ${result.message}`);
    }
  }

  uiRenderer.renderSuccess(`Generation complete: ${formatCount(successCount, 'succeeded')}, ${formatCount(failCount, 'failed')}`);
}

async function generateSingleTemplate(name: string, force: boolean, output: string): Promise<void> {
  const tmpl = templateManager.getByName(name);
  if (!tmpl) {
    uiRenderer.renderError(`Template not found: ${name}`);
    return;
  }
  await generateOneViaStrategy(tmpl, force, output);
}

async function generateOneViaStrategy(tmpl: ReturnType<typeof templateManager.getByName>, force: boolean, output: string): Promise<void> {
  if (!tmpl) return;
  const workingDir = cwd();
  const mgr = templateManager as EmbeddedTemplateManager;

  const strategy = new FlatMarkdownStrategy(detectedResult.toolType, mgr);
  const results = strategy.generateOne(workingDir, tmpl, force, output || undefined);

  for (const r of results) {
    if (r.success) {
      uiRenderer.renderSuccess(`Generated: ${r.filePath}`);
    } else {
      uiRenderer.renderError(r.message);
    }
  }
}

function formatCount(count: number, label: string): string {
  if (count === 1) return `1 ${label.slice(0, -1)}`;
  return `${count} ${label}`;
}
