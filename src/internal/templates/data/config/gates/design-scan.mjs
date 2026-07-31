// Shared source scanner for the design gates.
//
// One traversal, two consumers with opposite intent: design-tokens-gate.mjs
// asks "which literals are NOT in the design system", design-extract.mjs asks
// "which literals ARE in this codebase". Same regexes, so a value the extractor
// proposes as a token is by construction a value the gate will then accept.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';

export const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit',
  'coverage', 'vendor', '.git', '.venv', '__pycache__', 'conductor',
]);

export const SCAN_EXTS = new Set([
  '.css', '.scss', '.sass', '.less', '.styl',
  '.html', '.htm', '.vue', '.svelte', '.astro',
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
]);

export const SUPPRESS = 'design-tokens-ignore';
export const MAX_FILE_BYTES = 1024 * 1024;

export const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
export const FUNC_COLOR_RE = /\b(?:rgba?|hsla?)\s*\([^)]*\)/gi;
export const DIM_RE = /(-?\d*\.?\d+)(px|rem)\b/g;
export const FONT_FAMILY_RE = /(?:font-family\s*:|fontFamily\s*:)\s*([^;,\n}]+)/gi;

/** #abc -> #aabbcc, and a fully opaque alpha channel dropped so #141517ff === #141517. */
export function normalizeHex(hex) {
  let h = hex.toLowerCase();
  if (h.length === 4 || h.length === 5) {
    h = '#' + h.slice(1).split('').map((c) => c + c).join('');
  }
  if (h.length === 9 && h.slice(7) === 'ff') h = h.slice(0, 7);
  return h;
}

/** Assumed root font size. Comparing rem to px is impossible without one, and
 *  every mainstream stack defaults to 16px. */
export const ROOT_FONT_PX = 16;

/**
 * Dimensions are compared in pixels, never as `value+unit` strings. A token set
 * authored in px and a codebase authored in rem describe the same design, and
 * keying by unit would report every dimension in such a project as off-scale —
 * a permanent finding set that the baseline then freezes in place.
 *
 * `em` is deliberately not converted: it resolves against the element's own font
 * size, so there is no correct constant. It keeps its own namespace.
 */
export function toPx(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (unit === 'px') return n;
  if (unit === 'rem') return n * ROOT_FONT_PX;
  return null;
}

/** Comparison key: pixels when the unit is convertible, otherwise unit-scoped. */
export function dimKey(value, unit) {
  const px = toPx(value, unit);
  return px === null ? String(Number(value)) + unit : String(px) + 'px';
}

/** Saturation and lightness are what separate an ink or a background from an accent. */
export function hexToHsl(hex) {
  const h = normalizeHex(hex);
  if (h.length !== 7) return null;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return { h: hue * 360, s, l };
}

/**
 * Chroma, not HSL saturation. At extreme lightness HSL inflates saturation — a
 * warm off-white like #F7F5F2 reports s=0.24 and would be read as an accent,
 * which is exactly backwards for the colour most likely to be the page.
 */
export function isChromatic(hex) {
  const h = normalizeHex(hex);
  if (h.length !== 7) return false;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
  return chroma >= 0.12 && l > 0.08 && l < 0.92;
}

/**
 * The role of a dimension is decided by the property that governs it, which is
 * the nearest `name:` to its left — not by the line, since `border-radius: 4px;
 * padding: 16px 24px` puts three values of two roles on one line.
 */
export function roleOfDimension(line, index) {
  const before = line.slice(0, index);
  const property = before.match(/([a-zA-Z-]+)\s*:\s*[^:;]*$/);
  const name = property ? property[1] : before;
  if (/font-?size|line-?height|letter-?spacing/i.test(name) || /\btext-\[$|\bleading-\[$|\btracking-\[$/i.test(before)) return 'typography';
  if (/border-?radius/i.test(name) || /\brounded(-[a-z]+)?-\[$/i.test(before)) return 'radius';
  // Each alternative is anchored. Without the group, `outline` and `box-shadow`
  // match anywhere in `name` — and `name` falls back to the whole text left of
  // the value whenever the property regex misses, which is the common case in
  // markup and utility classes.
  if (/^(?:border|outline|box-?shadow)/i.test(name)) return 'border';
  // A page is not a gap. The largest "spacing" value in any real stylesheet is a
  // container width, so letting these into the spacing bucket makes the rhythm
  // anchor read 1200px and propose the widest band to every project.
  if (/^(?:max-|min-)?(?:width|height)$|^(?:top|right|bottom|left|inset)$/i.test(name)) return 'layout';
  return 'spacing';
}

export function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      yield* walk(full);
    } else if (entry.isFile() && SCAN_EXTS.has(extname(entry.name))) {
      yield full;
    }
  }
}

/** Extensions where a bare `#abc` is a colour rather than an issue reference. */
export const STYLESHEET_EXTS = new Set(['.css', '.scss', '.sass', '.less', '.styl']);

/**
 * Calls `onLine(line, location, ext)` for every scannable line under the given
 * roots, skipping suppressed lines and files too large to be hand-written.
 * Returns the number of files read.
 */
export function eachLine(roots, onLine) {
  let scanned = 0;
  for (const root of roots) {
    for (const path of walk(root)) {
      let size;
      try {
        size = statSync(path).size;
      } catch {
        continue;
      }
      if (size > MAX_FILE_BYTES) continue;

      const rel = relative(process.cwd(), path).split(sep).join('/');
      const ext = extname(path);
      let lines;
      try {
        lines = readFileSync(path, 'utf-8').split(/\r?\n/);
      } catch {
        // Unreadable or deleted between statSync and now. Skipping one file is
        // right; throwing here would surface as exit 1, which the gates reserve
        // for a design verdict.
        continue;
      }
      lines.forEach((line, index) => {
        if (line.includes(SUPPRESS)) return;
        onLine(line, rel + ':' + (index + 1), ext);
      });
      scanned += 1;
    }
  }
  return scanned;
}
