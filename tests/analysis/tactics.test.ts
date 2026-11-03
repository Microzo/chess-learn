import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { upgradeClass, type UpgradeInput } from '../../src/core/analysis/classifier';
import { isSacrifice, legalMoveCount, materialBalance } from '../../src/core/analysis/tactics';

const play = (moves: string[], fen?: string) => {
  const c = new Chess(fen);
  for (const m of moves) c.move(m);
  return c;
};

describe('materialBalance', () => {
  it('seimbang di posisi awal dan menghitung selisih dari sudut pandang warna', () => {
    expect(materialBalance(new Chess(), 'w')).toBe(0);
    const c = new Chess('4k3/8/8/8/8/8/8/3QK3 w - - 0 1');
    expect(materialBalance(c, 'w')).toBe(9);
    expect(materialBalance(c, 'b')).toBe(-9);
  });
});

describe('isSacrifice', () => {
  it('Nxe5 pada Legal\'s Mate adalah pengorbanan ratu', () => {
    const c = play(['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6']);
    expect(isSacrifice(c.fen(), 'f3e5')).toBe(true);
  });

  it('langkah biasa dan penukaran seimbang bukan pengorbanan', () => {
    expect(isSacrifice(new Chess().fen(), 'e2e4')).toBe(false);
    const c = play(['e4', 'd5']);
    expect(isSacrifice(c.fen(), 'e4d5')).toBe(false); // memakan bidak gratis
    const trade = play(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6']);
    expect(isSacrifice(trade.fen(), 'f3e5')).toBe(false); // memakan bidak e5 yang tidak lagi terjaga
  });

  it('ratu memakan bidak yang dijaga bidak = kehilangan ratu demi satu bidak', () => {
    const free = new Chess('4k3/8/8/3p4/8/8/8/3QK3 w - - 0 1');
    expect(isSacrifice(free.fen(), 'd1d5')).toBe(false); // bidak d5 tidak terjaga
    const guarded = new Chess('4k3/8/2p5/3p4/8/8/8/3QK3 w - - 0 1');
    expect(isSacrifice(guarded.fen(), 'd1d5')).toBe(true); // cxd5 menangkap ratu
  });

  it('buah yang sudah menggantung sebelum langkah tidak dihitung sebagai pengorbanan', () => {
    // Kuda Hitam di e5 diserang bidak d4. Hitam memberi skak dengan gajah (tidak menyelamatkan kuda).
    const fen = 'rnbqk2r/pppp1ppp/5n2/4n3/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4';
    expect(isSacrifice(fen, 'f8b4')).toBe(false);
  });

  it('posisi akhir permainan tidak dianggap pengorbanan', () => {
    const c = new Chess('7k/8/5K2/8/8/8/8/6Q1 w - - 0 1');
    expect(isSacrifice(c.fen(), 'g1g7')).toBe(false);
  });
});

describe('legalMoveCount', () => {
  it('menghitung langkah legal', () => {
    expect(legalMoveCount(new Chess().fen())).toBe(20);
    expect(legalMoveCount('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')).toBe(0);
  });
});

describe('upgradeClass', () => {
  const base: UpgradeInput = { cls: 'best', winBefore: 55, winAfter: 60, sacrifice: false, gapToSecond: null, legalMoves: 30, givesMate: false };
  const u = (o: Partial<UpgradeInput>) => upgradeClass({ ...base, ...o });

  it('hanya menaikkan "best"', () => {
    expect(u({ cls: 'good', sacrifice: true })).toBe('good');
    expect(u({ cls: 'blunder', gapToSecond: 50 })).toBe('blunder');
    expect(u({ cls: 'book', sacrifice: true })).toBe('book');
  });

  it('brilian: pengorbanan, tidak merusak posisi, belum menang telak', () => {
    expect(u({ sacrifice: true })).toBe('brilliant');
    expect(u({ sacrifice: true, winAfter: 40 })).toBe('best'); // posisi jadi buruk
    expect(u({ sacrifice: true, winBefore: 95 })).toBe('best'); // sudah menang telak
  });

  it('hebat: alternatif kedua jauh lebih buruk', () => {
    expect(u({ gapToSecond: 25 })).toBe('great');
    expect(u({ gapToSecond: 19 })).toBe('best');
    expect(u({ gapToSecond: null })).toBe('best');
  });

  it('tidak menaikkan saat skakmat, langkah satu-satunya yang legal, atau menang telak', () => {
    expect(u({ sacrifice: true, givesMate: true })).toBe('best');
    expect(u({ gapToSecond: 60, legalMoves: 1 })).toBe('best');
    expect(u({ gapToSecond: 60, winBefore: 92 })).toBe('best');
  });

  it('brilian lebih diutamakan daripada hebat', () => {
    expect(u({ sacrifice: true, gapToSecond: 60 })).toBe('brilliant');
  });
});
