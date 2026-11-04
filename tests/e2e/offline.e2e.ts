import { expect, test } from './fixtures';
import { clickMove, menu, pieces, watchErrors } from './util';

/**
 * Risiko terbesar PWA: aplikasi harus benar-benar jalan tanpa jaringan, termasuk engine WASM.
 * Tes ini mendaftarkan service worker, memutus jaringan, memuat ulang, lalu memakai fitur utama.
 */
test('berjalan offline setelah kunjungan pertama: pelajaran, puzzle, dan lawan bot', async ({ page, context }) => {
  const w = watchErrors(page);
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // service worker mengambil kendali setelah muat ulang pertama
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys[0]!);
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(cached.some((p) => p.endsWith('/engine/stockfish-lite.wasm'))).toBe(true);
  expect(cached.some((p) => p.endsWith('/engine/stockfish-lite.js'))).toBe(true);
  expect(cached.some((p) => p.endsWith('/pieces/original/wN.svg'))).toBe(true);
  expect(cached.some((p) => p.endsWith('/licenses/README.txt'))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toContainText('Chess Learn');

  // pelajaran + bidak
  await menu(page, /Belajar Strategi/).click();
  await page.getByRole('button', { name: /Scotch Game/ }).click();
  await expect(page.locator('.demo .piece')).toHaveCount(32);
  await page.locator('header.bar button').first().click();

  // puzzle
  await page.getByRole('button', { name: /Latihan taktik/ }).click();
  await page.getByRole('button', { name: /Skakmat dengan ratu/ }).click();
  await clickMove(page, 'g1', 'g7');
  await expect(page.locator('.demo-note')).toContainText('Benar');

  // engine WASM offline: bot membalas
  await page.goto('./');
  await menu(page, /Belajar vs Bot/).click();
  await page.locator('.chip[data-v="1"]').click();
  await page.getByRole('button', { name: 'Mulai' }).click();
  await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
  await clickMove(page, 'e2', 'e4');
  await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
  await expect(pieces(page)).toHaveCount(32);

  await context.setOffline(false);
  w.assertNoErrors();
});
