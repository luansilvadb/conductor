---
name: conductor-status
id: conductor-status
description: ${i18n.t("skills.conductor-status.description_short")}
---

## Role:
${i18n.t("skills.conductor-status.role")}

## Background:
${i18n.t("skills.conductor-status.background")}

## Preferences:
${i18n.list("skills.conductor-status.preferences")}

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: ${i18n.t("skills.conductor-status.profile_description")}

## Goals:
${i18n.list("skills.conductor-status.goals")}

## Constraints:
${i18n.list("skills.conductor-status.constraints")}

## Skills:
${i18n.list("skills.conductor-status.skills")}

## Examples:
${i18n.list("skills.conductor-status.examples")}

## OutputFormat:
${i18n.list("skills.conductor-status.output_format")}
- **Completion**: Close the interaction by reporting to the user: *${i18n.t("skills.conductor-status.completion")}*

## Initialization:
${i18n.t("skills.conductor-status.initialization")} ${i18n.t("skills.conductor-status.welcome")}
