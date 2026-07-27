/** AI coding assistant tool type */
export declare enum AIToolType {
    Cursor = "cursor",
    ClaudeCode = "claude-code",
    Antigravity = "antigravity",
    Trae = "trae",
    Unknown = "unknown"
}
/** Human-readable name */
export declare function toolTypeToString(t: AIToolType): string;
/** Config directory name for each tool type */
export declare function getConfigDir(t: AIToolType): string;
/** Signature files/directories to detect */
export declare function getSignatureFiles(t: AIToolType): string[];
/** Result of environment detection */
export interface DetectResult {
    toolType: AIToolType;
    configPath: string;
    isValid: boolean;
    message: string;
}
/** Parse a tool flag string to AIToolType */
export declare function parseToolFlag(flag: string): AIToolType;
//# sourceMappingURL=types.d.ts.map