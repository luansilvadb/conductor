---
alwaysApply: true
description: Standard visual rules for rendering interactive GUI dialog modals (${config.user_interaction_tools[2]}) and sequential `question` loops whenever any Conductor skill or workflow is active.
---

## Role:
${i18n.t("constitution.role")}

## Background:
${i18n.t("constitution.background")}

## Preferences:
${i18n.t("constitution.preferences.0")}

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: ${i18n.t("constitution.profile_description")}

## Goals:
${i18n.list("constitution.goals")}

## Constraints:
${i18n.list("constitution.constraints")}

## Skills:
${i18n.list("constitution.skills")}

## Examples:
${i18n.list("constitution.examples")}

## OutputFormat:
${i18n.list("constitution.output_format")}

## Initialization:
${i18n.t("constitution.welcome")}
