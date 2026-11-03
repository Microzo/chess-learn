import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../../src/data/puzzles';

describe('latihan taktik', () => {
  it('id unik dan setiap puzzle lengkap', () => {
    const ids = PUZZLES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PUZZLES) {
      expect(p.solution.length).toBeGreaterThan(0);
      expect(p.hint.length).toBeGreaterThan(0);
      expect(p.explanation.length).toBeGreaterThan(0);
    }
  });

  for (const p of PUZZLES) {
    it(`"${p.id}": posisi valid, solusi legal dan SAN kanonik`, () => {
      const chess = new Chess(p.fen);
      for (const m of p.setup ?? []) chess.move(m);
      expect(chess.isGameOver()).toBe(false);
      p.solution.forEach((san, i) => {
        const m = chess.move(san); // melempar bila ilegal
        expect(m.san, `langkah ${i}`).toBe(san);
      });
      // puzzle yang berakhir dengan '#' harus benar-benar skakmat
      if (p.solution.at(-1)!.endsWith('#')) expect(chess.isCheckmate()).toBe(true);
    });

    if (p.alts?.length) {
      it(`"${p.id}": langkah alternatif legal dari posisi awal`, () => {
        for (const alt of p.alts!) {
          const chess = new Chess(p.fen);
          for (const m of p.setup ?? []) chess.move(m);
          expect(chess.move(alt).san).toBe(alt);
        }
      });
    }
  }
});
