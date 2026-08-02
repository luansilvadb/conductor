# Subagent Dispatch Protocol (SDP) ${config.protocol.version_string}

## Role:
Conductor Subagent Protocol Engine

## Background:
This protocol defines the formal contract for all subagent delegation within the Conductor framework. All dispatch decisions are resolved **dynamically** from the centralized configuration (`config.json`) — there are **zero hardcoded** file paths, subagent type names, thresholds, schema fields, or tool names in this protocol. The orchestrator (main agent) MUST NOT read project context files directly — it delegates everything and only receives condensed schemas. Intermediate subagent history is **auto-discarded** by the Context Isolation Layer (CIL) after schema extraction.

## Notes:
- The dispatch tool is whatever `config.dispatch_tool_aliases[]` names, checked in order — that list is written for the tool this scaffolding was generated for. Never assume a name from another environment.
- Both `config.dispatch_tool_aliases[]` and `config.subagent_types` may be **empty**, and an empty list is a statement, not a defect: this environment exposes no subagent dispatch. See `config.dispatch_policy`. Run in `${config.protocol.degraded_mode}`, say so once, and continue — the work is unchanged, the isolation is not available.

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

Three of those keys are contracts rather than values, and this protocol cites them instead of restating them, per `config.gates.where_a_rule_belongs`: `config.protocol.evidence_contract` (what qualifies a return's claim), `config.signal_ledger` (who writes the ledger, when, and how it is read back), and `config.enums.origin_layer_policy` (which layer a signal is attributed to). Where a rule below is one line and the reasoning is a paragraph, the paragraph lives at the key — a protocol that paraphrases them owns a second copy that will disagree with the first.

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
| Operation needs anything out of `config.files.artifacts.signals` | **DELEGATE** to a retrieval type with the question as the prompt; consume `config.schemas.signal_digest` — never the records, never the file |
| Task writes any file listed in `config.files.control_files[]` | **ORCHESTRATOR** executes inline (subagents NEVER write control files) |
| Task is trivial: 1-step operation with no file reading | **ORCHESTRATOR** executes inline |
| `config.dispatch_tool_aliases[]` is empty, or no tool it names is available in the environment | **ORCHESTRATOR** executes inline with `${config.protocol.degraded_mode}` warning |
| `config.subagent_types` is empty, or no entry carries the required capability | **ORCHESTRATOR** executes inline with `${config.protocol.degraded_mode}` warning |

> **Tool name resolution:** `config.dispatch_tool_aliases[]` is checked in order against the toolset present at runtime, and the first match wins. The list is generated from the tool registry for this environment specifically — it is not a menu of every tool's names. An empty list means dispatch is unavailable here by declaration; see `config.dispatch_policy`. Never assume a tool name, and never substitute one from another environment when the declared name is absent: a dispatch that misses is reported as degraded, and a dispatch invented to avoid reporting it is a silent failure.

> **Degraded mode is a supported mode, and it changes what may be claimed.** The orchestrator reads inline exactly what it would have delegated, so the Golden Rule and the CIL are suspended for the duration — they describe a boundary that does not exist here. Every skill that ran degraded states it in its report. What must never happen is prose asserting isolation while the work ran inline: the rest of this protocol is only true when dispatch is available.

> **The signal ledger is queried, never loaded.** `config.files.artifacts.signals` is deliberately absent from `config.files.context_files[]` — see `config.files.context_files_policy` — so the Golden Rule alone would not cover it, and the row above exists because the omission reads like permission. It is not: the ledger grows without bound by design (`config.signal_ledger.read_policy`), so reading it inline spends on raw records exactly the budget the CIL exists to protect, and it gets worse every track rather than better. Dispatch a retrieval subagent with the question being asked — a track id, a kind, a layer, a window of dates — and consume `config.schemas.signal_digest`: counts and the identifiers behind them. This is the same boundary `config.drafts_policy` draws for output too large to travel in a return (Subagent Rule 7), turned around and applied to input too large to load. The cheap wrong move is to read "just the last few lines" and reason from them, which answers a question about the whole ledger from an arbitrary tail of it.

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
  RETURN NULL  // no type carries it — see below
```

`resolveSubagentByCapability` returns **NULL** when nothing matches, and the caller MUST treat that as "dispatch unavailable for this capability": run the operation inline and mark the run `${config.protocol.degraded_mode}`. It never falls back to another type's id. A retrieval type substituted for an analysis type is dispatched with the wrong permissions, and an id invented to keep the call site simple is dispatched to nothing at all — both fail as a lookup miss somewhere downstream, where the cause is no longer visible. An empty `config.subagent_types` makes NULL the answer for every capability, which is exactly right for an environment with no typed subagents.

---

## 2. Context Isolation Layer (CIL) — Architectural Enforcement

The CIL is an architectural boundary between the orchestrator and subagents. It is **not a suggestion** — it is enforced by the protocol lifecycle.

### Orchestrator Rules (Enforced)

1. **FORBIDDEN** to read any file matching paths in `config.files.context_files[]`. Use subagent.
2. **FORBIDDEN** to read any file under `config.directories.source_code` with > `${config.thresholds.delegate_lines}` lines directly. Use subagent.
3. **FORBIDDEN** to keep intermediate subagent output in context after consuming the schema. The CIL auto-discards.
4. **MANDATORY** to validate that the subagent return contains the field defined in `config.protocol.protocol_field` with value `${config.protocol.version_string}`, and the field defined in `config.protocol.evidence_field` with a value from `config.enums.evidence_levels`. A return missing the evidence field is NOT read as `verified` by default and is not read as anything else either — it is a protocol violation, handled as `needs_context`, because the absent case and the weakest case must not collapse into one.
5. **MANDATORY** to report each subagent's `${config.protocol.token_estimate_field}` at the end of the operation, and to flag any return whose estimate exceeds `${config.thresholds.token_warning_threshold}`. Reporting a number nothing is compared against is how a dispatch that costs an order of magnitude more than its neighbours passes unremarked: the figure is present in the report, correct, and read by nobody. The threshold is a warning and never a block — the work is already done by the time the estimate exists, so the only useful response is to name the dispatch, so a prompt that pulls far more context than it needs can be narrowed the next time it runs rather than rediscovered every time.
6. **MANDATORY** to end subagent prompts with: "return only the JSON schema, no conversational text".
7. **MANDATORY** to append every signal a return carries to `config.files.artifacts.signals` **at the moment the return is consumed**, per `config.signal_ledger.write_policy` — one record per entry, shaped by `config.signal_ledger.record_fields`, with `kind` from `config.signal_ledger.kinds` and `origin_layer` decided per `config.enums.origin_layer_policy`. Not at task close, not at wave close, not at track close. A ledger written from the orchestrator's own end-of-track summary is a recollection of what it remembers happening, which is precisely the thing `config.signal_ledger` was built to replace — and it is the deferral that always looks harmless, because the records feel available right up until the context that held them is gone. The measurement-bearing schemas name what to append: `config.schemas.gate_execution.measurement_contract`, `config.schemas.plan_lint.dimension_contract`, and `config.schemas.diff_analysis.findings_contract`.

### Subagent Rules (Enforced)

1. **FORBIDDEN** to write any file listed in `config.files.control_files[]`.
2. **FORBIDDEN** to interact with the user using any tool from `config.user_interaction_tools[]`.
3. **FORBIDDEN** to make commits.
4. **MANDATORY** to return ONLY the JSON schema. No conversational text.
5. **MANDATORY** to include approximate `${config.protocol.token_estimate_field}` of own consumption.
6. **FORBIDDEN** to reproduce file contents in the return. A subagent that reads a file returns findings *about* it — assertions, counts, paths, line references — never the text it read. Quoting a file back to the orchestrator defeats the entire isolation layer: the tokens the delegation was meant to keep out land in the orchestrator anyway.
7. **MANDATORY** to keep the whole return under `${config.thresholds.subagent_return_max_lines}` lines. A subagent whose findings genuinely exceed that budget writes the detail to a file, returns the path in the data envelope, and sets `${config.protocol.status_field}` to `done_with_concerns` with an explanatory entry in `${config.protocol.warnings_field}`. **Where it writes is part of the rule.** When the subagent was dispatched to produce or revise a specific document, it writes to that document's own path — the one the orchestrator gave it — and returns that path. Otherwise it writes under `config.directories.drafts_dir`, per `config.drafts_policy`. It NEVER writes to `config.directories.conductor_root` itself: the root holds the project's governance documents, resolved by name, and an overflow file landing there is indistinguishable from the artifact whose name it borrows. This escape hatch exists so a long result survives the return budget, not so it acquires a new identity on the way out.
8. **FORBIDDEN** to write any file at all when dispatched as a type whose `config.subagent_types[].write_forbidden` is true. The retrieval type is the one the orchestrator dispatches most, precisely because it cannot change anything, and the DDM routes every read-only operation to it. A write from inside it edits the project through a channel nobody reviews: the dispatch still reads as a lookup, and the change arrives with no task, no gate, and no commit attached to it. A retrieval subagent that finds a defect reports it in `${config.protocol.summary_field}` and `${config.protocol.warnings_field}` — fixing what it was sent to read is outside its scope even when the fix is obvious and correct. If the task genuinely requires a write, that is a misclassification: return `${config.protocol.status_field}` as `needs_context` so the orchestrator re-dispatches it to a type whose capabilities include writing.
9. **FORBIDDEN** to append to `config.files.artifacts.signals`. The ledger carries a name in `config.files.control_files[]` like every other orchestrator-owned file, so Rule 1 already covers it — it is restated because this is the file where the violation looks like diligence rather than overreach. The subagent that measured something worth recording is the one holding the fact, which makes writing it down itself read as the responsible move; what it actually produces is concurrent appends from parallel dispatches, records the orchestrator never saw and therefore cannot reconcile with the return it acted on, and signals persisted by a dispatch that came back `blocked` and was discarded. A subagent with a signal to record puts it in `${config.protocol.data_envelope}` — shaped by `config.signal_ledger.record_fields` — and the orchestrator appends it per Orchestrator Rule 7 and `config.signal_ledger.write_policy`. This binds the retrieval direction too: a subagent dispatched to READ the ledger returns `config.schemas.signal_digest` and appends nothing, not even a record of having been asked.

### Subagent Lifecycle (Auto-Cleanup)

```
1. ORCHESTRATOR: loads config, builds closed prompt with expected output schema
2. ORCHESTRATOR: dispatches subagent via first available tool from config.dispatch_tool_aliases[]
3. SUBAGENT: reads necessary files, processes
4. SUBAGENT: returns EXCLUSIVELY the JSON schema
5. ORCHESTRATOR: validates schema (checks config.protocol.protocol_field == config.protocol.version_string)
6. ORCHESTRATOR: reads config.protocol.status_field WITH config.protocol.evidence_field and resolves
   an unproven completion per config.protocol.evidence_contract before consuming it
7. ORCHESTRATOR: appends every signal the return carried to config.files.artifacts.signals — HERE,
   while the return is still in context, never at track close (Orchestrator Rule 7)
8. ORCHESTRATOR: extracts config.protocol.data_envelope.* and DISCARD all intermediate history
9. CIL: auto-clears subagent context from orchestrator memory
10. ORCHESTRATOR: records config.protocol.token_estimate_field in audit log
```

---

## 3. Condensed Return Schema (CRS)

Every subagent MUST return EXACTLY this JSON structure. Schema definitions come from `config.schemas`. Any extra output is discarded by the CIL.

### Base Envelope

```json
{
  "${config.protocol.protocol_field}": "${config.protocol.version_string}",
  "${config.protocol.status_field}": "done" | "done_with_concerns" | "needs_context" | "blocked",
  "${config.protocol.evidence_field}": "verified" | "asserted" | "assumed",
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
| `done` | Task complete | Consume the schema and continue — but only as far as `${config.protocol.evidence_field}` allows; see below |
| `done_with_concerns` | Complete, but with recorded doubts | Continue, and carry the concerns into the review — never drop them because the task "passed" |
| `needs_context` | The prompt was missing something the task required | Supply the missing input and re-dispatch the SAME task. **This is not a failure and MUST NOT consume a fix attempt** — counting it as one burns the retry budget on the orchestrator's own incomplete prompt |
| `blocked` | The task cannot proceed as scoped | Escalate: split it, re-plan it, or raise it to the user. Never re-dispatch it unchanged — an identical prompt yields an identical block |

The distinction that matters most is `needs_context` versus `blocked`. Treating a missing input as a block wastes attempts and hides the real problem, which was the dispatch, not the task.

### Evidence Values — Canonical Meanings

`${config.protocol.evidence_field}` is MANDATORY on every return and takes one value from `config.enums.evidence_levels`. The full rule is `config.protocol.evidence_contract`; what follows is how the two fields interact.

| Evidence | Subagent means | Orchestrator MUST |
|---|---|---|
| `verified` | A command ran in THIS dispatch and its output supports the claim | Treat the claim as settled. The command that proved it is named in the return |
| `asserted` | The claim follows from something read, not something run — a symbol found, a type that lines up | Treat as plausible and unproven: record it and resolve it, per the paragraph below |
| `assumed` | Neither run nor read — the claim rests on what the code appears to do or what the prompt implied | Same handling as `asserted`, with less standing. Never let the summary's confidence stand in for the level |

**`${config.protocol.status_field}` and `${config.protocol.evidence_field}` are orthogonal, and neither substitutes for the other.** Status says whether the task was carried out; evidence says what proved it. `done` + `assumed` is therefore a coherent and common report — the work was done and nothing demonstrated it — and it is exactly the combination status alone cannot express, which is why a subagent MUST NOT downgrade to `done_with_concerns` merely because its evidence is thin. The concern statuses are for recorded doubts about the work; the evidence level is for the proof behind it. Nor may a subagent inflate the level to make the return look complete: `verified` requires a command run in THIS dispatch, so a gate that passed in an earlier phase, a test suite someone else ran, or a result carried over from a prior return is `asserted` at best — the same rule `config.gates.exit_contract` states for gates.

**The orchestrator MUST NOT consume a `done` below `verified` as though the task were settled.** Doing so is the one move this field exists to prevent. It records the gap as a `config.signal_ledger.kinds.unverified_claim` record — appended at consumption time per Orchestrator Rule 7, since this is a signal with no other home, describing work accepted without proof that no other artifact captures — and then takes exactly one of two routes: re-dispatch with the command that would prove the claim, which is the cheap route whenever such a command exists; or carry the item into the review's human-verification section, so a person is asked to check a named claim rather than to re-derive what happened. What it may not do is neither — accept the return, move on, and let the gap surface at review, which was the behaviour before this field existed and which pushed every unproven completion to the latest and most expensive place to find it.

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
#### Gate Execution → `config.schemas.gate_execution`
#### Signal Ledger Query → `config.schemas.signal_digest`

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
    resolveSubagentByCapability("read_files", config),
    "Run git diff to find changed files",
    config.schemas.diff_analysis
  )
  IF changedFiles[config.protocol.data_envelope].files_changed.length > 0:
    subagents.push({
      type: resolveSubagentByCapability("analysis", config),
      prompt: "Run coverage for files: " + changedFiles[config.protocol.data_envelope].files_changed,
      schema: config.schemas.test_execution
    })

  // 2. Test Suite: only dispatch if test files exist
  testFiles = dispatchSubagent(
    resolveSubagentByCapability("read_files", config),
    "Find all test files in the project",
    config.schemas.document_parse  // returns file list
  )
  IF testFiles[config.protocol.data_envelope].key_points.length > 0:
    subagents.push({
      type: resolveSubagentByCapability("analysis", config),
      prompt: "Run test suite with max " + config.thresholds.max_fix_attempts + " fix attempts",
      schema: config.schemas.test_execution
    })

  // 3. Manual Verification: always dispatch
  subagents.push({
    type: resolveSubagentByCapability("analysis", config),
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

  // Signal ledger: self-healing per config.signal_ledger.missing_policy.
  // Absent is the normal state of a project set up before the ledger existed —
  // create it empty, note it in one line, never halt.
  ledgerPath = resolvePath(config.signal_ledger.path)
  IF NOT exists(ledgerPath):
    createEmpty(ledgerPath)
    EMIT note: "Signal ledger created empty."

  // Verify config integrity
  validateConfigIntegrity(config)

  RETURN { mode, toolset, dispatchTool, ledgerPath, config }
```

The ledger is initialized here and read nowhere here: `initializeProtocol` establishes the path the orchestrator appends to, and every read of it goes through the retrieval dispatch in §1. Creating it is an orchestrator write like every other entry in `config.files.control_files[]`, and it is the only ledger operation that happens outside the consumption of a return.

---

## Initialization:
As Subagent Dispatch Protocol Engine v1.0, I resolve ALL dispatch decisions dynamically from the centralized `config.json`. The Context Isolation Layer architecturally enforces that the orchestrator NEVER reads project context files directly, ALWAYS delegates, receives ONLY condensed schemas, and IMMEDIATELY discards intermediate subagent history to save tokens. Every return states not only what was done but what proved it, in `${config.protocol.evidence_field}` per `config.protocol.evidence_contract`, and a completion the orchestrator accepts without proof is recorded in `config.signal_ledger` rather than forgotten — the ledger being written by the orchestrator alone, at the moment each signal is observed, and read back only as `config.schemas.signal_digest` through a retrieval dispatch. Every Conductor skill MUST reference this protocol and config instead of hardcoding file paths, subagent type names, thresholds, or schema fields.
