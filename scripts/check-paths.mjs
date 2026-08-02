/**
 * Build guard: a directory key is a complete path and is never joined to another.
 *
 * `config.directories` holds two things that look identical at the call site. Most
 * entries already carry their prefix — `archive_dir` is `conductor/archive`, not
 * `archive` — while `conductor_root` is that prefix. Joining them produces
 * `conductor/conductor/archive`: a real directory the framework then creates, writes
 * to, and finds empty when it later looks in the right place. Nothing fails. The
 * archived track is simply somewhere no skill reads from, and the loss surfaces a
 * release later as a track that "disappeared".
 *
 * The neighbouring shape is the reason this cannot be left to judgement:
 * `config.files.artifacts.*` ARE bare file names and MUST be joined to an owning
 * directory (`config.files.artifacts_policy`). So the correct line and the broken one
 * differ only in which map the second key came from, and both read as obviously right.
 *
 * This runs over the i18n prose as well as the markdown templates, because the prose
 * is where the rule is actually spelled out and where the defect this guard was written
 * for was found.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'internal', 'templates', 'data');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

/** Two directory placeholders joined by a separator, or butted straight together. */
const JOINED = /\$\{config\.directories\.([a-z_]+)\}\s*\/?\s*\$\{config\.directories\.([a-z_]+)\}/g;

/**
 * config.json is where the rule is declared, and declaring it requires quoting the broken
 * form as the example — `config.directories_policy` names the exact join this guard rejects.
 * Grading the declarant against its own illustration reports the documentation as the defect,
 * which is the fastest way to get a guard switched off. Templates are what this checks.
 */
const declarant = path.join(dataDir, 'config', 'config.json');

const failures = [];
for (const file of walk(dataDir)) {
  if (!/\.(md|json)$/.test(file) || file === declarant) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(JOINED)) {
    const line = text.slice(0, m.index).split('\n').length;
    failures.push(
      `  ${path.relative(root, file)}:${line} joins config.directories.${m[1]} to config.directories.${m[2]}\n` +
      `    both are complete paths — use the second one alone (config.directories_policy)`,
    );
  }
}

if (failures.length > 0) {
  console.error('[check-paths] directory keys joined into a duplicated prefix:\n' + failures.join('\n'));
  console.error('\nA directory value already carries its prefix. Only config.files.artifacts.* are bare names that need joining.');
  process.exit(1);
}

console.log('[check-paths] ok — no directory key is composed with another');
