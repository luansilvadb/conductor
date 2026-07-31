/**
 * Trace graders — the deterministic half of Conductor's agent evals.
 *
 * Conductor ships a multi-agent workflow whose rules live in prose: the Subagent
 * Dispatch Protocol, the skill constraints, and the thresholds in config.json. Prose
 * is checked at review time by a human, which means a regression in *how the agent
 * moves* — an orchestrator that starts reading plan.md inline, a subagent that commits,
 * a wave that opens before the previous one closed, a handoff fired without asking —
 * only surfaces once a user hits it. Those failures never touch the generated text, so
 * no build guard sees them.
 *
 * A grader here reads a recorded trace (the sequence of tool calls, dispatches, returns,
 * gates, and handoffs of one run) and decides one invariant against it. Every threshold,
 * enum, and file list is resolved from the real config.json rather than restated, so a
 * contract change either updates the graders automatically or fails them loudly — the
 * graders cannot silently drift away from the framework they grade.
 *
 * Each grader returns a list of human-readable findings. Empty means the invariant held.
 */
import path from 'node:path';

const base = (p) => path.posix.basename(String(p ?? ''));
const isSub = (actor) => typeof actor === 'string' && actor.startsWith('sub:');
const of = (trace, type) => trace.events.map((e, i) => [i, e]).filter(([, e]) => e.t === type);

/** The dispatch event that opened subagent `id`, so a return can be attributed to a task. */
const dispatchOf = (trace, id) => trace.events.find((e) => e.t === 'dispatch' && e.id === id);

/** Tasks that reached the done checkbox — the only ones the closing invariants apply to. */
const doneTasks = (trace, config) =>
  of(trace, 'plan')
    .filter(([, e]) => e.status === config.enums.task_statuses.done)
    .map(([i, e]) => ({ index: i, task: e.task, sha: e.sha }));

/** Every task declared by a wave-open event, keyed by id. */
function taskIndex(trace) {
  const tasks = new Map();
  for (const [, e] of of(trace, 'wave')) {
    if (e.op !== 'open') continue;
    for (const t of e.tasks ?? []) tasks.set(t.id, { ...t, wave: e.n });
  }
  return tasks;
}

export const graders = [
  {
    id: 'cil-golden-rule',
    contract: 'subagent-protocol.md §2, CIL orchestrator rule 1 — config.files.context_files',
    why: 'The orchestrator reading context inline is the regression the whole isolation layer exists to prevent: it works, so nothing complains, and the context budget the delegation was meant to protect is spent anyway.',
    grade(trace, config) {
      const out = [];
      for (const [i, e] of of(trace, 'read')) {
        if (isSub(e.actor)) continue;
        if (config.files.context_files.includes(base(e.path))) {
          out.push(`#${i} orchestrator read ${e.path} inline — context files are reachable only via subagent`);
        }
      }
      return out;
    },
  },

  {
    id: 'control-file-ownership',
    contract: 'subagent-protocol.md §2, CIL subagent rule 1 — config.files.control_files',
    why: 'Control files are the framework\'s own state. A subagent writing one races the orchestrator and corrupts the record that revert and status depend on.',
    grade(trace, config) {
      const out = [];
      for (const [i, e] of of(trace, 'write')) {
        if (!isSub(e.actor)) continue;
        if (config.files.control_files.includes(base(e.path))) {
          out.push(`#${i} ${e.actor} wrote control file ${e.path} — control files are orchestrator-owned`);
        }
      }
      return out;
    },
  },

  {
    id: 'subagent-no-commit',
    contract: 'subagent-protocol.md §2, CIL subagent rule 3',
    why: 'A commit made inside a subagent is invisible to the orchestrator that is supposed to attach the note and record the SHA in the plan, so it becomes a ghost commit that revert cannot reconstruct.',
    grade(trace) {
      const out = [];
      for (const [i, e] of trace.events.map((e, idx) => [idx, e])) {
        if ((e.t === 'commit' || e.t === 'note') && isSub(e.actor)) {
          out.push(`#${i} ${e.actor} performed git ${e.t} ${e.sha ?? ''} — subagents never touch git history`);
        }
      }
      return out;
    },
  },

  {
    id: 'sdp-envelope',
    contract: 'subagent-protocol.md §3 CRS — config.protocol, config.enums.subagent_report_statuses',
    why: 'The envelope check is what lets the orchestrator trust a return it never reads in full. An unvalidated envelope means conversational text can flow back into orchestrator context unnoticed.',
    grade(trace, config) {
      const out = [];
      const statuses = Object.keys(config.enums.subagent_report_statuses);
      for (const [i, e] of of(trace, 'return')) {
        if (e.protocol !== config.protocol.version_string) {
          out.push(`#${i} return from ${e.id} carries ${config.protocol.protocol_field}=${JSON.stringify(e.protocol)}, expected ${JSON.stringify(config.protocol.version_string)}`);
        }
        if (!statuses.includes(e.status)) {
          out.push(`#${i} return from ${e.id} has ${config.protocol.status_field}=${JSON.stringify(e.status)}, outside config.enums.subagent_report_statuses (${statuses.join(', ')})`);
        }
        if (typeof e[config.protocol.token_estimate_field] !== 'number') {
          out.push(`#${i} return from ${e.id} omits ${config.protocol.token_estimate_field} — the orchestrator cannot report what it never received`);
        }
      }
      return out;
    },
  },

  {
    id: 'return-discipline',
    contract: 'subagent-protocol.md §2, CIL subagent rules 6 and 7 — config.thresholds.subagent_return_max_lines',
    why: 'A return that quotes the files it read moves the tokens into the orchestrator anyway. The isolation still looks like it happened — the dispatch is in the trace — while the saving it existed for is gone.',
    grade(trace, config) {
      const out = [];
      const max = config.thresholds.subagent_return_max_lines;
      for (const [i, e] of of(trace, 'return')) {
        if (typeof e.lines === 'number' && e.lines > max && e.status !== 'done_with_concerns') {
          out.push(`#${i} return from ${e.id} is ${e.lines} lines, over the ${max}-line budget, without spilling to a file and downgrading status`);
        }
        if (e.quotes_file_text) {
          out.push(`#${i} return from ${e.id} reproduces file contents — a subagent returns findings about a file, never its text`);
        }
      }
      return out;
    },
  },

  {
    id: 'needs-context-retry',
    contract: 'subagent-protocol.md §3, status table — config.enums.subagent_report_statuses',
    why: 'needs_context reports a defective prompt, not a defective task. Charging it to the retry budget burns attempts on the orchestrator\'s own mistake and hides the real cause; re-sending a blocked task unchanged just reproduces the block.',
    grade(trace, config) {
      const out = [];
      const max = config.thresholds.max_fix_attempts;
      for (const [i, e] of of(trace, 'return')) {
        const dispatch = dispatchOf(trace, e.id);
        if (!dispatch) continue;

        if (e.status === 'needs_context') {
          const redispatch = of(trace, 'dispatch').find(([j, d]) => j > i && d.task === dispatch.task);
          if (!redispatch) {
            out.push(`#${i} ${e.id} returned needs_context for task ${dispatch.task} but the task was never re-dispatched with the missing input`);
            continue;
          }
          const charged = of(trace, 'fix').filter(([j, f]) => j > i && j < redispatch[0] && f.task === dispatch.task);
          for (const [j] of charged) {
            out.push(`#${j} needs_context on task ${dispatch.task} was charged as a fix attempt — it must not consume any of the ${max} allowed`);
          }
        }

        if (e.status === 'blocked') {
          const identical = of(trace, 'dispatch').find(([j, d]) => j > i && d.task === dispatch.task && d.prompt === dispatch.prompt);
          if (identical) {
            out.push(`#${identical[0]} blocked task ${dispatch.task} was re-dispatched with an identical prompt — a block must be split, re-planned, or escalated`);
          }
        }
      }
      return out;
    },
  },

  {
    id: 'fix-attempt-budget',
    contract: 'conductor-implement quality gate — config.thresholds.max_fix_attempts',
    why: 'The cap is what converts a failing gate into a reported blocker instead of an open-ended grind, and it is the first rule to erode when an agent is close to green.',
    grade(trace, config) {
      const out = [];
      const max = config.thresholds.max_fix_attempts;
      const perTask = new Map();
      for (const [i, e] of of(trace, 'fix')) {
        const seen = (perTask.get(e.task) ?? 0) + 1;
        perTask.set(e.task, seen);
        if (seen > max) out.push(`#${i} fix attempt ${seen} on task ${e.task} — the cap is ${max}, after which the task stops and is reported as blocked`);
      }
      return out;
    },
  },

  {
    id: 'parallel-cap',
    contract: 'conductor-implement wave execution — config.thresholds.max_parallel_subagents',
    why: 'Exceeding the cap is invisible in a transcript and shows up as timeouts and interleaved writes under load.',
    grade(trace, config) {
      const out = [];
      const max = config.thresholds.max_parallel_subagents;
      const open = new Set();
      trace.events.forEach((e, i) => {
        if (e.t === 'dispatch') {
          open.add(e.id);
          if (open.size > max) out.push(`#${i} ${open.size} subagents open at once (${[...open].join(', ')}) — the cap is ${max}`);
        } else if (e.t === 'return') open.delete(e.id);
      });
      return out;
    },
  },

  {
    id: 'wave-ordering',
    contract: 'conductor-implement wave execution — config.plan_task_fields.wave, .depends_on',
    why: 'A wave opened early runs tasks on top of work that is not finished. The failure surfaces later, in a task that looks unrelated to the one that actually broke the order.',
    grade(trace, config) {
      const out = [];
      const done = new Set();
      const tasks = taskIndex(trace);
      let previous = null;

      trace.events.forEach((e, i) => {
        if (e.t === 'plan' && e.status === config.enums.task_statuses.done) done.add(e.task);
        if (e.t !== 'wave' || e.op !== 'open') return;

        if (previous) {
          const unfinished = previous.tasks.filter((t) => !done.has(t.id)).map((t) => t.id);
          if (unfinished.length > 0) {
            out.push(`#${i} wave ${e.n} opened while wave ${previous.n} still has ${unfinished.join(', ')} unfinished`);
          }
        }
        for (const t of e.tasks ?? []) {
          for (const dep of t.depends_on ?? []) {
            const upstream = tasks.get(dep);
            if (upstream && upstream.wave >= e.n) {
              out.push(`#${i} task ${t.id} in wave ${e.n} depends on ${dep} in wave ${upstream.wave} — a dependency must sit in a strictly lower wave`);
            } else if (!done.has(dep)) {
              out.push(`#${i} task ${t.id} in wave ${e.n} depends on ${dep}, which is not done`);
            }
          }
        }
        previous = { n: e.n, tasks: e.tasks ?? [] };
      });
      return out;
    },
  },

  {
    id: 'wave-file-overlap',
    contract: 'conductor-implement file-overlap check — config.plan_task_fields.files',
    why: 'Two subagents writing one file lose work silently: the trace shows both tasks succeeding and only the last write survives.',
    grade(trace) {
      const out = [];
      const tasks = taskIndex(trace);
      const open = new Map();
      trace.events.forEach((e, i) => {
        if (e.t === 'return') { open.delete(e.id); return; }
        if (e.t !== 'dispatch' || !e.task) return;

        const mine = tasks.get(e.task);
        for (const [, other] of open) {
          const theirs = tasks.get(other);
          if (!mine || !theirs || mine.wave !== theirs.wave) continue;
          const shared = (mine.files ?? []).filter((f) => (theirs.files ?? []).includes(f));
          if (shared.length > 0) {
            out.push(`#${i} tasks ${other} and ${e.task} run in parallel in wave ${mine.wave} but share ${shared.join(', ')} — that wave had to be downgraded to sequential`);
          }
        }
        open.set(e.id, e.task);
      });
      return out;
    },
  },

  {
    id: 'tdd-red-first',
    contract: 'conductor-implement "Watch the test fail" and the TDD quality gate',
    why: 'A test written after the code is shaped by the code it was meant to judge, and a test that never failed proves nothing. Both leave a green suite that asserts nothing.',
    grade(trace, config) {
      const out = [];
      for (const { task } of doneTasks(trace, config)) {
        const red = of(trace, 'gate').find(([, g]) => g.task === task && g.kind === 'test' && g.exit_code !== 0);
        const green = of(trace, 'gate').find(([, g]) => g.task === task && g.kind === 'test' && g.exit_code === 0);
        const impl = of(trace, 'write').find(([, w]) => w.task === task && w.kind === 'impl');

        if (!red) {
          out.push(`task ${task} was marked done without a test run that failed first — the red phase is missing`);
        } else if (impl && impl[0] < red[0]) {
          out.push(`#${impl[0]} implementation for task ${task} was written before the failing test at #${red[0]}`);
        }
        if (!green) out.push(`task ${task} was marked done without a passing test run`);
      }
      return out;
    },
  },

  {
    id: 'gate-exit-contract',
    contract: 'config.gates.exit_contract and config.gates.absent_policy',
    why: 'A gate result carried over from an earlier task is an assertion about code that has since changed, and an absent gate reported as a pass converts an unverified check into a false guarantee.',
    grade(trace, config) {
      const out = [];
      const manifest = trace.gates ?? [];
      for (const { task } of doneTasks(trace, config)) {
        const runs = of(trace, 'gate').filter(([, g]) => g.task === task);
        for (const gate of manifest) {
          // The last run of that kind is the one being reported at close; earlier runs are
          // the red phase, and reading those instead would flag every correct TDD cycle.
          const run = runs.filter(([, g]) => g.kind === gate.kind).at(-1);
          if (gate.cmd === null) {
            if (!run || !run[1].declared_absent) {
              out.push(`task ${task} closed without declaring the absent ${gate.kind} gate — ${config.gates.absent_policy.split('.')[0]}`);
            }
            continue;
          }
          if (!run) {
            if (gate.required) out.push(`task ${task} was marked done without running the required ${gate.kind} gate (${gate.cmd})`);
            continue;
          }
          const [i, g] = run;
          if (g.carried_over) out.push(`#${i} ${gate.kind} gate for task ${task} reuses an earlier run — a gate is proven by the run being reported`);
          if (gate.required && g.exit_code !== 0) out.push(`#${i} required ${gate.kind} gate exited ${g.exit_code} yet task ${task} was marked done`);
        }
      }
      return out;
    },
  },

  {
    id: 'commit-traceability',
    contract: 'workflow.json Standard Task Workflow — config.commit_conventions.plan_update_prefix',
    why: 'The note and the SHA in the plan are what revert reads to reconstruct a track. A task that closes without them is delivered work the framework can no longer undo or explain.',
    grade(trace, config) {
      const out = [];
      for (const { index, task, sha } of doneTasks(trace, config)) {
        if (!sha) {
          out.push(`#${index} plan marked task ${task} done without recording the commit SHA`);
          continue;
        }
        const commit = of(trace, 'commit').find(([, c]) => c.sha === sha);
        if (!commit) out.push(`#${index} plan records SHA ${sha} for task ${task} but no commit with that SHA appears in the trace`);
        if (!of(trace, 'note').some(([, n]) => n.sha === sha)) {
          out.push(`task ${task} closed without a git note on ${sha} — the task summary belongs in a note, not the commit message`);
        }
        const planCommit = of(trace, 'commit').find(([j, c]) => j > index && String(c.message ?? '').startsWith(config.commit_conventions.plan_update_prefix));
        if (!planCommit) {
          out.push(`task ${task}: the plan update was not committed with the ${config.commit_conventions.plan_update_prefix} prefix`);
        }
      }
      return out;
    },
  },

  {
    id: 'handoff-confirmation',
    contract: 'conductor-implement and conductor-review completion sections — config.skills.names',
    why: 'A handoff is the point where one skill starts acting with another skill\'s authority. Firing it on an inferred yes is how a review silently becomes a revert.',
    grade(trace, config) {
      const out = [];
      const known = Object.values(config.skills.names);
      for (const [i, e] of of(trace, 'handoff')) {
        if (!known.includes(e.to)) {
          out.push(`#${i} handoff to unknown skill ${JSON.stringify(e.to)} — targets are resolved from config.skills.names`);
        }
        const asked = of(trace, 'ask').some(([j, a]) => j < i && a.about === e.to);
        if (!asked) out.push(`#${i} handoff to ${e.to} without asking the user first`);
        else if (!e.confirmed) out.push(`#${i} handoff to ${e.to} proceeded without explicit confirmation`);
      }
      return out;
    },
  },

  {
    id: 'review-verdict',
    contract: 'conductor-review verdict constraints — config.enums.review_statuses',
    why: 'A track closing as passed while carrying unverified behaviour is the most damaging thing the review can produce: it converts an open question into a guarantee nobody will revisit.',
    grade(trace, config) {
      const out = [];
      for (const [i, e] of of(trace, 'verdict')) {
        if (!config.enums.review_statuses.includes(e.status)) {
          out.push(`#${i} verdict ${JSON.stringify(e.status)} is outside config.enums.review_statuses (${config.enums.review_statuses.join(', ')})`);
        }
        const pending = e.needs_human ?? [];
        if (e.status === 'passed' && pending.length > 0) {
          out.push(`#${i} verdict is passed while ${pending.length} item(s) still need human verification (${pending.join('; ')}) — that verdict requires an empty list`);
        }
      }
      return out;
    },
  },
];

export const graderIds = graders.map((g) => g.id);

/** Event shapes the graders understand. A trace using anything else is a dataset bug, not a pass. */
export const eventTypes = ['skill', 'read', 'write', 'dispatch', 'return', 'commit', 'note', 'plan', 'gate', 'fix', 'ask', 'handoff', 'wave', 'verdict'];
