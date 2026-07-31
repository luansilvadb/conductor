# Google Python Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format` gates in `config.gates.manifest` — a review MUST
NOT re-derive it by hand. The judgment layer is what a reviewer reads.

`ruff` alone covers most of the tooling layer; `black` handles the formatting rules
and `pylint` the rest.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| Line length maximum 80 | `E501` / `black` |
| 4 spaces per indent; never tabs | `W191`, `E101` / `black` |
| Two blank lines between top-level defs; one between methods | `E301`–`E303` / `black` |
| No extraneous whitespace; single spaces around binary operators | `E2xx` / `black` |
| f-strings for formatting | `UP032` |
| Consistent quote style | `Q000` / `black` |
| `TODO(username):` format | `TD002`, `FIX002` |
| Imports on separate lines, grouped stdlib / third-party / local | `E401`, `I001` |
| `import x` for modules; `from x import y` only for submodules | `TID252` |
| No bare `except:` | `E722` |
| No mutable default argument values | `B006` |
| Implicit false for emptiness; `is None` for None | `E711`, `E712` |
| Module-level constants `ALL_CAPS_WITH_UNDERSCORES` | `N816` / `pylint` naming |
| `snake_case` modules, functions, methods, variables | `N801`–`N816` |
| `PascalCase` classes | `N801` |
| Single leading underscore for internal members | `pylint` naming |
| Docstring present on every public module, function, class, method | `D100`–`D103` |
| Docstring uses triple double quotes | `D300` |
| Docstring starts with a one-line summary | `D205`, `D415` |
| Executable files use `main()` under `if __name__ == '__main__':` | `pylint` |

## Requires judgment

-   **Comprehensions:** use for simple cases; prefer an explicit loop where the
    logic is complex enough that the comprehension stops reading as one thought.
    The line between the two is the reviewer's call.
-   **Mutable global state:** avoid it. Module-level constants are fine. Whether a
    given module-level object is a constant or disguised state is semantic.
-   **Type annotations on public APIs:** strongly encouraged. What counts as a
    public API — and how precise the annotation should be — needs a reader.
-   **Docstring content:** the tool checks that `Args:` / `Returns:` / `Raises:`
    exist. Only a reader can tell whether they describe reality.

*Source: [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)*
