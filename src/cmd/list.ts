import { Command } from 'commander';
import { getContext } from './root.js';

export function createListCommand(): Command {
  const cmd = new Command('list')
    .aliases(['ls'])
    .description('List available command templates')
    .option('-c, --category <category>', 'Filter by category')
    .option('-q, --quiet', 'Output only template names (for piping)')
    .option('--all', 'List all templates across all categories')
    .action((options) => {
      const ctx = getContext();
      const rawCategory = options.category ?? '';
      const category = rawCategory.toLowerCase().trim();
      const quiet = options.quiet ?? false;
      const listAll = options.all ?? false;

      let tmpls = listAll
        ? ctx.templates.listAll()
        : ctx.templates.listAvailable(ctx.detected.toolType);

      if (category) {
        tmpls = tmpls.filter((t) => t.category.toLowerCase().trim() === category);
      }

      if (tmpls.length === 0) {
        ctx.ui.renderWarning(
          rawCategory
            ? `No templates found in category: ${rawCategory}`
            : 'No templates available',
        );
        return;
      }

      if (quiet) {
        for (const t of tmpls) console.log(t.id);
        return;
      }

      const rows = tmpls.map((t) => [t.name, t.category, t.description]);
      ctx.ui.renderTable(['Name', 'Category', 'Description'], rows);
    });

  return cmd;
}
