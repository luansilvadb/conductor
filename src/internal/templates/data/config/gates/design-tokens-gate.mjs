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
//        [--allow-unarmed]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, sep } from 'node:path';
import { fail, runDesignMd } from './design-cli.mjs';
import { dimKey, delaysOf, eachLine, normalizeHex, isRealShadow, HEX_RE, FUNC_COLOR_RE, DELAY_RE, DIM_RE, SHADOW_RE, STYLESHEET_EXTS } from './design-scan.mjs';

// --- Policy -----------------------------------------------------------------
// Dimensions every design system tolerates regardless of its scale: the zero,
// and the hairline border that no spacing scale bothers to name.
// Keyed in pixels, matching dimKey.
const ALWAYS_ALLOWED_DIMS = new Set(['0px', '1px']);

const MAX_SHOWN_PER_RULE = 15;

/** This script's own path, relative to the project root, so the remedy printed
 *  on failure is a command the reader can paste rather than an absolute path
 *  from whichever machine happened to run it. */
function selfPath() {
  const abs = process.argv[1];
  if (!abs) return 'conductor/gates/design-tokens-gate.mjs';
  const rel = relative(process.cwd(), abs).split(sep).join('/');
  return rel.startsWith('..') ? abs : rel;
}

// --- Args -------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    file: 'conductor/DESIGN.md',
    baseline: 'conductor/gates/design-tokens-baseline.json',
    bands: 'conductor/gates/design-bands.json',
    motion: 'conductor/gates/motion-bands.json',
    src: [],
    strict: false,
    updateBaseline: false,
    allowUnarmed: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') opts.file = argv[++i];
    else if (arg === '--baseline') opts.baseline = argv[++i];
    else if (arg === '--bands') opts.bands = argv[++i];
    else if (arg === '--motion') opts.motion = argv[++i];
    else if (arg === '--src') opts.src.push(argv[++i]);
    else if (arg === '--strict') opts.strict = true;
    else if (arg === '--update-baseline') opts.updateBaseline = true;
    else if (arg === '--allow-unarmed') opts.allowUnarmed = true;
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
/**
 * The depth band the project chose, and the shadow budget it implies.
 * Returns null when no band file exists or none was selected — an unchecked
 * axis, which the caller reports rather than guesses.
 */
function readDepthBand(bandsFile) {
  if (!existsSync(bandsFile)) return null;
  let spec;
  try {
    spec = JSON.parse(readFileSync(bandsFile, 'utf-8'));
  } catch (err) {
    fail(2, 'band definitions at ' + bandsFile + ' are unreadable (' + err.message + ')');
  }
  const depth = spec.depth;
  const selected = depth?.selected;
  if (!depth || !selected) return null;
  const limit = depth.bands?.[selected];
  if (typeof limit !== 'number') {
    fail(2, bandsFile + ' selects the depth band "' + selected + '", which is not defined in its bands table.');
  }
  return { name: selected, limit };
}

/**
 * The stagger step of the selected motion band, or null when no band was chosen
 * — in which case delays are not checked at all rather than checked against a
 * guess. A `restrained` band has a stagger of 0, which means no delay is ever
 * in band; that is the band saying nothing should be sequenced, and it is
 * returned as-is so the caller reports it plainly.
 */
function readStagger(motionFile) {
  if (!existsSync(motionFile)) return null;
  let spec;
  try {
    spec = JSON.parse(readFileSync(motionFile, 'utf-8'));
  } catch (err) {
    fail(2, 'motion bands at ' + motionFile + ' are unreadable (' + err.message + ')');
  }
  const selected = spec?.selected;
  if (!selected) return null;
  const band = spec.bands?.[selected];
  if (!band || typeof band.stagger !== 'number') {
    fail(2, motionFile + ' selects the motion band "' + selected + '", which is not defined in its bands table.');
  }
  return band.stagger === 0 ? null : band.stagger;
}

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

  // Collected unconditionally; whether they are findings depends on the band,
  // which is decided once in main() rather than per line.
  for (const match of line.matchAll(SHADOW_RE)) {
    // match[2] is the utility class alone; match[0] carries the delimiter that
    // anchored it, which would print as `"shadow-lg`.
    if (isRealShadow(match)) findings['off-band-depth'].push(at + '  ' + (match[2] ?? match[0]).trim());
  }

  for (const match of line.matchAll(DELAY_RE)) {
    for (const ms of delaysOf(match[1])) {
      if (allowed.stagger === null) continue;
      if (ms % allowed.stagger !== 0) {
        findings['off-band-motion'].push(at + '  ' + ms + 'ms (not a multiple of the ' + allowed.stagger + 'ms stagger)');
      }
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
  const depth = readDepthBand(opts.bands);
  allowed.stagger = readStagger(opts.motion);
  const findings = { 'hardcoded-color': [], 'off-scale-dimension': [], 'off-band-depth': [], 'off-band-motion': [] };

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
    // Depth is budgeted by the declared band, not by zero: `shadowed` tolerates
    // two shadow levels by definition, so holding it to zero would reject the
    // very band the user chose. An unselected band leaves the axis unchecked.
    if (rule === 'off-band-depth') {
      if (depth === null) continue;
      const limit = opts.strict ? depth.limit : Math.max(depth.limit, baseline?.[rule] ?? 0);
      if (count > limit) regressions.push({ rule, count, limit });
      continue;
    }
    // An unselected motion band leaves delays unchecked rather than held to zero,
    // which would flag every project that never answered the question.
    if (rule === 'off-band-motion' && allowed.stagger === null) continue;
    const limit = opts.strict || baseline === null ? 0 : (baseline[rule] ?? 0);
    if (count > limit) regressions.push({ rule, count, limit });
  }

  // A brownfield project that adopted the ratchet above its band is held to not
  // getting worse, which is the promise the ratchet makes everywhere else. Being
  // over the band is still said out loud, because the alternative is a project
  // that reads `bordered` in its design system and ships shadows forever.
  if (depth !== null && counts['off-band-depth'] > depth.limit &&
      !regressions.some((r) => r.rule === 'off-band-depth')) {
    process.stderr.write(
      '\nDepth band `' + depth.name + '` tolerates ' + depth.limit + ' shadow declaration(s); the code has ' +
      counts['off-band-depth'] + '. Held at the baseline rather than blocked, but the declared band and the code disagree.\n',
    );
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

  if (baseline === null && !opts.strict) {
    // An unarmed ratchet has not checked anything: with no baseline there is no
    // line to hold, so every finding is tolerated. Exiting 0 here made that
    // indistinguishable from a pass — the caller reads the exit code, and the
    // honest sentence on stderr does not travel with it. That is the same defect
    // as a gate that silently fails to run, so it is reported the same way.
    //
    // This is not a brownfield tax: the fix is one command, it is what setup is
    // already instructed to do, and it makes the project's real starting point
    // explicit instead of leaving it unmeasured.
    if (opts.allowUnarmed) {
      process.stderr.write(
        '\nNo baseline at ' + opts.baseline + ' — nothing was enforced this run, and --allow-unarmed was passed.\n' +
        'This gate verified nothing. Record where the project stands with --update-baseline to arm it.\n',
      );
      process.stdout.write('design-tokens: NOT ENFORCED (' + total + ' findings, no baseline)\n');
      process.exit(0);
    }
    fail(
      2,
      'no baseline at ' + opts.baseline + ', so the ratchet is unarmed and this run checked nothing ' +
      '(' + total + ' findings across ' + scanned + ' files went untested).\n' +
      'Arm it with: node ' + selfPath() + ' --update-baseline\n' +
      'Pass --allow-unarmed to accept an unverified run instead, or --strict to require zero findings.',
    );
  }

  if (regressions.length > 0) {
    process.stderr.write('\nDesign token gate FAILED:\n');
    for (const r of regressions) {
      process.stderr.write('  x ' + r.rule + ': ' + r.count + ' (allowed ' + r.limit + ')\n');
    }
    const BAND_RULES = new Set(['off-band-depth', 'off-band-motion']);
    if (regressions.some((r) => !BAND_RULES.has(r.rule))) {
      process.stderr.write(
        '\nReplace the literal values with tokens from ' + opts.file + '. ' +
        'Adding the invented value to the design system instead is the move this gate exists to catch.\n',
      );
    }
    if (regressions.some((r) => r.rule === 'off-band-motion')) {
      // There is no token for a stagger delay, so pointing at DESIGN.md would
      // send the agent to add one — which is the widening this gate prevents.
      process.stderr.write(
        '\nMotion findings are stagger delays that came from nowhere. Use multiples of the band\'s stagger ' +
        'step in ' + opts.motion + '; a sequence of 0/50/100/150ms in a system whose motion tokens are ' +
        'something else is the same defect as a 13px padding. Changing the selected band to fit the ' +
        'delays is a design decision and belongs to a design track.\n',
      );
    }
    if (regressions.some((r) => r.rule === 'off-band-depth')) {
      // Pointing this one at the token set would be actively wrong: there is no
      // token to reach for, and the only edit that silences it there is widening
      // the band the user picked.
      process.stderr.write(
        '\nDepth findings are shadows in a `' + depth.name + '` system. Remove them — depth in this band comes from ' +
        'background layering and 1px borders, not from box-shadow. Changing the selected band in ' + opts.bands +
        ' to make this pass is a design decision and belongs to a design track, not to this task.\n',
      );
    }
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
  if (depth === null && counts['off-band-depth'] > 0) {
    // Said every run, not once: an axis nobody selected is an axis nobody is
    // checking, and the shadows are already in the code.
    process.stderr.write(
      '\nDepth axis unchecked: no band selected in ' + opts.bands + ' (`depth.selected` is null), ' +
      'while ' + counts['off-band-depth'] + ' shadow declaration(s) are present. ' +
      'Set it to the band this project chose to bring the axis under the gate.\n',
    );
  }
  process.stdout.write(
    'design-tokens: PASS (' + total + ' findings, ' + scanned + ' files' +
    (depth === null ? ', depth unchecked' : ', depth ' + depth.name) + ')\n',
  );
  process.exit(0);
}

main();
