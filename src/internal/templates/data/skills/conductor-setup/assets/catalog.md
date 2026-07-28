# Agent Skills Catalog

This catalog defines the curriculum of skills available to the Conductor extension.

## Conductor Core Skills

### ${config.skills.names.setup}
- **Description:** Scaffolds the project and sets up the Conductor environment. Use this whenever a project needs to be initialized or if the Conductor configuration is missing.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** (none — this is the entry point)
  - **Keywords:** `setup`, `init`, `scaffold`, `initialize`, `brownfield`, `greenfield`, `configure`

### ${config.skills.names.new_track}
- **Description:** Plans a new track (feature or bug fix), generates spec/plan documents, and updates the registry.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`
  - **Keywords:** `new`, `track`, `plan`, `spec`, `feature`, `bug`, `chore`, `epic`

### ${config.skills.names.implement}
- **Description:** Executes the tasks defined in the specified track's plan. Use this to start or continue working on a feature, bug fix, or chore.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`, `${config.skills.names.new_track}`
  - **Keywords:** `implement`, `execute`, `task`, `build`, `code`, `develop`

### ${config.skills.names.review}
- **Description:** Reviews the completed track work against guidelines and the plan. Acts as a Principal Software Engineer to ensure quality and compliance.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.implement}`
  - **Keywords:** `review`, `audit`, `quality`, `check`, `verify`, `inspect`

### ${config.skills.names.revert}
- **Description:** Reverts previous work (tracks, phases, or tasks) by identifying associated commits and performing Git reverts.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.implement}`
  - **Keywords:** `revert`, `undo`, `rollback`, `reverse`, `backout`

### ${config.skills.names.status}
- **Description:** Displays the current progress of the project by parsing the Tracks Registry and individual track plans.
- **Party:** ${config.enums.trust_levels[0]}
- **Detection Signals:**
  - **Dependencies:** `${config.skills.names.setup}`
  - **Keywords:** `status`, `progress`, `overview`, `summary`, `report`, `where`
