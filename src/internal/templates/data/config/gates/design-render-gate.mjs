#!/usr/bin/env node
// Render gate. The only gate in this framework that looks at the page.
//
// Everything else here reads a declaration: DESIGN.md, or the source that is
// supposed to use it. Both are one compilation step away from what ships, and
// the gap is not academic — a design system can declare `expressive` type,
// `airy` rhythm and `soft` shape, and render 2.0x, 64px and 6px, while every
// declaration check passes. Utility classes carry no literal for the token scan
// to find, and no declaration check has a notion of breakpoint.
//
// This gate takes its measurements from the rendered page, at each configured
// viewport, and judges those. It also counts the composition metrics that the
// band architecture explicitly does not cover, and can write screenshots — the
// only artefact in the framework that lets a later step review the page rather
// than the markup.
//
// Playwright is NOT installed on the user's behalf, per config.gates.absent_policy:
// choosing a browser automation stack is the project's decision. When it is not
// resolvable this gate exits 2 (it cannot run) and setup registers it as absent
// (cmd null) rather than registering a command that will never work.
//
// Exit codes: 0 pass, 1 design violation, 2 harness failure.
//
// Usage:
//   node conductor/gates/design-render-gate.mjs --url <url> [--viewport <px>]...
//        [--bands <json>] [--composition <json>] [--baseline <json>]
//        [--page <name>] [--pages <composition.json>] [--grammar <json>]
//        [--screenshots <dir>] [--update-baseline] [--verbose]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fail } from './design-cli.mjs';
import { judgeAxis, judgeComposition, judgeDerivationRender, round } from './design-render-judge.mjs';

// Mobile-first projects declare 375px primary; 1440 is where composition is
// actually decided. Both are measured because the failure this gate exists for
// is precisely a system that differs between them.
const DEFAULT_VIEWPORTS = [375, 1440];

function parseArgs(argv) {
  const opts = {
    url: null,
    viewports: [],
    bands: 'conductor/gates/design-bands.json',
    composition: 'conductor/gates/composition-bands.json',
    baseline: 'conductor/gates/composition-baseline.json',
    grammar: 'conductor/gates/design-grammar.json',
    motion: 'conductor/gates/motion-bands.json',
    pages: 'conductor/design/composition.json',
    page: null,
    screenshots: null,
    updateBaseline: false,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url') opts.url = argv[++i];
    else if (arg === '--viewport') opts.viewports.push(Number(argv[++i]));
    else if (arg === '--bands') opts.bands = argv[++i];
    else if (arg === '--composition') opts.composition = argv[++i];
    else if (arg === '--baseline') opts.baseline = argv[++i];
    else if (arg === '--grammar') opts.grammar = argv[++i];
    else if (arg === '--motion') opts.motion = argv[++i];
    else if (arg === '--pages') opts.pages = argv[++i];
    else if (arg === '--page') opts.page = argv[++i];
    else if (arg === '--screenshots') opts.screenshots = argv[++i];
    else if (arg === '--update-baseline') opts.updateBaseline = true;
    else if (arg === '--verbose') opts.verbose = true;
  }
  if (opts.viewports.length === 0) opts.viewports = [...DEFAULT_VIEWPORTS];
  if (opts.viewports.some((v) => !Number.isFinite(v) || v <= 0)) {
    fail(2, 'every --viewport must be a positive number of pixels');
  }
  if (!opts.url) {
    fail(2, 'no --url given. This gate needs a running page: point it at the dev server or a preview of the built site.');
  }
  return opts;
}

/**
 * Resolves Playwright from the PROJECT, never from this framework.
 *
 * Conductor does not install tooling on the user's behalf, so the honest
 * outcome when it is missing is exit 2 — the gate could not run — and a
 * manifest entry of null. What must never happen is exit 0, which would report
 * an unexamined page as a checked one.
 */
async function loadPlaywright() {
  const candidates = [
    'playwright',
    join(process.cwd(), 'node_modules', 'playwright', 'index.js'),
    join(process.cwd(), 'node_modules', 'playwright-core', 'index.js'),
  ];
  for (const candidate of candidates) {
    try {
      const specifier = candidate.includes('node_modules') ? pathToFileURL(candidate).href : candidate;
      const mod = await import(specifier);
      if (mod?.chromium) return mod;
    } catch {
      // Try the next candidate; the aggregate failure is reported below.
    }
  }
  fail(
    2,
    'Playwright is not resolvable from this project, so the page was never rendered and nothing was checked.\n' +
    'Install it in the project (`npm i -D playwright && npx playwright install chromium`), ' +
    'or declare the design_render gate absent in the gate manifest — an absent gate is an unverified check, ' +
    'which is honest; a passing one here would not be.',
  );
}

/**
 * Runs in the page. Returns raw measurements only — every judgement happens in
 * design-render-judge.mjs, so what the gate decides stays readable without a
 * browser in the loop.
 */
/* c8 ignore start — executes in the browser context, not under node */
function collectInPage() {
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // A "section" is what the page itself calls one. Falling back to top-level
  // children of main/body keeps this working for pages that never use the tag.
  let sections = [...document.querySelectorAll('section')].filter(visible);
  if (sections.length < 2) {
    const root = document.querySelector('main') ?? document.body;
    sections = [...root.children].filter((el) => el instanceof HTMLElement && visible(el));
  }

  const body = getComputedStyle(document.body);
  const bodyFontSize = px(body.fontSize) || 16;
  const pageWidth = document.documentElement.clientWidth;

  // --- Style axes, as rendered ---------------------------------------------
  const sectionPaddings = sections
    .map((el) => px(getComputedStyle(el).paddingTop))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const median = (arr) => (arr.length === 0 ? null : arr[Math.floor(arr.length / 2)]);

  let displaySize = 0;
  for (const el of document.querySelectorAll('h1, h2, [class*="display"], [class*="headline"]')) {
    if (!visible(el)) continue;
    displaySize = Math.max(displaySize, px(getComputedStyle(el).fontSize));
  }

  // The shape anchor is the SMALLEST non-zero radius in use, matching
  // `rounded.sm` in the band table. Pills (9999px) are excluded: every band
  // declares one, so it distinguishes nothing.
  let smallestRadius = null;
  let shadowCount = 0;
  for (const el of document.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement) || !visible(el)) continue;
    const style = getComputedStyle(el);
    const radius = px(style.borderTopLeftRadius);
    if (radius > 0 && radius < 500 && (smallestRadius === null || radius < smallestRadius)) {
      smallestRadius = radius;
    }
    const shadow = style.boxShadow;
    if (shadow && shadow !== 'none') shadowCount += 1;
  }

  // --- Composition ----------------------------------------------------------
  const headings = sections
    .map((el) => el.querySelector('h1, h2, h3'))
    .filter((el) => el && visible(el));

  const centred = headings.filter((el) => {
    const style = getComputedStyle(el);
    if (style.textAlign === 'center') return true;
    // Also count a block centred by auto margins inside its container.
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement?.getBoundingClientRect();
    if (!parent || parent.width === 0) return false;
    const leftGap = rect.left - parent.left;
    const rightGap = parent.right - rect.right;
    return Math.abs(leftGap - rightGap) < 2 && leftGap > 1;
  }).length;

  const widths = new Set();
  for (const el of sections) {
    const inner = el.firstElementChild;
    if (!(inner instanceof HTMLElement) || !visible(inner)) continue;
    widths.add(Math.round(inner.getBoundingClientRect().width));
  }

  const heights = sections.map((el) => el.getBoundingClientRect().height).filter((h) => h > 0);
  const mean = heights.reduce((a, b) => a + b, 0) / (heights.length || 1);
  const variance = heights.reduce((a, h) => a + (h - mean) ** 2, 0) / (heights.length || 1);
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

  const headingSizes = new Set(headings.map((el) => Math.round(px(getComputedStyle(el).fontSize))));

  // Per-section shape, for checking the declared derivation against what the
  // page actually built. Declaring `hero-split` and rendering another centred
  // stack is the obvious way to satisfy the grammar gate without composing
  // anything, and it is invisible to every check that reads only the manifest.
  const perSection = sections.map((el) => {
    const heading = el.querySelector('h1, h2, h3');
    const rect = el.getBoundingClientRect();
    let entry = 'left';
    if (heading && visible(heading)) {
      const style = getComputedStyle(heading);
      const hRect = heading.getBoundingClientRect();
      if (style.textAlign === 'center') entry = 'center';
      else if (style.textAlign === 'right') entry = 'right';
      else {
        const leftGap = hRect.left - rect.left;
        const rightGap = rect.right - hRect.right;
        if (leftGap > 1 && Math.abs(leftGap - rightGap) < 2) entry = 'center';
        else if (rightGap < leftGap * 0.5) entry = 'right';
      }
    }

    let bleeds = false;
    for (const child of el.querySelectorAll('*')) {
      if (!(child instanceof HTMLElement) || !visible(child)) continue;
      const cRect = child.getBoundingClientRect();
      if (cRect.width >= pageWidth - 1 && cRect.width > rect.width * 0.98 && el.clientWidth < pageWidth) {
        bleeds = true;
        break;
      }
      if (cRect.left < rect.left - 1 || cRect.right > rect.right + 1) {
        bleeds = true;
        break;
      }
    }
    if (Math.round(rect.width) >= pageWidth - 1 && getComputedStyle(el).paddingLeft === '0px') bleeds = true;

    return { entry, bleeds };
  });

  // Elements that leave their container's measure: full-bleed strips, pulled
  // quotes, overlapping cards. Counted at the section level to avoid rewarding
  // a page for every decorative absolute child.
  let gridBreaking = 0;
  for (const el of sections) {
    for (const child of el.querySelectorAll(':scope > *, :scope > * > *')) {
      if (!(child instanceof HTMLElement) || !visible(child)) continue;
      const rect = child.getBoundingClientRect();
      const parent = child.parentElement?.getBoundingClientRect();
      if (!parent) continue;
      const bleeds = rect.width > parent.width + 2 || rect.width >= pageWidth - 1;
      const offset = Math.abs((rect.left - parent.left) - (parent.right - rect.right)) > parent.width * 0.25;
      if (bleeds || offset) {
        gridBreaking += 1;
        break;
      }
    }
  }

  return {
    sections: sections.length,
    perSection,
    axes: {
      rhythm: median(sectionPaddings),
      type_contrast: displaySize > 0 ? displaySize : null,
      shape: smallestRadius,
    },
    shadows: shadowCount,
    bodyFontSize,
    composition: {
      centered_section_ratio: headings.length > 0 ? centred / headings.length : null,
      distinct_container_widths: widths.size,
      section_height_variation: cv,
      distinct_heading_sizes: headingSizes.size,
      grid_breaking_elements: gridBreaking,
    },
  };
}
/* c8 ignore stop */

/**
 * Motion invariants that only a browser can settle.
 *
 * Each is a separate page load because each asks a different question, and all
 * three are questions about a state that exists for a few hundred milliseconds
 * or only under a setting nobody tests by hand:
 *
 *   1. With JavaScript disabled, is the content there? If the hidden state was
 *      authored into the stylesheet, this is where the page turns out to be
 *      blank without a script — the failure mode progressive enhancement exists
 *      to prevent.
 *   2. Immediately after the document is parsed, is anything in the first
 *      viewport already invisible? That is the flash: an entrance animation on
 *      content that was never off screen, which has nothing to enter from.
 *   3. Under `prefers-reduced-motion: reduce`, is the content still visible?
 *      The common mistake is to disable the transition and keep the hidden
 *      state, which turns a request for less movement into less content.
 */
async function checkMotion(browser, url, spec) {
  const blocking = [];
  const advisory = [];
  const inv = spec?.invariants ?? {};

  // Counts elements in the first viewport that are effectively invisible.
  const hiddenAboveFold = () => {
    const out = [];
    const h = window.innerHeight;
    for (const el of document.querySelectorAll('section, header, h1, h2, p, img, a, button')) {
      if (!(el instanceof HTMLElement)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top >= h || rect.bottom <= 0 || rect.width === 0) continue;
      const style = getComputedStyle(el);
      const faded = parseFloat(style.opacity) < 0.05;
      const shifted = style.transform !== 'none' && /matrix.*?,\s*(-?\d+(\.\d+)?)\)$/.test(style.transform);
      if (faded || style.visibility === 'hidden') {
        out.push((el.id ? '#' + el.id : el.tagName.toLowerCase()) + (faded ? ' (opacity ' + style.opacity + ')' : ' (visibility hidden)'));
      }
      void shifted;
    }
    return out.slice(0, 8);
  };

  const load = async (contextOptions, waitUntil) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...contextOptions });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil, timeout: 30000 });
      return { hidden: await page.evaluate(hiddenAboveFold), context };
    } catch (err) {
      await context.close();
      throw err;
    }
  };

  const runs = [
    {
      key: 'progressive_enhancement',
      options: { javaScriptEnabled: false },
      waitUntil: 'domcontentloaded',
      label: 'with JavaScript disabled',
      detail: 'the hidden state is authored in the markup or stylesheet, so without a script the content never appears',
    },
    {
      key: 'nothing_above_the_fold_starts_hidden',
      options: {},
      waitUntil: 'domcontentloaded',
      label: 'immediately after the document was parsed',
      detail: 'content already in the first viewport was given an entrance animation, so the first thing the user sees is an empty page',
    },
    {
      key: 'reduced_motion_keeps_content',
      options: { reducedMotion: 'reduce' },
      waitUntil: 'networkidle',
      label: 'under prefers-reduced-motion: reduce',
      detail: 'reduced motion disabled the transition but left the hidden state, so the setting hides content instead of calming it',
    },
  ];

  for (const run of runs) {
    const rule = inv[run.key];
    if (!rule) continue;
    let result;
    try {
      result = await load(run.options, run.waitUntil);
    } catch (err) {
      advisory.push('motion: could not load the page ' + run.label + ' (' + err.message + ')');
      continue;
    }
    await result.context.close();
    if (result.hidden.length === 0) continue;

    const line = 'motion: ' + result.hidden.length + ' element(s) invisible above the fold ' + run.label +
      ' (' + result.hidden.join(', ') + ') — ' + run.detail;
    if (rule.severity === 'warn') advisory.push(line);
    else blocking.push(line);
  }

  return { blocking, advisory };
}

function readJson(path, what) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    fail(2, what + ' at ' + path + ' is unreadable (' + err.message + ')');
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const bandSpec = readJson(opts.bands, 'band definitions');
  const compositionSpec = readJson(opts.composition, 'composition bands');
  const baselineFile = readJson(opts.baseline, 'composition baseline');
  const baseline = baselineFile?.metrics ?? null;

  const { chromium } = await loadPlaywright();
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    fail(2, 'could not launch Chromium (' + err.message + '). Run `npx playwright install chromium`.');
  }

  const measurements = [];
  try {
    for (const width of [...opts.viewports].sort((a, b) => a - b)) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        const response = await page.goto(opts.url, { waitUntil: 'networkidle', timeout: 30000 });
        if (response && !response.ok()) {
          fail(2, opts.url + ' responded ' + response.status() + ' at ' + width + 'px — nothing was measured.');
        }
      } catch (err) {
        fail(2, 'could not load ' + opts.url + ' at ' + width + 'px (' + err.message + '). Is the dev server running?');
      }
      const data = await page.evaluate(collectInPage);
      measurements.push({ viewport: width, ...data });

      if (opts.screenshots) {
        mkdirSync(opts.screenshots, { recursive: true });
        await page.screenshot({
          path: join(opts.screenshots, 'viewport-' + width + '.png'),
          fullPage: true,
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const blocking = [];
  const advisory = [];

  // --- Motion, in its own page loads ----------------------------------------
  const motionSpec = readJson(opts.motion, 'motion bands');
  if (motionSpec) {
    let motionBrowser;
    try {
      motionBrowser = await chromium.launch();
      const verdict = await checkMotion(motionBrowser, opts.url, motionSpec);
      blocking.push(...verdict.blocking);
      advisory.push(...verdict.advisory);
    } catch (err) {
      advisory.push('motion checks did not run (' + err.message + ')');
    } finally {
      if (motionBrowser) await motionBrowser.close();
    }
  }

  // --- Style axes, per viewport ---------------------------------------------
  for (const [axis, def] of Object.entries(bandSpec?.axes ?? {})) {
    const samples = measurements.map((m) => ({ viewport: m.viewport, value: m.axes[axis] ?? null }));
    const verdict = judgeAxis(axis, def.bands, samples);
    blocking.push(...verdict.blocking);
    advisory.push(...verdict.advisory);
  }

  // Depth is categorical, so it is judged against the selected band rather than
  // an anchor — the same rule the token gate applies to the source.
  const depth = bandSpec?.depth;
  if (depth?.selected) {
    const limit = depth.bands?.[depth.selected];
    for (const m of measurements) {
      if (typeof limit === 'number' && m.shadows > limit) {
        blocking.push(
          'depth at ' + m.viewport + 'px renders ' + m.shadows + ' shadowed element(s); band `' +
          depth.selected + '` tolerates ' + limit,
        );
      }
    }
  } else {
    advisory.push('depth: no band selected in ' + opts.bands + ', so the axis was not checked');
  }

  // --- Declared derivation vs what was built --------------------------------
  const widest = measurements[measurements.length - 1];
  if (opts.page && widest) {
    const grammarSpec = readJson(opts.grammar, 'grammar definitions');
    const declared = readJson(opts.pages, 'page compositions');
    const pages = declared?.pages ?? declared ?? {};
    const page = pages[opts.page];
    if (!page) {
      fail(2, 'no page named ' + JSON.stringify(opts.page) + ' in ' + opts.pages + ', so the declared composition could not be checked.');
    }
    const verdict = judgeDerivationRender(widest.perSection ?? [], page.sections ?? [], grammarSpec?.archetypes);
    blocking.push(...verdict.blocking);
    advisory.push(...verdict.advisory);
  }

  // --- Composition, at the widest viewport ----------------------------------
  const metrics = widest?.composition ?? {};
  if (opts.updateBaseline) {
    const body = {
      description:
        'Composition metrics recorded when the render gate was adopted. The gate demands no worse ' +
        'than these; the numbers may only move toward the declared floors.',
      recordedAt: new Date().toISOString(),
      viewport: widest?.viewport ?? null,
      metrics,
    };
    mkdirSync(dirname(opts.baseline), { recursive: true });
    writeFileSync(opts.baseline, JSON.stringify(body, null, 2) + '\n', 'utf-8');
    process.stdout.write('design-render: composition baseline recorded at ' + widest?.viewport + 'px\n');
    process.exit(0);
  }

  const composition = judgeComposition(metrics, compositionSpec, baseline);
  blocking.push(...composition.blocking);
  advisory.push(...composition.advisory);

  // --- Report ---------------------------------------------------------------
  for (const m of measurements) {
    const line = m.viewport + 'px: ' + m.sections + ' sections, rhythm ' + m.axes.rhythm +
      ', display ' + m.axes.type_contrast + ', radius ' + m.axes.shape + ', shadows ' + m.shadows;
    if (opts.verbose || blocking.length > 0) process.stderr.write('  ' + line + '\n');
  }
  if (opts.verbose || blocking.length > 0) {
    process.stderr.write('  composition@' + widest?.viewport + 'px: ' +
      Object.entries(metrics).map(([k, v]) => k + ' ' + round(v ?? 0)).join(', ') + '\n');
  }

  if (blocking.length > 0) {
    process.stderr.write('\nRender gate FAILED (' + blocking.length + ' blocking):\n');
    for (const line of blocking) process.stderr.write('  x ' + line + '\n');
    if (advisory.length > 0) {
      process.stderr.write('\nAlso reported (non-blocking):\n');
      for (const line of advisory) process.stderr.write('  - ' + line + '\n');
    }
    process.stderr.write(
      '\nThese are measurements of the rendered page, not of the design system. Fix them in the ' +
      'components and the stylesheet — editing DESIGN.md or the band files to match what rendered ' +
      'is the move every design gate here exists to catch.\n',
    );
    if (opts.screenshots) {
      process.stderr.write('Screenshots for this run: ' + opts.screenshots + '\n');
    }
    process.stdout.write('design-render: FAIL (' + blocking.length + ' blocking, ' + advisory.length + ' advisory)\n');
    process.exit(1);
  }

  if (advisory.length > 0 && opts.verbose) {
    process.stderr.write('\nRender gate passed with notes:\n');
    for (const line of advisory) process.stderr.write('  - ' + line + '\n');
  }
  // Said on the way out, every time, because this is the gate whose green most
  // looks like a verdict on the page. It is a verdict on the absence of the
  // defects named above: structure, cadence, integrity. Art direction and the
  // assets are the larger share of visual quality and nothing here measured them.
  process.stderr.write(
    '\nPassing means the measured defects are absent — bands, derivation, motion safety, composition ' +
    'floors. It is not a judgement that the page looks good: art direction and original assets are ' +
    'outside what any gate can settle, and a page can pass all of this and still be forgettable.\n',
  );
  process.stdout.write(
    'design-render: PASS (' + measurements.length + ' viewports, ' + advisory.length + ' advisory)\n',
  );
  process.exit(0);
}

main().catch((err) => fail(2, 'render gate crashed: ' + (err?.stack ?? err)));
