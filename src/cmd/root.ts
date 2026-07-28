import { Command } from 'commander';
import { cwd } from 'node:process';
import { AIToolType, parseToolFlag, type DetectResult } from '../internal/detector/types.js';
import { DefaultDetector } from '../internal/detector/detector.js';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { CharmUIRenderer } from '../internal/ui/renderer.js';
import { runInit } from './init.js';
import { runGenerate } from './generate.js';
import pkg from '../../package.json' with { type: 'json' };

// Global state shared across commands
export let det: DefaultDetector;
export let uiRenderer: CharmUIRenderer;
export let templateManager: EmbeddedTemplateManager;
export let detectedResult: DetectResult;
export let toolFlag = '';

export function createProgram(): Command {
  const program = new Command();
  program
    .name('Conductor')
    .description(
      'Conductor Spec Driven Development',
    )
    .version(pkg.version, '-v, --version', 'Print conductor version and exit')
    .hook('preAction', (thisCommand: Command) => {
      det = new DefaultDetector();
      uiRenderer = new CharmUIRenderer();
      templateManager = new EmbeddedTemplateManager();

      const workingDir = cwd();
      const globalOpts = thisCommand.opts();
      toolFlag = globalOpts.tool ?? '';

      if (toolFlag) {
        const toolType = parseToolFlag(toolFlag);
        detectedResult = {
          toolType,
          configPath: det.getConfigDirPath(toolType, workingDir),
          isValid: toolType !== AIToolType.Unknown,
          message: `tool manually specified: ${toolType}`,
        };
      } else {
        detectedResult = det.detect(workingDir);
      }
    })
    .action(async () => {
      // Fluxo padrão (sem subcomando): inicializa + gera tudo
      const ok = await runInit();
      if (!ok) return;
      await runGenerate();
    });

  program.option('-t, --tool <tool>', 'Manually specify tool type (cursor, claude-code, antigravity)');

  return program;
}
