import { expect, test } from '@playwright/test';

test('bahasa bawaan Inggris, dan bisa diganti ke Indonesia lewat Pengaturan', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByText('Learn Strategy').first()).toBeVisible();

  await page.getByRole('button', { name: /Settings/i }).first().click();
  await page.locator('.chip[data-v="id"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.getByText('Pengaturan').first()).toBeVisible();
});
