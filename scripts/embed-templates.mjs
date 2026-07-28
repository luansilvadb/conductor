// Gera src/internal/templates/embedded.ts com todos os templates
// embutidos como strings. Para cada categoria em src/internal/templates/data,
// faz iteracao RECURSIVA completa, preservando a hierarquia de subpastas:
//   - <cat>/file.ext                          -> sourceDir=<cat>, subpath='', ext='<ext>'
//   - <cat>/<subdir>/file.ext                 -> sourceDir=<cat>, subpath=<subdir>, ext='<ext>'
//   - <cat>/<subdir>/.../file.ext             -> sourceDir=<cat>, subpath=<subdir>/..., ext='<ext>'
// Captura QUALQUER tipo de arquivo (.md, .py, .json, etc.) — a extensao original
// e preservada para que a geracao mantenha o nome correto no destino.
//
// Este script deve rodar ANTES do tsc no build.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src/internal/templates/data');
const OUT_FILE = join(ROOT, 'src/internal/templates/embedded.ts');

/**
 * @typedef {{ abs: string, category: string, subpath: string, ext: string }} Entry
 */

/**
 * Caminha RECURSIVAMENTE por `dir`, coletando TODO arquivo encontrado
 * (qualquer extensao). O `subpath` fica como o caminho relativo de `dir` ate
 * o arquivo (sem o nome do arquivo), usando separador `/`.
 * O `ext` e a extensao do arquivo (incluindo o ponto, ex.: ".md", ".py").
 * Diretorios vazios sao ignorados. Retorna ordem deterministica por caminho.
 *
 * @param {string} dir
 * @param {string} category
 * @returns {Entry[]}
 */
// Extensions that must not be embedded as text strings.
const BINARY_EXTS = new Set(['.pyc', '.pyo', '.so', '.dll', '.exe', '.bin', '.wasm']);

function listForCategoryRecursive(dir, category) {
  const result = [];
  const stack = [{ current: dir, subpath: '' }];

  while (stack.length > 0) {
    const { current, subpath } = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isFile()) {
        const ext = extname(entry.name);
        if (!BINARY_EXTS.has(ext)) {
          result.push({ abs: full, category, subpath, ext });
        }
        continue;
      }
      if (entry.isDirectory()) {
        // Skip Python cache dirs (__pycache__, __pypackages__) and hidden dirs (.git, etc.)
        if (entry.name.startsWith('__') || entry.name.startsWith('.')) continue;
        const childSubpath = subpath === '' ? entry.name : `${subpath}/${entry.name}`;
        stack.push({ current: full, subpath: childSubpath });
      }
    }
  }

  // Ordem deterministica por caminho relativo ao diretorio da categoria.
  result.sort((a, b) => {
    const ra = relative(dir, a.abs).split(/[\\/]/).join('/');
    const rb = relative(dir, b.abs).split(/[\\/]/).join('/');
    return ra < rb ? -1 : ra > rb ? 1 : 0;
  });
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
  // Descobre categorias dinamicamente: cada subdiretorio de DATA_DIR e uma categoria.
  let topEntries;
  try {
    topEntries = readdirSync(DATA_DIR, { withFileTypes: true });
  } catch {
    console.error('[embed-templates] Nao foi possivel ler', DATA_DIR);
    process.exit(1);
  }
  const categories = topEntries
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const entries = [];
  for (const catName of categories) {
    const catDir = join(DATA_DIR, catName);
    const catEntries = listForCategoryRecursive(catDir, catName);
    entries.push(...catEntries);
  }

  if (entries.length === 0) {
    console.error('[embed-templates] Nenhum template encontrado em', DATA_DIR);
    process.exit(1);
  }

  const lines = [
    '// ARQUIVO GERADO AUTOMATICAMENTE por scripts/embed-templates.mjs',
    '// NAO EDITAR - altere os arquivos em src/internal/templates/data/ e rode `npm run build`.',
    '// Iteracao recursiva completa: qualquer tipo de arquivo e capturado.',
    '',
    'export interface EmbeddedTemplate {',
    "  /** Caminho absoluto do arquivo no source (apenas para diagnostico). */",
    '  sourcePath: string;',
    "  /** Categoria (commands, rules, agents, skills). */",
    '  category: string;',
    "  /** Subpath dentro da categoria: caminho relativo ate o arquivo (sem o nome do arquivo).",
    '   *  Ex.: "conductor-setup" para skills/conductor-setup/SKILL.md,',
    '   *       "conductor-setup/assets/code_styleguides" para skills/conductor-setup/assets/code_styleguides/cpp.md.',
    '   */',
    '  subpath: string;',
    "  /** Extensao original do arquivo, incluindo o ponto (ex.: \".md\", \".py\"). */",
    '  ext: string;',
    "  /** Conteudo bruto do arquivo. Para .md, inclui frontmatter YAML. */",
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
    lines.push(`    ext: ${JSON.stringify(e.ext)},`);
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
