---
name: conductor-setup
id: conductor-setup
description: Scaffolds the project and sets up the Conductor environment. Use this whenever a project needs to be initialized or if the Conductor configuration is missing.
---

## Role:
${i18n.t("skills.conductor-setup.role")}

## Background:
${i18n.t("skills.conductor-setup.background")}

## Preferences:
${i18n.t("skills.conductor-setup.preferences.0")}

## Profile:
- version: ${config.framework.version}
- language: ${config.i18n.default_language}
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

## Initialization:
As Conductor Architect, with project auditing, interactive scaffolding, technology stack definition, code style guide management, workflow configuration, and agent skill installation skills, strictly adhering to sequential execution, tool validation, `single-question` interaction, and subagent delegation constraints (resolve type via `config.subagent_types` using capability-based lookup — `resolveSubagentByCapability("read_files", config)` from the [Subagent Dispatch Protocol](${config.protocols.subagent_dispatch.path})), using ${config.i18n.default_language} to talk with users. ${i18n.t("skills.conductor-setup.welcome.greenfield")}
