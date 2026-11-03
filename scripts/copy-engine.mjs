// Menyalin Stockfish (lite, single-thread) dari node_modules ke public/engine.
// Single-thread dipilih agar jalan di HP & hosting statis tanpa header COOP/COEP.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'stockfish', 'src');
const dst = join(root, 'public', 'engine');
mkdirSync(dst, { recursive: true });

const files = readdirSync(src);
for (const ext of ['js', 'wasm']) {
  const f = files.find((n) => /^stockfish-17\.1-lite-single-[0-9a-f]+\./.test(n) && n.endsWith('.' + ext));
  if (!f) throw new Error(`Engine file .${ext} tidak ditemukan di ${src}`);
  // wasm dicari engine dari nama .js -> .wasm, jadi keduanya harus sama nama dasar
  copyFileSync(join(src, f), join(dst, `stockfish-lite.${ext}`));
}
console.log('Engine disalin ke public/engine');
