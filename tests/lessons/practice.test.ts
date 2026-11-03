import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/lessons';
import { PracticeSession } from '../../src/modes/lessons/practice-core';

const demo = LESSONS.find((l) => l.id === 'scotch')!.demo!;

describe('PracticeSession', () => {
  it('memainkan seluruh teori sebagai Putih dengan lawan otomatis', () => {
    const s = new PracticeSession(demo, 'w');
    let guard = 0;
    while (!s.finished && guard++ < 100) {
      if (s.opponentToMove) { s.playOpponent(); continue; }
      const e = s.expected()!;
      expect(s.tryMove(e.from, e.to).result).toBe('correct');
    }
    expect(s.finished).toBe(true);
    expect(s.mistakes).toBe(0);
  });

  it('sebagai Hitam, Putih bergerak otomatis lebih dulu', () => {
    const s = new PracticeSession(demo, 'b');
    expect(s.opponentToMove).toBe(true);
    expect(s.playOpponent()!.san).toBe(demo.steps[0]!.san);
    expect(s.opponentToMove).toBe(false);
  });

  it('langkah legal tetapi bukan teori dihitung salah dan posisi tidak berubah', () => {
    const s = new PracticeSession(demo, 'w');
    const fen = s.chess.fen();
    expect(s.tryMove('a2', 'a3').result).toBe('wrong');
    expect(s.mistakes).toBe(1);
    expect(s.chess.fen()).toBe(fen);
    expect(s.step).toBe(0);
  });

  it('langkah ilegal ditolak tanpa dihitung salah; bukan giliran diblokir', () => {
    const s = new PracticeSession(demo, 'w');
    expect(s.tryMove('e2', 'e5').result).toBe('illegal');
    expect(s.mistakes).toBe(0);
    s.tryMove('e2', 'e4');
    expect(s.tryMove('d2', 'd4').result).toBe('blocked');
  });

  it('semua pelajaran opening bisa dilatih penuh dari kedua sisi', () => {
    for (const l of LESSONS.filter((x) => x.category === 'opening' && x.demo)) {
      for (const side of ['w', 'b'] as const) {
        const s = new PracticeSession(l.demo!, side);
        let guard = 0;
        while (!s.finished && guard++ < 200) {
          if (s.opponentToMove) { s.playOpponent(); continue; }
          const e = s.expected()!;
          expect(s.tryMove(e.from, e.to).result, `${l.id} ${side}`).toBe('correct');
        }
        expect(s.finished, `${l.id} ${side}`).toBe(true);
      }
    }
  });
});
