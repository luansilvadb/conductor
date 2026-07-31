# Effective Go

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format`/`typecheck` gates in `config.gates.manifest` — a
review MUST NOT re-derive it by hand. The judgment layer is what a reviewer reads.

Go is the ecosystem where this split is least controversial: `gofmt` is, in the
guide's own words, a non-negotiable automated standard, so every formatting rule
below is settled before a reviewer ever sees the diff.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| All code formatted with `gofmt` / `go fmt` | `gofmt -l` (gate: format) |
| Tabs for indentation; line wrapping left to the formatter | `gofmt` |
| `MixedCaps` / `mixedCaps`; no underscores in multi-word names | `revive:var-naming` |
| Exported vs unexported by initial case | `revive:exported` |
| Package names short, single-word, lowercase | `revive:package-comments`, `stylecheck ST1003` |
| Getters not prefixed with `Get` | `stylecheck ST1016` / `revive` |
| One-method interfaces named with the `-er` suffix | `stylecheck ST1003` |
| No parentheses around `if` conditions; braces mandatory | `gofmt` |
| Explicit `fallthrough`; cases do not fall through | compiler |
| Errors never discarded with the blank identifier | `errcheck` |
| Unused variables and imports | compiler |
| Suspect constructs (shadowing, printf mismatches, lost cancels) | `go vet` |

## Requires judgment

-   **Named result parameters:** use them where they clarify what is returned;
    they cost clarity when they invite naked returns in a long function.
-   **`defer` placement:** correct cleanup is mechanical to spot, but whether a
    `defer` belongs at acquisition or later — and whether it silently swallows an
    error — needs a reader.
-   **Small interfaces:** prefer many small interfaces to one large one. Whether
    an interface has grown past its purpose is a design judgement.
-   **Interface definition site:** Go interfaces belong with the consumer, not the
    implementer. Misplacement compiles fine and couples packages.
-   **Share memory by communicating.** Whether a given use of shared state should
    have been a channel is the core design question in concurrent Go, and no
    linter decides it.
-   **`panic` reserved for the truly unrecoverable.** Libraries should not panic.
    What counts as unrecoverable is a judgement about the caller's options.
-   **Error wrapping and message quality:** whether an error tells the caller
    something actionable cannot be linted.

## Removed

Explanations of `new` vs `make`, slices versus arrays, the comma-ok idiom,
goroutines, channels, and implicit interface satisfaction were removed. They teach
the language rather than constrain a choice, and the model already knows them —
carrying them here only dilutes the rules that do constrain something
(`config.styleguide_layers.removed`).

*Source: [Effective Go](https://go.dev/doc/effective_go)*
