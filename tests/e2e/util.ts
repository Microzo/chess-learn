import { expect, type Page } from '@playwright/test';

/** Kumpulkan galat konsol/halaman; panggil assertNoErrors() di akhir tes. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  return {
    assertNoErrors: () => expect(errors, errors.join('\n')).toEqual([]),
  };
}

export const square = (page: Page, sq: string) => page.locator(`.board [data-sq="${sq}"]`).first();

/** Langkah dengan dua klik sungguhan. */
export async function clickMove(page: Page, from: string, to: string) {
  await square(page, from).click();
  await square(page, to).click();
}

/** Langkah dengan seret mouse sungguhan. */
export async function dragMove(page: Page, from: string, to: string) {
  const a = (await square(page, from).boundingBox())!;
  const b = (await square(page, to).boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 12, a.y + a.height / 2 + 12, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
}

export async function noHorizontalScroll(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, 'halaman tergulir horizontal').toBeLessThanOrEqual(cw);
}

export const menu = (page: Page, title: string | RegExp) => page.locator('.menu-item', { hasText: title });
export const pieces = (page: Page) => page.locator('.board .piece');

/** PGN Legal's Mate: 5.Nxe5 adalah pengorbanan ratu yang tepat. */
export const LEGAL_PGN = '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#';
