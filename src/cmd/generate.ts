import { Command } from 'commander';
import { cwd } from 'node:process';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { FlatMarkdownStrategy } from '../internal/templates/flat-strategy.js';
import { detectedResult, det, uiRenderer, templateManager, toolFlag } from './root.js';
import { selectToolInteractively } from './init.js';
import { AIToolType } from '../internal/detector/types.js';

let forceFlag = false;
let outputFlag = '';

export function createGenerateCommand(): Command {
  const cmd = new Command('generate')
    .aliases(['gen', 'g'])
    .description('Generate all command template files (or a specific one with [template-name])')
    .argument('[template-name]', 'Template name to generate')
    .option('-f, --force', 'Overwrite existing files')
    .option('-a, --all', 'Generate all available templates')
    .option('-o, --output <path>', 'Custom output directory (overrides detection)')
    .action(async (templateName: string | undefined, options: { force?: boolean; all?: boolean; output?: string }) => {
      forceFlag = options.force ?? false;
      outputFlag = options.output ?? '';

      if (!outputFlag && !toolFlag) {
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

      const targetDir = determineTargetDir();
      if (!targetDir) {
        uiRenderer.renderError('Could not determine target directory. Use --output or --tool flag.');
        return;
      }

      if (templateName) {
        await generateSingleTemplate(templateName);
        return;
      }

      await generateAllTemplates(targetDir);
    });

  return cmd;
}

function determineTargetDir(): string {
  if (outputFlag) return outputFlag;
  if (detectedResult.isValid && detectedResult.configPath) return detectedResult.configPath;
  return '';
}

async function generateAllTemplates(_targetDir: string): Promise<void> {
  const workingDir = cwd();
  const mgr = templateManager as EmbeddedTemplateManager;

  const strategy = new FlatMarkdownStrategy(detectedResult.toolType, mgr);
  const results = strategy.generateAll(workingDir, forceFlag);

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

async function generateSingleTemplate(name: string): Promise<void> {
  const tmpl = templateManager.getByName(name);
  if (!tmpl) {
    uiRenderer.renderError(`Template not found: ${name}`);
    return;
  }
  await generateOneViaStrategy(tmpl);
}

async function generateOneViaStrategy(tmpl: ReturnType<typeof templateManager.getByName>): Promise<void> {
  if (!tmpl) return;
  const workingDir = cwd();
  const mgr = templateManager as EmbeddedTemplateManager;

  const strategy = new FlatMarkdownStrategy(detectedResult.toolType, mgr);
  const results = strategy.generateOne(workingDir, tmpl, forceFlag);

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
