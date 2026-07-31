// Shared bridge to the `@google/design.md` CLI, used by the design gates.
// Kept in one place because invoking it correctly on Windows is not obvious.

import { spawnSync } from 'node:child_process';

// Pinned deliberately. The format is alpha, it lives in the user's repository,
// and an unpinned `npx` would deliver a breaking upstream change silently on
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

/**
 * Runs a design.md subcommand and returns its parsed JSON output.
 * Exit status 1 is treated as data, not failure: `diff` uses it for its own
 * notion of regression, which the gates deliberately re-judge themselves.
 */
export function runDesignMd(args) {
  const full = ['-y', '-p', PACKAGE, BIN, ...args];
  // On Windows the launcher is `npx.cmd`, and since the fix for CVE-2024-27980
  // Node refuses to spawn a .cmd without a shell. With a shell, arguments are
  // re-parsed by cmd.exe, so anything that may contain a space is quoted here.
  const isWin = process.platform === 'win32';
  const res = isWin
    ? spawnSync('npx.cmd', full.map(quoteForCmd), {
        encoding: 'utf-8',
        windowsHide: true,
        shell: true,
      })
    : spawnSync('npx', full, { encoding: 'utf-8', windowsHide: true });

  if (res.error) {
    fail(2, 'could not execute npx (' + res.error.message + '). Is Node on PATH?');
  }
  if (res.status !== 0 && res.status !== 1) {
    fail(2, PACKAGE + ' ' + args[0] + ' failed (exit ' + res.status + '):\n' + (res.stderr || res.stdout));
  }

  try {
    return JSON.parse(res.stdout);
  } catch {
    fail(2, 'could not parse JSON from `' + BIN + ' ' + args[0] + '`. Raw output:\n' + res.stdout);
  }
}
