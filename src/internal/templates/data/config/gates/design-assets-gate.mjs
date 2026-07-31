#!/usr/bin/env node
// Asset integrity gate.
//
// Every other design gate judges decisions: is this value in the scale, does
// this pair meet contrast, does this page derive from the grammar. This one
// judges something cruder and, in practice, more damaging — whether the images
// the page presents as content are actually content.
//
// The failure it exists for, from a real audit: one 392-byte SVG of an empty
// phone outline, referenced three times with three different alt texts ("the
// expense screen", "the netting screen", "the household dashboard"), under three
// captions promising three different views of the product. And a 287-byte
// ellipse rendered at 320px as the hero illustration of a brand whose guidelines
// describe "animated blob creatures with stick limbs". Nothing was broken.
// Every gate was green. There was simply no artwork, and the markup asserted
// there was.
//
// This is not a judgement about artistic quality, which no gate can make. It is
// a check that the asset exists at the fidelity the markup claims for it — the
// same kind of check as a broken link, and it fails for the same reason: the
// page says something that is not true.
//
// Exit codes: 0 pass, 1 violation, 2 harness failure.
//
// Usage:
//   node conductor/gates/design-assets-gate.mjs [--src <dir>]... [--public <dir>]
//        [--min-bytes <n>] [--min-marks <n>] [--baseline <json>] [--update-baseline]

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fail } from './design-cli.mjs';
import { eachLine } from './design-scan.mjs';

// --- Policy -----------------------------------------------------------------
// An SVG below this size cannot carry a figure. For calibration: a single
// rounded rectangle is ~200 bytes, a recognisable icon 400-900, an illustration
// with a character in it several kilobytes. The threshold sits where "icon"
// ends, and it only applies to assets the markup uses as ILLUSTRATION, never to
// icons — a 300-byte icon is a good icon.
const MIN_ILLUSTRATION_BYTES = 900;

// Drawing elements in an SVG. Two shapes is a placeholder; a creature with
// limbs and a face does not fit in two.
const MIN_ILLUSTRATION_MARKS = 4;

// Where an asset is being used as illustration rather than decoration. Matched
// against the reference path, so it follows the project's own naming.
const ILLUSTRATION_HINTS = /(illustration|mascot|character|hero|artwork|scene|device|screenshot|preview|mockup)/i;

const MARK_RE = /<(path|circle|ellipse|rect|polygon|polyline|line|image|text|use)\b/gi;

// `<img src alt>`, `<Image src alt>`, and the same attributes in JSX with braces.
const IMG_TAG_RE = /<(?:img|Image)\b([^>]*)>/gi;
const ATTR_RE = /\b(src|alt|width|height|class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{[`'"]([^`'"]*)[`'"]\})/gi;

function parseArgs(argv) {
  const opts = {
    src: [],
    publicDirs: [],
    minBytes: MIN_ILLUSTRATION_BYTES,
    minMarks: MIN_ILLUSTRATION_MARKS,
    baseline: 'conductor/gates/design-assets-baseline.json',
    updateBaseline: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--src') opts.src.push(argv[++i]);
    else if (arg === '--public') opts.publicDirs.push(argv[++i]);
    else if (arg === '--min-bytes') opts.minBytes = Number(argv[++i]);
    else if (arg === '--min-marks') opts.minMarks = Number(argv[++i]);
    else if (arg === '--baseline') opts.baseline = argv[++i];
    else if (arg === '--update-baseline') opts.updateBaseline = true;
  }
  if (opts.src.length === 0) opts.src.push('.');
  if (opts.publicDirs.length === 0) {
    opts.publicDirs = ['public', 'static', 'assets'].filter((d) => existsSync(d));
  }
  return opts;
}

function attrsOf(tag) {
  const out = {};
  for (const m of tag.matchAll(ATTR_RE)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

/** Resolves a markup reference to a file on disk, trying each public root. */
function resolveAsset(ref, publicDirs) {
  if (!ref || /^(https?:|data:|#)/i.test(ref)) return null;
  const clean = ref.split('?')[0].split('#')[0];
  const candidates = [clean.replace(/^\//, '')];
  for (const dir of publicDirs) candidates.push(join(dir, clean.replace(/^\//, '')));
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    } catch {
      // Unreadable candidate is simply not a match.
    }
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!Number.isFinite(opts.minBytes) || !Number.isFinite(opts.minMarks)) {
    fail(2, '--min-bytes and --min-marks must be numbers');
  }
  for (const root of opts.src) {
    if (!existsSync(root)) fail(2, 'source path not found: ' + root);
  }

  // ref -> { alts:Set, uses:[location], illustrative:boolean }
  const refs = new Map();

  const scanned = eachLine(opts.src, (line, at) => {
    for (const tag of line.matchAll(IMG_TAG_RE)) {
      const attrs = attrsOf(tag[1]);
      const src = attrs.src;
      if (!src) continue;
      if (!refs.has(src)) refs.set(src, { alts: new Set(), uses: [], illustrative: false });
      const entry = refs.get(src);
      entry.uses.push(at);
      if (attrs.alt !== undefined && attrs.alt.trim() !== '') entry.alts.add(attrs.alt.trim());
      if (ILLUSTRATION_HINTS.test(src) || ILLUSTRATION_HINTS.test(attrs.class ?? attrs.classname ?? '')) {
        entry.illustrative = true;
      }
    }
  });

  const findings = { 'placeholder-asset': [], 'one-asset-many-claims': [] };

  for (const [ref, entry] of refs) {
    // One file, several different promises. The alt text is the claim; a single
    // file cannot be three different screens of a product.
    if (entry.alts.size > 1) {
      findings['one-asset-many-claims'].push(
        ref + ' is used ' + entry.uses.length + ' times with ' + entry.alts.size +
        ' different alt texts (' + [...entry.alts].map((a) => JSON.stringify(a)).join(', ') +
        ') at ' + entry.uses.join(', ') +
        ' — one file cannot be each of those things, so at least ' + (entry.alts.size - 1) +
        ' of these claims is false to a screen reader and empty to everyone else',
      );
    }

    const path = resolveAsset(ref, opts.publicDirs);
    if (!path || extname(path).toLowerCase() !== '.svg') continue;

    let body;
    try {
      body = readFileSync(path, 'utf-8');
    } catch {
      continue;
    }
    const bytes = Buffer.byteLength(body);
    const marks = [...body.matchAll(MARK_RE)].length;
    const isIllustration = entry.illustrative || ILLUSTRATION_HINTS.test(path);

    if (isIllustration && (bytes < opts.minBytes || marks < opts.minMarks)) {
      findings['placeholder-asset'].push(
        relative(process.cwd(), path).split(sep).join('/') + ': ' + bytes + ' bytes, ' + marks +
        ' drawing element(s) — used as illustration at ' + entry.uses[0] +
        ' but too simple to be one (expected at least ' + opts.minBytes + ' bytes and ' +
        opts.minMarks + ' elements). Either the artwork is missing, or this is a placeholder that ' +
        'the page presents as finished work',
      );
    }
  }

  const counts = Object.fromEntries(Object.entries(findings).map(([k, v]) => [k, v.length]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (opts.updateBaseline) {
    try {
      mkdirSync(dirname(opts.baseline), { recursive: true });
      writeFileSync(
        opts.baseline,
        JSON.stringify({
          description: 'Asset findings recorded when this gate was adopted. The numbers may only move down.',
          recordedAt: new Date().toISOString(),
          counts,
        }, null, 2) + '\n',
        'utf-8',
      );
    } catch (err) {
      fail(2, 'could not write the baseline to ' + opts.baseline + ' (' + err.message + ')');
    }
    process.stdout.write('design-assets: baseline recorded (' + total + ' findings)\n');
    process.exit(0);
  }

  let baseline = null;
  if (existsSync(opts.baseline)) {
    try {
      baseline = JSON.parse(readFileSync(opts.baseline, 'utf-8'))?.counts ?? null;
    } catch (err) {
      fail(2, 'baseline at ' + opts.baseline + ' is unreadable (' + err.message + ')');
    }
  }

  for (const [rule, list] of Object.entries(findings)) {
    if (list.length === 0) continue;
    process.stderr.write('\n' + rule + ' (' + list.length + '):\n');
    for (const line of list) process.stderr.write('  ' + line + '\n');
  }

  const regressions = Object.entries(counts).filter(([rule, count]) => count > (baseline?.[rule] ?? 0));
  if (regressions.length > 0) {
    process.stderr.write('\nAsset gate FAILED:\n');
    for (const [rule, count] of regressions) {
      process.stderr.write('  x ' + rule + ': ' + count + ' (allowed ' + (baseline?.[rule] ?? 0) + ')\n');
    }
    process.stderr.write(
      '\nThe fix is the asset, not the markup. Removing the alt text to silence this leaves the same ' +
      'empty image with less information; pointing three references at three equally empty files ' +
      'satisfies the letter of the check and none of its purpose. If the artwork does not exist yet, ' +
      'say so as a human-verification item and let the user decide — shipping a placeholder that ' +
      'presents itself as finished work is the one option this gate exists to remove.\n',
    );
    process.stdout.write('design-assets: FAIL (' + total + ' findings)\n');
    process.exit(1);
  }

  process.stdout.write('design-assets: PASS (' + total + ' findings, ' + scanned + ' files, ' + refs.size + ' referenced assets)\n');
  process.exit(0);
}

main();
