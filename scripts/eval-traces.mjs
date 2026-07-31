/**
 * Agent eval: grade recorded workflow traces against the framework's own contract.
 *
 * `check-i18n-coverage` guards the text Conductor generates. Nothing guarded the
 * behaviour that text is supposed to produce — the order of tool calls, who is allowed
 * to read what, whether a handoff was confirmed, whether a wave waited. Those rules live
 * in prose (subagent-protocol.md, the skill constraints, config.json), so they regress
 * without any file looking wrong.
 *
 * This runner replays the traces in `evals/traces/` through every grader in
 * `evals/graders.mjs` and compares the findings against what each trace declares it
 * should produce. A trace is graded, not merely run: a golden trace must come back clean,
 * and a regression trace must fail exactly the rubrics it names. Both directions matter —
 * a grader that stops firing and a grader that starts over-firing are the same defect,
 * an eval whose score no longer means anything.
 *
 * Thresholds, enums, and file lists come from the shipped config.json, so tightening the
 * contract there is picked up here instead of being restated and left to drift.
 *
 * Run: `npm run eval:traces` (also part of `npm run build`).
 * Report: written to `evals/report.md`, printed in summary form to stdout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { graders, graderIds, eventTypes } from '../evals/graders.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'src', 'internal', 'templates', 'data', 'config', 'config.json');
const contractsPath = path.join(root, 'src', 'internal', 'dispatch-contracts.json');
const tracesDir = path.join(root, 'evals', 'traces');
const reportPath = path.join(root, 'evals', 'report.md');

/**
 * The shipped config.json is a template, not a config: the dispatch block is
 * written per tool at generation time and sits here as a `${tool.*}` placeholder.
 * Graded unresolved, a rubric that reads `config.subagent_types` iterates a
 * string and finds no type to hold anything to — so it reports every trace as
 * clean and stops protecting anything, which is the one failure mode an eval
 * suite must not have.
 *
 * So resolve the placeholders the way generation does, from the same source the
 * tool registry reads, and grade the config a project actually receives. The
 * reference tool is the one whose contract distinguishes a retrieval type from a
 * general one; without that distinction the write-scope rubrics have no contract
 * to enforce.
 */
function loadConfig() {
  const contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
  const reference = contracts.contracts[contracts.reference_tool];
  if (!reference) {
    throw new Error(
      `dispatch-contracts.json names "${contracts.reference_tool}" as the reference tool but declares no contract for it`,
    );
  }

  const raw = fs.readFileSync(configPath, 'utf8')
    .replace('"${tool.subagent_types}"', JSON.stringify(reference.subagentTypes))
    .replace('"${tool.dispatch_tool_aliases}"', JSON.stringify(reference.toolAliases));

  const parsed = JSON.parse(raw);
  if (typeof parsed.subagent_types !== 'object' || Object.keys(parsed.subagent_types).length === 0) {
    throw new Error('config.subagent_types did not resolve — the placeholder in config.json was renamed or removed');
  }
  return parsed;
}

const config = loadConfig();

function loadTraces() {
  if (!fs.existsSync(tracesDir)) return [];
  return fs.readdirSync(tracesDir)
    .filter((f) => f.endsWith('.trace.json'))
    .sort()
    .map((f) => ({ file: `evals/traces/${f}`, ...JSON.parse(fs.readFileSync(path.join(tracesDir, f), 'utf8')) }));
}

/**
 * Dataset integrity. An expectation naming a rubric that no longer exists, or an event
 * type no grader reads, silently turns a case into a case that can never fail — the
 * quietest way for an eval suite to lose its teeth.
 */
function validate(trace) {
  const problems = [];
  if (!Array.isArray(trace.events) || trace.events.length === 0) problems.push('has no events');
  for (const [i, e] of (trace.events ?? []).entries()) {
    if (!eventTypes.includes(e.t)) problems.push(`event #${i} has unknown type ${JSON.stringify(e.t)}`);
  }
  for (const id of trace.expect_failures ?? []) {
    if (!graderIds.includes(id)) problems.push(`expects unknown rubric ${JSON.stringify(id)}`);
  }
  if (!Array.isArray(trace.expect_failures)) problems.push('is missing expect_failures (use [] for a golden trace)');
  return problems;
}

function gradeTrace(trace) {
  const findings = [];
  for (const grader of graders) {
    for (const message of grader.grade(trace, config)) findings.push({ rubric: grader.id, message });
  }
  const detected = [...new Set(findings.map((f) => f.rubric))].sort();
  const expected = [...(trace.expect_failures ?? [])].sort();
  const missed = expected.filter((r) => !detected.includes(r));
  const spurious = detected.filter((r) => !expected.includes(r));
  return { trace, findings, detected, expected, missed, spurious, ok: missed.length === 0 && spurious.length === 0 };
}

const traces = loadTraces();
const invalid = traces.flatMap((t) => validate(t).map((p) => `${t.file} ${p}`));
const results = traces.map(gradeTrace);

/** A rubric no trace exercises is untested code pretending to be a safety net. */
const coverage = graders.map((g) => ({
  rubric: g.id,
  fixtures: results.filter((r) => r.expected.includes(g.id)).map((r) => r.trace.id),
}));
const uncovered = coverage.filter((c) => c.fixtures.length === 0).map((c) => c.rubric);

const graded = results.filter((r) => r.ok).length;
const golden = results.filter((r) => r.expected.length === 0);
const regression = results.filter((r) => r.expected.length > 0);
const failed = results.filter((r) => !r.ok);
const pass = invalid.length === 0 && failed.length === 0 && uncovered.length === 0 && traces.length > 0;

const outcome = (r) => (r.ok ? (r.expected.length === 0 ? 'clean' : 'caught') : r.missed.length > 0 ? 'MISSED' : 'FALSE POSITIVE');

const lines = [];
const w = (s = '') => lines.push(s);

w('# Agent eval report — graded traces');
w();
w(`- Generated: \`npm run eval:traces\``);
w(`- Contract source: \`${path.relative(root, configPath).split(path.sep).join('/')}\``);
w(`- Rubrics: ${graders.length} · Traces: ${traces.length} (${golden.length} golden, ${regression.length} regression)`);
w(`- Graded as expected: ${graded}/${traces.length}`);
w(`- Result: **${pass ? 'PASS' : 'FAIL'}**`);
w();

if (invalid.length > 0) {
  w('## Dataset errors');
  w();
  for (const p of invalid) w(`- ${p}`);
  w();
}

w('## Traces');
w();
w('| Trace | Skill | Expected failures | Detected | Outcome |');
w('|---|---|---|---|---|');
for (const r of results) {
  const cell = (a) => (a.length === 0 ? '—' : a.map((x) => `\`${x}\``).join('<br>'));
  w(`| \`${r.trace.id}\` | ${r.trace.skill ?? '—'} | ${cell(r.expected)} | ${cell(r.detected)} | ${outcome(r)} |`);
}
w();

w('## Graded findings');
w();
w('Each regression trace is a workflow defect the framework must keep catching. The finding below is what the eval reports when that defect reaches a run.');
w();
for (const r of results.filter((x) => x.findings.length > 0)) {
  w(`### \`${r.trace.id}\` — ${r.trace.description ?? ''}`);
  w();
  for (const f of r.findings) w(`- **${f.rubric}**: ${f.message}`);
  if (r.missed.length > 0) w(`- ⚠️ expected but never fired: ${r.missed.join(', ')}`);
  if (r.spurious.length > 0) w(`- ⚠️ fired unexpectedly: ${r.spurious.join(', ')}`);
  w();
}
for (const r of failed.filter((x) => x.findings.length === 0)) {
  w(`### \`${r.trace.id}\` — no findings`);
  w();
  w(`- ⚠️ expected but never fired: ${r.missed.join(', ')}`);
  w();
}

w('## Rubric coverage');
w();
w('| Rubric | Contract | Exercised by |');
w('|---|---|---|');
for (const g of graders) {
  const fixtures = coverage.find((c) => c.rubric === g.id).fixtures;
  w(`| \`${g.id}\` | ${g.contract} | ${fixtures.length === 0 ? '**none**' : fixtures.map((f) => `\`${f}\``).join('<br>')} |`);
}
w();

fs.writeFileSync(reportPath, lines.join('\n'));

// Console summary: the table plus whatever went wrong, so CI output is self-explanatory.
console.log(`[eval-traces] ${graders.length} rubrics × ${traces.length} traces`);
for (const r of results) {
  const mark = r.ok ? (r.expected.length === 0 ? 'clean ' : 'caught') : 'FAIL  ';
  console.log(`  ${mark} ${r.trace.id}${r.expected.length > 0 ? ` → ${r.detected.join(', ') || '(nothing)'}` : ''}`);
}

if (!pass) {
  console.error('\n[eval-traces] FAILED');
  for (const p of invalid) console.error(`  dataset: ${p}`);
  for (const r of failed) {
    for (const rubric of r.missed) console.error(`  ${r.trace.id}: expected ${rubric} to fire, it did not — that regression would now reach a user`);
    for (const rubric of r.spurious) console.error(`  ${r.trace.id}: ${rubric} fired on a trace that should not trip it — ${r.findings.filter((f) => f.rubric === rubric).map((f) => f.message).join('; ')}`);
  }
  for (const rubric of uncovered) console.error(`  ${rubric}: no trace exercises this rubric — add one that fails it, or it is untested`);
  if (traces.length === 0) console.error('  no traces found under evals/traces/');
  console.error(`\nReport: ${path.relative(root, reportPath).split(path.sep).join('/')}`);
  process.exit(1);
}

console.log(`[eval-traces] ok — ${graded}/${traces.length} traces graded as expected, ${graders.length} rubrics covered`);
console.log(`[eval-traces] report: ${path.relative(root, reportPath).split(path.sep).join('/')}`);
