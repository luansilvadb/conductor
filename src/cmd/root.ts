import { Command } from 'commander';
import { cwd } from 'node:process';
import { buildContext, type ConductorContext } from '../internal/context.js';
import { runInit } from './init.js';
import { runGenerate } from './generate.js';
import pkg from '../../package.json' with { type: 'json' };

/** Module-private context — set by preAction, read via getContext(). */
let _ctx: ConductorContext | undefined;

/**
 * Returns the current invocation context.
 * Throws a descriptive error if called outside a command action (i.e. before preAction ran).
 */
export function getContext(): ConductorContext {
  if (!_ctx) {
    throw new Error(
      'ConductorContext is not initialized. ' +
        'Ensure this function is only called from within a command action.',
    );
  }
  return _ctx;
}

export function createProgram(): Command {
  const program = new Command();
  program
    .name('Conductor')
    .description('Conductor Spec Driven Development')
    .version(pkg.version, '-v, --version', 'Print conductor version and exit')
    .hook('preAction', (thisCommand: Command) => {
      const workingDir = cwd();
      const globalOpts = thisCommand.opts();
      const toolFlag: string = globalOpts.tool ?? '';
      _ctx = buildContext(toolFlag, workingDir);
    })
    .action(async () => {
      // Default flow (no subcommand): init then generate
      const ctx = getContext();
      const resolvedCtx = await runInit(ctx);
      if (!resolvedCtx) return;
      await runGenerate(resolvedCtx);
    });

  program.option('-t, --tool <tool>', 'Manually specify tool type (cursor, claude-code, antigravity)');

  return program;
}

