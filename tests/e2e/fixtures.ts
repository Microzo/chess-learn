import { expect, test as base } from '@playwright/test';

/**
 * Spesifikasi e2e lama menegaskan teks Indonesia. Bahasa bawaan aplikasi kini Inggris, jadi
 * konteks diberi pengaturan lang=id, tetapi hanya bila belum ada (agar perpindahan bahasa tetap bertahan).
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      try {
        if (localStorage.getItem('chesslearn.settings') === null) {
          localStorage.setItem('chesslearn.settings', JSON.stringify({ lang: 'id' }));
        }
      } catch { /* abaikan */ }
    });
    await use(context);
  },
});
export { expect };
