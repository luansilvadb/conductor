// Gera src/internal/templates/embedded.ts com todos os templates .md
// embutidos como strings. Replica a lógica de listagem do manager.ts:
//   - <cat>/file.md                          -> sourceDir=<cat>, subpath=''
//   - <cat>/<subdir>/file.md                 -> sourceDir=<cat>, subpath=<subdir>
// Categorias recursivas (com subdir): agents, skills.
// Categorias planas (sem subdir): commands, rules.
//
// Este script deve rodar ANTES do tsc no build.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src/internal/templates/data');
const OUT_FILE = join(ROOT, 'src/internal/templates/embedded.ts');

/**
 * @typedef {{ abs: string, category: string, subpath: string }} Entry
 */

/**
 * Lista os .md de uma categoria, opcionalmente descendo um nível.
 * Replica loadTemplatesFromDir (plano) e loadTemplatesFromDirRecursive (um nível).
 *
 * @param {string} dir
 * @param {string} category
 * @param {boolean} recursive
 * @returns {Entry[]}
 */
function listForCategory(dir, category, recursive) {
  const result = [];
  let topEntries;
  try {
    topEntries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const entry of topEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push({ abs: join(dir, entry.name), category, subpath: '' });
    } else if (recursive && entry.isDirectory()) {
      const subdir = join(dir, entry.name);
      let subEntries;
      try {
        subEntries = readdirSync(subdir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const se of subEntries) {
        if (se.isFile() && se.name.endsWith('.md')) {
          result.push({ abs: join(subdir, se.name), category, subpath: entry.name });
        }
      }
    }
  }
  return result;
}

function escapeForTemplateLiteral(content) {
  // Escapa backticks, ${ e backslashes para uso dentro de `...` em TS.
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function generate() {
  const entries = [
    ...listForCategory(join(DATA_DIR, 'commands'), 'commands', false),
    ...listForCategory(join(DATA_DIR, 'rules'), 'rules', false),
    ...listForCategory(join(DATA_DIR, 'agents'), 'agents', true),
    ...listForCategory(join(DATA_DIR, 'skills'), 'skills', true),
  ];

  if (entries.length === 0) {
    console.error('[embed-templates] Nenhum template encontrado em', DATA_DIR);
    process.exit(1);
  }

  const lines = [
    '// ARQUIVO GERADO AUTOMATICAMENTE por scripts/embed-templates.mjs',
    '// NÃO EDITAR — altere os .md em src/internal/templates/data/ e rode `npm run build`.',
    '',
    'export interface EmbeddedTemplate {',
    "  /** Caminho absoluto do arquivo .md no source (apenas para diagnóstico). */",
    '  sourcePath: string;',
    "  /** Categoria (commands, rules, agents, skills). */",
    '  category: string;',
    "  /** Subpath dentro da categoria (ex.: \"conductor-setup\" para skills/conductor-setup/SKILL.md). */",
    '  subpath: string;',
    "  /** Conteúdo bruto do .md, incluindo frontmatter YAML. */",
    '  content: string;',
    '}',
    '',
    'export const TEMPLATES: EmbeddedTemplate[] = [',
  ];

  for (const e of entries) {
    const relPath = e.abs.replace(/\\/g, '/');
    const content = readFileSync(e.abs, 'utf-8');
    lines.push('  {');
    lines.push(`    sourcePath: ${JSON.stringify(relPath)},`);
    lines.push(`    category: ${JSON.stringify(e.category)},`);
    lines.push(`    subpath: ${JSON.stringify(e.subpath)},`);
    lines.push(`    content: \`${escapeForTemplateLiteral(content)}\`,`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, lines.join('\n'), 'utf-8');
  console.log(`[embed-templates] ${entries.length} templates embutidos em ${OUT_FILE}`);
}

generate();
