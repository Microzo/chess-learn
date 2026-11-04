import { expect, test } from '@playwright/test';
import { clickMove, watchErrors } from './util';

test.describe('ujian dan latihan endgame (bahasa Inggris bawaan)', () => {
  test('ujian pemula sampai hasil, tercatat di Progres dan bertahan setelah muat ulang', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await page.getByRole('button', { name: /Exam & Progress/ }).click();
    await expect(page.locator('.level-now-name')).toHaveText('Not rated yet');
    await page.locator('.exam-level[data-level="beginner"]').getByRole('button', { name: 'Start exam' }).click();

    const white: [string, string][] = [['g1', 'g7'], ['a1', 'a8'], ['d1', 'd8']];
    for (let i = 0; i < 10; i++) {
      await expect(page.getByRole('heading', { name: new RegExp(`${i + 1}/10`) })).toBeVisible();
      if (await page.locator('.opts').count()) {
        await page.locator('.opt').first().click();
      } else {
        const candidates: [string, string][] = (await page.locator('.exam-prompt').innerText()).startsWith('Black') ? [['d8', 'h4']] : white;
        for (const [a, b] of candidates) {
          if (await page.locator('.card.cls-best, .card.cls-blunder').count()) break;
          await clickMove(page, a, b);
        }
      }
      await expect(page.locator('.card.cls-best, .card.cls-blunder')).toHaveCount(1);
      await page.getByRole('button', { name: i === 9 ? 'See result' : 'Next question →' }).click();
    }
    await expect(page.locator('.score')).toContainText('/10');
    await page.getByRole('button', { name: 'Progress' }).click();
    await expect(page.locator('.meter-row').first()).toBeVisible();
    await expect(page.locator('.exam-level[data-level="beginner"]')).toContainText('attempt');

    await page.reload();
    await page.getByRole('button', { name: /Exam & Progress/ }).click();
    await expect(page.locator('.exam-level[data-level="beginner"]')).toContainText('1 attempt');
    w.assertNoErrors();
  });

  test('latihan endgame: bot membalas dan saran engine muncul', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await page.getByRole('button', { name: /Endgame Practice/ }).click();
    await page.getByRole('button', { name: /King and queen vs king/ }).click();
    await expect(page.locator('.status')).toHaveText('Your move.', { timeout: 20000 });
    await clickMove(page, 'b1', 'b4');
    await expect(page.locator('.status')).toHaveText('Your move.', { timeout: 20000 });
    await expect(page.locator('.board [data-sq="b4"] .piece')).toHaveCount(1);
    await page.getByRole('button', { name: '💡 Hint' }).click();
    await expect(page.getByText(/Engine hint:/)).toBeVisible({ timeout: 20000 });
    w.assertNoErrors();
  });
});
