# Agent Skills Catalog

This catalog defines the curriculum of skills available to the Conductor extension.

## Conductor Core Skills

### ${config.skills.names.setup}
- **Description:** ${i18n.t("skills.conductor-setup.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** (none — this is the entry point)
  - **Keywords:** `setup`, `init`, `scaffold`, `initialize`, `brownfield`, `greenfield`, `configure`

### ${config.skills.names.new_track}
- **Description:** ${i18n.t("skills.conductor-new-track.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`
  - **Keywords:** `new`, `track`, `plan`, `spec`, `feature`, `bug`, `chore`, `epic`

### ${config.skills.names.implement}
- **Description:** ${i18n.t("skills.conductor-implement.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`, `${config.skills.names.new_track}`
  - **Keywords:** `implement`, `execute`, `task`, `build`, `code`, `develop`

### ${config.skills.names.review}
- **Description:** ${i18n.t("skills.conductor-review.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.implement}`
  - **Keywords:** `review`, `audit`, `quality`, `check`, `verify`, `inspect`

### ${config.skills.names.revert}
- **Description:** ${i18n.t("skills.conductor-revert.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.implement}`
  - **Keywords:** `revert`, `undo`, `rollback`, `reverse`, `backout`

### ${config.skills.names.status}
- **Description:** ${i18n.t("skills.conductor-status.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`
  - **Keywords:** `status`, `progress`, `overview`, `summary`, `report`, `where`

### ${config.skills.names.archive}
- **Description:** ${i18n.t("skills.conductor-archive.description_short")}
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`
  - **Keywords:** `archive`, `clean`, `cleanup`, `curate`, `organize`, `clear`
