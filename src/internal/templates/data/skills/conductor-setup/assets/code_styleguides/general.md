# General Code Style Principles

Language-agnostic principles that apply across everything in this project.

Rules are split into two layers (see `config.styleguide_layers`).

## Enforced by tooling

None, by design. Every principle in this file is a judgement about whether code
reads well to a human, and none of them survives translation into a rule a command
could decide. This section is present and deliberately empty so the split stays
uniform across every styleguide — an empty tooling layer is a finding about the
content, not an omission.

## Requires judgment

### Readability

-   Code should be easy to read and understand by humans.
-   Avoid overly clever or obscure constructs. Cleverness is a cost paid by every
    future reader to save the author once.

### Consistency

-   Follow existing patterns in the codebase.
-   Maintain consistent formatting, naming, and structure. Where a formatter or
    linter exists, it owns this and the review does not re-litigate it.

### Simplicity

-   Prefer simple solutions over complex ones.
-   Break down complex problems into smaller, manageable parts.

### Maintainability

-   Write code that is easy to modify and extend.
-   Minimize dependencies and coupling.
-   Keep files small enough to hold in view. A file approaching
    `config.thresholds.file_warn_lines` invites changes made with less than the
    whole picture visible; past `config.thresholds.file_max_lines` the structure
    gate blocks growth outright.

### Documentation

-   Document *why* something is done, not just *what*.
-   Keep documentation up-to-date with code changes. Documentation that has
    drifted is worse than none: it is believed.
