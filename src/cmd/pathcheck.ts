import { join } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';

const PROGRAM_NAME = 'conductor';
const PATH_HINT_MARKER_NAME = '.path-hint-shown';

/** Check if conductor is on PATH, and show hint if not */
export function maybePrintPathHint(): void {
  if (isOnPath()) return;

  const binDir = guessInstallDir();
  const markerPath = pathHintMarkerPath();

  if (markerPath && existsSync(markerPath)) return;

  printPathInstructions(binDir);

  if (markerPath) {
    mkdirSync(join(markerPath, '..'), { recursive: true });
    writeFileSync(markerPath, 'shown', 'utf-8');
  }
}

function isOnPath(): boolean {
  try {
    execSync(`where ${PROGRAM_NAME}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function guessInstallDir(): string {
  try {
    const binPath = process.argv[1];
    if (!binPath) return '<your Node.js bin directory>';
    return join(binPath, '..');
  } catch {
    return '<your Node.js bin directory>';
  }
}

function pathHintMarkerPath(): string {
  const cfgDir = process.env.APPDATA || (process.platform === 'darwin'
    ? join(homedir(), 'Library', 'Preferences')
    : join(homedir(), '.config'));
  if (!cfgDir) return '';
  return join(cfgDir, 'conductor', PATH_HINT_MARKER_NAME);
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
  w.write(' conductor is installed but its directory is not on your PATH.\n');
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
