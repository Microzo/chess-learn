import { expect, test } from './fixtures';
import { clickMove, LEGAL_PGN, menu, noHorizontalScroll, pieces, watchErrors } from './util';

const bg = (page: import('@playwright/test').Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe('pengaturan', () => {
  test('tema, warna papan, dan koordinat berubah, bertahan setelah muat ulang, tanpa pelanggaran CSP', async ({ page }) => {
    const w = watchErrors(page);
    const violations: string[] = [];
    await page.exposeFunction('__report', (v: string) => violations.push(v));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => void (window as unknown as { __report: (v: string) => void }).__report(e.violatedDirective));
    });
    await page.goto('./');
    const dark = await bg(page);
    await page.getByRole('button', { name: /Pengaturan/ }).click();
    await page.locator('.chip[data-v="terang"]').click();
    expect(await bg(page)).not.toBe(dark);
    await page.locator('.chip[data-v="cokelat"]').click();
    await page.getByLabel(/Koordinat papan/).uncheck();

    // papan memakai warna baru, koordinat hilang
    await page.getByRole('button', { name: 'Kembali', exact: true }).click();
    await menu(page, /Belajar Strategi/).click();
    await page.getByRole('button', { name: /Scotch Game/ }).click();
    const light = await page.locator('.demo .sq.light').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(light).toBe('rgb(240, 217, 181)'); // #f0d9b5
    await expect(page.locator('.demo .coord').first()).toBeHidden();

    // bertahan setelah muat ulang
    await page.reload();
    expect(await bg(page)).not.toBe(dark);
    expect(await page.evaluate(() => document.documentElement.dataset['theme'])).toBe('terang');
    expect(violations).toEqual([]);
    w.assertNoErrors();
  });

  test('sakelar suara dan volume tersimpan', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Pengaturan/ }).click();
    await page.getByLabel(/Efek suara/).uncheck();
    await page.locator('.vol').fill('40');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('chesslearn.settings')!));
    expect(saved).toMatchObject({ muted: true, volume: 0.4 });
  });
});

test.describe('bar dominasi', () => {
  test('tampil saat Belajar vs Bot, bergerak setelah analisa, dan bisa dimatikan', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Belajar vs Bot/).click();
    await page.locator('.chip[data-v="1"]').click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
    const bar = page.locator('.eval-bar');
    await expect(bar).toBeVisible();
    await clickMove(page, 'e2', 'e4');
    await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
    await expect(bar).toHaveAttribute('aria-label', /Bar dominasi/);
    await expect(pieces(page)).toHaveCount(32);

    await page.goto('./');
    await page.getByRole('button', { name: /Pengaturan/ }).click();
    await page.getByLabel(/Bar dominasi/).uncheck();
    await page.getByRole('button', { name: 'Kembali', exact: true }).click();
    await menu(page, /Belajar vs Bot/).click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
    await expect(page.locator('.eval-bar')).toBeHidden();
    w.assertNoErrors();
  });

  test('di Replay: berubah mengikuti langkah dan menunjukkan sisi yang unggul', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Replay/).click();
    await page.locator('details summary', { hasText: 'Impor PGN' }).click();
    await page.locator('textarea').fill(LEGAL_PGN);
    await page.getByRole('button', { name: 'Impor', exact: true }).click();
    await page.getByRole('button', { name: /Analisa partai/ }).click();
    await expect(page.locator('.summary .acc').first()).toBeVisible({ timeout: 90_000 });

    const bar = page.locator('.eval-bar');
    await expect(bar).toBeVisible();
    // akhir partai: Putih mematikan Hitam
    await page.locator('.movelist button', { hasText: 'Nd5#' }).click();
    await expect(bar).toHaveAttribute('data-lead', 'w');
    // bar beranimasi 0,35 detik: tunggu sampai bagian putih hampir memenuhi bar
    const ratio = () => page.locator('.eval-fill').evaluate((el) => el.getBoundingClientRect().height / el.parentElement!.getBoundingClientRect().height);
    await expect.poll(ratio).toBeGreaterThan(0.9);
    // posisi awal: seimbang
    await page.getByRole('button', { name: '⏮' }).click();
    await expect(bar).toHaveAttribute('data-lead', 'even');
  });
});

test.describe('tata letak responsif', () => {
  test('layar lebar: papan utuh terlihat tanpa menggulir dan info di sampingnya', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('./');
    await menu(page, /Main berdua/).click();
    await page.getByRole('button', { name: /Mulai/ }).click();
    const board = (await page.locator('.board').boundingBox())!;
    const side = (await page.locator('.game-side').boundingBox())!;
    expect(board.y + board.height, 'papan terpotong di bawah layar').toBeLessThanOrEqual(768);
    expect(side.x, 'info harus di kanan papan').toBeGreaterThanOrEqual(board.x + board.width);
    expect(board.width).toBeGreaterThan(450);
  });

  test('HP: info di bawah papan dan tanpa gulir horizontal', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Main berdua/).click();
    await page.getByRole('button', { name: /Mulai/ }).click();
    const board = (await page.locator('.board').boundingBox())!;
    const side = (await page.locator('.game-side').boundingBox())!;
    expect(side.y).toBeGreaterThanOrEqual(board.y + board.height);
    await noHorizontalScroll(page);
  });

  test('papan ketik: Tab menampilkan cincin fokus yang terlihat', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).toBe('solid');
  });
});

const startBot = async (page: import('@playwright/test').Page, mode: 'guide' | 'free' = 'guide') => {
  await menu(page, /Belajar vs Bot/).click();
  await page.locator(`.chip[data-v="${mode}"]`).click();
  await page.locator('.chip[data-v="1"]').click();
  await page.getByRole('button', { name: 'Mulai' }).click();
  await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
};

test.describe('Belajar vs Bot: bar vertikal, gulir, dan mode panduan', () => {
  test('bar dominasi vertikal di kiri papan dengan tinggi sama, dan terbalik bila bermain Hitam', async ({ page }) => {
    await page.goto('./');
    await startBot(page);
    const bar = (await page.locator('.eval-bar').boundingBox())!;
    const board = (await page.locator('.board').boundingBox())!;
    expect(bar.x + bar.width).toBeLessThanOrEqual(board.x);
    expect(bar.width).toBeLessThan(45);
    expect(Math.abs(bar.height - board.height)).toBeLessThan(3);
    expect(bar.y).toBeCloseTo(board.y, 0);
  });

  test('halaman tidak tergulir ke bawah setelah langkah: papan dan bar tetap terlihat', async ({ page }) => {
    // layar pendek: daftar langkah berada di bawah lipatan, tempat scrollIntoView dulu menyeret halaman
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto('./');
    await startBot(page);
    const scrolled = async () => page.evaluate(() => window.scrollY);
    await clickMove(page, 'e2', 'e4');
    await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
    await page.waitForTimeout(300);
    expect(await scrolled()).toBe(0);
    await clickMove(page, 'd2', 'd4');
    await expect(page.locator('.movelist .mv')).toHaveCount(4, { timeout: 30_000 });
    await page.waitForTimeout(300);
    expect(await scrolled()).toBe(0);
    for (const sel of ['.eval-bar', '.board']) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(b.y, sel + ' tergeser keluar layar').toBeGreaterThanOrEqual(0);
    }
  });

  test('tanpa panduan: tanpa bar, analisa, dan saran, tetapi bot tetap membalas dan partai tersimpan', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await startBot(page, 'free');
    await expect(page.locator('.eval-bar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Saran/ })).toHaveCount(0);
    await expect(page.locator('.cardbox')).toHaveCount(0);
    await clickMove(page, 'e2', 'e4');
    await expect(page.locator('.movelist .mv')).toHaveCount(2, { timeout: 30_000 });
    await expect(page.locator('.movelist .dot-badge')).toHaveCount(0);
    await expect(pieces(page)).toHaveCount(32);
    const saved = await page.evaluate(() => {
      const raw = Object.entries(localStorage).find(([k]) => k.includes('games'))?.[1];
      return JSON.parse(raw ?? '[]') as { analysis?: unknown; accuracy?: unknown; mode: string }[];
    });
    expect(saved).toHaveLength(1);
    expect(saved[0]!.mode).toBe('learning');
    expect(saved[0]!.analysis).toBeUndefined();
    w.assertNoErrors();
  });

  test('mode panduan menjelaskan perbedaannya di layar pengaturan permainan', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Belajar vs Bot/).click();
    await expect(page.locator('.guide-note')).toContainText('bar dominasi');
    await page.locator('.chip[data-v="free"]').click();
    await expect(page.locator('.guide-note')).toContainText('tanpa bar');
  });
});

test('versi tampil di beranda dan Pengaturan, tombol cek pembaruan menjawab', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByTestId('version')).toHaveText(/^v\d+\.\d+\.\d+ · \S+ · \d{4}-\d{2}-\d{2}$/);
  await page.getByRole('button', { name: /Pengaturan/ }).click();
  await expect(page.getByTestId('version')).toBeVisible();
  await page.getByRole('button', { name: 'Cek pembaruan' }).click();
  await expect(page.locator('[role="status"]').filter({ hasText: /terbaru|ditemukan|terpasang/ })).toBeVisible();
});
