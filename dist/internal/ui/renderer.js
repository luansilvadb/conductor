import { successStyle, errorStyle, warningStyle, infoStyle, headerStyle } from './styles.js';
/** Charm UI renderer implementation using @clack/prompts and chalk */
export class CharmUIRenderer {
    renderSuccess(msg) {
        console.log(successStyle(`✓ ${msg}`));
    }
    renderError(msg) {
        console.error(errorStyle(`✗ ${msg}`));
    }
    renderWarning(msg) {
        console.log(warningStyle(`⚠ ${msg}`));
    }
    renderInfo(msg) {
        console.log(infoStyle(msg));
    }
    renderTable(headers, rows) {
        if (headers.length === 0)
            return;
        const colWidths = computeColumnWidths(headers, rows);
        const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
        const separatorLine = colWidths.map((w) => '-'.repeat(w)).join('  ');
        console.log(headerStyle(headerLine));
        console.log(separatorLine);
        for (const row of rows) {
            const rowLine = row.map((cell, i) => (i < colWidths.length ? cell.padEnd(colWidths[i]) : cell)).join('  ');
            console.log(rowLine);
        }
    }
    async confirm(prompt) {
        const { confirm: clackConfirm, isCancel } = await import('@clack/prompts');
        const result = await clackConfirm({ message: prompt });
        if (isCancel(result))
            return false;
        return result;
    }
}
function computeColumnWidths(headers, rows) {
    const colWidths = headers.map((h) => h.length);
    for (const row of rows) {
        for (let i = 0; i < row.length; i++) {
            if (i < colWidths.length && row[i].length > colWidths[i]) {
                colWidths[i] = row[i].length;
            }
        }
    }
    return colWidths;
}
//# sourceMappingURL=renderer.js.map