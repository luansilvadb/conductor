/**
 * Build guard: generate a real project and fail if any placeholder survived.
 *
 * Every other check in this build reads the templates. None of them runs the thing the
 * templates exist to produce, and the gap is not theoretical: swapping
 * `${config.tool_dir}/skills/...` for `${config.directories.skills_dir}/...` inside
 * config.json leaves 14 of the 35 generated files carrying the raw placeholder, and the
 * entire build — i18n coverage, path composition, 30 graded traces, typecheck, bundle —
 * passes green over it. The defect ships to a user as a skill instructing an agent to
 * open a file called `${config.directories.skills_dir}/...`.
 *
 * The cause is worth stating because it is invisible at the call site: a value inside
 * config.json may reference other config keys and they resolve, but when a TEMPLATE cites
 * that value, what gets injected is the raw string — and only `${config.tool_dir}` is
 * substituted afterwards. So a nested placeholder is safe in a value nothing cites and
 * silently broken in a value some skill references, which is not a distinction anyone
 * should be asked to hold in their head.
 *
 * Generation is driven exactly as a user drives it, through the built CLI, with --output
 * and --locale supplied so nothing prompts. This runs after `bundle`, since that is what
 * it executes.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'dist', 'index.cjs');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'conductor-gen-'));

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

/** Anything the resolver was supposed to consume and did not. */
const UNRESOLVED = /\$\{(config|i18n|tool)\.[^}]*\}/g;

/**
 * Only rendered output is graded. `i18n/` is the translation source, copied into the
 * project verbatim so a later `generate` can render another locale from it — a placeholder
 * there is the content, not a leak, and grading it would report ~63 correct lines as defects.
 * The rendered skills, the rules, and the resolved config are what a placeholder must never
 * reach.
 */
const rendered = (file) => {
  const rel = path.relative(outDir, file).split(path.sep);
  return rel[0] !== 'i18n';
};

try {
  execFileSync(process.execPath, [cli, '--tool', 'claude-code', 'generate', '--output', outDir, '--locale', 'en-US'], { stdio: 'pipe' });

  const all = walk(outDir);
  const files = all.filter(rendered);
  if (all.length === 0) {
    console.error('[check-generate] generation produced no files');
    process.exit(1);
  }

  const failures = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(UNRESOLVED)) {
      const line = text.slice(0, m.index).split('\n').length;
      failures.push(`  ${path.relative(outDir, file)}:${line} — ${m[0]}`);
    }
  }

  if (failures.length > 0) {
    const shown = failures.slice(0, 15);
    console.error(`[check-generate] ${failures.length} unresolved placeholder(s) reached the generated output:\n` + shown.join('\n'));
    if (failures.length > shown.length) console.error(`  … and ${failures.length - shown.length} more`);
    console.error('\nA value that templates cite must not nest a placeholder other than ${config.tool_dir} — only that one is substituted after injection.');
    process.exit(1);
  }

  console.log(`[check-generate] ok — ${files.length} files generated, no placeholder survived`);
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
