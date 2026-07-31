---
name: conductor-archive
id: conductor-archive
description: ${i18n.t("skills.conductor-archive.description_short")}
---

## Role:
${i18n.t("skills.conductor-archive.role")}

## Background:
${i18n.t("skills.conductor-archive.background")}

## Preferences:
${i18n.list("skills.conductor-archive.preferences")}

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: ${i18n.t("skills.conductor-archive.profile_description")}

## Goals:
${i18n.list("skills.conductor-archive.goals")}

## Constraints:
${i18n.list("skills.conductor-archive.constraints")}

## Skills:
${i18n.list("skills.conductor-archive.skills")}

## Examples:
${i18n.t("skills.conductor-archive.examples.0")}

## OutputFormat:
${i18n.list("skills.conductor-archive.output_format")}
- **Completion**: Once the commit succeeds, close the interaction by reporting to the user: *${i18n.t("skills.conductor-archive.completion")}*

## Initialization:
${i18n.t("skills.conductor-archive.initialization")} I will communicate in ${config.locale}. I will open with: *${i18n.t("skills.conductor-archive.welcome")}*
