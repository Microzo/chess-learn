import { expect, test } from './fixtures';
import { clickMove, menu, watchErrors } from './util';


test.describe('lencana di papan dan analisa mendalam', () => {
  test('Belajar vs Bot: lencana di bidak tanpa menggulir, dan "Kenapa?" menjelaskan langkah', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Belajar vs Bot/).click();
    await page.locator('.chip[data-v="1"]').click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
    await clickMove(page, 'e2', 'e4');
    // setelah bot membalas, lencana ada di petak langkah terakhir (milik bot), terlihat tanpa menggulir
    await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
    const badge = page.locator('.board .sq-badge');
    await expect(badge).toHaveCount(1);
    await expect(badge).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.getByRole('button', { name: /Kenapa\?/ }).click();
    const deep = page.locator('.card.deep').filter({ hasText: 'Analisa mendalam' });
    await expect(deep).toBeVisible({ timeout: 30_000 });
    await expect(deep.locator('li').first()).toContainText('Peluang menang');
    // mematikan menyembunyikannya lagi
    await page.getByRole('button', { name: /Kenapa\?/ }).click();
    await expect(page.locator('.card.deep')).toHaveCount(0);
    w.assertNoErrors();
  });

  test('Replay: lencana mengikuti langkah dan Analisa mendalam menampilkan alasan', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Partai Legendaris/).click();
    await page.locator('.item[data-id="opera"] .item-main').click();
    await page.getByRole('button', { name: /Analisa partai/ }).click();
    await expect(page.locator('.summary .acc').first()).toBeVisible({ timeout: 120_000 });

    await page.locator('.movelist button', { hasText: 'Nxb5' }).first().click();
    await expect(page.locator('.board .sq-badge')).toHaveCount(1);
    await page.getByRole('button', { name: /Mendalam/ }).click();
    await expect(page.locator('.card.deep li').first()).toContainText('Evaluasi', { timeout: 30_000 });
    // pindah langkah memperbarui penjelasan
    const first = await page.locator('.card.deep').innerText();
    await page.getByRole('button', { name: '◀' }).click();
    await expect.poll(async () => page.locator('.card.deep').innerText(), { timeout: 30_000 }).not.toBe(first);
    w.assertNoErrors();
  });
});
