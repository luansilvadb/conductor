#!/usr/bin/env node
// Brownfield extraction. Reads an existing interface and reports the design
// system it already has, so setup can propose it instead of inventing one.
//
// Why this exists: authoring DESIGN.md from the bands alone works on a
// greenfield project and misdescribes every other kind. An existing interface
// already has colours and a rhythm; a design system that contradicts them is
// not adopted, it is ignored — and the token gate would open with hundreds of
// findings that are all "the design system is wrong", not "the code is wrong".
//
// This is NOT a gate. It never blocks and never writes. It prints what it
// found; the setup skill decides with the user what to keep.
//
// Usage:
//   node conductor/gates/design-extract.mjs [--src <dir>]... [--format json|text]
//        [--top <n>]

import { eachLine, hexToHsl, isChromatic, normalizeHex, roleOfDimension, toPx, STYLESHEET_EXTS, HEX_RE, FUNC_COLOR_RE, DIM_RE, FONT_FAMILY_RE } from './design-scan.mjs';

// Anchors from design-bands.json, duplicated here as plain numbers because this
// script must run before any design system exists. Kept in sync by hand — the
// only cost of an out-of-date copy is a weaker suggestion, never a wrong gate.
const BAND_ANCHORS = {
  rhythm: { compact: 48, airy: 96, editorial: 160 },
  type_contrast: { functional: 32, expressive: 56, editorial: 72 },
  shape: { sharp: 2, architectural: 4, soft: 8 },
};


function parseArgs(argv) {
  const opts = { src: [], format: 'json', top: 12 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--src') opts.src.push(argv[++i]);
    else if (argv[i] === '--format') opts.format = argv[++i];
    else if (argv[i] === '--top') opts.top = Number(argv[++i]);
  }
  if (opts.src.length === 0) opts.src.push('.');
  return opts;
}

function tally(map, key, at) {
  const entry = map.get(key) ?? { count: 0, sample: at };
  entry.count += 1;
  map.set(key, entry);
}

function ranked(map, top) {
  return [...map.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, top)
    .map(([value, { count, sample }]) => ({ value, count, sample }));
}

/** Nearest band by absolute distance, with the distance reported so a poor match is visible. */
function nearestBand(anchors, observed) {
  if (observed === null) return null;
  const [name, value] = Object.entries(anchors)
    .map(([n, v]) => [n, v, Math.abs(v - observed)])
    .sort((a, b) => a[2] - b[2])[0];
  return { band: name, band_value: value, observed, distance: Math.abs(value - observed) };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const colors = new Map();
  const functional = new Map();
  const dims = { spacing: new Map(), typography: new Map(), radius: new Map(), border: new Map(), layout: new Map() };
  const fonts = new Map();

  const scanned = eachLine(opts.src, (line, at, ext) => {
    // Same rule as the gate: outside a stylesheet a bare `#123` is an issue
    // reference, and counting those would put phantom colours at the top of the
    // ranking the user is asked to adopt.
    const colourLengths = STYLESHEET_EXTS.has(ext) ? [4, 5, 7, 9] : [7, 9];
    for (const match of line.matchAll(HEX_RE)) {
      if (!colourLengths.includes(match[0].length)) continue;
      tally(colors, normalizeHex(match[0]), at);
    }
    // Kept separate: rgba() is usually an overlay or a shadow, not a palette entry,
    // so folding it into the colour ranking would distort the proposal.
    for (const match of line.matchAll(FUNC_COLOR_RE)) tally(functional, match[0].replace(/\s+/g, ''), at);

    for (const match of line.matchAll(DIM_RE)) {
      if (Number(match[1]) === 0) continue;
      tally(dims[roleOfDimension(line, match.index)], match[1] + match[2], at);
    }
    for (const match of line.matchAll(FONT_FAMILY_RE)) {
      const family = match[1].trim().replace(/['"`]/g, '').split(',')[0].trim();
      if (family && !family.startsWith('$') && !family.startsWith('var(')) tally(fonts, family, at);
    }
  });

  // Role proposal. Ink is the darkest desaturated colour, paper the lightest,
  // and the accent the most used colour that is actually a hue.
  const byUse = [...colors.entries()].sort((a, b) => b[1].count - a[1].count);
  const withHsl = byUse.map(([hex, meta]) => ({ hex, ...meta, hsl: hexToHsl(hex) })).filter((c) => c.hsl);
  const neutrals = withHsl.filter((c) => !isChromatic(c.hex));
  const chromatics = withHsl.filter((c) => isChromatic(c.hex));
  const hueBuckets = new Set(chromatics.map((c) => Math.round(c.hsl.h / 30)));

  // Among the darks and among the lights, the one the codebase actually reaches
  // for wins. Picking the most extreme value instead would nominate #FFFFFF as
  // the page on a codebase that uses it once and a tinted paper everywhere else.
  const mostUsed = (pool) => pool.slice().sort((a, b) => b.count - a.count)[0]?.hex ?? null;

  const proposal = {
    primary: mostUsed(neutrals.filter((c) => c.hsl.l < 0.5)),
    neutral: mostUsed(neutrals.filter((c) => c.hsl.l >= 0.5)),
    accent: chromatics[0]?.hex ?? null,
    distinct_hues: hueBuckets.size,
    colour_strategy: hueBuckets.size <= 1 ? 'monochrome+1' : hueBuckets.size === 2 ? 'dual' : 'expressive',
  };

  // Each axis is anchored on a different statistic, and using the wrong one
  // produces a confident wrong answer. Rhythm is anchored on the section gap,
  // so it reads the LARGEST spacing value — the most frequent one is the base
  // step (typically 16px), which is not comparable to a 48/96/160 anchor.
  // Typographic contrast is likewise the largest size, the display. Shape is
  // the most FREQUENT radius, because the outlier pill button must not decide
  // the band for the whole system.
  // Compared in pixels: parseFloat on a key like '3.5rem' yields 3.5, which then
  // reports a 56px display as the 32px band — confidently wrong on the majority
  // of codebases, since rem is the common authoring unit.
  const asPx = (key) => {
    const parts = /^(-?\d*\.?\d+)(px|rem)$/.exec(key);
    return parts ? toPx(parts[1], parts[2]) : null;
  };
  const largest = (map) => {
    const values = [...map.keys()].map(asPx).filter((n) => n !== null);
    return values.length ? Math.max(...values) : null;
  };
  const mostFrequentPx = (map) => {
    const top = ranked(map, 1)[0];
    return top ? asPx(top.value) : null;
  };
  const topType = ranked(dims.typography, opts.top);

  const report = {
    scanned_files: scanned,
    colors: ranked(colors, opts.top),
    functional_colors: ranked(functional, 5),
    spacing: ranked(dims.spacing, opts.top),
    typography_sizes: topType,
    radii: ranked(dims.radius, opts.top),
    layout_sizes: ranked(dims.layout, 5),
    font_families: ranked(fonts, 5),
    proposal,
    nearest_bands: {
      rhythm: nearestBand(BAND_ANCHORS.rhythm, largest(dims.spacing)),
      type_contrast: nearestBand(BAND_ANCHORS.type_contrast, largest(dims.typography)),
      shape: nearestBand(BAND_ANCHORS.shape, mostFrequentPx(dims.radius)),
    },
    caveat:
      'Frequency is evidence, not endorsement. The most used value may be the most repeated mistake — ' +
      'present these to the user as findings to confirm, never adopt them silently.',
  };

  if (opts.format === 'text') {
    const line = (label, rows) =>
      process.stdout.write(label + ': ' + (rows.length ? rows.map((r) => r.value + ' (' + r.count + ')').join(', ') : '(none)') + '\n');
    process.stdout.write('Scanned ' + scanned + ' files\n');
    line('Colours', report.colors);
    line('Spacing', report.spacing);
    line('Type sizes', report.typography_sizes);
    line('Radii', report.radii);
    line('Fonts', report.font_families);
    process.stdout.write(
      'Proposed roles: primary ' + proposal.primary + ', neutral ' + proposal.neutral +
      ', accent ' + proposal.accent + ' (' + proposal.distinct_hues + ' distinct hues -> ' + proposal.colour_strategy + ')\n',
    );
    for (const [axis, near] of Object.entries(report.nearest_bands)) {
      if (near) process.stdout.write('Nearest band on ' + axis + ': ' + near.band + ' (' + near.band_value + ' vs observed ' + near.observed + ')\n');
    }
  } else {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  }
  process.exit(0);
}

main();
