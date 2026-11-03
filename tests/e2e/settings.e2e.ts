import { expect, test } from '@playwright/test';
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
    const full = await page.locator('.eval-fill').evaluate((el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width);
    expect(full).toBeGreaterThan(0.9);
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
