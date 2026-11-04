/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Content-Security-Policy untuk build produksi (GitHub Pages tidak bisa mengatur header, jadi lewat meta).
 * Hanya sumber dari origin sendiri; tanpa inline script, eval, objek, atau koneksi keluar.
 * Tidak dipasang saat dev karena HMR memakai WebSocket.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'", // hanya mengizinkan WebAssembly (Stockfish), bukan eval JavaScript
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function securityHeaders(): Plugin {
  return {
    name: 'security-meta',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
      { tag: 'meta', attrs: { name: 'referrer', content: 'no-referrer' }, injectTo: 'head-prepend' },
    ],
  };
}

/** Mengisi daftar precache di dist/sw.js dengan semua file hasil build. */
function precacheManifest(): Plugin {
  let outDir = 'dist';
  return {
    name: 'precache-manifest',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    closeBundle() {
      const files: string[] = [];
      const walk = (d: string) => {
        for (const n of readdirSync(d)) {
          const p = join(d, n);
          if (statSync(p).isDirectory()) walk(p);
          else if (n !== 'sw.js') files.push('./' + relative(outDir, p).replaceAll('\\', '/'));
        }
      };
      walk(outDir);
      const swPath = join(outDir, 'sw.js');
      const version = Date.now().toString(36);
      const sw = readFileSync(swPath, 'utf8')
        .replace('__PRECACHE__', JSON.stringify(['./', ...files]))
        .replace('__VERSION__', version);
      writeFileSync(swPath, sw);
    },
  };
}

export default defineConfig({
  base: './', // path relatif: bisa di-host di subfolder (GitHub Pages) maupun root
  plugins: [securityHeaders(), precacheManifest()],
  // Hanya localhost secara bawaan; untuk membuka dari HP lewat Wi-Fi jalankan `npm run dev -- --host` (jaringan tepercaya saja).
  server: { port: 5173 },
  preview: { port: 4173 },
  test: { setupFiles: ['tests/setup.ts'] },
});
