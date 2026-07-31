# Google C++ Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format`/`typecheck` gates in `config.gates.manifest` — a
review MUST NOT re-derive it by hand. The judgment layer is what a reviewer reads.

`clang-format` with the Google style decides the entire formatting section;
`clang-tidy` with the `google-*`, `modernize-*` and `readability-*` checks decides
most of the rest.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| Every formatting rule: indent 2, column 80, brace placement, wrapping, spacing, pointer alignment, template spacing, `#` at line start, init-list layout, no namespace indent | `clang-format` (Google style) |
| `PascalCase` types, concepts, functions; `snake_case` variables; trailing `_` on class members | `readability-identifier-naming` |
| `k` + PascalCase constants and enumerators | `readability-identifier-naming` |
| Lowercase namespaces; `ALL_CAPS` macros | `readability-identifier-naming` |
| Accessors/mutators `count()` / `set_count(v)` | `readability-identifier-naming` |
| Header guards `<PROJECT>_<PATH>_<FILE>_H_` | `llvm-header-guard` |
| Include order: related, C system, C++ standard, other libs, project | `clang-format` `IncludeCategories` |
| Direct includes only (IWYU); no reliance on transitive includes | `include-what-you-use` |
| Never forward declare `std::` symbols | `google-build-using-namespace` / IWYU |
| `explicit` on single-argument constructors and conversion operators | `google-explicit-constructor` |
| Copy/move explicitly `= default` or `= delete` | `cppcoreguidelines-special-member-functions` |
| `override` used, `virtual` omitted on overrides | `modernize-use-override` |
| Use C++ casts (`static_cast`), never C casts | `cppcoreguidelines-pro-type-cstyle-cast` |
| `nullptr`, never `NULL` or `0` | `modernize-use-nullptr` |
| `using` instead of `typedef` | `modernize-use-using` |
| Prefer range-based `for` | `modernize-loop-convert` |
| Prefer `++i` over `i++` | `readability-pre-increment` |
| Brace initialization | `modernize-use-default-member-init` |
| `constexpr` / `consteval` where possible | `misc-const-correctness` |
| `noexcept` where correct | `performance-noexcept-move-constructor` |
| No `using namespace` | `google-build-using-namespace` |
| Anonymous namespaces or `static` for internal linkage in `.cc` | `misc-use-anonymous-namespace` |
| Locals declared at narrowest scope and initialized | `cppcoreguidelines-init-variables` |
| `switch` always has `default`; `[[fallthrough]]` explicit | `bugprone-switch-missing-default-case`, `implicit-fallthrough` |
| Floating-point literals carry a radix point | `readability-uppercase-literal-suffix` |
| `return result;` without parentheses | `clang-format` |
| Avoid `dynamic_cast` / `typeid` (RTTI) | `cppcoreguidelines-pro-type-*` |
| Exceptions forbidden | `-fno-exceptions` (compiler) |
| Prefer `sizeof(varname)` over `sizeof(type)` | `bugprone-sizeof-expression` |
| Functions under 40 lines | `readability-function-size` |
| Declaration order `public` → `protected` → `private` | `llvm-else-after-return` / review-assisted |

## Requires judgment

-   **Header self-containment and inline definitions.** The <10-line threshold for
    inline functions in headers is mechanical, but ODR safety and whether a
    definition belongs in the header at all is design.
-   **Structs vs classes.** `struct` only for passive data. Whether a type has
    grown behaviour past that line is a reader's call.
-   **Composition over inheritance; `public` inheritance only.** No tool decides
    that a hierarchy should have been composition.
-   **Operator overloading.** Judicious use only; binary operators as non-members;
    never overload `&&`, `||`, `,` or unary `&`. Whether an overload is intuitive
    is exactly the judgement.
-   **Parameter ordering and output style.** Inputs before outputs; prefer return
    values or `std::optional`; references for required outputs, pointers for
    optional ones. Mechanical to check once decided, semantic to decide.
-   **Overload sets.** Use only where behaviour is obvious across the set, and
    document the set under a single umbrella comment.
-   **Static and global lifetime.** Statics must be trivially destructible. The
    rule is checkable; whether a global should exist at all is not.
-   **Ownership.** Single fixed owner, transferred via smart pointers. Which
    component *should* own a resource is the design decision the smart pointer
    only records.
-   **Macros.** Avoid; prefer `constexpr`/`inline`. When unavoidable, define close
    to use and `#undef` immediately.
-   **Concepts over `enable_if`; r-value references restricted** to move
    operations, perfect forwarding, and consuming `*this`. Correct usage is
    contextual.
-   **Comment quality.** File, class and function comments must explain intent.
    Presence is lintable; usefulness is not.

## Removed

The C++20 version policy (target C++20, no modules, approved coroutine libraries
only, approved Boost subset) is a project-wide toolchain decision, not a style
rule — it belongs in `config.files.artifacts.decisions` and in the build
configuration, where it can be enforced rather than remembered
(`config.styleguide_layers.misplaced_rule_policy`).

*Source: [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)*
