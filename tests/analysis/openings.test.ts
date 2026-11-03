import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENING_LINES } from '../../src/data/openings';
import { isBookPosition, openingAt } from '../../src/core/analysis/openings';

describe('openings', () => {
  it('semua jalur opening berisi langkah legal', () => {
    for (const [, name, line] of OPENING_LINES) {
      const g = new Chess();
      expect(() => line.split(' ').forEach((s) => g.move(s)), name).not.toThrow();
    }
  });

  it('mendeteksi Sicilian Defense dan posisi teori', () => {
    const g = new Chess();
    g.move('e4'); g.move('c5');
    expect(openingAt(g.fen())?.name).toBe('Sicilian Defense');
    expect(isBookPosition(g.fen())).toBe(true);
  });

  it('posisi acak bukan teori', () => {
    const g = new Chess();
    g.move('a3'); g.move('h6');
    expect(isBookPosition(g.fen())).toBe(false);
  });
});
