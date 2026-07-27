/** Interface for terminal output rendering */
export interface UIRenderer {
    renderSuccess(msg: string): void;
    renderError(msg: string): void;
    renderWarning(msg: string): void;
    renderInfo(msg: string): void;
    renderTable(headers: string[], rows: string[][]): void;
    confirm(prompt: string): Promise<boolean>;
}
/** Charm UI renderer implementation using @clack/prompts and chalk */
export declare class CharmUIRenderer implements UIRenderer {
    renderSuccess(msg: string): void;
    renderError(msg: string): void;
    renderWarning(msg: string): void;
    renderInfo(msg: string): void;
    renderTable(headers: string[], rows: string[][]): void;
    confirm(prompt: string): Promise<boolean>;
}
//# sourceMappingURL=renderer.d.ts.map