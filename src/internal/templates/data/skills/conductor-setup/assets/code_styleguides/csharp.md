# Google C# Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format`/`typecheck` gates in `config.gates.manifest` — a
review MUST NOT re-derive it by hand. The judgment layer is what a reviewer reads.

`.editorconfig` plus `dotnet format` and the built-in Roslyn analyzers decide the
tooling layer; most entries below map to an `IDExxxx` or `CAxxxx` rule id.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| `PascalCase` for classes, methods, constants, properties, namespaces, public fields | `IDE1006` naming style |
| `_camelCase` for private/internal/protected fields | `IDE1006` naming style |
| `camelCase` for locals and parameters | `IDE1006` naming style |
| Interfaces prefixed with `I` | `IDE1006` / `CA1715` |
| Type parameters prefixed with `T` | `CA1715` |
| Indent 2 spaces, never tabs | `.editorconfig` `indent_size` |
| K&R braces; `} else` on one line; braces even when optional | `csharp_new_line_before_open_brace`, `IDE0011` |
| Column limit 100 | `.editorconfig` |
| One statement per line | `.editorconfig` |
| Access modifiers always explicit | `IDE0040` |
| Standard modifier order | `IDE0036` |
| `using` directives outside namespaces, `System` first, then alphabetical | `IDE0065`, `IDE0055` |
| `const` where possible, otherwise `readonly` | `IDE0044`, `CA2211` |
| Null-conditional / null-coalescing over explicit null checks | `IDE0031`, `IDE0029` |
| Pattern matching for type checks and casts | `IDE0020`, `IDE0038` |
| Collection and object initializers | `IDE0028`, `IDE0017` |
| One top-level type per file, file named after it | `SA1402`, `SA1649` (StyleCop) |

## Requires judgment

-   **`var` vs explicit type.** Permitted where it aids readability by removing
    noisy or obvious type names; prefer an explicit type where it clarifies. This
    is exactly the trade-off a rule cannot see.
-   **Expression-bodied members.** Fine for simple properties and lambdas; avoid
    on method definitions. "Simple" is the reviewer's call.
-   **String interpolation vs `StringBuilder`.** Read for clarity by default; the
    performance exception applies only in hot paths, and identifying a hot path is
    judgement.
-   **Structs vs classes.** Almost always a class. A struct needs a positive
    argument: small, value-like, short-lived or frequently embedded.
-   **Collection type at API boundaries.** Most restrictive type for inputs
    (`IEnumerable`, `IReadOnlyList`); `IList` for returns only when transferring
    ownership of something mutable. This encodes intent, not syntax.
-   **`List<>` vs array.** Prefer `List<>` in public surface; arrays for fixed,
    construction-time sizes or multidimensional data.
-   **Extension methods.** Only when the source is unavailable or infeasible to
    change, and only for core, general features — they obscure where behaviour
    comes from.
-   **LINQ in hot paths.** Use it for readability; know when the allocation
    matters.
-   **Declaration order.** Members grouped by kind, then by accessibility, with
    interface implementations kept together. Partially analyzer-checkable; the
    grouping intent is not.
-   **Argument clarity.** When a call site reads as `Calculate(values, 7, false, null)`,
    replace the bare arguments with named constants, an enum, named arguments, or
    an options object. Whether a call site is unclear is the whole judgement.
-   **`out` parameters.** Permitted for output-only values, placed last; prefer a
    tuple or a return type when it reads better.

*Source: [Google C# Style Guide](https://google.github.io/styleguide/csharp-style.html)*
