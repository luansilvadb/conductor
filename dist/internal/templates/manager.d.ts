import { AIToolType } from '../detector/types.js';
import { type TemplateMeta, type GenerateRequest, type GenerateResult } from './types.js';
export interface TemplateManager {
    listAvailable(tool: AIToolType): TemplateMeta[];
    listAll(): TemplateMeta[];
    getByName(name: string): TemplateMeta | undefined;
    generate(req: GenerateRequest): GenerateResult;
}
export declare class EmbeddedTemplateManager implements TemplateManager {
    listAvailable(_tool: AIToolType): TemplateMeta[];
    /** Load all top-level .md files from every category directory. */
    listAll(): TemplateMeta[];
    getByName(name: string): TemplateMeta | undefined;
    generate(req: GenerateRequest): GenerateResult;
}
//# sourceMappingURL=manager.d.ts.map