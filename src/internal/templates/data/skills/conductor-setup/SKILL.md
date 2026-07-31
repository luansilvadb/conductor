---
name: conductor-setup
id: conductor-setup
description: ${i18n.t("skills.conductor-setup.description_short")}
---

## Role:
${i18n.t("skills.conductor-setup.role")}

## Background:
${i18n.t("skills.conductor-setup.background")}

## Preferences:
${i18n.t("skills.conductor-setup.preferences.0")}

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: ${i18n.t("skills.conductor-setup.profile_description")}

## Goals:
${i18n.list("skills.conductor-setup.goals")}

## Constraints:
${i18n.list("skills.conductor-setup.constraints")}

## Skills:
${i18n.list("skills.conductor-setup.skills")}

## Examples:
- **Greenfield Project Kickoff:** ${i18n.t("skills.conductor-setup.examples.greenfield_kickoff")}
- **Brownfield Project Resumption:** ${i18n.t("skills.conductor-setup.examples.brownfield_resumption")}
- **Style Guide Selection:** ${i18n.t("skills.conductor-setup.examples.style_guide_selection")}
- **Completion Handshake:** ${i18n.t("skills.conductor-setup.examples.completion_handshake")}

## OutputFormat:
${i18n.list("skills.conductor-setup.output_format")}

### Style Guide Recommendation — required wording
When presenting style guide options, open with: *${i18n.t("skills.conductor-setup.style_guide.recommendation")}* — `{stack}` MUST be replaced by the technology stack confirmed in the Technology Stack step. Justify the top recommendation with: *${i18n.t("skills.conductor-setup.style_guide.reason")}*

### Design System — required procedure
Applies only when the project renders a user interface; otherwise skip the step and record the skip per the `condition` on that entry of `config.files.setup_chain`. Read [`design-scales.md`](${config.protocols.design_authoring.path}) BEFORE drafting `${config.files.artifacts.design_system}` and follow its procedure exactly. Ask one single-choice `question` per axis, presenting the band names and what each implies — never the raw numbers. Choose ONE band per axis and copy its values verbatim; an averaged answer is the failure this step exists to prevent, and it is invisible once written. The `components` section is mandatory: contrast is only verified on declared `backgroundColor`/`textColor` pairs, so a design system without components carries no accessibility guarantee at all.

### Completion Report — required structure
On completion, report EXACTLY this structure, one line per generated artifact:

- Open with: *${i18n.t("skills.conductor-setup.completion.summary")}*
- `${config.files.artifacts.product}` — ${i18n.t("skills.conductor-setup.completion.product_file")} (`{vision}` = the product vision confirmed by the user)
- `${config.files.artifacts.design_system}` — ${i18n.t("skills.conductor-setup.completion.design_system_file")} — emit this line ONLY when the design system step ran
- `${config.files.artifacts.tech_stack}` — ${i18n.t("skills.conductor-setup.completion.tech_stack_file")} (`{stack}` = the confirmed technology stack)
- `${config.files.artifacts.decisions}` — ${i18n.t("skills.conductor-setup.completion.decisions_file")}
- `${config.files.artifacts.workflow}` — ${i18n.t("skills.conductor-setup.completion.workflow_file")} (`{coverage}` = `config.thresholds.coverage_min_percent`)
- `${config.directories.styleguides_dir}` — ${i18n.t("skills.conductor-setup.completion.styleguides_dir")} (`{languages}` = the languages whose style guides were installed)
- Close by asking: *${i18n.t("skills.conductor-setup.completion.next_action")}* If the user agrees, hand off to `${config.skills.names.new_track}`.

## Initialization:
${i18n.t("skills.conductor-setup.initialization")}

I will open with EXACTLY ONE of the three greetings below, chosen by the project state I detected during the audit. Never emit more than one, and never emit the labels themselves:

- **If `${config.directories.conductor_root}/${config.files.setup_marker}` already exists** (Conductor already initialized) → greet with: *${i18n.t("skills.conductor-setup.welcome.already_initialized")}*
- **Else if pre-existing source code was detected** (brownfield project) → greet with: *${i18n.t("skills.conductor-setup.welcome.brownfield")}* — `{stack_summary}` MUST be replaced by the one-line technology summary produced by the audit step (languages, framework, package manager).
- **Else** (empty project / no source code — greenfield) → greet with: *${i18n.t("skills.conductor-setup.welcome.greenfield")}* — `{steps}` MUST be replaced by these four narrative phases, in this exact order: (1) ${i18n.t("skills.conductor-setup.steps.discovery")}; (2) ${i18n.t("skills.conductor-setup.steps.product_definition")}; (3) ${i18n.t("skills.conductor-setup.steps.configuration")}; (4) ${i18n.t("skills.conductor-setup.steps.track_generation")}. These are the user-facing narrative; do NOT substitute the file-by-file execution checklist in `config.files.setup_chain[]`, which drives scaffolding rather than the greeting.
