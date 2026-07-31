# Effective Dart

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format`/`typecheck` gates in `config.gates.manifest` — a
review MUST NOT re-derive it by hand. The judgment layer is what a reviewer reads.

Effective Dart is unusual in that most of its `DO` and `DON'T` entries already ship
as named lint rules in `package:lints` / `package:flutter_lints`. Enable them in
`analysis_options.yaml` and the tooling layer below enforces itself; `dart format`
covers the rest.

## Enforced by tooling

| Rule | Lint rule |
| --- | --- |
| `UpperCamelCase` types, extensions, enums | `camel_case_types` |
| `lowercase_with_underscores` packages, directories, files, import prefixes | `file_names`, `library_prefixes` |
| `lowerCamelCase` members, top-level definitions, variables, parameters, constants | `non_constant_identifier_names`, `constant_identifier_names` |
| Acronyms longer than two letters capitalized as words | `camel_case_types` |
| No leading underscore on non-private identifiers | `no_leading_underscores_for_local_identifiers` |
| No prefix letters (`kDefaultTimeout`) | `constant_identifier_names` |
| No explicit `library` directive naming | `unnecessary_library_name` |
| `dart:` imports first, then `package:`, then relative; exports after imports; sections sorted | `directives_ordering` |
| Code formatted with `dart format`; lines ≤ 80 | `dart format` (gate: format) |
| Curly braces on all flow control statements | `curly_braces_in_flow_control_structures` |
| Comments formatted as sentences | `slash_for_doc_comments` |
| No block comments for documentation; `///` for doc comments | `slash_for_doc_comments` |
| Doc comments start with a single-sentence summary in its own paragraph | `lines_longer_than_80_chars` / analyzer docs |
| No documentation on both getter and setter | `unnecessary_getters_setters` |
| Backtick fences for code blocks in docs | analyzer docs |
| Strings in `part of` directives | `use_string_in_part_of_directives` |
| No imports into another package's `src` | `implementation_imports` |
| Import paths never reach into or out of `lib`; relative within `lib` | `avoid_relative_lib_imports`, `prefer_relative_imports` |
| No explicit `null` initialization or default | `avoid_init_to_null` |
| No `true`/`false` in equality operations | `no_literal_bool_comparisons` |
| Adjacent strings for literal concatenation | `prefer_adjacent_string_concatenation` |
| Interpolation over concatenation; no unnecessary braces | `prefer_interpolation_to_compose_strings`, `unnecessary_brace_in_string_interps` |
| Collection literals | `prefer_collection_literals` |
| `.isEmpty` / `.isNotEmpty`, never `.length` for emptiness | `prefer_is_empty`, `prefer_is_not_empty` |
| `for-in` over `Iterable.forEach()` with a literal | `avoid_function_literals_in_foreach_calls` |
| `.toList()` over `List.from()` | `prefer_iterable_whereType` family |
| `whereType()` to filter by type | `prefer_iterable_whereType` |
| Function declarations to bind a function to a name | `prefer_function_declarations_over_variables` |
| Tear-offs instead of trivial lambdas | `unnecessary_lambdas` |
| No unnecessary getter/setter wrapping of a field | `unnecessary_getters_setters` |
| `final` field for a read-only property | `prefer_final_fields` |
| No `this.` except to disambiguate or redirect | `unnecessary_this` |
| Fields initialized at declaration where possible | `initialize_fields_at_declaration` |
| Initializing formals (`this.field`) | `prefer_initializing_formals` |
| `;` instead of `{}` for empty constructor bodies | `empty_constructor_bodies` |
| No `new`; no redundant `const` | `unnecessary_new`, `unnecessary_const` |
| No `catch` without `on`; errors not discarded | `avoid_catches_without_on_clauses` |
| Never catch `Error` or its implementers | `avoid_catching_errors` |
| `rethrow` to preserve the stack trace | `use_rethrow_when_possible` |
| `async`/`await` over raw futures; no pointless `async` | `unnecessary_await_in_return` |
| No positional boolean parameters | `avoid_positional_boolean_parameters` |
| `hashCode` overridden whenever `==` is | `hash_and_equals` |
| `==` parameter not nullable | `avoid_null_checks_in_equality_operators` |
| Type-annotate variables without initializers; annotate return and parameter types | `always_declare_return_types`, `type_annotate_public_apis` |
| No redundant annotation on initialized locals or initializing formals | `omit_local_variable_types`, `type_init_formals` |
| Type arguments written only where not inferred | `inference_failure_on_*` |
| No legacy `typedef` syntax | `prefer_generic_function_type_aliases` |
| `Future<void>` for async members producing no value | `avoid_void_async` |
| Private declarations preferred | `library_private_types_in_public_api` |

## Requires judgment

-   **Formatter-friendly code.** Shortening identifiers or flattening nested
    expressions so the formatter produces readable output is a rewrite decision,
    not a lint fix.
-   **Doc comment prose.** Third-person verbs for side-effecting functions, noun
    phrases for properties, "Whether…" for booleans, brevity, avoiding redundancy
    with surrounding context, judicious code samples. The analyzer checks that a
    doc comment exists; every one of these is about whether it is *good*.
-   **`late` variables.** Avoid where you need to test initialization; prefer a
    nullable type. Which of the two a given field is depends on the lifecycle.
-   **`var` vs `final` for locals.** Pick one rule and hold to it project-wide —
    a consistency decision, not a per-site one.
-   **Don't store what you can calculate.** Whether a field is a cache or
    duplicated state is semantic.
-   **API naming.** Most descriptive noun last; imperative verb phrases for
    side-effecting methods; noun phrases for value-returning ones; `to___()` for
    copies and `as___()` for views; positive boolean names; consistent terms
    across the API; code that reads like a sentence at the call site. This whole
    section is the reviewer's core work.
-   **Class and mixin design.** Avoid one-member abstract classes where a function
    would do; avoid static-only classes; avoid extending or implementing types not
    intended for it; use class modifiers deliberately to express what may be
    extended or implemented.
-   **Getters and setters as concepts.** A getter must be side-effect-free and
    idempotent; a setter must not exist without a getter. Whether an operation is
    conceptually a property access is judgement.
-   **Avoid faking overloading with runtime type tests**, avoid returning
    nullable `Future`/`Stream`/collections, avoid returning `this` for fluency —
    prefer cascades.
-   **Parameter design.** Avoid optional positional parameters the caller may want
    to skip past; avoid mandatory parameters that accept a "no argument" sentinel;
    use inclusive-start / exclusive-end ranges.
-   **Custom equality on mutable classes.** Avoid. When it appears, the question
    is whether the class should be immutable instead.
-   **`dynamic`.** Annotate with it deliberately rather than letting inference
    fail silently — but every use disables static checking, and whether that
    trade is worth it is contextual.

*Sources: [Effective Dart — Style](https://dart.dev/effective-dart/style),
[Documentation](https://dart.dev/effective-dart/documentation),
[Usage](https://dart.dev/effective-dart/usage),
[Design](https://dart.dev/effective-dart/design)*
