import { Command } from 'commander';
import { cwd } from 'node:process';
import { AIToolType, parseToolFlag } from '../internal/detector/types.js';
import { DefaultDetector } from '../internal/detector/detector.js';
import { EmbeddedTemplateManager } from '../internal/templates/manager.js';
import { CharmUIRenderer } from '../internal/ui/renderer.js';
// Global state shared across commands
export let det;
export let uiRenderer;
export let templateManager;
export let detectedResult;
export let toolFlag = '';
const program = new Command();
export function createProgram() {
    program
        .name('Conductor')
        .description('Conductor Spec Driven Development')
        .version('0.1.0', '-v, --version', 'Print conductor version and exit')
        .hook('preAction', (thisCommand) => {
        det = new DefaultDetector();
        uiRenderer = new CharmUIRenderer();
        templateManager = new EmbeddedTemplateManager();
        const workingDir = cwd();
        const globalOpts = thisCommand.opts();
        toolFlag = globalOpts.tool ?? '';
        if (toolFlag) {
            const toolType = parseToolFlag(toolFlag);
            detectedResult = {
                toolType,
                configPath: det.getConfigDirPath(toolType, workingDir),
                isValid: toolType !== AIToolType.Unknown,
                message: `tool manually specified: ${toolType}`,
            };
        }
        else {
            detectedResult = det.detect(workingDir);
        }
    });
    program.option('-t, --tool <tool>', 'Manually specify tool type (cursor, claude-code, antigravity)');
    return program;
}
//# sourceMappingURL=root.js.map