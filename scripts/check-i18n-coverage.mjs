/**
 * Build guard: every i18n string-array entry must reach the generated output.
 *
 * Templates render an array either as `${i18n.list("a.b.items")}` — which always
 * emits the whole array — or as hand-written `${i18n.t("a.b.items.0")}` … `.N`
 * lines, used where entries need custom separators (e.g. a blank line between
 * examples). The hand-written form is the hazard: append an entry to the JSON and
 * it silently never appears in the generated skill, because nothing links the
 * array's length to the indices the template happens to spell out.
 *
 * This script fails the build on that mismatch. It runs before `embed`, so a
 * dropped constraint is caught at build time rather than discovered as an agent
 * that quietly stopped honouring a rule.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'internal', 'templates', 'data');
const baseDir = path.join(dataDir, 'i18n', 'base');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

/** Full i18n key → number of entries, for every string-array under i18n/base. */
function collectArrays() {
  const arrays = {};
  for (const file of walk(baseDir)) {
    if (!file.endsWith('.json')) continue;
    const ns = path.relative(baseDir, file).split(path.sep).join('.').replace(/\.json$/, '');
    const walkValue = (obj, prefix) => {
      for (const [key, value] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(value)) {
          if (value.every((v) => typeof v === 'string')) arrays[`${ns}.${full}`] = value.length;
          // Mixed/object arrays hold no directly addressable strings, but may nest ones
          else value.forEach((v, i) => { if (v && typeof v === 'object' && !Array.isArray(v)) walkValue(v, `${full}.${i}`); });
        } else if (value && typeof value === 'object') walkValue(value, full);
      }
    };
    walkValue(JSON.parse(fs.readFileSync(file, 'utf8')), '');
  }
  return arrays;
}

function templateFiles() {
  return [...walk(path.join(dataDir, 'skills')), ...walk(path.join(dataDir, 'rules'))]
    .filter((f) => f.endsWith('.md'));
}

/** Full i18n key → highest index referenced by an `${i18n.t(...)}` placeholder. */
function collectIndexedRefs() {
  const refs = {};
  for (const file of templateFiles()) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/\$\{i18n\.t\("([^"]+)"\)\}/g)) {
      // The resolver accepts bracket notation too (items[2]); normalise before splitting,
      // otherwise such a reference is dropped and its array looks fully covered.
      const parts = match[1].replace(/\[(\d+)\]/g, '.$1').split('.');
      const last = parts[parts.length - 1];
      if (!/^\d+$/.test(last)) continue;
      const key = parts.slice(0, -1).join('.');
      refs[key] = Math.max(refs[key] ?? -1, Number(last));
    }
  }
  return refs;
}

/** Every `${i18n.list(...)}` key, with the template that references it. */
function collectListRefs() {
  const refs = [];
  for (const file of templateFiles()) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/\$\{i18n\.list\("([^"]+)"\)\}/g)) {
      refs.push({ key: match[1], file: path.relative(process.cwd(), file) });
    }
  }
  return refs;
}

const arrays = collectArrays();
const refs = collectIndexedRefs();
const failures = [];

for (const [key, length] of Object.entries(arrays)) {
  const highestUsed = refs[key];
  if (highestUsed === undefined) continue; // rendered via i18n.list() — always complete
  if (highestUsed < length - 1) {
    failures.push(
      `  ${key}: ${length} entries (0..${length - 1}) but templates stop at .${highestUsed} ` +
      `— ${length - 1 - highestUsed} entry(ies) would never be generated`,
    );
  } else if (highestUsed > length - 1) {
    failures.push(
      `  ${key}: only ${length} entries (0..${length - 1}) but a template references .${highestUsed} ` +
      `— that placeholder resolves to nothing and is emitted verbatim`,
    );
  }
}

// An `${i18n.list("...")}` key that matches no string array resolves to nothing and is
// emitted verbatim into the generated skill — the failure this guard exists to prevent.
for (const { key, file } of collectListRefs()) {
  if (!(key in arrays)) {
    failures.push(`  ${key}: referenced by i18n.list() in ${file} but no such string array exists`);
  }
}

if (failures.length > 0) {
  console.error('[check-i18n-coverage] i18n entries unreachable from templates:\n' + failures.join('\n'));
  console.error('\nFix by adding the missing ${i18n.t("...")} lines, or switch the block to ${i18n.list("...")}.');
  process.exit(1);
}

console.log(`[check-i18n-coverage] ok — ${Object.keys(arrays).length} arrays, no unreachable entries`);
