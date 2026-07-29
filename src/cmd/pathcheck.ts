import { join } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';

const PROGRAM_NAME = 'conductor';
const PATH_HINT_MARKER_NAME = '.path-hint-shown';

/** Check if conductor is on PATH, and show hint if not */
export function maybePrintPathHint(): void {
  if (isOnPath()) return;

  const binDir = resolveInstallDir();
  const markerPath = pathHintMarkerPath();

  if (markerPath && existsSync(markerPath)) return;

  printPathInstructions(binDir);

  if (markerPath) {
    mkdirSync(join(markerPath, '..'), { recursive: true });
    writeFileSync(markerPath, 'shown', 'utf-8');
  }
}

function isOnPath(): boolean {
  const cmd = process.platform === 'win32'
    ? `where ${PROGRAM_NAME}`
    : `which ${PROGRAM_NAME}`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Locate the real binary directory in this order:
 * 1. npm global bin directory — most reliable for npm installs
 * 2. Parent of process.argv[1] — fallback for other install methods
 * 3. Generic placeholder string
 *
 * Using "npm bin -g" instead of deriving from argv[1] avoids the issue where
 * argv[1] in a bundled CJS file points to the .js inside node_modules,
 * not the symlink directory that needs to be on PATH.
 */
function resolveInstallDir(): string {
  // Try npm global bin dir first
  try {
    const npmBin = execSync('npm bin -g', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (npmBin) return npmBin;
  } catch {
    // npm not available
  }

  // Fallback: parent of argv[1]
  try {
    const binPath = process.argv[1];
    if (binPath) return join(binPath, '..');
  } catch {
    // ignore
  }

  return '<your Node.js bin directory>';
}

function pathHintMarkerPath(): string {
  const cfgDir = process.env.APPDATA || (process.platform === 'darwin'
    ? join(homedir(), 'Library', 'Preferences')
    : join(homedir(), '.config'));
  if (!cfgDir) return '';
  return join(cfgDir, PROGRAM_NAME, PATH_HINT_MARKER_NAME);
}

const SHELL_RC_FILES: Record<string, string> = {
  zsh: '~/.zshrc',
  bash: '~/.bashrc',
  fish: '~/.config/fish/config.fish',
};

function printPathInstructions(binDir: string): void {
  const w = process.stderr;

  writeHeader(w, binDir);

  if (process.platform === 'win32') {
    writeWindowsInstructions(w, binDir);
  } else {
    writeUnixInstructions(w, binDir);
  }

  w.write('\n');
  w.write(' (This message will not be shown again.)\n');
  w.write('──────────────────────────────────────────────────────────────\n');
  w.write('\n');
}

function writeHeader(w: NodeJS.WriteStream, binDir: string): void {
  w.write('\n');
  w.write('──────────────────────────────────────────────────────────────\n');
  w.write(` ${PROGRAM_NAME} is installed but its directory is not on your PATH.\n`);
  w.write('──────────────────────────────────────────────────────────────\n');
  w.write(` Binary location: ${binDir}\n`);
  w.write('\n');
}

function writeWindowsInstructions(w: NodeJS.WriteStream, binDir: string): void {
  w.write(' To make `conductor` available in any terminal:\n');
  w.write('\n');
  w.write('   PowerShell (current user, persistent):\n');
  w.write(`     [Environment]::SetEnvironmentVariable("Path",\n`);
  w.write(`       [Environment]::GetEnvironmentVariable("Path","User") + ";${binDir}",\n`);
  w.write(`       "User")\n`);
  w.write('\n');
  w.write('   Then open a new terminal window.\n');
}

function writeUnixInstructions(w: NodeJS.WriteStream, binDir: string): void {
  const shell = process.env.SHELL ? join(process.env.SHELL).split('/').pop() || '' : '';
  const rcFile = SHELL_RC_FILES[shell] ?? '~/.profile';

  w.write(` Append this line to ${rcFile}:\n\n`);

  if (shell === 'fish') {
    w.write(`   set -gx PATH ${binDir} $PATH\n`);
  } else {
    w.write(`   export PATH="${binDir}:$PATH"\n`);
  }

  w.write(`\n Then reload your shell:\n\n   source ${rcFile}\n`);
}
