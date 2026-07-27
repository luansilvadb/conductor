import { Command } from 'commander';
import { type DetectResult } from '../internal/detector/types.js';
import { DefaultDetector } from '../internal/detector/detector.js';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { CharmUIRenderer } from '../internal/ui/renderer.js';
export declare let det: DefaultDetector;
export declare let uiRenderer: CharmUIRenderer;
export declare let templateManager: EmbeddedTemplateManager;
export declare let detectedResult: DetectResult;
export declare let toolFlag: string;
export declare function createProgram(): Command;
//# sourceMappingURL=root.d.ts.map