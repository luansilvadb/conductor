/**
 * ConductorContext — immutable per-invocation container for all shared services.
 *
 * Built once in the preAction hook and passed explicitly to each command.
 * No global mutable state. Callers outside a command action get a clear error.
 */
import { AIToolType, parseToolFlag } from './tool-registry.js';
import type { DetectResult } from './detector/types.js';
import { DefaultDetector } from './detector/detector.js';
import type { DetectorService } from './detector/detector.js';
import { EmbeddedTemplateManager } from './templates/manager.js';
import type { TemplateManager } from './templates/manager.js';
import { CharmUIRenderer } from './ui/renderer.js';
import type { UIRenderer } from './ui/renderer.js';

export interface ConductorContext {
  readonly det: DetectorService;
  readonly ui: UIRenderer;
  readonly templates: TemplateManager;
  readonly detected: DetectResult;
  readonly workingDir: string;
}

/** Build a fresh context for one CLI invocation. */
export function buildContext(toolFlag: string, workingDir: string): ConductorContext {
  const det = new DefaultDetector();
  const ui = new CharmUIRenderer();
  const templates = new EmbeddedTemplateManager();

  let detected: DetectResult;
  if (toolFlag) {
    const toolType = parseToolFlag(toolFlag);
    detected = {
      toolType,
      configPath: det.getConfigDirPath(toolType, workingDir),
      isValid: toolType !== AIToolType.Unknown,
      message: `tool manually specified: ${toolType}`,
    };
  } else {
    detected = det.detect(workingDir);
  }

  return Object.freeze({ det, ui, templates, detected, workingDir });
}

/** Return a new context with a different DetectResult (used after interactive tool selection). */
export function withDetected(ctx: ConductorContext, detected: DetectResult): ConductorContext {
  return Object.freeze({ ...ctx, detected });
}
