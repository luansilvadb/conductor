import { Command } from 'commander';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { FlatMarkdownStrategy } from '../internal/templates/flat-strategy.js';
import { getContext } from './root.js';
import { selectToolInteractively, selectLocaleInteractively } from './init.js';
import { AIToolType } from '../internal/tool-registry.js';
import type { ConductorContext } from '../internal/context.js';
import { withDetected } from '../internal/context.js';

export function createGenerateCommand(): Command {
  const cmd = new Command('generate')
    .aliases(['gen', 'g'])
    .description('Generate all command template files (or a specific one with [template-name])')
    .argument('[template-name]', 'Template name to generate')
    .option('-f, --force', 'Overwrite existing files')
    .option('-a, --all', 'Generate all available templates')
    .option('-o, --output <path>', 'Custom output directory (overrides detection)')
    .option('-l, --locale <locale>', 'Locale override (e.g. pt-BR)')
    .action(async (templateName, options) => {
      await runGenerate(getContext(), { templateName, force: options.force, output: options.output, locale: options.locale });
    });

  return cmd;
}

export interface GenerateOptions {
  templateName?: string;
  force?: boolean;
  output?: string;
  locale?: string;
}

/** Resolve tool, target directory, and generate templates. */
export async function runGenerate(ctx: ConductorContext, opts: GenerateOptions = {}): Promise<void> {
  const force = opts.force ?? false;
  const output = opts.output ?? '';

  if (!output && !ctx.detected.isValid) {
    const tool = await selectToolInteractively();
    if (tool === AIToolType.Unknown) {
      ctx.ui.renderError('No tool selected. Use --output or --tool flag.');
      return;
    }

    ctx = withDetected(ctx, {
      toolType: tool,
      configPath: ctx.det.getConfigDirPath(tool, ctx.workingDir),
      isValid: true,
      message: `tool manually selected: ${tool}`,
    });
  }

  if (!opts.locale) {
    opts.locale = await selectLocaleInteractively();
  }

  const targetDir = output || ctx.detected.configPath;
  if (!targetDir) {
    ctx.ui.renderError('Could not determine target directory. Use --output or --tool flag.');
    return;
  }

  if (opts.templateName) {
    await generateSingleTemplate(ctx, opts.templateName, force, output, opts.locale);
    return;
  }

  await generateAllTemplates(ctx, targetDir, force, output, opts.locale);
}

async function generateAllTemplates(ctx: ConductorContext, _targetDir: string, force: boolean, output: string, locale?: string): Promise<void> {
  const mgr = ctx.templates as EmbeddedTemplateManager;
  const strategy = new FlatMarkdownStrategy(ctx.detected.toolType, mgr);
  const results = strategy.generateAll(ctx.workingDir, force, output || undefined, locale);

  if (results.length === 0) {
    ctx.ui.renderWarning('No templates available');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      ctx.ui.renderSuccess(`Generated: ${result.filePath}`);
    } else {
      failCount++;
      ctx.ui.renderError(`Failed: ${result.message}`);
    }
  }

  ctx.ui.renderSuccess(`Generation complete: ${formatCount(successCount, 'succeeded')}, ${formatCount(failCount, 'failed')}`);
}

async function generateSingleTemplate(ctx: ConductorContext, name: string, force: boolean, output: string, locale?: string): Promise<void> {
  const tmpl = ctx.templates.getByName(name);
  if (!tmpl) {
    ctx.ui.renderError(`Template not found: ${name}`);
    return;
  }

  const mgr = ctx.templates as EmbeddedTemplateManager;
  const strategy = new FlatMarkdownStrategy(ctx.detected.toolType, mgr);
  const results = strategy.generateOne(ctx.workingDir, tmpl, force, output || undefined, locale);

  for (const r of results) {
    if (r.success) {
      ctx.ui.renderSuccess(`Generated: ${r.filePath}`);
    } else {
      ctx.ui.renderError(r.message);
    }
  }
}

function formatCount(count: number, label: string): string {
  if (count === 1) return `1 ${label.slice(0, -1)}`;
  return `${count} ${label}`;
}
