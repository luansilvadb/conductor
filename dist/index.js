#!/usr/bin/env node
async function main() {
    const { createProgram } = await import('./cmd/root.js');
    const { createInitCommand } = await import('./cmd/init.js');
    const { createGenerateCommand } = await import('./cmd/generate.js');
    const { createListCommand } = await import('./cmd/list.js');
    const { createUninstallCommand } = await import('./cmd/uninstall.js');
    const { maybePrintPathHint } = await import('./cmd/pathcheck.js');
    maybePrintPathHint();
    const program = createProgram();
    program.addCommand(createInitCommand());
    program.addCommand(createGenerateCommand());
    program.addCommand(createListCommand());
    program.addCommand(createUninstallCommand());
    await program.parseAsync(process.argv);
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
export {};
//# sourceMappingURL=index.js.map