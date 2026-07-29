import { Command } from 'commander';
import { existsSync, mkdirSync } from 'node:fs';
import { select, isCancel } from '@clack/prompts';
import { getContext } from './root.js';
import { AIToolType, TOOL_REGISTRY } from '../internal/tool-registry.js';
import type { ConductorContext } from '../internal/context.js';
import { withDetected } from '../internal/context.js';

export function createInitCommand(): Command {
  const cmd = new Command('init')
    .description('Initialize command template directory for detected AI tool')
    .action(async () => {
      await runInit(getContext());
    });

  return cmd;
}

/**
 * Resolves the target tool (auto-detected or interactively selected),
 * creates the config directory, and returns an updated context.
 * Returns null if the user cancelled or an error occurred.
 */
export async function runInit(ctx: ConductorContext): Promise<ConductorContext | null> {
  let detected = ctx.detected;

  if (!detected.isValid) {
    const tool = await selectToolInteractively();
    if (tool === AIToolType.Unknown) {
      ctx.ui.renderError('No tool selected');
      return null;
    }
    detected = {
      toolType: tool,
      configPath: ctx.det.getConfigDirPath(tool, ctx.workingDir),
      isValid: true,
      message: `tool manually selected: ${tool}`,
    };
  }

  const configPath = detected.configPath;
  if (!configPath) {
    ctx.ui.renderError('Could not determine config directory');
    return null;
  }

  if (existsSync(configPath)) {
    ctx.ui.renderWarning(`Directory already exists: ${configPath}`);
    const confirmed = await ctx.ui.confirm('Do you want to continue anyway?');
    if (!confirmed) {
      ctx.ui.renderWarning('Initialization cancelled');
      return null;
    }
  }

  mkdirSync(configPath, { recursive: true });
  ctx.ui.renderSuccess(
    `Initialized ${detected.toolType} command directory at: ${configPath}`,
  );
  return withDetected(ctx, detected);
}

/** Build the tool selection list from TOOL_REGISTRY — stays in sync automatically. */
export async function selectToolInteractively(): Promise<AIToolType> {
  const options = TOOL_REGISTRY.map((d) => ({ label: d.label, value: d.id }));
  const result = await select({
    message: 'Select your AI coding tool:',
    options,
  });

  if (isCancel(result)) return AIToolType.Unknown;
  return result as AIToolType;
}

