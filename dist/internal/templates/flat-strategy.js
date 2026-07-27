import { join } from 'node:path';
import { AIToolType, getConfigDir } from '../detector/types.js';
/**
 * Resolve o subdiretório de saída a partir da categoria de origem.
 *
 * Padrão: o nome da categoria é preservado (commands → commands, rules → rules, etc.).
 * Antigravity: commands → workflows (convenção da IDE).
 */
function outputSubdir(sourceDir, toolType) {
    if (!sourceDir)
        return '';
    if (toolType === AIToolType.Antigravity && sourceDir === 'commands') {
        return 'workflows';
    }
    return sourceDir;
}
/**
 * Resolve o diretório "base" da ferramenta a partir do configDir.
 *
 * Ferramentas cujo configDir termina com `/commands` (Cursor, Claude, etc.)
 * têm a base no diretório pai (ex: `.cursor/commands` → `.cursor`).
 * Ferramentas cujo configDir É a base (Antigravity = `.agents`)
 * permanecem como estão.
 */
function getBaseDir(configDir, workingDir) {
    if (!configDir)
        return workingDir;
    const base = configDir.replace(/\/commands$/, '');
    return join(workingDir, base);
}
export class FlatMarkdownStrategy {
    toolKey;
    manager;
    constructor(toolKey, manager) {
        this.toolKey = toolKey;
        this.manager = manager;
    }
    generateAll(workingDir, force) {
        const tmpls = this.manager.listAvailable(this.toolKey);
        const results = [];
        for (const t of tmpls) {
            results.push(...this.generateOne(workingDir, t, force));
        }
        return results;
    }
    generateOne(workingDir, tmpl, force) {
        const toolType = this.toolKey;
        const configDir = getConfigDir(toolType);
        const sub = outputSubdir(tmpl.sourceDir, toolType);
        const base = getBaseDir(configDir, workingDir);
        const targetDir = sub ? join(base, sub, tmpl.subpath) : join(base, tmpl.subpath);
        const targetPath = join(targetDir, `${tmpl.id}.md`);
        return [
            this.manager.generate({
                templateName: tmpl.name,
                targetPath,
                force,
            }),
        ];
    }
}
//# sourceMappingURL=flat-strategy.js.map