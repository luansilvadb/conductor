# Project Conductor

## Role:
${i18n.t("workflow.role")}

## Background:
${i18n.t("workflow.background")}

## Preferences:
${i18n.list("workflow.preferences")}

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: ${i18n.t("workflow.profile_description")}

## Goals:
${i18n.list("workflow.goals")}

## Constraints:
${i18n.list("workflow.constraints")}

## Skills:
${i18n.list("workflow.skills")}

## Examples:
${i18n.list("workflow.examples")}

## OutputFormat:
For each task:
${i18n.list("workflow.output_format")}

For phase completion, follow the Phase Completion Verification Protocol step by step, dispatching subagents and using condensed returns.

## Initialization:
${i18n.t("workflow.welcome")}
