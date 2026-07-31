// Judgement half of the render gate, kept free of any browser so it can be
// tested and reasoned about on its own.
//
// The other design gates read what the project DECLARED: design-gate.mjs proves
// DESIGN.md is internally sound, design-tokens-gate.mjs proves the source
// contains no literal outside the token set. Both are blind in the same
// direction, and it is the direction that decides what the user sees:
//
//   - A utility class carries no literal. `rounded-md`, `text-3xl` and `gap-8`
//     contain no digit and no unit, so a Tailwind/UnoCSS/Panda interface passes
//     the token scan while rendering whatever the framework's default scale
//     says — which is the average of the web, the exact thing the bands exist
//     to avoid. The same hole swallows CSS custom properties and any component
//     library with semantic props (`<Button radius="md">`).
//   - Bands are checked once, against the document. A system may declare
//     `expressive` type and `airy` rhythm, then collapse to 2.0x and a 64px
//     section gap under a media query — landing on the mean answer in the very
//     viewport a mobile-first project calls primary — and every declaration
//     check still passes, because nothing here has a notion of breakpoint.
//
// So this file judges measurements taken from the rendered page, per viewport.
// A value that survives compilation and the cascade is the value the user gets,
// whatever name produced it.

/** Bands are exact anchors, never nearest-match: see design-bands.json. */
export function bandOf(value, bands) {
  const hit = Object.entries(bands).find(([, v]) => v === value);
  return hit ? hit[0] : null;
}

/**
 * Judges one axis across every viewport.
 *
 * Two distinct failures, deliberately kept apart in the message because they
 * have different fixes: a value that is in no band at all (the axis was
 * averaged), and values that are each in a band but not the SAME band (the
 * system silently changes identity at a breakpoint, which no token can express
 * and no reviewer reads a stylesheet closely enough to catch).
 */
export function judgeAxis(axis, bands, samples) {
  const blocking = [];
  const advisory = [];
  const options = Object.entries(bands).map(([n, v]) => n + ' ' + v).join(', ');

  const measured = samples.filter((s) => typeof s.value === 'number' && Number.isFinite(s.value));
  if (measured.length === 0) {
    advisory.push(axis + ': nothing measurable in any viewport, so the axis was not checked');
    return { blocking, advisory };
  }

  const landed = new Map();
  for (const sample of measured) {
    const band = bandOf(sample.value, bands);
    if (band === null) {
      blocking.push(
        axis + ' at ' + sample.viewport + 'px is ' + sample.value + ', which is no band. Expected one of ' +
        options + ' — a value between bands is the averaged answer this axis exists to prevent',
      );
      continue;
    }
    if (!landed.has(band)) landed.set(band, []);
    landed.get(band).push(sample.viewport);
  }

  if (landed.size > 1) {
    const spread = [...landed.entries()]
      .map(([band, viewports]) => band + ' at ' + viewports.join('/') + 'px')
      .join(', ');
    blocking.push(
      axis + ' changes band across viewports: ' + spread +
      '. The design system declares one band per axis; a breakpoint that moves it means the declared identity is not what renders',
    );
  }

  return { blocking, advisory };
}

/**
 * Composition metrics, which the band architecture never reached.
 *
 * design-scales.md is explicit that its bands "constrain style, not
 * composition", and hands hierarchy, density and grid tension to the prose of
 * DESIGN.md. The same document opens by stating why prose cannot carry it:
 * "Prose does not move it; the model regresses to the mean on the next token.
 * What does move it is removing the choice." So the axis that decides whether a
 * page looks designed was left to the one instrument the framework itself
 * classifies as inoperative — and seven identical centred sections pass every
 * gate that exists.
 *
 * These are counted on the rendered DOM, which is what makes them gateable at
 * all. They are intentionally crude: each one is a floor against sameness, not
 * a definition of good composition. A page can clear all of them and still be
 * poor; a page that fails them is uniform in a way no design intends.
 */
export function judgeComposition(metrics, spec, baseline) {
  const blocking = [];
  const advisory = [];
  if (!spec || typeof spec !== 'object') return { blocking, advisory };

  for (const [name, rule] of Object.entries(spec.metrics ?? {})) {
    const value = metrics[name];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      advisory.push('composition.' + name + ': not measurable on this page');
      continue;
    }

    const prior = baseline?.[name];
    let violated = false;
    let expectation = '';

    if (typeof rule.max === 'number') {
      // Ratcheted: a page already above the ceiling is held where it is rather
      // than blocked, matching every other ratchet in the framework.
      const limit = typeof prior === 'number' ? Math.max(rule.max, prior) : rule.max;
      violated = value > limit;
      expectation = 'at most ' + rule.max + (limit !== rule.max ? ' (held at ' + limit + ' by the baseline)' : '');
    } else if (typeof rule.min === 'number') {
      const limit = typeof prior === 'number' ? Math.min(rule.min, prior) : rule.min;
      violated = value < limit;
      expectation = 'at least ' + rule.min + (limit !== rule.min ? ' (held at ' + limit + ' by the baseline)' : '');
    } else {
      continue;
    }

    const line = 'composition.' + name + ' is ' + round(value) + ', expected ' + expectation +
      (rule.why ? ' — ' + rule.why : '');
    if (violated) {
      if (rule.severity === 'warn') advisory.push(line);
      else blocking.push(line);
    }
  }

  return { blocking, advisory };
}

export function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Confirms the page BUILT the composition it declared.
 *
 * The grammar gate reads a list of archetype names and can only trust it. That
 * makes declaring `hero-split` and then rendering one more centred stack the
 * obvious way to satisfy it without composing anything — and it is invisible to
 * every check that reads the manifest rather than the page. This closes that
 * loop with the two properties the archetypes actually promise and a browser can
 * actually measure: where the eye enters, and whether anything leaves the frame.
 *
 * Grid shape is deliberately NOT checked. `5fr 7fr` can be honoured by flex, by
 * grid, by a max-width and a margin, or by a layout that reads identically and
 * shares none of those; asserting the mechanism would reject correct pages and
 * teach people to write the markup the gate recognises rather than the markup
 * the page needs.
 */
export function judgeDerivationRender(perSection, declaredSections, archetypes) {
  const blocking = [];
  const advisory = [];
  if (!Array.isArray(declaredSections) || declaredSections.length === 0) return { blocking, advisory };

  if (perSection.length !== declaredSections.length) {
    advisory.push(
      'the page declares ' + declaredSections.length + ' sections and renders ' + perSection.length +
      ', so the declared composition could not be matched section by section',
    );
    return { blocking, advisory };
  }

  for (let i = 0; i < declaredSections.length; i += 1) {
    const name = declaredSections[i];
    const spec = archetypes?.[name];
    if (!spec) continue;
    const actual = perSection[i];

    if (spec.entry && actual.entry !== spec.entry) {
      blocking.push(
        'section ' + (i + 1) + ' declares `' + name + '` (enters from the ' + spec.entry +
        ') but renders entering from the ' + actual.entry +
        (actual.entry === 'center'
          ? ' — declaring an asymmetric archetype and centring it anyway is the composition equivalent of widening a token'
          : ''),
      );
    }
    if (spec.bleeds === true && actual.bleeds !== true) {
      blocking.push(
        'section ' + (i + 1) + ' declares `' + name + '`, which bleeds past its container, but nothing in it leaves the container',
      );
    }
  }

  return { blocking, advisory };
}
