import { Command } from 'commander';
export declare function createGenerateCommand(): Command;
/** Resolve ferramenta, diretório-alvo e gera templates. */
export declare function runGenerate(opts?: {
    templateName?: string;
    force?: boolean;
    output?: string;
}): Promise<void>;
//# sourceMappingURL=generate.d.ts.map