#!/usr/bin/env node
// Intent coherence gate.
//
// The design system is a set of answers. This gate checks them against the
// reason they were given — the references the user named at setup and what they
// said about each.
//
// Why this is a gate and not a note: intent is the one input that arrives once,
// early, from a person, and is never regenerated. Every later track reads the
// bands and the tokens; none of them reads the sentence that produced those
// bands, so a band quietly changed in track four cannot be checked against
// anything, and by then nobody remembers that `airy` was chosen because the user
// said the reference "breathes". Recording the intent as a referenceable
// contract is what keeps that sentence available and makes drifting away from it
// visible rather than gradual.
//
// It is deliberately NOT a check that the interface looks like the reference —
// nothing here can settle that, and claiming to would be the exact overreach
// design-scales.md warns about. It checks one thing: that the parameters still
// say what the person said.
//
// Exit codes: 0 pass, 1 violation, 2 harness failure.
//
// Usage:
//   node conductor/gates/design-intent-gate.mjs
//        [--intent <intent.json>] [--vocabulary <json>] [--bands <json>]
//        [--motion <json>]

import { existsSync, readFileSync } from 'node:fs';
import { fail } from './design-cli.mjs';

function parseArgs(argv) {
  const opts = {
    intent: 'conductor/design/intent.json',
    vocabulary: 'conductor/gates/intent-vocabulary.json',
    bands: 'conductor/gates/design-bands.json',
    motion: 'conductor/gates/motion-bands.json',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--intent') opts.intent = argv[++i];
    else if (arg === '--vocabulary') opts.vocabulary = argv[++i];
    else if (arg === '--bands') opts.bands = argv[++i];
    else if (arg === '--motion') opts.motion = argv[++i];
  }
  return opts;
}

function readJson(path, what, required) {
  if (!existsSync(path)) {
    if (required) fail(2, 'no ' + what + ' at ' + path);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    fail(2, what + ' at ' + path + ' is unreadable (' + err.message + ')');
  }
}

/** The band actually configured on each axis, from the files that own it. */
function configuredBands(opts) {
  const bands = readJson(opts.bands, 'band definitions', false);
  const motion = readJson(opts.motion, 'motion bands', false);
  return {
    depth: bands?.depth?.selected ?? null,
    motion: motion?.selected ?? null,
    // rhythm and type_contrast live as numbers in DESIGN.md rather than as a
    // named selection, so they are carried in the intent file itself, recorded
    // at the moment the band was chosen. Re-deriving them here would mean
    // running the design CLI for a check that is about provenance, not values.
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const intent = readJson(opts.intent, 'design intent', false);
  if (!intent) {
    fail(
      2,
      'no design intent at ' + opts.intent + ', so no parameter can be checked against the reason it was chosen.\n' +
      'Setup records it from the references the user named. Without it the bands are values nobody can account for, ' +
      'and a later track cannot tell a deliberate change from a drift.',
    );
  }

  const vocabulary = readJson(opts.vocabulary, 'intent vocabulary', true);
  const references = Array.isArray(intent.references) ? intent.references : [];
  const blocking = [];
  const advisory = [];

  // --- The averaging trap ---------------------------------------------------
  if (references.length > 0) {
    const primaries = references.filter((r) => r.primary === true);
    if (primaries.length === 0) {
      blocking.push(
        'no reference is marked primary. ' + vocabulary.the_averaging_trap.rule + ' ' +
        vocabulary.the_averaging_trap.why,
      );
    } else if (primaries.length > 1) {
      blocking.push(
        primaries.length + ' references are marked primary. Exactly one decides the identity — ' +
        'two primaries is an average with extra steps',
      );
    }

    // Each non-primary reference may claim at most one axis.
    for (const ref of references.filter((r) => r.primary !== true)) {
      const claimed = ref.decides ?? [];
      if (claimed.length > 1) {
        blocking.push(
          'reference ' + JSON.stringify(ref.url ?? ref.name ?? '?') + ' decides ' + claimed.length +
          ' axes (' + claimed.join(', ') + '). A secondary reference may override at most one, and only ' +
          'where the primary is silent — beyond that the identity is being assembled from parts',
        );
      }
    }
  } else {
    advisory.push('no references recorded, so the parameters have no stated reason behind them');
  }

  // --- Parameters still say what the person said ----------------------------
  const declared = intent.axes ?? {};
  const configured = configuredBands(opts);

  for (const [axis, expected] of Object.entries(declared)) {
    const actual = configured[axis];
    if (actual === undefined) continue; // axis not owned by a selection file
    if (actual === null) {
      advisory.push(
        axis + ': intent says `' + expected.band + '` but no band is selected, so the axis is unchecked' +
        (expected.because ? ' (recorded reason: "' + expected.because + '")' : ''),
      );
      continue;
    }
    if (actual !== expected.band) {
      blocking.push(
        axis + ' is configured as `' + actual + '` but the recorded intent is `' + expected.band + '`' +
        (expected.because ? ', from "' + expected.because + '"' : '') +
        (expected.from ? ' (' + expected.from + ')' : '') +
        '. Either the configuration drifted, or the intent genuinely changed — if it changed, update ' +
        opts.intent + ' and say why, so the next track inherits the reason and not just the value',
      );
    }
  }

  // --- Unmapped reasons are carried, not dropped ----------------------------
  const unmapped = (intent.unmapped ?? []).filter(Boolean);
  if (unmapped.length > 0) {
    advisory.push(
      unmapped.length + ' reason(s) recorded that map to no axis: ' +
      unmapped.map((u) => JSON.stringify(u)).join(', ') +
      ' — these are usually the part specific to this product, and no gate acts on them. They belong ' +
      'in front of a human.',
    );
  }

  for (const line of advisory) process.stderr.write('  - ' + line + '\n');

  if (blocking.length > 0) {
    process.stderr.write('\nIntent gate FAILED (' + blocking.length + ' blocking):\n');
    for (const line of blocking) process.stderr.write('  x ' + line + '\n');
    process.stderr.write(
      '\nThis gate does not judge whether the interface resembles the references — nothing here can ' +
      'settle that. It checks that the parameters still say what the person said.\n',
    );
    process.stdout.write('design-intent: FAIL (' + blocking.length + ' blocking, ' + advisory.length + ' advisory)\n');
    process.exit(1);
  }

  process.stdout.write(
    'design-intent: PASS (' + references.length + ' reference(s), ' +
    Object.keys(declared).length + ' axis reason(s), ' + advisory.length + ' advisory)\n',
  );
  process.exit(0);
}

main();
