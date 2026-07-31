# Agent eval report — graded traces

- Generated: `npm run eval:traces`
- Contract source: `src/internal/templates/data/config/config.json`
- Rubrics: 19 · Traces: 26 (4 golden, 22 regression)
- Graded as expected: 26/26
- Result: **PASS**

## Traces

| Trace | Skill | Expected failures | Detected | Outcome |
|---|---|---|---|---|
| `implement-golden` | conductor-implement | — | — | clean |
| `review-golden` | conductor-review | — | — | clean |
| `orchestrator-reads-context-inline` | conductor-implement | `cil-golden-rule` | `cil-golden-rule` | caught |
| `subagent-writes-control-file` | conductor-implement | `control-file-ownership` | `control-file-ownership` | caught |
| `subagent-commits` | conductor-implement | `subagent-no-commit` | `subagent-no-commit` | caught |
| `envelope-drift` | conductor-review | `sdp-envelope` | `sdp-envelope` | caught |
| `oversized-return` | conductor-review | `return-discipline` | `return-discipline` | caught |
| `needs-context-charged-as-failure` | conductor-implement | `needs-context-retry` | `needs-context-retry` | caught |
| `fix-budget-overrun` | conductor-implement | `fix-attempt-budget` | `fix-attempt-budget` | caught |
| `parallel-cap-exceeded` | conductor-implement | `parallel-cap` | `parallel-cap` | caught |
| `wave-opened-early` | conductor-implement | `wave-ordering` | `wave-ordering` | caught |
| `wave-file-overlap` | conductor-implement | `wave-file-overlap` | `wave-file-overlap` | caught |
| `test-written-after-code` | conductor-implement | `tdd-red-first` | `tdd-red-first` | caught |
| `gate-result-carried-over` | conductor-implement | `gate-exit-contract` | `gate-exit-contract` | caught |
| `task-closed-without-note` | conductor-implement | `commit-traceability` | `commit-traceability` | caught |
| `handoff-without-confirmation` | conductor-review | `handoff-confirmation` | `handoff-confirmation` | caught |
| `passed-with-unverified-behaviour` | conductor-review | `review-verdict` | `review-verdict` | caught |
| `search-subagent-writes` | conductor-review | `subagent-write-scope` | `subagent-write-scope` | caught |
| `gate-manifest-loosened` | conductor-implement | `history-guard` | `history-guard` | caught |
| `history-rewrite-erases-notes` | conductor-revert | `history-guard` | `history-guard` | caught |
| `handoff-with-work-in-flight` | conductor-implement | `handoff-readiness` | `handoff-readiness` | caught |
| `design-system-loosened` | conductor-implement | `history-guard` | `history-guard` | caught |
| `design-gate-skipped-on-close` | conductor-implement | `gate-exit-contract` | `gate-exit-contract` | caught |
| `design-golden` | conductor-implement | — | — | clean |
| `conditional-setup-step-dropped` | conductor-setup | `conditional-setup-step` | `conditional-setup-step` | caught |
| `setup-golden` | conductor-setup | — | — | clean |

## Graded findings

Each regression trace is a workflow defect the framework must keep catching. The finding below is what the eval reports when that defect reaches a run.

### `orchestrator-reads-context-inline` — The orchestrator delegates the spec, then reads plan.md itself because it is 'just one file'. The run succeeds, and the context budget the delegation protects is spent anyway.

- **cil-golden-rule**: #4 orchestrator read conductor/tracks/auth/plan.md inline — context files are reachable only via subagent
- **cil-golden-rule**: #5 orchestrator read conductor/lessons.md inline — context files are reachable only via subagent

### `subagent-writes-control-file` — An implementation subagent ticks its own checkbox in plan.md and updates state.md, racing the orchestrator that owns both files.

- **control-file-ownership**: #4 sub:s1 wrote control file conductor/tracks/auth/plan.md — control files are orchestrator-owned
- **control-file-ownership**: #5 sub:s1 wrote control file conductor/state.md — control files are orchestrator-owned

### `subagent-commits` — A subagent commits its own work. The orchestrator never learns the SHA, so no note is attached and the plan records nothing — a ghost commit that revert cannot reconstruct.

- **subagent-no-commit**: #4 sub:s1 performed git commit 9f8e7d6 — subagents never touch git history
- **subagent-no-commit**: #5 sub:s1 performed git note 9f8e7d6 — subagents never touch git history

### `envelope-drift` — A subagent answers in its own shape: no protocol field, a status invented on the spot, and no token estimate. The orchestrator consumed it without validating, so conversational text flows back unnoticed.

- **sdp-envelope**: #2 return from r1 carries protocol=null, expected "sdp-v1"
- **sdp-envelope**: #2 return from r1 has status="ok", outside config.enums.subagent_report_statuses (done, done_with_concerns, needs_context, blocked)
- **sdp-envelope**: #2 return from r1 omits token_estimate — the orchestrator cannot report what it never received

### `oversized-return` — A read-only subagent quotes the styleguide back at the orchestrator across 42 lines. The dispatch is in the trace, so the isolation looks like it happened while every token it was meant to keep out landed anyway.

- **return-discipline**: #2 return from r1 is 42 lines, over the 15-line budget, without spilling to a file and downgrading status
- **return-discipline**: #2 return from r1 reproduces file contents — a subagent returns findings about a file, never its text

### `needs-context-charged-as-failure` — A subagent reports needs_context because the prompt omitted the spec. The orchestrator books it as a fix attempt before re-dispatching, spending the retry budget on its own incomplete prompt.

- **needs-context-retry**: #4 needs_context on task T1 was charged as a fix attempt — it must not consume any of the 2 allowed

### `fix-budget-overrun` — The test gate keeps failing and the agent keeps trying. The third attempt is past the cap that exists to turn a failing gate into a reported blocker instead of an open-ended grind.

- **fix-attempt-budget**: #11 fix attempt 3 on task T1 — the cap is 2, after which the task stops and is reported as blocked

### `parallel-cap-exceeded` — A six-task wave is dispatched in one go. Nothing in the transcript looks wrong; the cost shows up as subagent timeouts and interleaved writes under load.

- **parallel-cap**: #7 6 subagents open at once (s1, s2, s3, s4, s5, s6) — the cap is 5

### `wave-opened-early` — Wave 2 opens while both wave-1 tasks are still open, and it contains a task depending on a sibling in its own wave. The order breaks silently; the failure surfaces later in a task that looks unrelated.

- **wave-ordering**: #4 wave 2 opened while wave 1 still has T1, T2 unfinished
- **wave-ordering**: #4 task T3 in wave 2 depends on T4 in wave 2 — a dependency must sit in a strictly lower wave

### `wave-file-overlap` — Two tasks in the same wave both touch src/api/routes.ts and are dispatched in parallel anyway. Both subagents report success and only the last write survives.

- **wave-file-overlap**: #3 tasks T1 and T2 run in parallel in wave 1 but share src/api/routes.ts — that wave had to be downgraded to sequential

### `test-written-after-code` — The implementation lands first and the test is written against it afterwards. Everything else about the task is correct — gates run fresh, commit, note and SHA are all in place — which is exactly why this regression survives a transcript read.

- **tdd-red-first**: #4 implementation for task T1 was written before the failing test at #6

### `gate-result-carried-over` — The task closes on a test result from the previous task's run and never declares the absent coverage gate. Both make an unverified check read as a passed one.

- **gate-exit-contract**: #7 test gate for task T1 reuses an earlier run — a gate is proven by the run being reported
- **gate-exit-contract**: task T1 closed without declaring the absent coverage gate — A gate whose cmd is null is DECLARED, never silently skipped and never installed on the user's behalf — choosing a linter is the project's decision, not Conductor's

### `task-closed-without-note` — The task closes with a commit but no git note, and the plan update rides along in the feature commit instead of its own prefixed one. Nothing is visibly broken until revert has to reconstruct the track.

- **commit-traceability**: task T1 closed without a git note on 5e6f7a8 — the task summary belongs in a note, not the commit message
- **commit-traceability**: task T1: the plan update was not committed with the conductor(plan): prefix

### `handoff-without-confirmation` — The review finds high-severity problems and invokes the revert skill on its own reading of the situation. The user is never asked, and work is rolled back on an inferred yes.

- **handoff-confirmation**: #4 handoff to conductor-revert without asking the user first

### `passed-with-unverified-behaviour` — The review lists two behaviours no executed test covers and still closes as passed. The open questions become a guarantee nobody will revisit — the most damaging outcome this skill can produce.

- **review-verdict**: #3 verdict is passed while 2 item(s) still need human verification (session expiry is changed by the track but covered by no executed test; the coverage gate is absent, so the coverage claim rests on judgement) — that verdict requires an empty list

### `search-subagent-writes` — A retrieval subagent dispatched to scan the diff fixes what it finds instead of reporting it. The dispatch reads as a read-only lookup, the return is a clean envelope, and the edit reaches the working tree with no task, no gate and no commit attached to it.

- **subagent-write-scope**: #4 sub:e1 was dispatched as Explore (write_forbidden) yet wrote src/auth/token.ts — a retrieval subagent returns findings, it never edits

### `gate-manifest-loosened` — The lint gate fails on the task's own code, so the subagent edits the gate manifest and the gate passes. The trace shows a red gate turning green with no fix in between — read as a transcript it looks like the task was repaired.

- **history-guard**: #9 sub:s1 edited conductor/gates/gates.json while task T1 was open — a gate loosened by the work it judges stops being a gate

### `history-rewrite-erases-notes` — A revert done with a hard reset and a note removal instead of the reverting commits the skill is supposed to produce. The working tree ends up in the requested state, so the run reports success — while the record revert itself reads to reconstruct a track is gone, and no later run can tell that anything was removed.

- **history-guard**: #5 orchestrator ran `git reset --hard HEAD~3` — discards commits the plan still records SHAs for; the framework's own traceability is not the agent's to clear
- **history-guard**: #6 orchestrator ran `git notes remove HEAD` — deletes the task record revert reconstructs a track from; the framework's own traceability is not the agent's to clear
- **history-guard**: #7 orchestrator ran `git push origin main --force` — rewrites published history; the framework's own traceability is not the agent's to clear

### `handoff-with-work-in-flight` — The user is asked about the review while T2 is still running, and the handoff fires on the answer. The review then reads a plan that shows T2 in progress and a diff that does not contain it yet — its findings describe a state that stopped being true moments after it looked.

- **handoff-readiness**: #16 handoff to conductor-review with T2 still [~] — the receiving skill inherits a plan that claims work is under way with nobody doing it
- **handoff-readiness**: #16 handoff to conductor-review while s2 had not returned — the next skill starts reading files a subagent is still writing

### `design-system-loosened` — The design token gate rejects a colour the component invented, so the subagent adds that colour to DESIGN.md instead of using an existing token. The gate then passes. Read as a transcript this is indistinguishable from a fix — a red gate turned green — and the artefact it edited is the one the gate judges against.

- **history-guard**: #9 sub:s1 edited conductor/DESIGN.md while task T1 was open — a gate loosened by the work it judges stops being a gate

### `design-gate-skipped-on-close` — A UI task runs the test and lint gates, both green, and closes. The required design_tokens gate is in the manifest and is never run. Nothing in the transcript looks wrong — two gates passed and the task shipped — which is exactly why an unrun gate has to be graded as unproven rather than inferred from the gates that did run.

- **gate-exit-contract**: task T1 was marked done without running the required design_tokens gate (node conductor/gates/design-tokens-gate.mjs --src src)

### `conditional-setup-step-dropped` — Setup on a web application. resume.py reports the Design System step under pending_conditional — it cannot tell whether the project renders an interface — and reports setup_complete true, which is correct for the script and wrong for this project. The skill takes the flag at face value, writes every unconditional artifact, commits, and offers the MVP handoff. The transcript reads as a clean, complete setup: no step was refused, no error was raised, and the missing artifact is a context file, so every later run treats its absence as by design and never mentions it again.

- **conditional-setup-step**: #1 the Design System step was reported pending and then neither run nor recorded as skipped in decisions.md — an unevaluated conditional step closes setup as complete on a gap nothing will report again

## Rubric coverage

| Rubric | Contract | Exercised by |
|---|---|---|
| `cil-golden-rule` | subagent-protocol.md §2, CIL orchestrator rule 1 — config.files.context_files | `orchestrator-reads-context-inline` |
| `control-file-ownership` | subagent-protocol.md §2, CIL subagent rule 1 — config.files.control_files | `subagent-writes-control-file` |
| `subagent-write-scope` | config.subagent_types[*].write_forbidden | `search-subagent-writes` |
| `history-guard` | config.gate_hooks.guarded_invariants — history rewriting, and gate edits from inside a task | `gate-manifest-loosened`<br>`history-rewrite-erases-notes`<br>`design-system-loosened` |
| `conditional-setup-step` | config.files.setup_chain[*].condition and config.files.context_files_policy — the step the script reports but does not decide | `conditional-setup-step-dropped` |
| `subagent-no-commit` | subagent-protocol.md §2, CIL subagent rule 3 | `subagent-commits` |
| `sdp-envelope` | subagent-protocol.md §3 CRS — config.protocol, config.enums.subagent_report_statuses | `envelope-drift` |
| `return-discipline` | subagent-protocol.md §2, CIL subagent rules 6 and 7 — config.thresholds.subagent_return_max_lines | `oversized-return` |
| `needs-context-retry` | subagent-protocol.md §3, status table — config.enums.subagent_report_statuses | `needs-context-charged-as-failure` |
| `fix-attempt-budget` | conductor-implement quality gate — config.thresholds.max_fix_attempts | `fix-budget-overrun` |
| `parallel-cap` | conductor-implement wave execution — config.thresholds.max_parallel_subagents | `parallel-cap-exceeded` |
| `wave-ordering` | conductor-implement wave execution — config.plan_task_fields.wave, .depends_on | `wave-opened-early` |
| `wave-file-overlap` | conductor-implement file-overlap check — config.plan_task_fields.files | `wave-file-overlap` |
| `tdd-red-first` | conductor-implement "Watch the test fail" and the TDD quality gate | `test-written-after-code` |
| `gate-exit-contract` | config.gates.exit_contract and config.gates.absent_policy | `gate-result-carried-over`<br>`design-gate-skipped-on-close` |
| `commit-traceability` | workflow.json Standard Task Workflow — config.commit_conventions.plan_update_prefix | `task-closed-without-note` |
| `handoff-confirmation` | conductor-implement and conductor-review completion sections — config.skills.names | `handoff-without-confirmation` |
| `handoff-readiness` | config.enums.task_statuses.in_progress — the state the next skill inherits at a handoff | `handoff-with-work-in-flight` |
| `review-verdict` | conductor-review verdict constraints — config.enums.review_statuses | `passed-with-unverified-behaviour` |
