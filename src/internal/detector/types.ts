/** AI coding assistant tool type */
export enum AIToolType {
  Cursor = 'cursor',
  ClaudeCode = 'claude-code',
  Antigravity = 'antigravity',
  Trae = 'trae',
  Unknown = 'unknown',
}

/** Human-readable name per tool type (exhaustive: adding an enum member forces an update here). */
const TOOL_NAME: Record<AIToolType, string> = {
  [AIToolType.Cursor]: 'Cursor',
  [AIToolType.ClaudeCode]: 'Claude Code',
  [AIToolType.Antigravity]: 'Antigravity',
  [AIToolType.Trae]: 'Trae',
  [AIToolType.Unknown]: 'Unknown',
};

/** Config directory name per tool type */
const CONFIG_DIR: Record<AIToolType, string> = {
  [AIToolType.Cursor]: '.cursor/commands',
  [AIToolType.ClaudeCode]: '.claude/commands',
  [AIToolType.Antigravity]: '.agents',
  [AIToolType.Trae]: '.trae/commands',
  [AIToolType.Unknown]: '',
};

/** Signature files/directories per tool type */
const SIGNATURE_FILES: Record<AIToolType, string[]> = {
  [AIToolType.Cursor]: ['.cursor', '.cursorrules'],
  [AIToolType.ClaudeCode]: ['.claude', 'CLAUDE.md'],
  [AIToolType.Antigravity]: ['.antigravity'],
  [AIToolType.Trae]: ['.trae'],
  [AIToolType.Unknown]: [],
};

/** Human-readable name */
export function toolTypeToString(t: AIToolType): string {
  return TOOL_NAME[t];
}

/** Config directory name for each tool type */
export function getConfigDir(t: AIToolType): string {
  return CONFIG_DIR[t];
}

/** Signature files/directories to detect */
export function getSignatureFiles(t: AIToolType): string[] {
  return SIGNATURE_FILES[t];
}

/** Result of environment detection */
export interface DetectResult {
  toolType: AIToolType;
  configPath: string;
  isValid: boolean;
  message: string;
}

/** Flag string aliases mapped to tool type */
const TOOL_FLAG_TO_TYPE: Record<string, AIToolType> = {
  cursor: AIToolType.Cursor,
  'claude-code': AIToolType.ClaudeCode,
  claude: AIToolType.ClaudeCode,
  antigravity: AIToolType.Antigravity,
  trae: AIToolType.Trae,
};

/** Parse a tool flag string to AIToolType */
export function parseToolFlag(flag: string): AIToolType {
  return TOOL_FLAG_TO_TYPE[flag.toLowerCase()] ?? AIToolType.Unknown;
}
