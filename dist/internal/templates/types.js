/** Mapping of frontmatter keys to TemplateMeta setters */
const FRONTMATTER_SETTERS = {
    name: (m, v) => (m.name = v),
    id: (m, v) => (m.id = v),
    category: (m, v) => (m.category = v),
    description: (m, v) => (m.description = v),
};
/** Parse YAML frontmatter from template content */
export function parseFrontmatter(content) {
    const meta = createEmptyMeta(content);
    if (!content.startsWith('---'))
        return meta;
    const parts = content.split('---', 3);
    if (parts.length < 3)
        return meta;
    const lines = parts[1].split('\n');
    for (const line of lines) {
        applyFrontmatterLine(meta, line);
    }
    return meta;
}
function createEmptyMeta(content) {
    return {
        name: '',
        id: '',
        category: '',
        description: '',
        content,
        tags: [],
        sourceDir: '',
        subpath: '',
    };
}
function applyFrontmatterLine(meta, line) {
    const trimmed = line.trim();
    if (!trimmed)
        return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1)
        return;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    const setter = FRONTMATTER_SETTERS[key];
    if (setter)
        setter(meta, value);
}
//# sourceMappingURL=types.js.map