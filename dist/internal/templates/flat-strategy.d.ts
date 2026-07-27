import { type TemplateMeta, type GenerateResult, type GenerationStrategy } from './types.js';
import { type EmbeddedTemplateManager } from './manager.js';
export declare class FlatMarkdownStrategy implements GenerationStrategy {
    private toolKey;
    private manager;
    constructor(toolKey: string, manager: EmbeddedTemplateManager);
    generateAll(workingDir: string, force: boolean): GenerateResult[];
    generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean): GenerateResult[];
}
//# sourceMappingURL=flat-strategy.d.ts.map