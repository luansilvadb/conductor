import { Command } from 'commander';
import { detectedResult, uiRenderer, templateManager } from './root.js';
let categoryFlag = '';
let quietFlag = false;
let listAllFlag = false;
export function createListCommand() {
    const cmd = new Command('list')
        .aliases(['ls'])
        .description('List available command templates')
        .option('-c, --category <category>', 'Filter by category')
        .option('-q, --quiet', 'Output only template names (for piping)')
        .option('--all', 'List all templates across all categories')
        .action((options) => {
        categoryFlag = options.category ?? '';
        quietFlag = options.quiet ?? false;
        listAllFlag = options.all ?? false;
        let tmpls = listAllFlag
            ? templateManager.listAll()
            : templateManager.listAvailable(detectedResult.toolType);
        if (categoryFlag) {
            tmpls = tmpls.filter((t) => t.category === categoryFlag);
        }
        if (tmpls.length === 0) {
            uiRenderer.renderWarning(categoryFlag ? `No templates found in category: ${categoryFlag}` : 'No templates available');
            return;
        }
        if (quietFlag) {
            for (const t of tmpls)
                console.log(t.id);
            return;
        }
        const rows = tmpls.map((t) => [t.name, t.category, t.description]);
        uiRenderer.renderTable(['Name', 'Category', 'Description'], rows);
    });
    return cmd;
}
//# sourceMappingURL=list.js.map