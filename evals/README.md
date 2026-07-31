# Agent evals — graded traces

```bash
npm run eval:traces     # also runs as part of `npm run build`
```

Conductor's product is agent behaviour. The build already guards the text it generates
(`check:i18n`), but nothing guarded the thing that text exists to produce: the order of
tool calls, who is allowed to read what, whether a wave waited, whether a handoff was
confirmed. Those rules live in prose — `subagent-protocol.md`, the skill constraints,
`config.json` — and prose regresses without any file looking wrong. The regression only
surfaces when a user hits it, in a run nobody kept.

These evals grade **traces**: the recorded sequence of one run's tool calls, dispatches,
returns, gates, commits and handoffs. A grader decides one invariant against that
sequence, so the checks apply to how the agent moved rather than to what it said.

## What is graded

Each trace in `traces/` declares, in `expect_failures`, the rubrics it must trip. A golden
trace declares `[]` and must come back clean. The runner fails on either mismatch:

- **a rubric that stopped firing** — the regression it protects against would now reach a user;
- **a rubric that fired where it should not** — the eval's score stops meaning anything, and
  the first response to a noisy check is to ignore it.

The second direction is why the golden traces deliberately contain the *legitimate*
neighbours of each violation: a subagent reading `plan.md` (allowed) next to an
orchestrator reading it (not), a `needs_context` re-dispatch (free) next to a fix attempt
(charged), a wave dispatched in parallel on disjoint files, `git checkout -b` and a plain
`git push` next to the destructive spellings of both, and a ratchet write to
`gates/baseline.json` inside an open task — which `config.ratchet` requires — next to the
gate-manifest edit that is forbidden there, and a gate that exits 2 recorded under
`unrunnable_gates` with the task left open next to the same exit reclassified as a pending
human check. Without those, a grader that
over-fires still scores a perfect run — which is exactly what happened when this suite was
first written, and how the current golden traces got their shape.

A rubric that no trace exercises also fails the run. An ungraded grader is untested code
wearing the costume of a safety net.

## Where the rules come from

Thresholds, enums, file lists and commit prefixes are read from the shipped
`src/internal/templates/data/config/config.json`, never restated here. Loosening the
contract there — raising `max_parallel_subagents`, dropping a file from `control_files` —
makes the corresponding trace stop failing, and the eval reports it. The graders cannot
drift away from the framework they grade without saying so.

## Rubrics

| Rubric | Invariant |
|---|---|
| `cil-golden-rule` | The orchestrator never reads a `config.files.context_files` entry inline. |
| `control-file-ownership` | Subagents never write a `config.files.control_files` entry. |
| `subagent-write-scope` | A subagent dispatched as a `write_forbidden` type never writes. |
| `history-guard` | No run rewrites git history, and no open task edits the gate manifest or the structure script. |
| `subagent-no-commit` | Subagents never commit or attach notes. |
| `sdp-envelope` | Every return carries the protocol field, a status from the enum, and a token estimate. |
| `return-discipline` | Returns stay inside the line budget and never quote file text back. |
| `needs-context-retry` | `needs_context` is re-dispatched and never charged as a fix attempt; `blocked` is never re-sent unchanged. |
| `fix-attempt-budget` | Fix attempts per task stay within `config.thresholds.max_fix_attempts`. |
| `parallel-cap` | Concurrent subagents stay within `config.thresholds.max_parallel_subagents`. |
| `wave-ordering` | A wave opens only after the previous one closed, and dependencies sit in strictly lower waves. |
| `wave-file-overlap` | Tasks sharing a file are never dispatched in parallel. |
| `tdd-red-first` | A closed task has a test that failed before the implementation and passed after. |
| `gate-exit-contract` | Gates are proven by the run being reported; absent gates are declared, not counted as passes. |
| `unrunnable-gate` | A required gate that exits 2 is recorded in `unrunnable_gates` and blocks the track — never reclassified as a pending human check. |
| `commit-traceability` | A closed task has its commit, its note, its SHA in the plan, and a prefixed plan commit. |
| `handoff-confirmation` | A skill hands off only to a known skill, and only after the user was asked. |
| `handoff-readiness` | A handoff fires only once every task is closed and every subagent has returned. |
| `review-verdict` | The verdict comes from the enum, and `passed` requires an empty human-verification list. |

## Adding a trace

Write `traces/NN-name.trace.json`:

```json
{
  "id": "short-id",
  "skill": "conductor-implement",
  "description": "What went wrong, and why a transcript read would miss it.",
  "expect_failures": ["rubric-id"],
  "gates": [{ "kind": "test", "cmd": "npm test", "required": true }],
  "events": [ { "t": "dispatch", "id": "s1", "task": "T1", "prompt": "…" } ]
}
```

`gates` is the gate manifest the run was working against — `cmd: null` marks an absent
gate. Event types are listed in `eventTypes` at the bottom of `graders.mjs`; an unknown
`t` fails the run rather than being ignored, because an event no grader reads is a case
that can never fail.

Keep each regression trace tripping exactly one rubric. When a trace trips two, the second
one is usually a grader reaching past its own invariant.

## Reports

`report.md` is regenerated on every run and committed, so a diff shows what the graders
said before and after a change to the framework's contract.
