// Limpa dist/ de forma robusta ao EPERM causado por file watchers da IDE.
// Estratégia: renomeia dist/ -> dist.old/ e remove .old/ depois (best-effort).
// Se a remoção de .old/ falhar (watcher segurando handles), o próximo build tenta de novo.

import { existsSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const OLD = DIST + '.old';

function tryRm(path, label) {
  if (!existsSync(path)) return true;
  try {
    rmSync(path, { recursive: true, force: true });
    return true;
  } catch (e) {
    console.warn(`[clean-dist] não consegui remover ${label}: ${e.code ?? e.message}`);
    return false;
  }
}

// 1. Tenta limpar .old/ de uma execução anterior (pode ter sobrado por EPERM).
tryRm(OLD, 'dist.old/ residual');

// 2. Se dist/ existe, renomeia para .old/ (operação atômica que escapar do watcher).
if (existsSync(DIST)) {
  try {
    renameSync(DIST, OLD);
  } catch (e) {
    // Se renomear falhou, cai para rmSync direto (pode falhar também).
    console.warn(`[clean-dist] rename falhou (${e.code ?? e.message}); tentando rmSync direto`);
    tryRm(DIST, 'dist/');
    console.log('[clean-dist] clean (in-place)');
    process.exit(0);
  }
  // 3. Tenta remover .old/ agora que dist/ já foi renomeado.
  if (tryRm(OLD, 'dist.old/')) {
    console.log('[clean-dist] clean');
  } else {
    console.warn('[clean-dist] dist.old/ deixado residual; será limpo no próximo build.');
  }
} else {
  console.log('[clean-dist] clean (dist não existia)');
}
