#!/usr/bin/env node
// Design token gate. Checks the CODE against the design system, which is the
// half `design-gate.mjs` cannot see: that gate proves DESIGN.md is internally
// sound, this one proves the components actually use it.
//
// Deliberately does NOT depend on stylelint. Two reasons:
//   1. It would mean installing stylelint plus a plugin into the user's
//      project, and choosing the user's tooling is not this framework's call.
//   2. Stylelint only reads stylesheets. Most of what an agent invents lives
//      in markup — `className="p-[13px] bg-[#8B5CF6]"`, inline `style={{...}}`
//      — which a stylesheet linter never opens.
// So the allowed values are read from `designmd export --format dtcg` and the
// source tree is scanned directly. Zero dependencies, any stack.
//
// Findings are ratcheted, not absolute: a legacy project adopts this by
// recording where it stands and never getting worse. A threshold an existing
// codebase cannot meet is a threshold that gets deleted.
//
// Exit codes: 0 pass, 1 violation, 2 harness failure.
//
// Usage:
//   node conductor/gates/design-tokens-gate.mjs [--src <dir>]... [--strict]
//        [--file <DESIGN.md>] [--baseline <json>] [--update-baseline]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fail, runDesignMd } from './design-cli.mjs';
import { dimKey, eachLine, normalizeHex, HEX_RE, FUNC_COLOR_RE, DIM_RE, STYLESHEET_EXTS } from './design-scan.mjs';

// --- Policy -----------------------------------------------------------------
// Dimensions every design system tolerates regardless of its scale: the zero,
// and the hairline border that no spacing scale bothers to name.
// Keyed in pixels, matching dimKey.
const ALWAYS_ALLOWED_DIMS = new Set(['0px', '1px']);

const MAX_SHOWN_PER_RULE = 15;

// --- Args -------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    file: 'conductor/DESIGN.md',
    baseline: 'conductor/gates/design-tokens-baseline.json',
    src: [],
    strict: false,
    updateBaseline: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') opts.file = argv[++i];
    else if (arg === '--baseline') opts.baseline = argv[++i];
    else if (arg === '--src') opts.src.push(argv[++i]);
    else if (arg === '--strict') opts.strict = true;
    else if (arg === '--update-baseline') opts.updateBaseline = true;
  }
  if (opts.src.length === 0) opts.src.push('.');
  return opts;
}

// --- Allowed values ---------------------------------------------------------
function collectAllowed(designFile) {
  const dtcg = runDesignMd(['export', '--format', 'dtcg', designFile]);
  const colors = new Set();
  const dims = new Set(ALWAYS_ALLOWED_DIMS);

  const addDim = (v) => {
    if (v && typeof v === 'object' && typeof v.value === 'number' && v.unit) {
      dims.add(dimKey(v.value, v.unit));
    }
  };

  for (const [group, body] of Object.entries(dtcg)) {
    if (group.startsWith('$') || !body || typeof body !== 'object') continue;
    for (const [name, token] of Object.entries(body)) {
      if (name.startsWith('$')) continue;
      const value = token?.$value;
      if (!value) continue;

      if (typeof value.hex === 'string') {
        colors.add(normalizeHex(value.hex));
      } else if (typeof value.value === 'number' && value.unit) {
        addDim(value);
      } else if (typeof value === 'object') {
        // Composite typography token: its dimensions count as part of the scale.
        addDim(value.fontSize);
        addDim(value.letterSpacing);
        addDim(value.lineHeight);
      }
    }
  }

  if (colors.size === 0 && dims.size === ALWAYS_ALLOWED_DIMS.size) {
    fail(2, 'no tokens exported from ' + designFile + '. Nothing to check against.');
  }
  return { colors, dims };
}

// --- Scan -------------------------------------------------------------------
function scanLine(line, at, ext, allowed, findings) {
  // Outside a stylesheet, `#123` is an issue reference or a URL fragment far more
  // often than a colour, and flagging it tells the agent to "replace the literal
  // value with a token" — i.e. to rewrite a correct comment. Shorthand hex is
  // therefore only read as colour where CSS is the language.
  const colourLengths = STYLESHEET_EXTS.has(ext) ? [4, 5, 7, 9] : [7, 9];
  for (const match of line.matchAll(HEX_RE)) {
    const raw = match[0];
    if (!colourLengths.includes(raw.length)) continue;
    if (!allowed.colors.has(normalizeHex(raw))) {
      findings['hardcoded-color'].push(at + '  ' + raw);
    }
  }

  for (const match of line.matchAll(FUNC_COLOR_RE)) {
    // Functional colours are never token references, so any of them is an
    // invented value by definition.
    findings['hardcoded-color'].push(at + '  ' + match[0]);
  }

  for (const match of line.matchAll(DIM_RE)) {
    if (!allowed.dims.has(dimKey(match[1], match[2]))) {
      findings['off-scale-dimension'].push(at + '  ' + match[0]);
    }
  }
}

// --- Baseline ---------------------------------------------------------------
/**
 * Returns null ONLY when there is no baseline at all. A file that exists but
 * cannot be used is a harness failure, never an absent baseline: conflating the
 * two silently disarms an armed ratchet, which is the exact "unrun gate reads as
 * a pass" failure the rest of this gate exists to prevent.
 */
function readBaseline(path) {
  if (!existsSync(path)) return null;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    fail(2, 'baseline at ' + path + ' is unreadable (' + err.message + '). Delete it and re-record with --update-baseline.');
  }
  if (!parsed || typeof parsed.counts !== 'object' || parsed.counts === null) {
    fail(2, 'baseline at ' + path + ' has no `counts` object. It was truncated or hand-edited; re-record with --update-baseline.');
  }
  return parsed.counts;
}

function writeBaseline(path, counts) {
  const body = {
    description:
      'Design token findings recorded when this gate was adopted. The gate demands ' +
      'no worse than these counts; the numbers may only move down.',
    recordedAt: new Date().toISOString(),
    counts,
  };
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(body, null, 2) + '\n', 'utf-8');
  } catch (err) {
    fail(2, 'could not write the baseline to ' + path + ' (' + err.message + ')');
  }
}

// --- Main -------------------------------------------------------------------
function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(opts.file)) {
    fail(2, 'no design system found at ' + opts.file + '. Run the setup skill to author one, or declare this gate absent in the manifest.');
  }

  const allowed = collectAllowed(opts.file);
  const findings = { 'hardcoded-color': [], 'off-scale-dimension': [] };

  for (const root of opts.src) {
    if (!existsSync(root)) fail(2, 'source path not found: ' + root);
  }
  const scanned = eachLine(opts.src, (line, at, ext) => scanLine(line, at, ext, allowed, findings));

  const counts = Object.fromEntries(
    Object.entries(findings).map(([rule, list]) => [rule, list.length]),
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (opts.updateBaseline) {
    writeBaseline(opts.baseline, counts);
    process.stdout.write('design-tokens: baseline recorded (' + total + ' findings across ' + scanned + ' files)\n');
    process.exit(0);
  }

  const baseline = readBaseline(opts.baseline);
  const regressions = [];
  for (const [rule, count] of Object.entries(counts)) {
    const limit = opts.strict || baseline === null ? 0 : (baseline[rule] ?? 0);
    if (count > limit) regressions.push({ rule, count, limit });
  }

  // Detail always goes to stderr: the point of this gate is that the agent
  // reads the rejection and the address of the offending value.
  for (const [rule, list] of Object.entries(findings)) {
    if (list.length === 0) continue;
    process.stderr.write('\n' + rule + ' (' + list.length + '):\n');
    for (const line of list.slice(0, MAX_SHOWN_PER_RULE)) {
      process.stderr.write('  ' + line + '\n');
    }
    if (list.length > MAX_SHOWN_PER_RULE) {
      process.stderr.write('  ... and ' + (list.length - MAX_SHOWN_PER_RULE) + ' more\n');
    }
  }

  if (baseline === null && !opts.strict && total > 0) {
    // Honest middle ground: an unarmed ratchet must not read as a pass, and
    // must not block a brownfield project on its first run either.
    process.stderr.write(
      '\nNo baseline at ' + opts.baseline + ' — nothing was enforced this run.\n' +
      'Record where the project stands with --update-baseline, and the gate will hold that line from then on.\n',
    );
    process.stdout.write('design-tokens: NOT ENFORCED (' + total + ' findings, no baseline)\n');
    process.exit(0);
  }

  if (regressions.length > 0) {
    process.stderr.write('\nDesign token gate FAILED:\n');
    for (const r of regressions) {
      process.stderr.write('  x ' + r.rule + ': ' + r.count + ' (allowed ' + r.limit + ')\n');
    }
    process.stderr.write(
      '\nReplace the literal values with tokens from ' + opts.file + '. ' +
      'Adding the invented value to the design system instead is the move this gate exists to catch.\n',
    );
    process.stdout.write('design-tokens: FAIL (' + total + ' findings)\n');
    process.exit(1);
  }

  const improved = baseline
    ? Object.entries(counts).filter(([rule, c]) => c < (baseline[rule] ?? 0))
    : [];
  if (improved.length > 0) {
    process.stderr.write(
      '\nImproved against the baseline: ' +
      improved.map(([rule, c]) => rule + ' ' + (baseline[rule] ?? 0) + ' -> ' + c).join(', ') +
      '. Re-record with --update-baseline so the gain is held.\n',
    );
  }
  process.stdout.write('design-tokens: PASS (' + total + ' findings, ' + scanned + ' files)\n');
  process.exit(0);
}

main();
