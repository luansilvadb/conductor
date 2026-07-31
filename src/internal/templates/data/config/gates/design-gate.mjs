#!/usr/bin/env node
// Design gate. Wraps the `@google/design.md` CLI and applies Conductor's own
// severity policy on top of its JSON output.
//
// Why a wrapper exists at all: the upstream CLI is a linter, not a gate.
//   - `lint` marks only `broken-ref` as an error, so a DESIGN.md whose button
//     fails WCAG AA at 2.07:1 still exits 0.
//   - `diff` computes `regression` from the delta in finding COUNTS, not from
//     token changes. Flattening the type scale and halving the section rhythm
//     changes no counts, so it reports `regression: false` and exits 0 — which
//     is precisely the move an agent makes when it is easier to shrink the
//     design system than to make the component fit it.
// Both commands do expose everything needed via `--format json`. This script
// reads that JSON and decides.
//
// Exit codes:
//   0  pass
//   1  design violation (the report on stderr is the point — it lands in the
//      agent's next prompt)
//   2  harness failure (CLI absent, file missing, unparsable output). Never
//      conflate this with a passing design; a gate that cannot run has not run.
//
// Usage:
//   node conductor/gates/design-gate.mjs [--mode implement|design]
//                                        [--file <path>] [--baseline <path>]

import { existsSync, readFileSync } from 'node:fs';
import { fail, runDesignMd } from './design-cli.mjs';
import { toPx } from './design-scan.mjs';

// --- Policy -----------------------------------------------------------------
// Maps each upstream lint rule to how Conductor treats it. Edit here, not in
// the logic below.
//
//   fail  -> blocks
//   warn  -> reported, does not block
//   info  -> reported only in verbose output
const LINT_POLICY = {
  // Already an upstream error.
  'broken-ref': 'fail',
  // Arithmetic over declared values, and the file's own Do's and Don'ts
  // demands it. Upstream calls it a warning; a contrast failure shipped is a
  // contrast failure.
  'contrast-ratio': 'fail',
  // A token silently dropped is worse than a missing one: the agent believes
  // it is constrained and is not.
  'token-like-ignored': 'fail',
  // Without these the design system constrains nothing and the model goes
  // back to inventing values, which is the whole reason this gate exists.
  'missing-primary': 'fail',
  'missing-typography': 'fail',
  // Gradual erosion: tokens defined but wired to no component. Reported, not
  // blocking — an unused token is a smell, and a project mid-refactor has them
  // legitimately.
  'orphaned-tokens': 'warn',
  // Cosmetic or advisory.
  'section-order': 'warn',
  'unknown-key': 'warn',
  'token-summary': 'info',
  'missing-sections': 'info',
  'omitted-rules': 'info',
};

// Unknown rules from a future CLI version must not pass silently.
const UNKNOWN_RULE_POLICY = 'warn';

// Token groups an implementation task may never touch. Widening the palette or
// flattening the scale mid-implementation is the design-system equivalent of
// editing the gate manifest to make a task pass.
const FROZEN_DURING_IMPLEMENT = ['colors', 'typography', 'spacing', 'rounded', 'components'];

// --- Args -------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    mode: 'implement',
    file: 'conductor/DESIGN.md',
    baseline: 'conductor/gates/design-baseline.md',
    bands: 'conductor/gates/design-bands.json',
    pairings: 'conductor/gates/type-pairings.json',
    verbose: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--mode') opts.mode = argv[++i];
    else if (arg === '--file') opts.file = argv[++i];
    else if (arg === '--baseline') opts.baseline = argv[++i];
    else if (arg === '--bands') opts.bands = argv[++i];
    else if (arg === '--pairings') opts.pairings = argv[++i];
    else if (arg === '--verbose') opts.verbose = true;
  }
  if (opts.mode !== 'implement' && opts.mode !== 'design') {
    fail(2, 'Unknown --mode "' + opts.mode + '". Expected "implement" or "design".');
  }
  return opts;
}

// --- Checks -----------------------------------------------------------------
function checkSpec(file) {
  const report = runDesignMd(['lint', '--format', 'json', file]);
  const blocking = [];
  const advisory = [];

  for (const finding of report.findings ?? []) {
    const policy = LINT_POLICY[finding.rule] ?? UNKNOWN_RULE_POLICY;
    const where = finding.path ? finding.path + ': ' : '';
    const line = '[' + finding.rule + '] ' + where + finding.message;

    if (policy === 'fail') blocking.push(line);
    else if (policy === 'warn') advisory.push(line);
  }

  return { name: 'spec', blocking, advisory };
}

function checkRatchet(baseline, file, mode) {
  const report = runDesignMd(['diff', '--format', 'json', baseline, file]);
  const blocking = [];
  const advisory = [];

  // Deliberately ignores report.regression — see the header. Judge the tokens.
  for (const group of Object.keys(report.tokens ?? {})) {
    const change = report.tokens[group];
    const touched = [
      ...(change.added ?? []).map((t) => 'added ' + t),
      ...(change.removed ?? []).map((t) => 'removed ' + t),
      ...(change.modified ?? []).map((t) => 'modified ' + t),
    ];
    if (touched.length === 0) continue;

    const line = group + ': ' + touched.join(', ');
    if (mode === 'implement' && FROZEN_DURING_IMPLEMENT.includes(group)) blocking.push(line);
    else advisory.push(line);
  }

  const delta = report.findings?.delta ?? {};
  if ((delta.errors ?? 0) > 0 || (delta.warnings ?? 0) > 0) {
    blocking.push(
      'lint findings increased against the baseline (errors +' +
        (delta.errors ?? 0) + ', warnings +' + (delta.warnings ?? 0) + ')',
    );
  }

  return { name: 'ratchet', blocking, advisory };
}

/**
 * Checks that each numeric axis landed exactly on a band.
 *
 * Without this the whole banding scheme is advice: a design system filled with
 * the median of every value the model has read is internally consistent, so it
 * passes every other check here. A 64px section gap is not an error — it is the
 * average, which is what generic is made of.
 */
function checkBands(designFile, bandsFile) {
  let spec;
  try {
    spec = JSON.parse(readFileSync(bandsFile, 'utf-8'));
  } catch (err) {
    // Exit 1 here would reach the orchestrator as a design verdict and send the
    // agent looking for a token to fix. The band file being broken is a harness
    // failure and must say so.
    fail(2, 'band definitions at ' + bandsFile + ' are unreadable (' + err.message + ')');
  }
  const dtcg = runDesignMd(['export', '--format', 'dtcg', designFile]);
  const blocking = [];
  const advisory = [];

  // The DTCG export names the colour group `color`, singular.
  const groupOf = (name) => (name === 'colors' ? dtcg.color : dtcg[name]);

  // Band anchors are pixels. Returning the bare number would compare 3.5rem
  // against 56 and fail every rem-authored system, while accepting 96rem as the
  // 96px band — wrong in both directions.
  const dimensionAt = (path) => {
    const [group, token, prop] = path.split('.');
    const value = groupOf(group)?.[token]?.$value;
    if (!value) return null;
    const dim = prop ? value[prop] : value;
    if (typeof dim?.value !== 'number') return null;
    const px = toPx(dim.value, dim.unit);
    return px === null ? { unsupported: dim.unit } : px;
  };

  for (const [axis, def] of Object.entries(spec.axes ?? {})) {
    const found = dimensionAt(def.token);
    if (found === null) {
      advisory.push(axis + ': ' + def.token + ' is not defined, so the axis was not checked');
      continue;
    }
    if (typeof found === 'object') {
      advisory.push(axis + ': ' + def.token + ' is in ' + found.unsupported + ', which cannot be compared to a pixel band; the axis was not checked');
      continue;
    }
    const match = Object.entries(def.bands).find(([, v]) => v === found);
    if (!match) {
      const options = Object.entries(def.bands).map(([n, v]) => n + ' ' + v).join(', ');
      blocking.push(
        axis + ': ' + def.token + ' is ' + found + ', which is no band. Expected one of ' + options +
        ' — a value between bands is the averaged answer this axis exists to prevent',
      );
    }
  }

  const banned = spec.banned ?? {};
  const hexOf = (token) => groupOf('colors')?.[token]?.$value?.hex?.toLowerCase() ?? null;
  const allHexes = Object.entries(groupOf('colors') ?? {})
    .filter(([name]) => !name.startsWith('$'))
    .map(([name, token]) => [name, token?.$value?.hex?.toLowerCase()]);

  for (const [name, hex] of allHexes) {
    if (hex && (banned.accent_colors ?? []).includes(hex)) {
      blocking.push('colors.' + name + ' is ' + hex + ', one of the most frequently generated accents — pick a colour the product chose, not one the model reaches for');
    }
  }
  if ((banned.neutral_must_not_be ?? []).includes(hexOf('neutral'))) {
    blocking.push('colors.neutral is pure white — use a tinted off-white; pure white is the strongest signal of an unconsidered palette');
  }
  if ((banned.primary_must_not_be ?? []).includes(hexOf('primary'))) {
    blocking.push('colors.primary is pure black — use a near-black');
  }

  return { name: 'bands', blocking, advisory };
}

/**
 * Checks the type pairing against the catalogue, and the family count against
 * the one rule that holds regardless of catalogue.
 *
 * Pairing type well is a craft skill, and the failure mode is not ugliness — it
 * is sameness: the same two or three families appear in every generated
 * interface, so the page reads as related to every other generated page. A
 * catalogue removes the composition step, exactly as the bands did for spacing.
 *
 * A project with its own licensed brand faces leaves `selected` null and is
 * reported as unchecked. That is correct: brand type always outranks a
 * catalogue entry, and the catalogue exists for the case where nobody chose,
 * which is the case where the mean answer wins by default.
 */
function checkType(designFile, pairingsFile) {
  const blocking = [];
  const advisory = [];
  if (!existsSync(pairingsFile)) return { name: 'type', blocking, advisory };

  let spec;
  try {
    spec = JSON.parse(readFileSync(pairingsFile, 'utf-8'));
  } catch (err) {
    fail(2, 'type pairings at ' + pairingsFile + ' are unreadable (' + err.message + ')');
  }

  const dtcg = runDesignMd(['export', '--format', 'dtcg', designFile]);
  const typography = dtcg.typography ?? {};
  const familyOf = (token) => {
    const raw = typography[token]?.$value?.fontFamily;
    if (!raw) return null;
    return String(Array.isArray(raw) ? raw[0] : raw).split(',')[0].replace(/["']/g, '').trim();
  };

  const families = new Set();
  for (const [name, token] of Object.entries(typography)) {
    if (name.startsWith('$')) continue;
    const raw = token?.$value?.fontFamily;
    if (!raw) continue;
    families.add(String(Array.isArray(raw) ? raw[0] : raw).split(',')[0].replace(/["']/g, '').trim());
  }
  if (families.size > 2) {
    blocking.push(
      'typography uses ' + families.size + ' families (' + [...families].join(', ') +
      '). More than two is an unresolved decision, not a richer system',
    );
  }

  const selected = spec.selected;
  if (!selected) {
    advisory.push('type pairing: none selected in ' + pairingsFile + ', so the pairing was not checked');
    return { name: 'type', blocking, advisory };
  }

  const pairing = spec.pairings?.[selected];
  if (!pairing) {
    fail(2, pairingsFile + ' selects the pairing "' + selected + '", which it does not define.');
  }

  const display = familyOf('display');
  const body = familyOf('body');
  const norm = (s) => (s ?? '').toLowerCase();

  if (display && norm(display) !== norm(pairing.display)) {
    blocking.push(
      'typography.display is `' + display + '`, but the selected pairing `' + selected + '` is `' +
      pairing.display + '`. Pick a pairing and copy it — recombining halves of two pairings is composing ' +
      'a new one, which is what the catalogue exists to avoid',
    );
  }
  if (body && norm(body) !== norm(pairing.body)) {
    blocking.push(
      'typography.body is `' + body + '`, but the selected pairing `' + selected + '` is `' + pairing.body + '`',
    );
  }

  return { name: 'type', blocking, advisory };
}

// --- Report -----------------------------------------------------------------
function report(sections, opts) {
  const blocking = sections.flatMap((s) => s.blocking);
  const advisory = sections.flatMap((s) => s.advisory);

  if (blocking.length > 0) {
    process.stderr.write('\nDesign gate FAILED (' + blocking.length + ' blocking):\n');
    for (const line of blocking) process.stderr.write('  x ' + line + '\n');
    if (advisory.length > 0) {
      process.stderr.write('\nAlso reported (non-blocking):\n');
      for (const line of advisory) process.stderr.write('  - ' + line + '\n');
    }
    // Where the fix belongs differs by section, and pointing at the wrong file
    // is how an agent ends up "fixing" a contrast failure by deleting the
    // component, or a ratchet failure by editing the design system.
    const failed = sections.filter((s) => s.blocking.length > 0).map((s) => s.name);
    if (failed.includes('spec')) {
      process.stderr.write(
        '\nSpec findings are fixed in ' + opts.file + ' itself: correct the token values ' +
        'so the declared system is internally sound.\n',
      );
    }
    if (failed.includes('bands')) {
      process.stderr.write(
        '\nBand findings mean an axis was averaged rather than chosen. Go back to the band table, ' +
        'pick one band for that axis and copy its value — do not nudge the current value toward the nearest band.\n',
      );
    }
    if (failed.includes('type')) {
      process.stderr.write(
        '\nType findings are fixed by copying the selected pairing into ' + opts.file + ' verbatim, ' +
        'or by selecting a different pairing deliberately. Editing the catalogue to match what was ' +
        'already written is the same move as widening a token to fit a component.\n',
      );
    }
    if (failed.includes('ratchet')) {
      process.stderr.write(
        '\nRatchet findings are fixed in the code, never in ' + opts.file + '. ' +
        'Changing the design system to make a task pass is the failure this gate exists to catch — ' +
        'if the system genuinely needs to change, that is a design track, not an implementation task.\n',
      );
    }
    process.stdout.write('design: FAIL (' + blocking.length + ' blocking, ' + advisory.length + ' advisory)\n');
    process.exit(1);
  }

  if (advisory.length > 0 && opts.verbose) {
    process.stderr.write('\nDesign gate passed with notes:\n');
    for (const line of advisory) process.stderr.write('  - ' + line + '\n');
  }
  process.stdout.write('design: PASS (' + advisory.length + ' advisory)\n');
  process.exit(0);
}

// --- Main -------------------------------------------------------------------
function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(opts.file)) {
    fail(2, 'no design system found at ' + opts.file + '. Run the setup skill to author one, or declare this gate absent in the manifest.');
  }
  // Guard against an empty or truncated file reaching the CLI as "valid".
  if (readFileSync(opts.file, 'utf-8').trim() === '') {
    fail(2, opts.file + ' is empty.');
  }

  const sections = [checkSpec(opts.file), checkType(opts.file, opts.pairings)];

  if (existsSync(opts.bands)) {
    sections.push(checkBands(opts.file, opts.bands));
  } else if (opts.verbose) {
    process.stderr.write('design-gate: no band definitions at ' + opts.bands + ' — axis check skipped.\n');
  }

  if (existsSync(opts.baseline)) {
    sections.push(checkRatchet(opts.baseline, opts.file, opts.mode));
  } else if (opts.verbose) {
    process.stderr.write(
      'design-gate: no baseline at ' + opts.baseline + ' — ratchet skipped. ' +
      'Copy the approved ' + opts.file + ' there to enable it.\n',
    );
  }

  report(sections, opts);
}

main();
