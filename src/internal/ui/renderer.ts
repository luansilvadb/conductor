import { successStyle, errorStyle, warningStyle, infoStyle, headerStyle } from './styles.js';

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
export class CharmUIRenderer implements UIRenderer {
  renderSuccess(msg: string): void {
    console.log(successStyle(`✓ ${msg}`));
  }

  renderError(msg: string): void {
    console.error(errorStyle(`✗ ${msg}`));
  }

  renderWarning(msg: string): void {
    console.log(warningStyle(`⚠ ${msg}`));
  }

  renderInfo(msg: string): void {
    console.log(infoStyle(msg));
  }

  renderTable(headers: string[], rows: string[][]): void {
    if (headers.length === 0) return;

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

  async confirm(prompt: string): Promise<boolean> {
    const { confirm: clackConfirm, isCancel } = await import('@clack/prompts');

    const result = await clackConfirm({ message: prompt });

    if (isCancel(result)) return false;
    return result as boolean;
  }
}

function computeColumnWidths(headers: string[], rows: string[][]): number[] {
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
