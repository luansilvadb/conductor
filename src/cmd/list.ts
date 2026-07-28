import { Command } from 'commander';
import { detectedResult, uiRenderer, templateManager } from './root.js';

export function createListCommand(): Command {
  const cmd = new Command('list')
    .aliases(['ls'])
    .description('List available command templates')
    .option('-c, --category <category>', 'Filter by category')
    .option('-q, --quiet', 'Output only template names (for piping)')
    .option('--all', 'List all templates across all categories')
    .action((options: { category?: string; quiet?: boolean; all?: boolean }) => {
      const category = options.category ?? '';
      const quiet = options.quiet ?? false;
      const listAll = options.all ?? false;

      let tmpls = listAll
        ? templateManager.listAll()
        : templateManager.listAvailable(detectedResult.toolType);

      if (category) {
        tmpls = tmpls.filter((t) => t.category === category);
      }

      if (tmpls.length === 0) {
        uiRenderer.renderWarning(
          category ? `No templates found in category: ${category}` : 'No templates available',
        );
        return;
      }

      if (quiet) {
        for (const t of tmpls) console.log(t.id);
        return;
      }

      const rows = tmpls.map((t) => [t.name, t.category, t.description]);
      uiRenderer.renderTable(['Name', 'Category', 'Description'], rows);
    });

  return cmd;
}
