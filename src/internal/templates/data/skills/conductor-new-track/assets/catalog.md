# Community Agent Skills Catalog

This catalog lists **third-party (non-Conductor) agent skills** that may be
recommended to the user while planning a new track. It is the file resolved by
`config.catalogs.community`.

The `${config.skills.names.new_track}` skill dispatches a subagent to match the
track spec against the entries below and returns matches using the
`config.schemas.skill_catalog_match` schema. Only entries present in this file
can ever be recommended — an empty catalog makes the recommendation step a
no-op.

## How to extend this catalog

Every entry MUST be a `###` heading with the skill's canonical name, followed by
exactly these fields, in this order:

- **Description**: what the skill does, in one or two sentences.
- **URL**: the canonical, resolvable location the skill is installed from.
- **Party**: the trust level, resolved from `config.enums.trust_levels`.
  Use `${config.enums.trust_levels[1]}` for third-party skills,
  `${config.enums.trust_levels[3]}` for third-party skills that have been
  audited by the community. Never use `${config.enums.trust_levels[0]}`
  (first-party) here — that value is reserved for Conductor's own core skills in
  the core catalog (`config.catalogs.core`).
- **Detection Signals**: the evidence that makes this skill relevant.
  - **Dependencies**: package names that, when present in the project manifest,
    indicate relevance.
  - **Keywords**: terms in the track spec that indicate relevance.

Rules for entries:

1. Never add a skill whose URL you cannot verify. An unverifiable entry is worse
   than a missing one, because it will be recommended to the user as installable.
2. Keep `Detection Signals` narrow. Broad keywords cause false recommendations.
3. Recommendations are always presented to the user for approval; a skill in this
   catalog is never installed automatically.

## Firebase Skills

Skills focused on setting up, managing, and using various Firebase services.

### firebase-ai-logic-basics

- **Description**: Official skill for integrating Firebase AI Logic (Gemini API)
  into web applications. Covers setup, multimodal inference, structured output,
  and security.
- **URL**: https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-ai-logic-basics/
- **Party**: ${config.enums.trust_levels[1]}
- **Detection Signals**:
  - **Dependencies**: `firebase`, `firebase-admin`
  - **Keywords**: `Firebase`, `AI Logic`, `Gemini API`, `GenAI`
