import { Command } from 'commander';
import { AIToolType } from '../internal/detector/types.js';
export declare function createInitCommand(): Command;
/** Resolve a ferramenta (detecta ou pergunta) e cria o diretório de configuração. */
export declare function runInit(): Promise<boolean>;
export declare function selectToolInteractively(): Promise<AIToolType>;
//# sourceMappingURL=init.d.ts.map