import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { CATEGORY_ORDER, GLOSSARY, LESSONS } from '../../src/data/lessons';

describe('materi belajar', () => {
  it('id unik dan kategori valid', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of LESSONS) expect(CATEGORY_ORDER).toContain(l.category);
  });

  it('setiap kategori punya pelajaran dan setiap pelajaran berisi teks', () => {
    for (const c of CATEGORY_ORDER) expect(LESSONS.some((l) => l.category === c)).toBe(true);
    for (const l of LESSONS) {
      expect(l.title.length).toBeGreaterThan(0);
      expect(l.body.length).toBeGreaterThan(0);
      expect(l.points.length).toBeGreaterThan(0);
    }
  });

  for (const l of LESSONS.filter((x) => x.demo)) {
    it(`demo "${l.id}": FEN valid, semua langkah legal`, () => {
      const d = l.demo!;
      const chess = new Chess(d.fen);
      d.steps.forEach((s, i) => {
        expect(s.note.length, `${l.id} langkah ${i} butuh catatan`).toBeGreaterThan(0);
        if (s.san) {
          const m = chess.move(s.san); // melempar bila ilegal
          expect(m.san).toBe(s.san); // penulisan SAN kanonik (skak/mat ditulis benar)
        }
      });
      if (d.expectMate) expect(chess.isCheckmate()).toBe(true);
      if (d.expectStalemate) expect(chess.isStalemate()).toBe(true);
    });
  }

  it('glosarium: istilah unik dan terisi', () => {
    const terms = GLOSSARY.map((g) => g.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
    for (const g of GLOSSARY) expect(g.def.length).toBeGreaterThan(0);
  });
});
