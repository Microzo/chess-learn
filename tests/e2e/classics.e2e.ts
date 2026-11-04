import { expect, test } from './fixtures';
import { menu, noHorizontalScroll, pieces, watchErrors } from './util';

const back = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Kembali', exact: true }).click();

test.describe('partai legendaris', () => {
  test('buka Opera Game, ikuti catatan sampai skakmat, simpan ke Replay, tanpa galat', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Partai Legendaris/).click();
    await expect(page.locator('.item')).toHaveCount(6);
    await page.locator('.item[data-id="opera"] .item-main').click();
    await expect(page.locator('h2')).toContainText('Paul Morphy');

    // awal: 32 bidak, lalu langkah demi langkah dengan papan ketik
    await page.getByRole('button', { name: '⏮' }).click();
    await expect(pieces(page)).toHaveCount(32);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.card.note')).toContainText('pusat');
    await page.keyboard.press('End');
    await expect(page.locator('.card.note')).toContainText('Skakmat');
    await expect(page.locator('.movelist .mv.cur')).toContainText('Rd8#');
    expect(await pieces(page).count()).toBeLessThan(32);

    // simpan ke Replay lalu muncul di daftar
    await page.getByRole('button', { name: /Simpan ke Replay saya/ }).click();
    await back(page); // daftar partai legendaris
    await back(page); // beranda
    await menu(page, /Replay/).click();
    await expect(page.locator('.item')).toHaveCount(1);
    await expect(page.locator('.item')).toContainText('Paul Morphy');
    w.assertNoErrors();
  });

  test('semua partai bisa dibuka dan papannya benar di awal dan akhir, tanpa galat', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    for (const id of ['immortal', 'game-of-the-century', 'kasparov-topalov', 'deep-blue', 'fischer-spassky-6']) {
      await menu(page, /Partai Legendaris/).click();
      await page.locator(`.item[data-id="${id}"] .item-main`).click();
      await expect(page.locator('.movelist .mv').first()).toBeVisible();
      await page.keyboard.press('Home');
      await expect(pieces(page)).toHaveCount(32);
      await page.keyboard.press('End');
      await expect(page.locator('.movelist .mv.cur')).toHaveCount(1);
      expect(await pieces(page).count()).toBeLessThan(32);
      await back(page);
      await back(page);
    }
    w.assertNoErrors();
  });

  test('daftar dan replay muat di layar HP tanpa gulir horizontal', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Partai Legendaris/).click();
    await noHorizontalScroll(page);
    await page.locator('.item[data-id="game-of-the-century"] .item-main').click();
    await noHorizontalScroll(page);
  });
});
