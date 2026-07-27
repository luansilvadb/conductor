import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { uiRenderer } from './root.js';

const HOMEBREW_FORMULA_NAME = 'luansilvadb/tools/conductor';

type InstallMethod = 'homebrew' | 'go-install' | 'npm' | 'unknown';

interface InstallContext {
  method: InstallMethod;
  binaryPath: string;
  resolvedPath: string;
  goBinPath?: string;
}

interface UninstallStep {
  action: string;
  description: string;
  run: () => boolean;
}

interface UninstallPlan {
  method: InstallMethod;
  steps: UninstallStep[];
}

export function createUninstallCommand(): Command {
  const cmd = new Command('uninstall')
    .description('Uninstall conductor CLI')
    .action(async () => {
      const ctx = detectInstallContext();
      const plan = buildUninstallPlan(ctx);

      if (plan.steps.length === 0) {
        uiRenderer.renderWarning('Nothing to uninstall.');
        return;
      }

      uiRenderer.renderWarning(`Uninstall method detected: ${plan.method}`);
      uiRenderer.renderInfo('The following steps will be performed:');
      plan.steps.forEach((step, i) => uiRenderer.renderInfo(`  ${i + 1}. ${step.description}`));

      const confirmed = await uiRenderer.confirm('Do you want to proceed with uninstall?');
      if (!confirmed) {
        uiRenderer.renderWarning('Uninstall cancelled.');
        return;
      }

      for (const step of plan.steps) {
        uiRenderer.renderInfo(`Executing: ${step.description}...`);
        if (step.run()) {
          uiRenderer.renderSuccess(`Completed: ${step.description}`);
        } else {
          uiRenderer.renderError(`Failed: ${step.description}`);
          uiRenderer.renderWarning('Continuing with remaining steps...');
        }
      }

      uiRenderer.renderSuccess('Uninstall completed. You may need to close and reopen your terminal.');
    });

  return cmd;
}

function detectInstallContext(): InstallContext {
  const binaryPath = process.argv[1] || '';
  const resolvedPath = safeResolve(binaryPath);

  const ctx: InstallContext = { method: 'unknown', binaryPath, resolvedPath };

  const detected = tryDetectNpm(ctx, binaryPath)
    || tryDetectGoInstall(ctx, binaryPath)
    || tryDetectHomebrew(ctx);

  return detected ?? ctx;
}

function safeResolve(path: string): string {
  try {
    return resolve(path);
  } catch {
    return path;
  }
}

function tryDetectNpm(ctx: InstallContext, binaryPath: string): InstallContext | null {
  try {
    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf-8' }).trim();
    const npmBinPath = join(npmPrefix, 'node_modules', '.bin', 'conductor');
    if (existsSync(npmBinPath) || (binaryPath && binaryPath.includes(npmPrefix))) {
      return { ...ctx, method: 'npm' };
    }
  } catch {
    // not npm
  }
  return null;
}

function tryDetectGoInstall(ctx: InstallContext, binaryPath: string): InstallContext | null {
  try {
    const goBin = execSync('go env GOPATH 2>nul || echo no-gopath', {
      encoding: 'utf-8',
      shell: 'cmd.exe',
    }).trim();
    if (goBin && goBin !== 'no-gopath') {
      const goBinPath = join(goBin, 'bin');
      if (binaryPath && binaryPath.includes(goBinPath)) {
        return { ...ctx, method: 'go-install', goBinPath };
      }
    }
  } catch {
    // not go-install
  }
  return null;
}

function tryDetectHomebrew(ctx: InstallContext): InstallContext | null {
  if (process.platform === 'win32') return null;
  try {
    execSync(`brew list ${HOMEBREW_FORMULA_NAME} 2>/dev/null`, { stdio: 'ignore' });
    return { ...ctx, method: 'homebrew' };
  } catch {
    return null;
  }
}

const STEP_BUILDERS: Record<InstallMethod, (ctx: InstallContext) => UninstallStep[]> = {
  homebrew: () => [{
    action: 'brew-uninstall',
    description: 'Uninstall conductor via Homebrew',
    run: () => safeExec(`brew uninstall ${HOMEBREW_FORMULA_NAME}`),
  }],
  'go-install': (ctx) => {
    if (!ctx.goBinPath) return [];
    const binaryPath = join(ctx.goBinPath, 'conductor');
    return [{
      action: 'remove-binary',
      description: `Remove conductor binary from ${ctx.goBinPath}`,
      run: () => removeBinaryPair(binaryPath),
    }];
  },
  npm: () => [{
    action: 'npm-uninstall',
    description: 'Uninstall conductor global npm package',
    run: () => safeExec('npm uninstall -g conductor'),
  }],
  unknown: (ctx) => {
    if (!ctx.resolvedPath || !existsSync(ctx.resolvedPath)) return [];
    return [{
      action: 'remove-binary',
      description: `Remove binary at ${ctx.resolvedPath}`,
      run: () => safeUnlink(ctx.resolvedPath),
    }];
  },
};

function buildUninstallPlan(ctx: InstallContext): UninstallPlan {
  const steps = [
    ...STEP_BUILDERS[ctx.method](ctx),
    {
      action: 'remove-config',
      description: 'Remove conductor config directory (if any)',
      run: removeConfigDir,
    },
  ];

  return { method: ctx.method, steps };
}

function removeConfigDir(): boolean {
  try {
    const cfgDir = process.env.APPDATA
      ? join(process.env.APPDATA, 'conductor')
      : join(require('node:os').homedir(), '.config', 'conductor');
    if (existsSync(cfgDir)) removeDirRecursive(cfgDir);
    return true;
  } catch {
    return false;
  }
}

function removeDirRecursive(dir: string): void {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      unlinkSync(fullPath);
    }
  }
  rmdirSync(dir);
}

function safeExec(command: string): boolean {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

function safeUnlink(path: string): boolean {
  try {
    unlinkSync(path);
    return true;
  } catch {
    return false;
  }
}

function removeBinaryPair(binaryPath: string): boolean {
  try {
    if (existsSync(binaryPath)) unlinkSync(binaryPath);
    const exePath = binaryPath + '.exe';
    if (existsSync(exePath)) unlinkSync(exePath);
    return true;
  } catch {
    return false;
  }
}
