import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import { getContext } from './root.js';

const HOMEBREW_FORMULA_NAME = 'luansilvadb/tools/conductor';
const PROGRAM_NAME = 'conductor';

type InstallMethod = 'homebrew' | 'go-install' | 'npm' | 'unknown';
type Confidence = 'high' | 'medium' | 'low';

interface InstallEvidence {
  method: InstallMethod;
  confidence: Confidence;
  reason: string;
  binaryPath: string;
}

interface UninstallStep {
  action: string;
  description: string;
  run: () => boolean;
}

interface UninstallPlan {
  method: InstallMethod;
  confidence: Confidence;
  reason: string;
  steps: UninstallStep[];
}

export function createUninstallCommand(): Command {
  const cmd = new Command('uninstall')
    .description('Uninstall conductor CLI')
    .action(async () => {
      const ui = getContext().ui;
      const evidence = detectInstall();
      const plan = buildUninstallPlan(evidence);

      if (plan.steps.length === 0) {
        ui.renderWarning('Nothing to uninstall.');
        return;
      }

      ui.renderWarning(`Install method: ${plan.method} (confidence: ${plan.confidence})`);
      ui.renderInfo(`Detection reason: ${plan.reason}`);
      ui.renderInfo('Steps to perform:');
      plan.steps.forEach((step, i) => ui.renderInfo(`  ${i + 1}. ${step.description}`));

      if (plan.confidence === 'low') {
        ui.renderWarning(
          'Detection confidence is LOW. Please verify the steps above carefully before proceeding.',
        );
      }

      const confirmed = await ui.confirm('Do you want to proceed with uninstall?');
      if (!confirmed) {
        ui.renderWarning('Uninstall cancelled.');
        return;
      }

      for (const step of plan.steps) {
        ui.renderInfo(`Executing: ${step.description}...`);
        if (step.run()) {
          ui.renderSuccess(`Completed: ${step.description}`);
        } else {
          ui.renderError(`Failed: ${step.description}`);
          ui.renderWarning('Continuing with remaining steps...');
        }
      }

      ui.renderSuccess('Uninstall completed. You may need to close and reopen your terminal.');
    });

  return cmd;
}

// ---------------------------------------------------------------------------
// Install detection agent
// ---------------------------------------------------------------------------

function detectInstall(): InstallEvidence {
  const binaryPath = safeResolve(process.argv[1] || '');

  return (
    tryDetectNpm(binaryPath) ??
    tryDetectGoInstall(binaryPath) ??
    tryDetectHomebrew() ??
    unknownEvidence(binaryPath)
  );
}

function tryDetectNpm(binaryPath: string): InstallEvidence | null {
  try {
    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf-8' }).trim();
    const npmBinPath = join(npmPrefix, 'node_modules', '.bin', PROGRAM_NAME);

    // High confidence: argv[1] is inside npm prefix AND the bin entry exists
    if (binaryPath.includes(npmPrefix) && existsSync(npmBinPath)) {
      return {
        method: 'npm',
        confidence: 'high',
        reason: `Binary path is inside npm global prefix "${npmPrefix}" and ${PROGRAM_NAME} exists in npm bin`,
        binaryPath: npmBinPath,
      };
    }

    // Medium confidence: binary exists in npm bin but argv[1] path doesn't match
    if (existsSync(npmBinPath)) {
      return {
        method: 'npm',
        confidence: 'medium',
        reason: `"${PROGRAM_NAME}" found in npm global bin at "${npmBinPath}" but process path does not match`,
        binaryPath: npmBinPath,
      };
    }
  } catch {
    // npm not available or prefix command failed
  }
  return null;
}

function tryDetectGoInstall(binaryPath: string): InstallEvidence | null {
  try {
    const goPath = execSync('go env GOPATH', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (!goPath) return null;

    const goBinDir = join(goPath, 'bin');
    const goBinaryPath = join(goBinDir, PROGRAM_NAME);

    if (binaryPath.includes(goBinDir) && existsSync(goBinaryPath)) {
      return {
        method: 'go-install',
        confidence: 'high',
        reason: `Binary path is inside GOPATH/bin and ${PROGRAM_NAME} binary exists there`,
        binaryPath: goBinaryPath,
      };
    }

    if (existsSync(goBinaryPath)) {
      return {
        method: 'go-install',
        confidence: 'medium',
        reason: `"${PROGRAM_NAME}" found in GOPATH/bin at "${goBinaryPath}" but process path does not match`,
        binaryPath: goBinaryPath,
      };
    }
  } catch {
    // go not available
  }
  return null;
}

function tryDetectHomebrew(): InstallEvidence | null {
  if (process.platform === 'win32') return null;
  try {
    execSync(`brew list ${HOMEBREW_FORMULA_NAME} 2>/dev/null`, { stdio: 'ignore' });
    return {
      method: 'homebrew',
      confidence: 'high',
      reason: `"brew list ${HOMEBREW_FORMULA_NAME}" succeeded`,
      binaryPath: '',
    };
  } catch {
    return null;
  }
}

function unknownEvidence(binaryPath: string): InstallEvidence {
  const isLikelyConductor = basename(binaryPath).toLowerCase().includes(PROGRAM_NAME);
  return {
    method: 'unknown',
    confidence: isLikelyConductor ? 'medium' : 'low',
    reason: isLikelyConductor
      ? `No known package manager detected; binary at "${binaryPath}" matches the program name`
      : `No known package manager detected; binary at "${binaryPath}" does not appear to be ${PROGRAM_NAME}`,
    binaryPath,
  };
}

// ---------------------------------------------------------------------------
// Uninstall plan builder
// ---------------------------------------------------------------------------

const STEP_BUILDERS: Record<InstallMethod, (evidence: InstallEvidence) => UninstallStep[]> = {
  homebrew: () => [
    {
      action: 'brew-uninstall',
      description: 'Uninstall conductor via Homebrew',
      run: () => safeExec(`brew uninstall ${HOMEBREW_FORMULA_NAME}`),
    },
  ],
  'go-install': (evidence) => {
    if (!evidence.binaryPath) return [];
    return [
      {
        action: 'remove-binary',
        description: `Remove conductor binary from ${join(evidence.binaryPath, '..')}`,
        run: () => removeBinaryPair(evidence.binaryPath),
      },
    ];
  },
  npm: () => [
    {
      action: 'npm-uninstall',
      description: 'Uninstall conductor global npm package',
      run: () => safeExec('npm uninstall -g conductor'),
    },
  ],
  unknown: (evidence) => {
    if (!evidence.binaryPath || !existsSync(evidence.binaryPath)) return [];
    // Safety: only remove if path basename clearly belongs to this program
    if (!basename(evidence.binaryPath).toLowerCase().includes(PROGRAM_NAME)) return [];
    return [
      {
        action: 'remove-binary',
        description: `Remove binary at ${evidence.binaryPath}`,
        run: () => safeUnlink(evidence.binaryPath),
      },
    ];
  },
};

function buildUninstallPlan(evidence: InstallEvidence): UninstallPlan {
  const steps = [
    ...STEP_BUILDERS[evidence.method](evidence),
    {
      action: 'remove-config',
      description: 'Remove conductor config directory (if any)',
      run: removeConfigDir,
    },
  ];

  return {
    method: evidence.method,
    confidence: evidence.confidence,
    reason: evidence.reason,
    steps,
  };
}

function removeConfigDir(): boolean {
  try {
    const cfgDir = process.env.APPDATA
      ? join(process.env.APPDATA, PROGRAM_NAME)
      : join(homedir(), '.config', PROGRAM_NAME);
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

function safeResolve(path: string): string {
  try {
    return resolve(path);
  } catch {
    return path;
  }
}
