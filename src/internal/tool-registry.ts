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
}

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
  },
  {
    id: AIToolType.ClaudeCode,
    label: 'Claude Code',
    flags: ['claude-code', 'claude'],
    configDir: '.claude/commands',
    configBaseDir: '.claude',
    signatures: ['.claude', 'CLAUDE.md'],
    detectionPriority: 2,
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
  },
  {
    id: AIToolType.Trae,
    label: 'Trae',
    flags: ['trae'],
    configDir: '.trae/commands',
    configBaseDir: '.trae',
    signatures: ['.trae'],
    detectionPriority: 4,
  },
];

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

/** Parse a tool flag string to AIToolType. Returns AIToolType.Unknown if unrecognised. */
export function parseToolFlag(flag: string): AIToolType {
  return findDescriptorByFlag(flag)?.id ?? AIToolType.Unknown;
}
