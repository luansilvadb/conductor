// Derivation checker for the composition grammar. Pure: no browser, no CLI, no
// filesystem beyond what the caller hands it, so the rules stay readable and
// testable on their own.
//
// A page declares its composition as an ordered list of archetype names. This
// file decides whether that list is a sentence the grammar can produce, and
// whether it satisfies the invariants that apply to every page regardless of
// grammar. Both halves matter and they fail differently:
//
//   - A derivation error means the page has the wrong SHAPE: no turn, two
//     resolves, a prove before anything was established. The fix is the order.
//   - An invariant error means the page has the right shape and no variety
//     inside it: six sections, four of them centred, nothing bleeding. The fix
//     is the choice of archetype, not the order.

/** Movement counts are either an exact number or an inclusive [min, max]. */
function bounds(count) {
  if (Array.isArray(count)) return { min: count[0], max: count[1] };
  return { min: count, max: count };
}

/**
 * Matches the sequence of roles against the movements, in order.
 *
 * Greedy with backtracking. The grammars here are tiny (five movements, a
 * handful of sections), so the simple exhaustive walk is both fast enough and
 * obviously correct — a hand-rolled greedy pass without backtracking silently
 * rejects valid pages whenever an optional movement precedes a required one.
 */
export function derives(roles, movements) {
  function walk(roleIndex, movementIndex) {
    if (movementIndex === movements.length) return roleIndex === roles.length;
    const { min, max } = bounds(movements[movementIndex].count);
    const role = movements[movementIndex].role;

    let taken = 0;
    while (taken < min) {
      if (roles[roleIndex + taken] !== role) return false;
      taken += 1;
    }
    for (let n = min; n <= max; n += 1) {
      if (n > 0 && roles[roleIndex + n - 1] !== role) break;
      if (walk(roleIndex + n, movementIndex + 1)) return true;
    }
    return false;
  }
  return walk(0, 0);
}

/** Human-readable account of where a sequence stops matching a grammar. */
function explainDerivation(roles, grammar) {
  const shape = grammar.movements
    .map((m) => {
      const { min, max } = bounds(m.count);
      return m.role + (min === max ? '×' + min : '×' + min + '-' + max);
    })
    .join(' → ');
  const missing = grammar.movements
    .filter((m) => bounds(m.count).min > 0 && !roles.includes(m.role))
    .map((m) => m.role);

  let detail = 'got ' + (roles.join(' → ') || '(no sections)');
  if (missing.length > 0) {
    detail += '; no section fills the ' + missing.join(' or ') + ' movement';
    if (missing.includes('turn')) {
      detail += ' — the turn is the movement a generated page always omits, and its absence is what makes a page read as a list rather than an argument';
    }
  }
  return 'expected ' + shape + '; ' + detail;
}

/**
 * Checks one page's declared composition.
 *
 * `sections` is the ordered list of archetype names the page claims to use.
 * Returns blocking and advisory findings; empty blocking means the derivation
 * is valid and every invariant held.
 */
export function checkDerivation(sections, spec, grammarName) {
  const blocking = [];
  const advisory = [];
  const archetypes = spec.archetypes ?? {};
  const grammar = (spec.grammars ?? {})[grammarName];

  if (!grammar) {
    blocking.push(
      'unknown grammar ' + JSON.stringify(grammarName) + '. Declared grammars: ' +
      Object.keys(spec.grammars ?? {}).join(', '),
    );
    return { blocking, advisory };
  }
  if (!Array.isArray(sections) || sections.length === 0) {
    blocking.push('the page declares no sections, so there is no composition to check');
    return { blocking, advisory };
  }

  const unknown = sections.filter((name) => !archetypes[name]);
  if (unknown.length > 0) {
    blocking.push(
      'unknown archetype(s): ' + [...new Set(unknown)].join(', ') +
      '. Compose from the declared vocabulary — inventing one here is how the grammar stops constraining anything. ' +
      'Available: ' + Object.keys(archetypes).join(', '),
    );
    return { blocking, advisory };
  }

  const resolved = sections.map((name) => ({ name, ...archetypes[name] }));

  // --- Shape ----------------------------------------------------------------
  const roles = resolved.map((s) => s.role);
  if (!derives(roles, grammar.movements)) {
    blocking.push('composition is not a valid `' + grammarName + '` page: ' + explainDerivation(roles, grammar));
  }

  // --- Variety --------------------------------------------------------------
  const inv = spec.invariants ?? {};

  for (let i = 1; i < resolved.length; i += 1) {
    if (resolved[i].name === resolved[i - 1].name) {
      blocking.push(
        'sections ' + i + ' and ' + (i + 1) + ' both use `' + resolved[i].name +
        '` — ' + (inv.no_adjacent_repeat?.why ?? 'adjacent repetition reads as a template'),
      );
    }
  }

  const centeredLimit = inv.max_centered_statement?.value;
  if (typeof centeredLimit === 'number') {
    const used = resolved.filter((s) => s.name === 'centered-statement').length;
    if (used > centeredLimit) {
      blocking.push(
        '`centered-statement` used ' + used + ' times, at most ' + centeredLimit + ' allowed — ' +
        (inv.max_centered_statement.why ?? ''),
      );
    }
  }

  const distinctLimit = inv.min_distinct_archetypes?.value;
  if (typeof distinctLimit === 'number') {
    const distinct = new Set(resolved.map((s) => s.name)).size;
    if (distinct < distinctLimit) {
      blocking.push(
        'only ' + distinct + ' distinct archetype(s), at least ' + distinctLimit + ' required — ' +
        (inv.min_distinct_archetypes.why ?? ''),
      );
    }
  }

  const bleedLimit = inv.min_bleeding_sections?.value;
  if (typeof bleedLimit === 'number') {
    const bleeding = resolved.filter((s) => s.bleeds === true).length;
    if (bleeding < bleedLimit) {
      blocking.push(
        'no section bleeds past its container (' + bleeding + ' of ' + bleedLimit + ' required) — ' +
        (inv.min_bleeding_sections.why ?? ''),
      );
    }
  }

  const densityLimit = inv.max_consecutive_same_density?.value;
  if (typeof densityLimit === 'number') {
    let run = 1;
    for (let i = 1; i <= resolved.length; i += 1) {
      if (i < resolved.length && resolved[i].density === resolved[i - 1].density) {
        run += 1;
        continue;
      }
      if (run > densityLimit) {
        blocking.push(
          run + ' consecutive sections share density `' + resolved[i - 1].density + '` (at most ' +
          densityLimit + ') — ' + (inv.max_consecutive_same_density.why ?? ''),
        );
      }
      run = 1;
    }
  }

  // Centre only. A run of left-entering sections is the reading direction; a run
  // of centred ones is the stack this whole file exists to prevent.
  const centreRun = inv.max_consecutive_centered_entry?.value;
  if (typeof centreRun === 'number') {
    let run = 0;
    for (let i = 0; i <= resolved.length; i += 1) {
      if (i < resolved.length && resolved[i].entry === 'center') {
        run += 1;
        continue;
      }
      if (run > centreRun) {
        blocking.push(
          run + ' consecutive sections enter from the centre (at most ' + centreRun + ') — ' +
          (inv.max_consecutive_centered_entry.why ?? ''),
        );
      }
      run = 0;
    }
  }

  const centreRatio = inv.max_centered_entry_ratio?.value;
  if (typeof centreRatio === 'number') {
    const centred = resolved.filter((s) => s.entry === 'center').length;
    const ratio = centred / resolved.length;
    if (ratio > centreRatio) {
      blocking.push(
        centred + ' of ' + resolved.length + ' sections enter from the centre (' + Math.round(ratio * 100) +
        '%, at most ' + Math.round(centreRatio * 100) + '%) — ' + (inv.max_centered_entry_ratio.why ?? ''),
      );
    }
  }

  return { blocking, advisory };
}

/**
 * The archetypes that would complete a partial composition — what the agent
 * should be told when it is stuck, instead of being left to guess.
 */
export function suggestions(sections, spec, grammarName) {
  const grammar = (spec.grammars ?? {})[grammarName];
  if (!grammar) return [];
  const out = [];
  for (const movement of grammar.movements) {
    const { min } = bounds(movement.count);
    const have = sections.filter((name) => spec.archetypes?.[name]?.role === movement.role).length;
    if (have < min) {
      const options = Object.entries(spec.archetypes ?? {})
        .filter(([, a]) => a.role === movement.role)
        .map(([name]) => name);
      out.push(movement.role + ': ' + options.join(', '));
    }
  }
  return out;
}
