#!/usr/bin/env node
// Composition grammar gate. Checks that every page the project declares is a
// valid sentence in the grammar, before anything is built.
//
// This is the earliest of the design gates and the cheapest to satisfy: it
// reads a list of archetype names, not code, so it can run while the page is
// still an outline. That is deliberate. Composition is decided when the page is
// planned; catching a centred stack after it is implemented means asking for a
// rewrite, and an agent asked to rewrite a layout it already built will nudge
// rather than recompose.
//
// Exit codes: 0 pass, 1 violation, 2 harness failure.
//
// Usage:
//   node conductor/gates/design-grammar-gate.mjs
//        [--pages <composition.json>] [--grammar <design-grammar.json>] [--page <name>]

import { existsSync, readFileSync } from 'node:fs';
import { fail } from './design-cli.mjs';
import { checkDerivation, suggestions } from './design-grammar-check.mjs';

function parseArgs(argv) {
  const opts = {
    pages: 'conductor/design/composition.json',
    grammar: 'conductor/gates/design-grammar.json',
    page: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--pages') opts.pages = argv[++i];
    else if (arg === '--grammar') opts.grammar = argv[++i];
    else if (arg === '--page') opts.page = argv[++i];
  }
  return opts;
}

function readJson(path, what) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    fail(2, what + ' at ' + path + ' is unreadable (' + err.message + ')');
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const spec = readJson(opts.grammar, 'grammar definitions');
  if (!spec) {
    fail(2, 'no grammar at ' + opts.grammar + '. Conductor ships one; restore it or declare this gate absent in the manifest.');
  }

  const declared = readJson(opts.pages, 'page compositions');
  if (!declared) {
    fail(
      2,
      'no page compositions at ' + opts.pages + ', so no composition was checked.\n' +
      'Declare each page as { "grammar": <one of ' + Object.keys(spec.grammars ?? {}).join('|') + '>, ' +
      '"sections": [<archetype names in order>] }.\n' +
      'Archetypes available: ' + Object.keys(spec.archetypes ?? {}).join(', '),
    );
  }

  const pages = Object.entries(declared.pages ?? declared).filter(([name]) => !name.startsWith('$'));
  if (pages.length === 0) {
    fail(2, opts.pages + ' declares no pages. An empty composition file checks nothing.');
  }

  const selected = opts.page ? pages.filter(([name]) => name === opts.page) : pages;
  if (selected.length === 0) {
    fail(2, 'no page named ' + JSON.stringify(opts.page) + ' in ' + opts.pages);
  }

  let blockingTotal = 0;
  for (const [name, page] of selected) {
    const sections = page?.sections ?? [];
    const grammar = page?.grammar;
    if (!grammar) {
      fail(2, 'page ' + JSON.stringify(name) + ' declares no grammar. Pick one of: ' + Object.keys(spec.grammars ?? {}).join(', '));
    }

    const { blocking } = checkDerivation(sections, spec, grammar);
    if (blocking.length === 0) continue;

    blockingTotal += blocking.length;
    process.stderr.write('\n' + name + ' (' + grammar + ', ' + sections.length + ' sections):\n');
    for (const line of blocking) process.stderr.write('  x ' + line + '\n');

    const hints = suggestions(sections, spec, grammar);
    if (hints.length > 0) {
      process.stderr.write('  Archetypes that would fill the missing movements:\n');
      for (const hint of hints) process.stderr.write('    ' + hint + '\n');
    }
  }

  if (blockingTotal > 0) {
    process.stderr.write(
      '\nCompose from the declared vocabulary rather than adjusting it. Adding an archetype, raising an ' +
      'invariant or inventing a grammar to make a page pass is the same move as widening the token set ' +
      'to fit a component — if the vocabulary genuinely lacks a shape this product needs, that is a ' +
      'design decision and belongs to a design track.\n',
    );
    process.stdout.write('design-grammar: FAIL (' + blockingTotal + ' blocking across ' + selected.length + ' page(s))\n');
    process.exit(1);
  }

  process.stdout.write('design-grammar: PASS (' + selected.length + ' page(s))\n');
  process.exit(0);
}

main();
