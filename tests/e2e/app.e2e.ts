import { expect, test } from './fixtures';
import { clickMove, dragMove, LEGAL_PGN, menu, noHorizontalScroll, pieces, square, watchErrors } from './util';

test.describe('layar utama dan navigasi', () => {
  test('menampilkan tujuh mode, tautan lisensi, dan tidak ada galat', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await expect(page.locator('h1')).toContainText('Chess Learn');
    await expect(page.locator('.menu-item')).toHaveCount(7);
    const lic = page.getByRole('link', { name: 'Lisensi dan atribusi' });
    await expect(lic).toBeVisible();
    const res = await page.request.get((await lic.getAttribute('href'))!);
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('GPL-3.0');
    await noHorizontalScroll(page);
    w.assertNoErrors();
  });

  test('semua layar utama muat tanpa galat dan tanpa gulir horizontal', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    for (const [title, heading] of [
      [/Belajar Strategi/, 'Belajar Strategi'],
      [/Belajar vs Bot/, 'Belajar vs Bot'],
      [/Main berdua/, 'Main berdua'],
      [/Replay/, 'Replay'],
    ] as const) {
      await menu(page, title).click();
      await expect(page.locator('h2').first()).toContainText(heading);
      await noHorizontalScroll(page);
      await page.locator('header.bar button').first().click();
      await expect(page.locator('h1')).toBeVisible();
    }
    w.assertNoErrors();
  });
});

test.describe('PvP dengan mouse sungguhan', () => {
  test('klik dan seret memindahkan bidak; langkah salah tidak meninggalkan bidak macet', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Main berdua/).click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(pieces(page)).toHaveCount(32);

    await clickMove(page, 'e2', 'e4');
    await expect(square(page, 'e4').locator('.piece')).toHaveCount(1);
    await dragMove(page, 'e7', 'e5');
    await expect(square(page, 'e5').locator('.piece')).toHaveCount(1);

    // seret ke kotak ilegal: bidak kembali ke asal tanpa sisa transformasi
    await dragMove(page, 'g1', 'g5');
    await expect(square(page, 'g1').locator('.piece')).toHaveCount(1);
    const style = await square(page, 'g1').locator('.piece').getAttribute('style');
    expect(style ?? '').not.toContain('translate');
    await expect(pieces(page)).toHaveCount(32);
    w.assertNoErrors();
  });

  test('promosi bidak lewat dialog pilihan', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Main berdua/).click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    // 1.a4 b5 2.axb5 a6 3.bxa6 Bb7 4.axb7 Nf6 lalu 5.bxa8: bidak putih menangkap benteng di baris terakhir
    const line: [string, string][] = [
      ['a2', 'a4'], ['b7', 'b5'], ['a4', 'b5'], ['a7', 'a6'], ['b5', 'a6'], ['c8', 'b7'], ['a6', 'b7'], ['g8', 'f6'],
    ];
    for (const [f, t] of line) await clickMove(page, f, t);
    await clickMove(page, 'b7', 'a8');
    await expect(page.locator('.promo-btn')).toHaveCount(4);
    await page.locator('.promo-btn[aria-label="q"]').click();
    await expect(square(page, 'a8').locator('img[src*="wQ"]')).toHaveCount(1);
  });

  test('jam: bendera jatuh mengakhiri partai dan langkah sesudahnya ditolak', async ({ page }) => {
    await page.clock.install();
    await page.goto('./');
    await menu(page, /Main berdua/).click();
    await page.getByRole('button', { name: '3 menit' }).click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await clickMove(page, 'e2', 'e4');
    await clickMove(page, 'e7', 'e5');
    await page.clock.fastForward('03:05');
    await expect(page.locator('.status')).toContainText('habis');
    await expect(page.locator('.end')).toContainText('menang');
    await clickMove(page, 'g1', 'f3');
    await expect(square(page, 'f3').locator('.piece')).toHaveCount(0);
  });
});

test.describe('puzzle dan latihan opening', () => {
  test('menyelesaikan puzzle skakmat dan progres bertahan setelah muat ulang', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Belajar Strategi/).click();
    await page.getByRole('button', { name: /Latihan taktik/ }).click();
    await page.getByRole('button', { name: /Skakmat dengan ratu/ }).click();
    await clickMove(page, 'g1', 'g7');
    await expect(page.locator('.demo-note')).toContainText('Benar');
    await page.reload();
    await menu(page, /Belajar Strategi/).click();
    await expect(page.getByRole('button', { name: /Latihan taktik \(1\// })).toBeVisible();
  });

  test('latihan opening: langkah teori diterima, lawan membalas, langkah salah ditolak', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Belajar Strategi/).click();
    await page.getByRole('button', { name: /Scotch Game/ }).click();
    await page.locator('.practice summary').click();
    await page.getByRole('button', { name: 'Main sebagai Putih' }).click();
    const board = page.locator('.practice .board');
    await board.locator('[data-sq="a2"]').click();
    await board.locator('[data-sq="a3"]').click();
    await expect(page.locator('.practice .demo-note')).toContainText('Bukan langkah teori');
    await board.locator('[data-sq="e2"]').click();
    await board.locator('[data-sq="e4"]').click();
    await expect(board.locator('[data-sq="e5"] .piece')).toHaveCount(1, { timeout: 3000 });
    await expect(page.locator('.practice .demo-counter')).toContainText('1 kesalahan');
    w.assertNoErrors();
  });
});

test.describe('lawan bot dan analisa dengan engine asli', () => {
  test('bot membalas dan kartu analisa muncul', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Belajar vs Bot/).click();
    await page.locator('.chip[data-v="1"]').click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
    await clickMove(page, 'e2', 'e4');
    await expect(page.locator('.cardbox .card').first()).not.toContainText('Menganalisa');
    await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
    await expect(pieces(page)).toHaveCount(32);
    w.assertNoErrors();
  });

  test("Legal's Mate: 5.Nxe5 berlabel Brilian, 7.Nd5# tidak dinaikkan", async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Replay/).click();
    await page.locator('details summary', { hasText: 'Impor PGN' }).click();
    await page.locator('textarea').fill(LEGAL_PGN);
    await page.getByRole('button', { name: 'Impor', exact: true }).click();
    await page.getByRole('button', { name: /Analisa partai/ }).click();
    await expect(page.locator('.summary .acc').first()).toBeVisible({ timeout: 90_000 });

    await expect(page.locator('.movelist .dot-badge.brilliant')).toHaveCount(1);
    await expect(page.locator('.movelist button:has(.dot-badge.brilliant)')).toContainText('Nxe5');
    await expect(page.locator('.summary .cnt [title="Brilian"], .summary .badge.brilliant').first()).toBeVisible();

    await page.locator('.movelist button', { hasText: 'Nxe5' }).click();
    const card = page.locator('.cardbox .card.cls-brilliant');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Brilian');
    const border = await card.evaluate((el) => getComputedStyle(el).borderLeftColor);
    expect(border).toBe('rgb(27, 172, 166)');

    await page.locator('.movelist button', { hasText: 'Nd5#' }).click();
    await expect(page.locator('.cardbox .card.cls-brilliant')).toHaveCount(0);
    w.assertNoErrors();
  });

  test('cadangan: unduh JSON lalu pulihkan setelah partai dihapus', async ({ page }) => {
    await page.goto('./');
    await menu(page, /Replay/).click();
    await page.locator('details summary', { hasText: 'Impor PGN' }).click();
    await page.locator('textarea').fill(LEGAL_PGN);
    await page.getByRole('button', { name: 'Impor', exact: true }).click();
    await page.getByRole('button', { name: 'Kembali', exact: true }).click();
    await expect(page.locator('.item')).toHaveCount(1);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Cadangkan semua/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^chess-learn-cadangan-\d{4}-\d{2}-\d{2}\.json$/);
    const path = await download.path();

    page.once('dialog', (d) => void d.accept());
    await page.locator('[aria-label="Hapus"]').click();
    await expect(page.locator('.item')).toHaveCount(0);

    const dialog = page.waitForEvent('dialog');
    await page.locator('input[type="file"]').setInputFiles(path);
    const d = await dialog;
    expect(d.message()).toBe('1 partai dipulihkan.');
    await d.accept();
    await expect(page.locator('.item')).toHaveCount(1);
  });
});

test.describe('keamanan', () => {
  test('CSP aktif: memblokir skrip inline & sumber luar, tetapi fitur tetap jalan', async ({ page }) => {
    const violations: string[] = [];
    await page.exposeFunction('__report', (v: string) => violations.push(v));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => void (window as unknown as { __report: (v: string) => void }).__report(e.violatedDirective));
    });
    await page.goto('./');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toMatch(/(?<!wasm-)unsafe-eval/); // eval JavaScript dilarang; hanya WebAssembly yang diizinkan
    expect(csp).toContain("'wasm-unsafe-eval'");

    // suntikan skrip inline harus diblokir (tidak mengubah window)
    await page.evaluate(() => {
      const s = document.createElement('script');
      s.textContent = 'window.__pwned = true';
      document.head.append(s);
    });
    expect(await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned)).toBeUndefined();
    // sumber gambar luar diblokir
    await page.evaluate(() => {
      const i = new Image();
      i.src = 'https://example.com/x.png';
      document.body.append(i);
    });
    await expect.poll(() => violations.join(',')).toContain('script-src');
    await expect.poll(() => violations.join(',')).toContain('img-src');
    violations.length = 0;

    // alur utama (engine WASM + worker + unduhan) tidak boleh memicu pelanggaran CSP
    await menu(page, /Belajar vs Bot/).click();
    await page.locator('.chip[data-v="1"]').click();
    await page.getByRole('button', { name: 'Mulai' }).click();
    await expect(page.locator('.status')).toContainText('Giliran', { timeout: 30_000 });
    await clickMove(page, 'e2', 'e4');
    await expect(page.locator('.botline')).toContainText('Bot', { timeout: 30_000 });
    expect(violations).toEqual([]);
  });

  test('PGN berisi HTML tidak dieksekusi dan ditampilkan sebagai teks', async ({ page }) => {
    const w = watchErrors(page);
    await page.goto('./');
    await menu(page, /Replay/).click();
    await page.locator('details summary', { hasText: 'Impor PGN' }).click();
    await page.locator('textarea').fill('[White "<img src=x onerror=window.__xss=1>"]\n[Black "<script>window.__xss=1</script>"]\n\n1. e4 e5 {<b>x</b>} *');
    await page.getByRole('button', { name: 'Impor', exact: true }).click();
    await expect(page.locator('h2')).toContainText('<img src=x');
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(page.locator('h2 img, h2 script')).toHaveCount(0);
    w.assertNoErrors();
  });
});
