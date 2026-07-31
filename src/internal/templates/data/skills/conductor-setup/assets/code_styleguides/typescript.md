# Google TypeScript Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format`/`typecheck` gates in `config.gates.manifest` — a
review MUST NOT re-derive it by hand. The judgment layer is what a reviewer reads.

Google's own guide is enforced by `gts`, which already ships most of the tooling
layer below.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| Use `const`/`let`; `var` is forbidden; `const` by default | `no-var`, `prefer-const` |
| ES6 modules; do not use `namespace` | `@typescript-eslint/no-namespace` |
| Named exports; no default exports | `import/no-default-export` |
| Do not use `#private` fields; use the `private` modifier | `no-restricted-syntax` (PrivateIdentifier) |
| Mark never-reassigned properties `readonly` | `@typescript-eslint/prefer-readonly` |
| Never write the `public` modifier | `@typescript-eslint/explicit-member-accessibility` (`no-public`) |
| Function declarations for named functions; arrows for anonymous | `func-style` |
| Single quotes; template literals for interpolation | `quotes` |
| Always `===` / `!==` | `eqeqeq` |
| Avoid non-nullability assertions (`y!`) | `@typescript-eslint/no-non-null-assertion` |
| Avoid `any`; prefer `unknown` or a specific type | `@typescript-eslint/no-explicit-any` |
| Do not instantiate `String`/`Boolean`/`Number` wrappers | `no-new-wrappers` |
| Terminate statements with semicolons; never rely on ASI | `semi` |
| Do not use `const enum` | `no-restricted-syntax` (TSEnumDeclaration[const=true]) |
| `eval()` and `Function(...string)` forbidden | `no-eval`, `no-new-func` |
| `UpperCamelCase` for classes, interfaces, types, enums, decorators | `@typescript-eslint/naming-convention` |
| `lowerCamelCase` for variables, parameters, functions, methods, properties | `@typescript-eslint/naming-convention` |
| `CONSTANT_CASE` for global constants and enum values | `@typescript-eslint/naming-convention` |
| No `_` prefix or suffix on identifiers | `@typescript-eslint/naming-convention` |
| `T[]` for simple types, `Array<T>` for unions | `@typescript-eslint/array-type` (`array-simple`) |
| Do not use the `{}` type | `@typescript-eslint/no-empty-object-type` |
| No types in `@param` / `@return` — redundant in TypeScript | `jsdoc/no-types` |

## Requires judgment

-   **Type assertions:** avoid `x as SomeType`. Where one is unavoidable, the
    assertion must carry a justification explaining why the compiler cannot know
    what the author knows. The assertion is mechanical; the adequacy of the
    justification is the review's concern.
-   **Type inference:** rely on inference for simple, obvious types; be explicit
    for complex ones. "Complex" has no mechanical threshold — judge whether a
    reader can reconstruct the type without running the compiler.
-   **Optional vs `|undefined`:** prefer optional parameters and fields (`?`) over
    adding `|undefined` to a type.
-   **JSDoc vs implementation comments:** `/** JSDoc */` documents the API; `//`
    explains the implementation. Using one where the other belongs misleads about
    the intended audience.
-   **Comments must add information.** A comment restating the code is worse than
    no comment: it doubles the surface that can go stale.

## Moved out of this guide

-   **`undefined` vs `null` consistency** is a project-wide architectural choice,
    not a per-file style rule. Record it once in `config.files.artifacts.decisions`
    (see `config.styleguide_layers.misplaced_rule_policy`) instead of asking every
    review to re-decide it.

*Source: [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)*
