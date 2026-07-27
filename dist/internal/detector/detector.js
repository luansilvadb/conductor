import { accessSync, constants } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { AIToolType, getConfigDir, getSignatureFiles, toolTypeToString, } from './types.js';
/** Candidate tools checked during detection (order = priority). */
const CANDIDATE_TOOLS = [
    AIToolType.Cursor,
    AIToolType.ClaudeCode,
    AIToolType.Antigravity,
    AIToolType.Trae,
];
/** Default detector implementation */
export class DefaultDetector {
    detect(workingDir) {
        const dir = workingDir ?? cwd();
        const tool = findDetectedTool(dir);
        if (tool === AIToolType.Unknown)
            return notDetectedResult();
        return detectedResult(tool, this.getConfigDirPath(tool, dir));
    }
    getConfigDirPath(tool, workingDir) {
        const configDir = getConfigDir(tool);
        if (!configDir)
            return '';
        return join(workingDir, configDir);
    }
}
/** Return the first candidate tool whose signature exists in workingDir. */
function findDetectedTool(workingDir) {
    return CANDIDATE_TOOLS.find((tool) => getSignatureFiles(tool).some((sig) => signatureExists(workingDir, sig))) ?? AIToolType.Unknown;
}
/** True if a path exists (F_OK) on disk. */
function signatureExists(workingDir, signature) {
    try {
        accessSync(join(workingDir, signature), constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
function detectedResult(tool, configPath) {
    return {
        toolType: tool,
        configPath,
        isValid: true,
        message: `${toolTypeToString(tool)} environment detected`,
    };
}
function notDetectedResult() {
    return {
        toolType: AIToolType.Unknown,
        isValid: false,
        configPath: '',
        message: 'no AI coding tool environment detected',
    };
}
//# sourceMappingURL=detector.js.map