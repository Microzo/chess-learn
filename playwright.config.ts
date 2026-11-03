import { defineConfig } from '@playwright/test';

/**
 * Tes end-to-end di browser sungguhan terhadap build produksi (`vite preview`), lengkap dengan
 * service worker dan engine Stockfish asli. Jalankan: `npm run test:e2e`.
 * Lokal memakai Microsoft Edge/Chrome yang terpasang (tanpa unduhan); di CI set E2E_CHANNEL=chromium
 * setelah `npx playwright install chromium`.
 */
const channel = process.env.E2E_CHANNEL ?? 'msedge';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    viewport: { width: 390, height: 844 },
    ...(channel === 'chromium' ? {} : { channel }),
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
