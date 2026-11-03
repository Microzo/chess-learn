import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { ChessClock, formatClock, type TimeControl } from '../../src/core/game/clock';
import { hasMatingMaterial } from '../../src/core/game/game';

const tc = (baseMs: number, incMs = 0): TimeControl => ({ id: 't', label: 't', baseMs, incMs });

describe('ChessClock', () => {
  it('belum berjalan sebelum langkah pertama Putih', () => {
    const c = new ChessClock(tc(60_000));
    expect(c.active).toBeNull();
    expect(c.remaining('w', 5_000)).toBe(60_000);
    expect(c.flagged(999_999)).toBeNull();
  });

  it('jam Hitam berjalan setelah langkah pertama Putih, tanpa inkremen pada langkah pertama', () => {
    const c = new ChessClock(tc(60_000, 2_000));
    c.press('w', 1_000);
    expect(c.active).toBe('b');
    expect(c.remaining('w', 9_000)).toBe(60_000);
    expect(c.remaining('b', 11_000)).toBe(50_000);
  });

  it('mengurangi waktu pemain yang jalan dan menambah inkremen saat ia melangkah', () => {
    const c = new ChessClock(tc(60_000, 2_000));
    c.press('w', 0);
    c.press('b', 10_000); // Hitam memakai 10 detik, +2 detik
    expect(c.remaining('b', 10_000)).toBe(52_000);
    expect(c.active).toBe('w');
    c.press('w', 15_000); // Putih memakai 5 detik, +2 detik
    expect(c.remaining('w', 15_000)).toBe(57_000);
  });

  it('mengabaikan press dari pihak yang bukan gilirannya', () => {
    const c = new ChessClock(tc(60_000));
    c.press('w', 0);
    c.press('w', 5_000);
    expect(c.active).toBe('b');
    expect(c.remaining('b', 5_000)).toBe(55_000); // jam Hitam tetap berjalan sejak langkah Putih
  });

  it('mendeteksi bendera jatuh dan tidak pernah negatif', () => {
    const c = new ChessClock(tc(5_000));
    c.press('w', 0);
    expect(c.flagged(4_999)).toBeNull();
    expect(c.flagged(5_000)).toBe('b');
    expect(c.remaining('b', 99_000)).toBe(0);
  });

  it('stop membekukan waktu', () => {
    const c = new ChessClock(tc(60_000));
    c.press('w', 0);
    c.stop(7_000);
    expect(c.active).toBeNull();
    expect(c.remaining('b', 500_000)).toBe(53_000);
    expect(c.flagged(500_000)).toBeNull();
  });
});

describe('ChessClock pause/resume', () => {
  it('waktu tidak berkurang selama dijeda', () => {
    const c = new ChessClock(tc(60_000));
    c.press('w', 0); // jam Hitam jalan
    c.pause(10_000);
    expect(c.active).toBeNull();
    expect(c.remaining('b', 500_000)).toBe(50_000);
    c.resume(500_000);
    expect(c.active).toBe('b');
    expect(c.remaining('b', 505_000)).toBe(45_000);
  });
  it('pause saat jam belum berjalan tidak berpengaruh', () => {
    const c = new ChessClock(tc(60_000));
    c.pause(1_000);
    c.resume(2_000);
    expect(c.active).toBeNull();
  });
});

describe('formatClock', () => {
  it('menampilkan menit:detik dan desimal di bawah 10 detik', () => {
    expect(formatClock(600_000)).toBe('10:00');
    expect(formatClock(59_001)).toBe('1:00');
    expect(formatClock(9_950)).toBe('0:09.9');
    expect(formatClock(0)).toBe('0:00.0');
  });
});

describe('hasMatingMaterial', () => {
  const has = (fen: string, c: 'w' | 'b') => hasMatingMaterial(new Chess(fen), c);
  it('raja saja atau satu buah ringan tidak cukup', () => {
    expect(has('4k3/8/8/8/8/8/8/4K3 w - - 0 1', 'w')).toBe(false);
    expect(has('4k3/8/8/8/8/8/8/4KN2 w - - 0 1', 'w')).toBe(false);
    expect(has('4k3/8/8/8/8/8/8/4KB2 w - - 0 1', 'w')).toBe(false);
  });
  it('gajah-gajah sewarna melawan raja telanjang tidak cukup, beda warna cukup', () => {
    expect(has('4k3/8/8/8/8/B7/8/2B1K3 w - - 0 1', 'w')).toBe(false); // c1 dan a3 sama-sama kotak gelap
    expect(has('4k3/8/8/8/8/8/8/2BBK3 w - - 0 1', 'w')).toBe(true); // c1 gelap, d1 terang
  });
  it('satu buah ringan cukup bila lawan masih punya bidak atau buah (skakmat dengan bantuan masih mungkin)', () => {
    expect(has('4k3/p7/8/8/8/8/8/4KN2 w - - 0 1', 'w')).toBe(true);
    expect(has('4k3/n7/8/8/8/8/8/4KB2 w - - 0 1', 'w')).toBe(true);
  });
  it('bidak, benteng, ratu, atau dua buah ringan cukup', () => {
    expect(has('4k3/8/8/8/8/8/P7/4K3 w - - 0 1', 'w')).toBe(true);
    expect(has('4k3/8/8/8/8/8/8/R3K3 w - - 0 1', 'w')).toBe(true);
    expect(has('4k3/8/8/8/8/8/8/3QK3 w - - 0 1', 'w')).toBe(true);
    expect(has('4k3/8/8/8/8/8/8/3NKB2 w - - 0 1', 'w')).toBe(true);
  });
});
