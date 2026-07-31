import dispatchContracts from './dispatch-contracts.json' with { type: 'json' };

/**
 * Single source of truth for all supported AI coding tools.
 *
 * Adding a new tool: add ONE entry to TOOL_REGISTRY — nothing else needs changing.
 * Detection priority, config paths, category remapping, and flag aliases all live here.
 */

// ---------------------------------------------------------------------------
// Tool type enum
// ---------------------------------------------------------------------------

/** AI coding assistant tool type */
export enum AIToolType {
  Cursor = 'cursor',
  ClaudeCode = 'claude-code',
  Antigravity = 'antigravity',
  Trae = 'trae',
  Unknown = 'unknown',
}

// ---------------------------------------------------------------------------
// ToolLifecycle — optional hook/permission integration
// ---------------------------------------------------------------------------

/**
 * Where a tool keeps its lifecycle configuration, when it has one.
 *
 * This is deliberately optional. Conductor's quality gates are invoked by the
 * generated skills, which every supported tool can do; hooks only make the same
 * gates fire automatically. A tool without a lifecycle therefore loses
 * automation, never capability — which is what keeps `TOOL_REGISTRY` neutral
 * while still letting a tool that offers more get more.
 *
 * Only fill this in for tools whose hook contract is actually known. An omitted
 * lifecycle is correct; a guessed one writes broken configuration into the
 * user's editor.
 */
export interface ToolLifecycle {
  /** Settings file holding hooks/permissions, relative to the project root. */
  settingsPath: string;
  /**
   * Tool-native event names for the two points Conductor cares about:
   *   - `beforeToolUse`: intercept a command before it runs (deny-list guard).
   *   - `afterResponse`: run the ratchet once the agent finishes responding.
   */
  events: Readonly<{ beforeToolUse: string; afterResponse: string }>;
  /** Whether the tool supports persistent allow/deny command rules. */
  permissions: boolean;
}

// ---------------------------------------------------------------------------
// ToolDispatch — optional subagent dispatch contract
// ---------------------------------------------------------------------------

/** A subagent type the host tool actually exposes, described by capability. */
export interface SubagentType {
  /** The tool-native type id, spelled exactly as the dispatch tool expects it. */
  id: string;
  /** Capability tags the SDP matches against via resolveSubagentByCapability. */
  capabilities: string[];
  description: string;
  /** True for retrieval types that must never write (SDP Subagent Rule 8). */
  write_forbidden: boolean;
}

/**
 * How a tool exposes subagent dispatch, when it exposes one at all.
 *
 * Deliberately optional, and deliberately empty-by-default. Conductor's SDP
 * treats "no dispatch tool available" as a first-class mode
 * (`config.protocol.degraded_mode`): the orchestrator runs inline and says so.
 * That is a supported way to work — losing isolation, never correctness.
 *
 * Shipping a guessed tool name is strictly worse than shipping none. The
 * generated config would name a dispatch tool the environment does not have,
 * every capability lookup would resolve to an id nothing answers to, and the
 * framework would land in degraded mode anyway — but silently, through a failed
 * dispatch, with prose everywhere still claiming isolation is in force. Only
 * fill this in for a tool whose contract is known.
 */
export interface ToolDispatch {
  /** Dispatch tool names, checked in order. First match wins. */
  toolAliases: string[];
  /** Subagent types keyed by Conductor's role names. */
  subagentTypes: Record<string, SubagentType>;
}

// ---------------------------------------------------------------------------
// ToolDescriptor — complete per-tool specification
// ---------------------------------------------------------------------------

/** Complete specification for a supported AI coding tool. */
export interface ToolDescriptor {
  /** Canonical type identifier. */
  id: AIToolType;
  /** Human-readable display name (e.g. "Claude Code"). */
  label: string;
  /** CLI flag aliases accepted by --tool (all lowercase). */
  flags: string[];
  /**
   * Full config directory path relative to project root.
   * Example: ".cursor/commands", ".agents"
   */
  configDir: string;
  /**
   * Base config directory — the root where non-commands assets live.
   * For tools whose configDir ends in a category segment (e.g. ".cursor/commands"),
   * this is the parent (".cursor"). For tools where configDir IS the base (".agents"),
   * both fields are equal.
   */
  configBaseDir: string;
  /** Files or directories whose presence on disk indicates this tool is active. */
  signatures: string[];
  /**
   * Detection priority: lower number = checked first during auto-detection.
   * Must be unique across all registered tools.
   */
  detectionPriority: number;
  /**
   * Optional category remapping: source category name → output subdirectory name.
   * Used when the tool uses different naming conventions than the source categories.
   * Example: Antigravity maps "commands" → "workflows".
   * Categories not listed here use their source name unchanged.
   */
  categoryMapping?: Readonly<Record<string, string>>;
  /**
   * Optional lifecycle integration. Omit when the tool has no hook contract, or
   * when its contract is not known with certainty — see {@link ToolLifecycle}.
   */
  lifecycle?: ToolLifecycle;
  /**
   * Optional subagent dispatch contract. Omit when the tool exposes no subagent
   * dispatch, or when its contract is not known with certainty — the generated
   * config then declares dispatch absent and the SDP runs in degraded mode,
   * which is honest. See {@link ToolDispatch}.
   */
  dispatch?: ToolDispatch;
}

/**
 * Declared dispatch contracts, by tool id.
 *
 * Kept in JSON rather than inline here because the trace evals read the same
 * file: a rubric about write scope must grade the contract that is actually
 * generated, and a second copy of these ids would let the two drift until the
 * evals pass against a config no project has.
 */
const DISPATCH_CONTRACTS = dispatchContracts.contracts as Record<string, ToolDispatch>;

// ---------------------------------------------------------------------------
// TOOL_REGISTRY — add new tools here only
// ---------------------------------------------------------------------------

export const TOOL_REGISTRY: readonly ToolDescriptor[] = [
  {
    id: AIToolType.Cursor,
    label: 'Cursor',
    flags: ['cursor'],
    configDir: '.cursor/commands',
    configBaseDir: '.cursor',
    signatures: ['.cursor', '.cursorrules'],
    detectionPriority: 1,
    // No `dispatch`: Cursor's subagent contract is not known here. See ToolDispatch —
    // an omission puts the SDP in declared degraded mode; a guess breaks it silently.
  },
  {
    id: AIToolType.ClaudeCode,
    label: 'Claude Code',
    flags: ['claude-code', 'claude'],
    configDir: '.claude/commands',
    configBaseDir: '.claude',
    signatures: ['.claude', 'CLAUDE.md'],
    detectionPriority: 2,
    lifecycle: {
      settingsPath: '.claude/settings.json',
      events: { beforeToolUse: 'PreToolUse', afterResponse: 'Stop' },
      permissions: true,
    },
    dispatch: DISPATCH_CONTRACTS['claude-code'],
  },
  {
    id: AIToolType.Antigravity,
    label: 'Antigravity',
    flags: ['antigravity'],
    configDir: '.agents',
    configBaseDir: '.agents',
    signatures: ['.antigravity'],
    detectionPriority: 3,
    categoryMapping: { commands: 'workflows' },
    dispatch: DISPATCH_CONTRACTS['antigravity'],
  },
  {
    id: AIToolType.Trae,
    label: 'Trae',
    flags: ['trae'],
    configDir: '.trae/commands',
    configBaseDir: '.trae',
    signatures: ['.trae'],
    detectionPriority: 4,
    // No `dispatch`: Trae's subagent contract is not known here. See ToolDispatch.
  },
];

/** Dispatch contract for a tool, or an explicitly empty one when it has none. */
export function findDispatch(id: AIToolType): ToolDispatch {
  return findDescriptor(id)?.dispatch ?? { toolAliases: [], subagentTypes: {} };
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Lookup a descriptor by tool type. Returns undefined for AIToolType.Unknown. */
export function findDescriptor(id: AIToolType): ToolDescriptor | undefined {
  return TOOL_REGISTRY.find((d) => d.id === id);
}

/** Lookup a descriptor by CLI flag string (case-insensitive). */
export function findDescriptorByFlag(flag: string): ToolDescriptor | undefined {
  const lower = flag.toLowerCase();
  return TOOL_REGISTRY.find((d) => d.flags.includes(lower));
}

/**
 * Returns all registered tools sorted ascending by detectionPriority.
 * Use this when iterating candidates for auto-detection.
 */
export function registeredToolsByPriority(): readonly ToolDescriptor[] {
  return [...TOOL_REGISTRY].sort((a, b) => a.detectionPriority - b.detectionPriority);
}

/**
 * Lifecycle integration for a tool, or undefined when it has none.
 *
 * Callers MUST treat undefined as "gates run via the skills only" — never as an
 * error and never as a reason to skip the gates.
 */
export function findLifecycle(id: AIToolType): ToolLifecycle | undefined {
  return findDescriptor(id)?.lifecycle;
}

/** Parse a tool flag string to AIToolType. Returns AIToolType.Unknown if unrecognised. */
export function parseToolFlag(flag: string): AIToolType {
  return findDescriptorByFlag(flag)?.id ?? AIToolType.Unknown;
}
