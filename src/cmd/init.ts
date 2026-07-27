import { Command } from 'commander';
import { cwd } from 'node:process';
import { existsSync, mkdirSync } from 'node:fs';
import { detectedResult, det, uiRenderer } from './root.js';
import { AIToolType, parseToolFlag } from '../internal/detector/types.js';

export function createInitCommand(): Command {
  const cmd = new Command('init')
    .description('Initialize command template directory for detected AI tool')
    .action(async () => {
      const workingDir = cwd();

      if (!detectedResult.isValid) {
        const tool = await selectToolInteractively();
        if (tool === AIToolType.Unknown) {
          uiRenderer.renderError('No tool selected');
          return;
        }
        // Reassign detectedResult
        Object.assign(detectedResult, {
          toolType: tool,
          configPath: det.getConfigDirPath(tool, workingDir),
          isValid: true,
          message: `tool manually selected: ${tool}`,
        });
      }

      const configPath = detectedResult.configPath;
      if (!configPath) {
        uiRenderer.renderError('Could not determine config directory');
        return;
      }

      if (existsSync(configPath)) {
        uiRenderer.renderWarning(`Directory already exists: ${configPath}`);
        const confirmed = await uiRenderer.confirm('Do you want to continue anyway?');
        if (!confirmed) {
          uiRenderer.renderWarning('Initialization cancelled');
          return;
        }
      }

      mkdirSync(configPath, { recursive: true });

      uiRenderer.renderSuccess(
        `Initialized ${detectedResult.toolType} command directory at: ${configPath}`,
      );
    });

  return cmd;
}

export async function selectToolInteractively(): Promise<AIToolType> {
  const { select, isCancel } = await import('@clack/prompts');

  const result = await select({
    message: 'Select your AI coding tool:',
    options: [
      { label: 'Cursor', value: 'cursor' },
      { label: 'Claude Code', value: 'claude-code' },
      { label: 'Antigravity', value: 'antigravity' },
      { label: 'Trae', value: 'trae' },
    ],
  });

  if (isCancel(result)) return AIToolType.Unknown;
  return parseToolFlag(result as string);
}
