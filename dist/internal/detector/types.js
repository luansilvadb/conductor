/** AI coding assistant tool type */
export var AIToolType;
(function (AIToolType) {
    AIToolType["Cursor"] = "cursor";
    AIToolType["ClaudeCode"] = "claude-code";
    AIToolType["Antigravity"] = "antigravity";
    AIToolType["Trae"] = "trae";
    AIToolType["Unknown"] = "unknown";
})(AIToolType || (AIToolType = {}));
/** Human-readable name per tool type (exhaustive: adding an enum member forces an update here). */
const TOOL_NAME = {
    [AIToolType.Cursor]: 'Cursor',
    [AIToolType.ClaudeCode]: 'Claude Code',
    [AIToolType.Antigravity]: 'Antigravity',
    [AIToolType.Trae]: 'Trae',
    [AIToolType.Unknown]: 'Unknown',
};
/** Config directory name per tool type */
const CONFIG_DIR = {
    [AIToolType.Cursor]: '.cursor/commands',
    [AIToolType.ClaudeCode]: '.claude/commands',
    [AIToolType.Antigravity]: '.agents',
    [AIToolType.Trae]: '.trae/commands',
    [AIToolType.Unknown]: '',
};
/** Signature files/directories per tool type */
const SIGNATURE_FILES = {
    [AIToolType.Cursor]: ['.cursor', '.cursorrules'],
    [AIToolType.ClaudeCode]: ['.claude', 'CLAUDE.md'],
    [AIToolType.Antigravity]: ['.antigravity'],
    [AIToolType.Trae]: ['.trae'],
    [AIToolType.Unknown]: [],
};
/** Human-readable name */
export function toolTypeToString(t) {
    return TOOL_NAME[t];
}
/** Config directory name for each tool type */
export function getConfigDir(t) {
    return CONFIG_DIR[t];
}
/** Signature files/directories to detect */
export function getSignatureFiles(t) {
    return SIGNATURE_FILES[t];
}
/** Flag string aliases mapped to tool type */
const TOOL_FLAG_TO_TYPE = {
    cursor: AIToolType.Cursor,
    'claude-code': AIToolType.ClaudeCode,
    claude: AIToolType.ClaudeCode,
    antigravity: AIToolType.Antigravity,
    trae: AIToolType.Trae,
};
/** Parse a tool flag string to AIToolType */
export function parseToolFlag(flag) {
    return TOOL_FLAG_TO_TYPE[flag.toLowerCase()] ?? AIToolType.Unknown;
}
//# sourceMappingURL=types.js.map