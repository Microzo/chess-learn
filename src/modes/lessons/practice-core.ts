import { Chess } from 'chess.js';
import type { Demo } from '../../data/lessons';

export type Side = 'w' | 'b';
export type TryResult = 'correct' | 'wrong' | 'illegal' | 'blocked';

/**
 * Sesi latihan: pemain memainkan satu sisi dari rangkaian langkah sebuah demo; sisi lawan
 * dimainkan otomatis. Hanya langkah yang persis sama dengan teori yang diterima.
 */
export class PracticeSession {
  chess: Chess;
  step = 0; // indeks langkah demo berikutnya
  mistakes = 0;

  constructor(readonly demo: Demo, readonly side: Side) {
    this.chess = new Chess(demo.fen);
  }

  get total(): number {
    return this.demo.steps.filter((s) => s.san).length;
  }

  get finished(): boolean {
    return this.step >= this.demo.steps.length;
  }

  /** Giliran lawan: langkah otomatis berikutnya? */
  get opponentToMove(): boolean {
    return !this.finished && this.chess.turn() !== this.side;
  }

  /** Mainkan langkah lawan sesuai teori; null bila bukan gilirannya. */
  playOpponent(): { san: string; from: string; to: string; note: string } | null {
    if (!this.opponentToMove) return null;
    const s = this.demo.steps[this.step]!;
    const m = this.chess.move(s.san!);
    this.step++;
    return { san: m.san, from: m.from, to: m.to, note: s.note };
  }

  /** SAN langkah yang diharapkan dari pemain sekarang (untuk petunjuk). */
  expected(): { san: string; from: string; to: string; note: string } | null {
    if (this.finished || this.chess.turn() !== this.side) return null;
    const s = this.demo.steps[this.step]!;
    const probe = new Chess(this.chess.fen());
    const m = probe.move(s.san!);
    return { san: m.san, from: m.from, to: m.to, note: s.note };
  }

  tryMove(from: string, to: string, promotion?: string): { result: TryResult; note?: string } {
    if (this.finished || this.chess.turn() !== this.side) return { result: 'blocked' };
    const probe = new Chess(this.chess.fen());
    let m;
    try {
      m = probe.move({ from, to, ...(promotion ? { promotion } : {}) });
    } catch {
      return { result: 'illegal' };
    }
    const want = this.demo.steps[this.step]!;
    if (m.san !== want.san) {
      this.mistakes++;
      return { result: 'wrong' };
    }
    this.chess.move(m.san);
    this.step++;
    return { result: 'correct', note: want.note };
  }
}
