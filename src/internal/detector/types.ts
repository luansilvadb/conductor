/**
 * Detector types — re-exports AIToolType from tool-registry and delegates
 * all data-driven helpers to it. Kept for backward compatibility with existing imports.
 */
export {
  AIToolType,
  parseToolFlag,
  type ToolDescriptor,
} from '../tool-registry.js';

import { findDescriptor } from '../tool-registry.js';
import type { AIToolType as _AIToolType } from '../tool-registry.js';

/** Human-readable name */
export function toolTypeToString(t: _AIToolType): string {
  return findDescriptor(t)?.label ?? 'Unknown';
}

/** Config directory name for each tool type */
export function getConfigDir(t: _AIToolType): string {
  return findDescriptor(t)?.configDir ?? '';
}

/** Signature files/directories to detect */
export function getSignatureFiles(t: _AIToolType): string[] {
  return findDescriptor(t)?.signatures ?? [];
}

/** Result of environment detection */
export interface DetectResult {
  toolType: _AIToolType;
  configPath: string;
  isValid: boolean;
  message: string;
}
