import { TEMPLATES } from '../templates/embedded.js';
import configData from '../templates/data/config.json' with { type: 'json' };

/** Default locale derived from the bundled config. All code should use this constant. */
export const DEFAULT_LOCALE: string =
  (configData as { i18n?: { default_language?: string } }).i18n?.default_language ?? 'pt-BR';

// ---------------------------------------------------------------------------
// JSON navigation helpers
// ---------------------------------------------------------------------------

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

/**
 * Navigate a JSON value using a dot-path that may contain array indices
 * (e.g. "goals.0", "user_interaction_tools[2]", "thresholds.coverage_min_percent").
 * Returns the string representation of the resolved value, or undefined if not found.
 */
function resolvePath(root: JsonValue, path: string): string | undefined {
  // Normalise bracket notation to dot notation: user_interaction_tools[2] → user_interaction_tools.2
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: JsonValue = root;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      if (Number.isNaN(idx)) return undefined;
      current = current[idx];
    } else if (typeof current === 'object') {
      current = (current as JsonObject)[part];
    } else {
      return undefined;
    }
  }

  if (typeof current === 'string') return current;
  if (typeof current === 'number' || typeof current === 'boolean') return String(current);
  return undefined;
}

// ---------------------------------------------------------------------------
// i18n namespace map builder
// ---------------------------------------------------------------------------

/** Cache: locale → namespace map. Built once per locale, reused across all generate() calls. */
const i18nMapCache = new Map<string, Map<string, JsonObject>>();

/**
 * Build a namespace→JsonObject map from all i18n TEMPLATES for the given locale.
 *
 * Namespace derivation rules (TEMPLATES with category === 'i18n', ext === '.json'):
 *   subpath "pt-BR"         + fileId "constitution" → namespace "constitution"
 *   subpath "pt-BR"         + fileId "common"       → namespace "common"
 *   subpath "pt-BR/skills"  + fileId "conductor-setup" → namespace "skills.conductor-setup"
 */
function buildI18nMap(locale: string): Map<string, JsonObject> {
  const cached = i18nMapCache.get(locale);
  if (cached) return cached;

  const map = new Map<string, JsonObject>();

  for (const t of TEMPLATES) {
    if (t.category !== 'i18n' || t.ext !== '.json') continue;
    if (!t.subpath.startsWith(locale)) continue;

    const fileName = t.sourcePath.split(/[/\\]/).pop() ?? '';
    const fileId = fileName.endsWith('.json') ? fileName.slice(0, -5) : fileName;

    let data: JsonObject;
    try {
      data = JSON.parse(t.content) as JsonObject;
    } catch {
      continue;
    }

    // Strip the locale prefix from subpath to get the relative directory
    const relDir = t.subpath.slice(locale.length).replace(/^\//, '');
    const namespace = relDir
      ? relDir.replace(/\//g, '.') + '.' + fileId
      : fileId;

    if (map.has(namespace)) {
      throw new Error(
        `[i18n] Namespace collision detected for locale "${locale}": ` +
        `namespace "${namespace}" already registered. ` +
        `Rename the file or reorganise the directory to fix this.`
      );
    }

    map.set(namespace, data);
  }

  i18nMapCache.set(locale, map);
  return map;
}

// ---------------------------------------------------------------------------
// Placeholder resolvers
// ---------------------------------------------------------------------------

/**
 * Resolve a single i18n key such as "skills.conductor-setup.goals.0".
 *
 * Strategy: try progressively shorter namespace prefixes until a matching
 * file is found in the map, then navigate the remaining path.
 * If not found, return the original placeholder string unchanged.
 */
function resolveI18nKey(key: string, i18nMap: Map<string, JsonObject>): string {
  const parts = key.split('.');

  // Try namespaces of decreasing length so the most specific match wins first
  for (let nsLen = parts.length - 1; nsLen >= 1; nsLen--) {
    const ns = parts.slice(0, nsLen).join('.');
    const data = i18nMap.get(ns);
    if (!data) continue;

    const keyPath = parts.slice(nsLen).join('.');
    const value = resolvePath(data, keyPath);
    if (value !== undefined) return value;
  }

  // Preserve unresolved placeholder as-is so the agent can see what was missing
  return `\${i18n.t("${key}")}`;
}

/**
 * Resolve a config path such as "framework.version" or "user_interaction_tools[2]".
 * Uses the bundled config.json imported statically.
 */
function resolveConfigPath(path: string, baseDir?: string, locale?: string): string {
  if (path === 'tool_dir') {
    return baseDir ? baseDir.replace(/\\/g, '/') : '';
  }
  if (path === 'locale') {
    return locale || DEFAULT_LOCALE;
  }

  let value = resolvePath(configData as unknown as JsonValue, path);
  
  if (typeof value === 'string' && value.includes('${config.tool_dir}')) {
    const replacement = baseDir ? baseDir.replace(/\\/g, '/') : '';
    value = value.replace(/\$\{config\.tool_dir\}/g, replacement);
  }

  return value !== undefined ? value : `\${config.${path}}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Maximum i18n expansion rounds. An i18n value may reference another i18n key
 * (e.g. a skill reusing `common.confirmations.yes`), so a single pass is not
 * enough: `String.replace` never rescans the text it just inserted. The cap
 * bounds pathological or cyclic references — on reaching it, whatever
 * placeholders remain are left verbatim, matching the not-found behaviour.
 */
const MAX_I18N_DEPTH = 8;

/**
 * Resolve all `${i18n.t("...")}` and `${config.*}` placeholders in `content`.
 *
 * Two-phase approach (order matters):
 *   Phase 1 — i18n: repeated until the text stops changing (see MAX_I18N_DEPTH),
 *             so i18n values may reference other i18n keys.
 *   Phase 2 — config: handles both original placeholders and those introduced by
 *             the i18n phase.
 *
 * Placeholders NOT touched:
 *   - `{param}` style (no dollar sign) — runtime parameters resolved by the agent
 *   - Any unrecognised `${...}` pattern — preserved verbatim
 */
export function resolveContent(content: string, locale: string, baseDir?: string): string {
  const i18nMap = buildI18nMap(locale);
  const fallbackMap = locale !== DEFAULT_LOCALE ? buildI18nMap(DEFAULT_LOCALE) : undefined;

  // Phase 1 — i18n, iterated to a fixpoint so nested keys expand too
  let afterI18n = content;
  for (let round = 0; round < MAX_I18N_DEPTH; round++) {
    const next = afterI18n.replace(
      /\$\{i18n\.t\("([^"]+)"\)\}/g,
      (_, key: string) => {
        let val = resolveI18nKey(key, i18nMap);
        if (val === `\${i18n.t("${key}")}` && fallbackMap) {
          val = resolveI18nKey(key, fallbackMap);
        }
        return val;
      }
    );
    // Stable output means every remaining placeholder is unresolvable — stop.
    if (next === afterI18n) break;
    afterI18n = next;
  }

  // Pass 2 — config (covers originals + any introduced by i18n pass)
  const afterConfig = afterI18n.replace(
    /\$\{config\.([^}]+)\}/g,
    (_, path: string) => resolveConfigPath(path, baseDir, locale),
  );

  return afterConfig;
}
