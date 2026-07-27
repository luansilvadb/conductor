import { accessSync, constants } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import {
  AIToolType,
  type DetectResult,
  getConfigDir,
  getSignatureFiles,
  toolTypeToString,
} from './types.js';

/** Candidate tools checked during detection (order = priority). */
const CANDIDATE_TOOLS: readonly AIToolType[] = [
  AIToolType.Cursor,
  AIToolType.ClaudeCode,
  AIToolType.Antigravity,
  AIToolType.Trae,
];

/** Interface for detecting AI coding environments */
export interface DetectorService {
  detect(workingDir?: string): DetectResult;
  getConfigDirPath(tool: AIToolType, workingDir: string): string;
}

/** Default detector implementation */
export class DefaultDetector implements DetectorService {
  detect(workingDir?: string): DetectResult {
    const dir = workingDir ?? cwd();
    const tool = findDetectedTool(dir);
    if (tool === AIToolType.Unknown) return notDetectedResult();
    return detectedResult(tool, this.getConfigDirPath(tool, dir));
  }

  getConfigDirPath(tool: AIToolType, workingDir: string): string {
    const configDir = getConfigDir(tool);
    if (!configDir) return '';
    return join(workingDir, configDir);
  }
}

/** Return the first candidate tool whose signature exists in workingDir. */
function findDetectedTool(workingDir: string): AIToolType {
  return CANDIDATE_TOOLS.find((tool) =>
    getSignatureFiles(tool).some((sig) => signatureExists(workingDir, sig)),
  ) ?? AIToolType.Unknown;
}

/** True if a path exists (F_OK) on disk. */
function signatureExists(workingDir: string, signature: string): boolean {
  try {
    accessSync(join(workingDir, signature), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function detectedResult(tool: AIToolType, configPath: string): DetectResult {
  return {
    toolType: tool,
    configPath,
    isValid: true,
    message: `${toolTypeToString(tool)} environment detected`,
  };
}

function notDetectedResult(): DetectResult {
  return {
    toolType: AIToolType.Unknown,
    isValid: false,
    configPath: '',
    message: 'no AI coding tool environment detected',
  };
}
