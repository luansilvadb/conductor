// Shared bridge to the `@google/design.md` CLI, used by the design gates.
// Kept in one place because invoking it correctly across package managers and
// on Windows is not obvious.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Pinned deliberately. The format is alpha, it lives in the user's repository,
// and an unpinned fetch would deliver a breaking upstream change silently on
// some future run. Bump this after reading the changelog, never by drift.
export const PACKAGE = '@google/design.md@0.4.0';
export const BIN = 'designmd'; // not `design.md`: on Windows the .md suffix
                               // collides with the shell's file association.

/** Exit code 2 is reserved for "the gate could not run" — never for a design
 *  verdict. A gate that failed to execute has not passed. */
export function fail(code, message) {
  process.stderr.write('design-gate: ' + message + '\n');
  process.exit(code);
}

function quoteForCmd(arg) {
  return /[\s"&|<>^]/.test(arg) ? '"' + arg.replace(/"/g, '""') + '"' : arg;
}

// --- Executor resolution ----------------------------------------------------
// Why this exists: `npx` is not a neutral way to run a one-off binary. npm
// refuses to operate at all inside a project whose `devEngines.packageManager`
// names another manager (EBADDEVENGINES), and it aborts before it ever fetches
// the package. Conductor's own setup writes that field, so hard-coding npx made
// both design gates unrunnable in every pnpm, yarn or bun project it created —
// the gates that exist to stop a generic interface, disabled by default on the
// majority of modern JavaScript projects.
//
// The manager is therefore read from the project rather than assumed.

/** Reads the nearest package.json without throwing; absent or broken is "no signal". */
function readPackageJson(cwd) {
  const path = join(cwd, 'package.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * The declared manager, in the order the ecosystem itself resolves it:
 * corepack's `packageManager` field, then `devEngines.packageManager`, then the
 * lockfile. A lockfile is the weakest signal but the most common one, and it is
 * still a far better guess than assuming npm.
 */
export function detectPackageManager(cwd = process.cwd()) {
  const pkg = readPackageJson(cwd);

  const fromSpec = (spec) => {
    const match = /^([a-z]+)(?:@(\d+))?/i.exec(String(spec ?? ''));
    return match ? { name: match[1].toLowerCase(), major: match[2] ? Number(match[2]) : null } : null;
  };

  const corepack = fromSpec(pkg?.packageManager);
  if (corepack) return { ...corepack, source: 'packageManager' };

  const devEngines = pkg?.devEngines?.packageManager;
  if (devEngines?.name) {
    // `version` here is a range ("^11.9.0"), not a spec — take the first number.
    const major = /(\d+)/.exec(String(devEngines.version ?? ''));
    return {
      name: String(devEngines.name).toLowerCase(),
      major: major ? Number(major[1]) : null,
      source: 'devEngines.packageManager',
    };
  }

  for (const [file, name] of [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
    ['package-lock.json', 'npm'],
  ]) {
    if (existsSync(join(cwd, file))) return { name, major: null, source: file };
  }

  return { name: 'npm', major: null, source: 'default' };
}

/**
 * Whether `command` can be spawned at all, so a missing manager falls back
 * rather than surfacing as an unexplained failure of the gate.
 *
 * The extension is left to the shell on Windows rather than appended here: the
 * launchers do not agree on one (`pnpm.cmd`, `bunx.exe`), and guessing wrong
 * reports a manager that is installed as missing.
 */
function isOnPath(command) {
  const isWin = process.platform === 'win32';
  const probe = spawnSync(command, ['--version'], {
    encoding: 'utf-8',
    windowsHide: true,
    shell: isWin,
  });
  return !probe.error && probe.status === 0;
}

/**
 * The command that runs BIN from PACKAGE under the given manager.
 *
 * Each manager is given its own explicit "package X, run binary Y" form. The
 * shorthand (`pnpm dlx @google/design.md@0.4.0`) infers the binary from the
 * package name, which is wrong here: the package is `@google/design.md` and the
 * binary is `designmd`.
 */
function runnerFor(manager, args) {
  const invoke = [BIN, ...args];
  switch (manager.name) {
    case 'pnpm':
      return { command: 'pnpm', argv: ['--package=' + PACKAGE, 'dlx', ...invoke] };
    case 'yarn':
      // Only Berry has `dlx`. Yarn 1 has no one-off runner, so it borrows npx —
      // which is safe precisely because a Yarn 1 project has no devEngines block
      // for npm to reject.
      if (manager.major !== null && manager.major < 2) return null;
      return { command: 'yarn', argv: ['dlx', '--package', PACKAGE, ...invoke] };
    case 'bun':
      return { command: 'bunx', argv: ['--package', PACKAGE, ...invoke] };
    default:
      return null;
  }
}

/**
 * Resolves how to invoke the CLI, preferring what costs least and breaks least:
 *   1. A binary already installed in the project — no network, no manager.
 *   2. The project's own package manager's one-off runner.
 *   3. npx, which is correct for npm projects and the only remaining option.
 * Exported so a gate can report which route it took when something goes wrong.
 */
export function resolveRunner(cwd = process.cwd()) {
  const isWin = process.platform === 'win32';

  const local = join(cwd, 'node_modules', '.bin', isWin ? BIN + '.cmd' : BIN);
  if (existsSync(local)) {
    return { command: local, argv: [], via: 'node_modules/.bin', manager: null };
  }

  const manager = detectPackageManager(cwd);
  const runner = runnerFor(manager, []);
  if (runner && isOnPath(runner.command)) {
    return {
      command: runner.command,
      argv: runner.argv,
      via: manager.name + ' (from ' + manager.source + ')',
      manager,
    };
  }

  return {
    command: 'npx',
    argv: ['-y', '-p', PACKAGE],
    via: runner ? 'npx (fallback: ' + manager.name + ' not on PATH)' : 'npx',
    manager,
  };
}

/**
 * Runs a design.md subcommand and returns its parsed JSON output.
 * Exit status 1 is treated as data, not failure: `diff` uses it for its own
 * notion of regression, which the gates deliberately re-judge themselves.
 */
export function runDesignMd(args) {
  const runner = resolveRunner();
  const isWin = process.platform === 'win32';

  // The npx route names the binary after the package flags; every other route
  // already carries it, and the local binary IS the binary.
  const full =
    runner.via.startsWith('npx')
      ? [...runner.argv, BIN, ...args]
      : [...runner.argv, ...args];

  // On Windows the launchers are shims (`npx.cmd`, `pnpm.cmd`, `bunx.exe`), and
  // since the fix for CVE-2024-27980 Node refuses to spawn a .cmd without a
  // shell. Running through the shell also lets cmd.exe pick the right extension
  // from PATHEXT, which is why none is appended here. With a shell, arguments
  // are re-parsed by cmd.exe, so anything that may contain a space is quoted.
  const command = runner.command;
  const res = isWin
    ? spawnSync(quoteForCmd(command), full.map(quoteForCmd), {
        encoding: 'utf-8',
        windowsHide: true,
        shell: true,
      })
    : spawnSync(command, full, { encoding: 'utf-8', windowsHide: true });

  // Every failure path names the route taken. A gate that cannot run must say
  // what it tried to run, or the agent reading it can only guess — and the guess
  // it reaches for ("the tool is not installed") sends it to work around a gate
  // that was one flag away from working.
  const context = 'via ' + runner.via + ' (' + [command, ...full].join(' ') + ')';

  if (res.error) {
    fail(2, 'could not execute ' + command + ' ' + context + ': ' + res.error.message);
  }
  if (res.status !== 0 && res.status !== 1) {
    fail(
      2,
      PACKAGE + ' ' + args[0] + ' failed (exit ' + res.status + ') ' + context + '\n' +
      'stdout:\n' + (res.stdout || '(empty)') + '\n' +
      'stderr:\n' + (res.stderr || '(empty)'),
    );
  }

  try {
    return JSON.parse(res.stdout);
  } catch {
    // stderr is included deliberately. This path is where a runner that refused
    // to start reports WHY — EBADDEVENGINES, a proxy rejection, a missing
    // registry — and printing stdout alone turns all of them into one blank
    // message that names no cause.
    fail(
      2,
      'could not parse JSON from `' + BIN + ' ' + args[0] + '` ' + context + '\n' +
      'stdout:\n' + (res.stdout || '(empty)') + '\n' +
      'stderr:\n' + (res.stderr || '(empty)'),
    );
  }
}
