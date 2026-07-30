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
${i18n.t("skills.conductor-setup.goals.0")}
${i18n.t("skills.conductor-setup.goals.1")}
${i18n.t("skills.conductor-setup.goals.2")}
${i18n.t("skills.conductor-setup.goals.3")}
${i18n.t("skills.conductor-setup.goals.4")}
${i18n.t("skills.conductor-setup.goals.5")}
${i18n.t("skills.conductor-setup.goals.6")}
${i18n.t("skills.conductor-setup.goals.7")}
${i18n.t("skills.conductor-setup.goals.8")}

## Constraints:
${i18n.t("skills.conductor-setup.constraints.0")}
${i18n.t("skills.conductor-setup.constraints.1")}
${i18n.t("skills.conductor-setup.constraints.2")}
${i18n.t("skills.conductor-setup.constraints.3")}
${i18n.t("skills.conductor-setup.constraints.4")}
${i18n.t("skills.conductor-setup.constraints.5")}
${i18n.t("skills.conductor-setup.constraints.6")}
${i18n.t("skills.conductor-setup.constraints.7")}
${i18n.t("skills.conductor-setup.constraints.8")}
${i18n.t("skills.conductor-setup.constraints.9")}
${i18n.t("skills.conductor-setup.constraints.10")}

## Skills:
${i18n.t("skills.conductor-setup.skills.0")}
${i18n.t("skills.conductor-setup.skills.1")}
${i18n.t("skills.conductor-setup.skills.2")}
${i18n.t("skills.conductor-setup.skills.3")}
${i18n.t("skills.conductor-setup.skills.4")}
${i18n.t("skills.conductor-setup.skills.5")}
${i18n.t("skills.conductor-setup.skills.6")}
${i18n.t("skills.conductor-setup.skills.7")}
${i18n.t("skills.conductor-setup.skills.8")}
${i18n.t("skills.conductor-setup.skills.9")}

## Examples:
- **Greenfield Project Kickoff:** ${i18n.t("skills.conductor-setup.examples.greenfield_kickoff")}
- **Brownfield Project Resumption:** ${i18n.t("skills.conductor-setup.examples.brownfield_resumption")}
- **Style Guide Selection:** ${i18n.t("skills.conductor-setup.examples.style_guide_selection")}
- **Completion Handshake:** ${i18n.t("skills.conductor-setup.examples.completion_handshake")}

## OutputFormat:
${i18n.t("skills.conductor-setup.output_format.0")}
${i18n.t("skills.conductor-setup.output_format.1")}
${i18n.t("skills.conductor-setup.output_format.2")}
${i18n.t("skills.conductor-setup.output_format.3")}
${i18n.t("skills.conductor-setup.output_format.4")}
${i18n.t("skills.conductor-setup.output_format.5")}
${i18n.t("skills.conductor-setup.output_format.6")}
${i18n.t("skills.conductor-setup.output_format.7")}
${i18n.t("skills.conductor-setup.output_format.8")}
${i18n.t("skills.conductor-setup.output_format.9")}
${i18n.t("skills.conductor-setup.output_format.10")}
${i18n.t("skills.conductor-setup.output_format.11")}
${i18n.t("skills.conductor-setup.output_format.12")}
${i18n.t("skills.conductor-setup.output_format.13")}

### Style Guide Recommendation — required wording
When presenting style guide options, open with: *${i18n.t("skills.conductor-setup.style_guide.recommendation")}* — `{stack}` MUST be replaced by the technology stack confirmed in the Technology Stack step. Justify the top recommendation with: *${i18n.t("skills.conductor-setup.style_guide.reason")}*

### Completion Report — required structure
On completion, report EXACTLY this structure, one line per generated artifact:

- Open with: *${i18n.t("skills.conductor-setup.completion.summary")}*
- `${config.files.artifacts.product}` — ${i18n.t("skills.conductor-setup.completion.product_file")} (`{vision}` = the product vision confirmed by the user)
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
