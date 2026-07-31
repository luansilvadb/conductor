# Google HTML/CSS Style Guide

Rules are split into two layers (see `config.styleguide_layers`). The tooling layer
is decided by the `lint`/`format` gates in `config.gates.manifest` — a review MUST
NOT re-derive it by hand. The judgment layer is what a reviewer reads.

`stylelint` and `prettier` cover the CSS side; an HTML linter plus `prettier` cover
the markup side.

## Enforced by tooling

| Rule | Tool rule |
| --- | --- |
| Indent by 2 spaces; no tabs | `prettier` |
| Lowercase for elements, attributes, selectors, properties | `stylelint` case rules, HTML linter |
| No trailing whitespace | `prettier` |
| UTF-8 without BOM; `<meta charset="utf-8">` present | HTML linter |
| `<!doctype html>` present | `htmlhint doctype-first` |
| Valid HTML | HTML validator |
| Omit `type` on `<link>` and `<script>` | `htmlhint` |
| New line per block/list/table element; children indented | `prettier` |
| Double quotes for HTML attribute values | `prettier` |
| Valid CSS | `stylelint` |
| Hyphen-separated class names | `stylelint selector-class-pattern` |
| No ID selectors for styling | `stylelint selector-max-id` |
| Shorthand properties where possible | `stylelint shorthand-property-no-redundant-values` |
| Omit units on zero values | `stylelint length-zero-no-unit` |
| Leading zeros on decimals | `stylelint number-leading-zero` |
| 3-character hex where possible | `stylelint color-hex-length` |
| Avoid `!important` | `stylelint declaration-no-important` |
| Alphabetized declarations within a rule | `stylelint-order` |
| Semicolon after every declaration | `stylelint declaration-block-trailing-semicolon` |
| Space after property colon; space before opening brace | `prettier` |
| New line per selector and declaration; rules separated by a blank line | `prettier` |
| Single quotes in attribute selectors and property values | `stylelint string-quotes` |
| HTTPS for embedded resources | `stylelint function-url-scheme-allowed-list` |

## Requires judgment

-   **Semantics.** Use elements for their intended purpose — `<p>` for paragraphs,
    not for spacing. A validator confirms the markup parses; only a reader
    confirms it means what the element claims.
-   **Multimedia fallback.** `alt` text and captions must be *present* (linted)
    and *useful* (not). `alt="image"` passes every tool and helps nobody.
-   **Separation of concerns.** Structure, presentation and behaviour stay in
    HTML, CSS and JS respectively. Whether a given piece of logic has leaked
    across that boundary is a design call.
-   **Class naming.** `.video-player` over `.vid`, and never `.red-text`. The rule
    is that a name describes purpose rather than appearance; a pattern lint
    enforces the shape of the name, never its meaning.

*Source: [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)*
