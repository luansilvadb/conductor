import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { parseFrontmatter } from './types.js';
import { FileExistsError } from '../errors.js';
const DATA_DIR = join(import.meta.dirname, 'data');
export class EmbeddedTemplateManager {
    listAvailable(_tool) {
        return this.listAll();
    }
    /** Load all top-level .md files from every category directory. */
    listAll() {
        const commands = loadTemplatesFromDir(join(DATA_DIR, 'commands'), 'commands');
        const rules = loadTemplatesFromDir(join(DATA_DIR, 'rules'), 'rules');
        const agents = loadTemplatesFromDirRecursive(join(DATA_DIR, 'agents'), 'agents');
        const skills = loadTemplatesFromDirRecursive(join(DATA_DIR, 'skills'), 'skills');
        return [...commands, ...rules, ...agents, ...skills];
    }
    getByName(name) {
        return this.listAll().find((t) => t.name === name || t.id === name);
    }
    generate(req) {
        const dir = parse(req.targetPath).dir;
        mkdirSync(dir, { recursive: true });
        if (existsSync(req.targetPath) && !req.force) {
            return {
                success: false,
                filePath: req.targetPath,
                message: 'File already exists (use --force to overwrite)',
                error: new FileExistsError(),
            };
        }
        const tmpl = this.getByName(req.templateName);
        if (!tmpl) {
            return {
                success: false,
                message: `Template not found: ${req.templateName}`,
            };
        }
        writeFileSync(req.targetPath, tmpl.content, 'utf-8');
        return {
            success: true,
            filePath: req.targetPath,
            message: 'Template generated successfully',
        };
    }
}
function loadTemplatesFromDir(dir, sourceDir, subpath = '') {
    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        const templates = [];
        for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith('.md'))
                continue;
            const meta = parseMetaFromFile(join(dir, entry.name));
            meta.sourceDir = sourceDir;
            meta.subpath = subpath;
            templates.push(meta);
        }
        return templates;
    }
    catch {
        return [];
    }
}
function loadTemplatesFromDirRecursive(dir, sourceDir) {
    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        const templates = [];
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.md')) {
                const meta = parseMetaFromFile(join(dir, entry.name));
                meta.sourceDir = sourceDir;
                templates.push(meta);
            }
            else if (entry.isDirectory()) {
                templates.push(...loadTemplatesFromDir(join(dir, entry.name), sourceDir, entry.name));
            }
        }
        return templates;
    }
    catch {
        return [];
    }
}
function parseMetaFromFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const meta = parseFrontmatter(content);
    if (!meta.id) {
        const fileName = filePath.split(/[\\/]/).pop() || '';
        meta.id = fileName.replace(/\.md$/, '');
        meta.name = meta.name || meta.id;
    }
    return meta;
}
//# sourceMappingURL=manager.js.map