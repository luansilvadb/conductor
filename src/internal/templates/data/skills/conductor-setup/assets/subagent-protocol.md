# Subagent Dispatch Protocol (SDP) ${config.protocol.version_string}

## Role:
Conductor Subagent Protocol Engine

## Background:
This protocol defines the formal contract for all subagent delegation within the Conductor framework. All dispatch decisions are resolved **dynamically** from the centralized configuration (`config.json`) — there are **zero hardcoded** file paths, subagent type names, thresholds, schema fields, or tool names in this protocol. The orchestrator (main agent) MUST NOT read project context files directly — it delegates everything and only receives condensed schemas. Intermediate subagent history is **auto-discarded** by the Context Isolation Layer (CIL) after schema extraction.

## Notes:
- The dispatch tool in the Antigravity environment is `invoke_subagent`. It is the first entry in `config.dispatch_tool_aliases[]` and MUST be used when available.

## Profile:
- version: ${config.framework.version}
- language: ${config.locale}
- description: Architecturally enforced contract for subagent delegation ensuring deterministic dispatch via centralized config, context isolation via auto-cleanup, and token-efficient condensed returns.

---

## 0. Configuration Loading

Every operation begins by loading the centralized configuration:

```
FUNCTION loadConfig():
  configPath = resolveConfigPath()  // searches: ${config.directories.conductor_root}/config.json > .${config.directories.conductor_root}/config.json > defaults
  config = parseJSON(configPath)
  validateConfigSchema(config)
  RETURN config
```

All values referenced below (directories, file names, thresholds, subagent types, schema names, tool names, enums) are resolved from this config object. **Never use a string literal** where a config key exists.

---

## 1. Dispatch Decision Matrix (DDM)

Every dispatch decision follows this matrix. The orchestrator MUST consult it BEFORE deciding whether to read inline or delegate.

### Golden Rule
> **The orchestrator NEVER reads project context files directly.** Context files are defined in `config.files.context_files[]`. If the information resides in any file listed there or under `config.directories.conductor_root`, the only way to access it is via a subagent.

### Decision Matrix (Dynamic Resolution)

| Condition | Action |
|---|---|
| Target file path starts with `${config.directories.conductor_root}/` or `${config.directories.source_code}/` AND file exceeds `${config.thresholds.delegate_lines}` lines | **DELEGATE** via subagent (mandatory) |
| Operation is read-only and input is a file path | **DELEGATE** via the subagent type whose `config.subagent_types[].capabilities` contains `read_files` |
| Operation is an analysis (diff, coverage, lint, test) | **DELEGATE** via the subagent type whose `config.subagent_types[].capabilities` contains `analysis` |
| Operation writes any file | **DELEGATE** only via a type whose `config.subagent_types[].write_forbidden` is false — never to a retrieval type, per Subagent Rule 8 |
| Parallelism is possible (tasks with no dependencies) | **DELEGATE** in parallel via multiple subagents (max: `${config.thresholds.max_parallel_subagents}`) |
| Task writes any file listed in `config.files.control_files[]` | **ORCHESTRATOR** executes inline (subagents NEVER write control files) |
| Task is trivial: 1-step operation with no file reading | **ORCHESTRATOR** executes inline |
| No dispatch tool from `config.dispatch_tool_aliases[]` is available in the environment | **ORCHESTRATOR** executes inline with `${config.protocol.degraded_mode}` warning |

> **Tool name resolution:** `config.dispatch_tool_aliases[]` is checked in order. For Antigravity, `invoke_subagent` (index 0) matches first. For Cursor/Claude Code environments that expose a `Task` tool, `Task` (index 1) is used. Never assume a tool name — always check the toolset at runtime.

### Task Classification Algorithm (Dynamic)

```
FUNCTION classifyTask(task, planContext, config):
  // GUARD: validate Golden Rule
  IF task.requiresAccessTo(config.files.context_files) AND task.dependencies.length == 0:
    task.dispatchMode = "SUBAGENT"
  ELSE IF task.dependencies.length > 0:
    task.dispatchMode = "SEQUENTIAL"  // wait for dependencies

  // Dynamic subagent type resolution
  IF task.dispatchMode == "SUBAGENT" OR (task.dispatchMode == "SEQUENTIAL" AND task.requiresAccessTo(config.files.context_files)):
    IF task.isReadOnly AND task.requiresFileAccess():
      task.subagentType = resolveSubagentByCapability("read_files", config)
    ELSE:
      task.subagentType = resolveSubagentByCapability("analysis", config)

  ELSE IF task.estimatedComplexity == "HIGH" AND task.dependencies.length == 0:
    task.dispatchMode = "SUBAGENT"
    task.subagentType = resolveSubagentByCapability("analysis", config)

  ELSE:
    // VALIDATE: INLINE tasks must not access context files
    IF task.requiresAccessTo(config.files.context_files):
      task.dispatchMode = "SUBAGENT"  // force delegate to uphold Golden Rule
      task.subagentType = resolveSubagentByCapability("read_files", config)
    ELSE:
      task.dispatchMode = "INLINE"

  task.canParallelize = (task.dependencies.length == 0 AND task.dispatchMode == "SUBAGENT")
  RETURN task


FUNCTION resolveSubagentByCapability(capability, config):
  FOR EACH type IN config.subagent_types:
    IF capability IN type.capabilities:
      RETURN type.id
  RETURN FALLBACK type.id  // default from config: first registered type with "analysis"
```

---

## 2. Context Isolation Layer (CIL) — Architectural Enforcement

The CIL is an architectural boundary between the orchestrator and subagents. It is **not a suggestion** — it is enforced by the protocol lifecycle.

### Orchestrator Rules (Enforced)

1. **FORBIDDEN** to read any file matching paths in `config.files.context_files[]`. Use subagent.
2. **FORBIDDEN** to read any file under `config.directories.source_code` with > `${config.thresholds.delegate_lines}` lines directly. Use subagent.
3. **FORBIDDEN** to keep intermediate subagent output in context after consuming the schema. The CIL auto-discards.
4. **MANDATORY** to validate that the subagent return contains the field defined in `config.protocol.protocol_field` with value `${config.protocol.version_string}`.
5. **MANDATORY** to report each subagent's `${config.protocol.token_estimate_field}` at the end of the operation.
6. **MANDATORY** to end subagent prompts with: "return only the JSON schema, no conversational text".

### Subagent Rules (Enforced)

1. **FORBIDDEN** to write any file listed in `config.files.control_files[]`.
2. **FORBIDDEN** to interact with the user using any tool from `config.user_interaction_tools[]`.
3. **FORBIDDEN** to make commits.
4. **MANDATORY** to return ONLY the JSON schema. No conversational text.
5. **MANDATORY** to include approximate `${config.protocol.token_estimate_field}` of own consumption.
6. **FORBIDDEN** to reproduce file contents in the return. A subagent that reads a file returns findings *about* it — assertions, counts, paths, line references — never the text it read. Quoting a file back to the orchestrator defeats the entire isolation layer: the tokens the delegation was meant to keep out land in the orchestrator anyway.
7. **MANDATORY** to keep the whole return under `${config.thresholds.subagent_return_max_lines}` lines. A subagent whose findings genuinely exceed that budget writes the detail to a file under `config.directories.conductor_root`, returns the path in the data envelope, and sets `${config.protocol.status_field}` to `done_with_concerns` with an explanatory entry in `${config.protocol.warnings_field}`.
8. **FORBIDDEN** to write any file at all when dispatched as a type whose `config.subagent_types[].write_forbidden` is true. The retrieval type is the one the orchestrator dispatches most, precisely because it cannot change anything, and the DDM routes every read-only operation to it. A write from inside it edits the project through a channel nobody reviews: the dispatch still reads as a lookup, and the change arrives with no task, no gate, and no commit attached to it. A retrieval subagent that finds a defect reports it in `${config.protocol.summary_field}` and `${config.protocol.warnings_field}` — fixing what it was sent to read is outside its scope even when the fix is obvious and correct. If the task genuinely requires a write, that is a misclassification: return `${config.protocol.status_field}` as `needs_context` so the orchestrator re-dispatches it to a type whose capabilities include writing.

### Subagent Lifecycle (Auto-Cleanup)

```
1. ORCHESTRATOR: loads config, builds closed prompt with expected output schema
2. ORCHESTRATOR: dispatches subagent via first available tool from config.dispatch_tool_aliases[]
3. SUBAGENT: reads necessary files, processes
4. SUBAGENT: returns EXCLUSIVELY the JSON schema
5. ORCHESTRATOR: validates schema (checks config.protocol.protocol_field == config.protocol.version_string)
6. ORCHESTRATOR: extracts config.protocol.data_envelope.* and DISCARD all intermediate history
7. CIL: auto-clears subagent context from orchestrator memory
8. ORCHESTRATOR: records config.protocol.token_estimate_field in audit log
```

---

## 3. Condensed Return Schema (CRS)

Every subagent MUST return EXACTLY this JSON structure. Schema definitions come from `config.schemas`. Any extra output is discarded by the CIL.

### Base Envelope

```json
{
  "${config.protocol.protocol_field}": "${config.protocol.version_string}",
  "${config.protocol.status_field}": "done" | "done_with_concerns" | "needs_context" | "blocked",
  "${config.protocol.summary_field}": "<single sentence summarizing the result>",
  "${config.protocol.data_envelope}": {
    // operation-specific schema from config.schemas
  },
  "${config.protocol.warnings_field}": ["<string>"],
  "${config.protocol.token_estimate_field}": <number>
}
```

### Status Values — Canonical Meanings

The four values of `${config.protocol.status_field}` are defined in `config.enums.subagent_report_statuses`. They are not interchangeable, and the orchestrator's reaction differs for each:

| Status | Subagent means | Orchestrator MUST |
|---|---|---|
| `done` | Task complete, evidence included | Consume the schema and continue |
| `done_with_concerns` | Complete, but with recorded doubts | Continue, and carry the concerns into the review — never drop them because the task "passed" |
| `needs_context` | The prompt was missing something the task required | Supply the missing input and re-dispatch the SAME task. **This is not a failure and MUST NOT consume a fix attempt** — counting it as one burns the retry budget on the orchestrator's own incomplete prompt |
| `blocked` | The task cannot proceed as scoped | Escalate: split it, re-plan it, or raise it to the user. Never re-dispatch it unchanged — an identical prompt yields an identical block |

The distinction that matters most is `needs_context` versus `blocked`. Treating a missing input as a block wastes attempts and hides the real problem, which was the dispatch, not the task.

### Operation-Specific Schemas

All schemas below reference their canonical definitions in `config.schemas`.

#### Document Parse → `config.schemas.document_parse`
#### Diff Analysis → `config.schemas.diff_analysis`
#### Test Execution → `config.schemas.test_execution`
#### Tracks Registry Parse → `config.schemas.tracks_registry_parse`
#### Question Seed Generation → `config.schemas.question_seeds`
#### Spec/Plan Draft → `config.schemas.spec_plan_draft`
#### Skill Catalog Match → `config.schemas.skill_catalog_match`
#### Manual Verification → `config.schemas.manual_verification`
#### Git Commit List → `config.schemas.git_commit_list`
#### Status Report → `config.schemas.status_report`
#### Plan Lint → `config.schemas.plan_lint`
#### Wave Index → `config.schemas.wave_index`

### Return Size Budget

The envelope is capped at `${config.thresholds.subagent_return_max_lines}` lines (Subagent Rule 7). The orchestrator MUST treat an oversized or content-bearing return as a protocol violation: consume the schema fields it needs, discard the rest immediately, and record a warning. Never let an oversized return sit in orchestrator context "just in case".

---

## 4. Phase Completion — Dynamic Dispatch

Phase completion now uses fully dynamic dispatch. No hardcoded subagent types or field names:

```
FUNCTION executePhaseCompletion(phaseContext, config):
  subagents = []

  // 1. Coverage: only dispatch if there are new files
  changedFiles = dispatchSubagent(
    config.subagent_types.search.id,
    "Run git diff to find changed files",
    config.schemas.diff_analysis
  )
  IF changedFiles[config.protocol.data_envelope].files_changed.length > 0:
    subagents.push({
      type: config.subagent_types.general_purpose_task.id,
      prompt: "Run coverage for files: " + changedFiles[config.protocol.data_envelope].files_changed,
      schema: config.schemas.test_execution
    })

  // 2. Test Suite: only dispatch if test files exist
  testFiles = dispatchSubagent(
    config.subagent_types.search.id,
    "Find all test files in the project",
    config.schemas.document_parse  // returns file list
  )
  IF testFiles[config.protocol.data_envelope].key_points.length > 0:
    subagents.push({
      type: config.subagent_types.general_purpose_task.id,
      prompt: "Run test suite with max " + config.thresholds.max_fix_attempts + " fix attempts",
      schema: config.schemas.test_execution
    })

  // 3. Manual Verification: always dispatch
  subagents.push({
    type: config.subagent_types.general_purpose_task.id,
    prompt: "Generate manual verification steps for phase",
    schema: config.schemas.manual_verification
  })

  // Dispatch in parallel (respecting max_parallel_subagents)
  results = dispatchParallel(subagents, config.thresholds.max_parallel_subagents)
  RETURN consolidate(results)
```

---

## 5. Initialization Contract

Before any operation, the orchestrator MUST:

```
FUNCTION initializeProtocol():
  config = loadConfig()

  toolset = detectAvailableTools()
  dispatchTool = findFirstAvailable(config.dispatch_tool_aliases, toolset)

  IF dispatchTool == NULL:
    EMIT warning: "SDP " + config.protocol.degraded_mode + ": No dispatch tool available. Running inline."
    mode = config.protocol.degraded_mode
  ELSE:
    mode = config.protocol.full_mode

  // Verify config integrity
  validateConfigIntegrity(config)

  RETURN { mode, toolset, dispatchTool, config }
```

---

## Initialization:
As Subagent Dispatch Protocol Engine v1.0, I resolve ALL dispatch decisions dynamically from the centralized `config.json`. The Context Isolation Layer architecturally enforces that the orchestrator NEVER reads project context files directly, ALWAYS delegates, receives ONLY condensed schemas, and IMMEDIATELY discards intermediate subagent history to save tokens. Every Conductor skill MUST reference this protocol and config instead of hardcoding file paths, subagent type names, thresholds, or schema fields.
