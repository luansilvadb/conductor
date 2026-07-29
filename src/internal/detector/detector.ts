import { accessSync, constants } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import {
  AIToolType,
  type ToolDescriptor,
  findDescriptor,
  registeredToolsByPriority,
} from '../tool-registry.js';
import type { DetectResult } from './types.js';

/** Interface for detecting AI coding environments */
export interface DetectorService {
  detect(workingDir?: string): DetectResult;
  getConfigDirPath(tool: AIToolType, workingDir: string): string;
}

/** Default detector implementation */
export class DefaultDetector implements DetectorService {
  detect(workingDir?: string): DetectResult {
    const dir = workingDir ?? cwd();
    const matches = registeredToolsByPriority().filter((descriptor) =>
      descriptor.signatures.some((sig) => signatureExists(dir, sig)),
    );

    if (matches.length === 0) return notDetectedResult();

    if (matches.length > 1) {
      return {
        toolType: AIToolType.Unknown,
        configPath: '',
        isValid: false,
        message: 'Multiple AI coding tool environments detected. Please select one explicitly.',
      };
    }

    const descriptor = matches[0];
    return {
      toolType: descriptor.id,
      configPath: join(dir, descriptor.configDir),
      isValid: true,
      message: `${descriptor.label} environment detected`,
    };
  }

  getConfigDirPath(tool: AIToolType, workingDir: string): string {
    const configDir = findDescriptor(tool)?.configDir;
    if (!configDir) return '';
    return join(workingDir, configDir);
  }
}

/**
 * (Removed findDetectedDescriptor since DefaultDetector uses inline filtering now)
 */

/** True if a path exists (F_OK) on disk. */
function signatureExists(workingDir: string, signature: string): boolean {
  try {
    accessSync(join(workingDir, signature), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function notDetectedResult(): DetectResult {
  return {
    toolType: AIToolType.Unknown,
    isValid: false,
    configPath: '',
    message: 'no AI coding tool environment detected',
  };
}

