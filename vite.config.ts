import { defineConfig, type Plugin } from 'vite';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

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
  plugins: [precacheManifest()],
  server: { host: true, port: 5173 }, // host:true -> bisa dibuka dari HP lewat IP laptop
  preview: { host: true, port: 4173 },
});
