# Google JavaScript Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format` gates in `config.gates.manifest` — a review MUST
NOT re-derive it by hand. The judgment layer is what a reviewer reads.

Nearly this entire guide is mechanical: `eslint` plus `prettier` decide it.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| File names lowercase with `_` or `-`; extension `.js` | `unicorn/filename-case` |
| UTF-8 encoding; ASCII spaces only; tabs forbidden | `no-irregular-whitespace`, `no-tabs` |
| New files are ES modules (`import`/`export`) | `sourceType: module` |
| Named exports; no default exports | `import/no-default-export` |
| No line-wrapped imports; `.js` extension mandatory in paths | `import/extensions` |
| Braces required for all control structures; K&R style | `curly`, `brace-style` |
| Indent +2 spaces per block | `indent` / `prettier` |
| Every statement terminated with a semicolon | `semi` |
| Column limit 80; continuation lines indented +4 | `max-len` / `prettier` |
| Single blank line between methods; no trailing whitespace | `no-trailing-spaces`, `padded-blocks` |
| `const` by default, `let` when reassigned; `var` forbidden | `no-var`, `prefer-const` |
| Trailing commas; no `Array`/`Object` constructors | `comma-dangle`, `no-array-constructor`, `no-new-object` |
| Object literal shorthand | `object-shorthand` |
| No JavaScript getter/setter properties | `accessor-pairs` / `no-restricted-syntax` |
| Arrow functions for nested functions | `prefer-arrow-callback` |
| Single quotes; template literals for multi-line | `quotes`, `prefer-template` |
| Prefer `for-of`; `for-in` only on dict-style objects | `no-restricted-syntax`, `guard-for-in` |
| `this` only in constructors, methods, or arrows within them | `no-invalid-this` |
| Always `===` / `!==` | `eqeqeq` |
| `with` forbidden | `no-with` |
| `eval()` / `Function(...string)` forbidden | `no-eval`, `no-new-func` |
| Never rely on ASI | `semi` |
| Do not modify builtin objects | `no-extend-native` |
| `UpperCamelCase` classes; `lowerCamelCase` methods, functions, fields, variables | `camelcase` / `@typescript-eslint/naming-convention` |
| `CONSTANT_CASE` for constants | `@typescript-eslint/naming-convention` |
| JSDoc present on classes, fields, methods | `jsdoc/require-jsdoc` |
| JSDoc types enclosed in braces | `jsdoc/valid-types` |

## Requires judgment

-   **`this` binding intent.** Preferring arrow functions to preserve `this` is
    mechanical; whether the surrounding code *should* depend on `this` at all is
    not. Flag designs that need lexical `this` to stay correct.
-   **JSDoc completeness and accuracy.** A linter can require the tag; only a
    reader can tell whether `@param` describes what the parameter actually means
    or merely restates its name.
-   **Choice of `@deprecated` / `@override`.** Whether a member genuinely
    overrides or is genuinely deprecated is semantic, not syntactic.

*Source: [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)*
