/** Metadata parsed from template YAML frontmatter */
export interface TemplateMeta {
    name: string;
    id: string;
    category: string;
    description: string;
    content: string;
    tags: string[];
    /** Source category directory (commands, rules, agents, skills) */
    sourceDir: string;
    /** Relative subpath within the category (e.g. "teste" for skills/teste/SKILL.md) */
    subpath: string;
}
/** Parameters for template generation requests */
export interface GenerateRequest {
    templateName: string;
    targetPath: string;
    force: boolean;
}
/** Result of a template generation operation */
export interface GenerateResult {
    success: boolean;
    filePath?: string;
    message: string;
    error?: Error;
}
/** Strategy for rendering template content per tool */
export interface GenerationStrategy {
    generateAll(workingDir: string, force: boolean): GenerateResult[];
    generateOne(workingDir: string, tmpl: TemplateMeta, force: boolean): GenerateResult[];
}
/** Parse YAML frontmatter from template content */
export declare function parseFrontmatter(content: string): TemplateMeta;
//# sourceMappingURL=types.d.ts.map