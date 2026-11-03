import { Chess } from 'chess.js';
import type { Engine } from '../engine/engine';
import type { EngineLine, MoveAnalysis, MoveClass, OpeningInfo } from '../../types';
import { classify, moveAccuracy, winLoss } from './classifier';
import { isBookPosition, openingAt } from './openings';

/** Nilai pengganti untuk posisi skakmat (mate 0 tidak punya tanda). */
const MATE_CP = 10000;

export const CLASS_LABEL: Record<MoveClass, string> = {
  book: 'Teori',
  brilliant: 'Brilian',
  great: 'Hebat',
  best: 'Terbaik',
  excellent: 'Sangat baik',
  good: 'Bagus',
  inaccuracy: 'Kurang akurat',
  mistake: 'Kesalahan',
  blunder: 'Blunder',
};

export const CLASS_SYMBOL: Record<MoveClass, string> = {
  book: '📖',
  brilliant: '!!',
  great: '!',
  best: '★',
  excellent: '✓',
  good: '✓',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
};

function terminalLine(chess: Chess): EngineLine | null {
  if (chess.isCheckmate()) {
    // pihak yang harus jalan sudah skakmat
    const whiteWins = chess.turn() === 'b';
    return { eval: { cp: whiteWins ? MATE_CP : -MATE_CP, mate: null }, bestMoveUci: '(none)', pv: [], depth: 0 };
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return { eval: { cp: 0, mate: null }, bestMoveUci: '(none)', pv: [], depth: 0 };
  }
  return null;
}

export function uciOf(m: { from: string; to: string; promotion?: string | undefined }) {
  return m.from + m.to + (m.promotion ?? '');
}

export function uciToSan(fen: string, uci: string): string {
  if (!uci || uci === '(none)') return '';
  try {
    const g = new Chess(fen);
    return g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san;
  } catch {
    return uci;
  }
}

function comment(cls: MoveClass, loss: number, bestSan: string, opening?: OpeningInfo): string {
  const best = bestSan ? ` Langkah terbaik: ${bestSan}.` : '';
  const pct = `${loss.toFixed(0)}%`;
  switch (cls) {
    case 'book':
      return opening ? `Langkah teori: ${opening.name} (${opening.eco}).` : 'Langkah teori opening.';
    case 'best':
      return 'Langkah terbaik, sama dengan pilihan engine.';
    case 'excellent':
      return `Sangat baik, nyaris setara langkah terbaik.${best}`;
    case 'good':
      return `Langkah bagus, tapi ada yang sedikit lebih baik.${best}`;
    case 'inaccuracy':
      return `Kurang akurat, peluang menang turun ±${pct}.${best}`;
    case 'mistake':
      return `Kesalahan, peluang menang turun ±${pct}.${best}`;
    case 'blunder':
      return `Blunder! Peluang menang turun ±${pct}.${best}`;
    default:
      return '';
  }
}

export class Analyzer {
  private cache = new Map<string, EngineLine>();

  constructor(private engine: Engine, private depth = 12) {}

  /** Evaluasi posisi (dengan cache; posisi akhir permainan dihitung tanpa engine). */
  async evaluate(fen: string): Promise<EngineLine> {
    const hit = this.cache.get(fen);
    if (hit) return hit;
    const term = terminalLine(new Chess(fen));
    const line = term ?? (await this.engine.analyse(fen, { depth: this.depth }));
    this.cache.set(fen, line);
    return line;
  }

  async analyseMove(fenBefore: string, fenAfter: string, san: string, uci: string, ply: number): Promise<MoveAnalysis> {
    const before = await this.evaluate(fenBefore);
    const after = await this.evaluate(fenAfter);
    const mover = (fenBefore.split(' ')[1] ?? 'w') as 'w' | 'b';
    const loss = winLoss(before.eval, after.eval, mover);
    const isBook = isBookPosition(fenAfter);
    const classification = classify({ loss, playedUci: uci, engineBestUci: before.bestMoveUci, isBook });
    const opening = openingAt(fenAfter);
    const bestSan = uciToSan(fenBefore, before.bestMoveUci);
    return {
      ply,
      san,
      uci,
      fenBefore,
      fenAfter,
      classification,
      winLossPct: loss,
      evalBefore: before.eval,
      evalAfter: after.eval,
      engineBest: { san: bestSan, uci: before.bestMoveUci },
      ...(opening ? { opening } : {}),
      comment: comment(classification, loss, uci === before.bestMoveUci ? '' : bestSan, opening),
    };
  }

  /** Analisa seluruh partai dari PGN (untuk replay / PvP). */
  async analysePgn(pgn: string, onProgress?: (done: number, total: number) => void): Promise<MoveAnalysis[]> {
    const g = new Chess();
    g.loadPgn(pgn);
    const moves = g.history({ verbose: true });
    const out: MoveAnalysis[] = [];
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i]!;
      out.push(await this.analyseMove(m.before, m.after, m.san, uciOf(m), i + 1));
      onProgress?.(i + 1, moves.length);
    }
    return out;
  }
}

/** Akurasi rata-rata per pemain (0..100). */
export function accuracyOf(analysis: MoveAnalysis[]): { white: number; black: number } {
  const avg = (xs: MoveAnalysis[]) =>
    xs.length ? xs.reduce((s, a) => s + moveAccuracy(a.winLossPct), 0) / xs.length : 100;
  return {
    white: avg(analysis.filter((a) => a.ply % 2 === 1)),
    black: avg(analysis.filter((a) => a.ply % 2 === 0)),
  };
}

/** Opening terakhir yang cocok sampai langkah ke-n. */
export function openingUpTo(analysis: MoveAnalysis[], n = analysis.length): OpeningInfo | undefined {
  for (let i = Math.min(n, analysis.length) - 1; i >= 0; i--) {
    const o = analysis[i]!.opening;
    if (o) return o;
  }
  return undefined;
}

/** Hitung jumlah tiap kategori per pemain, untuk ringkasan replay. */
export function classCounts(analysis: MoveAnalysis[], side: 'w' | 'b'): Partial<Record<MoveClass, number>> {
  const out: Partial<Record<MoveClass, number>> = {};
  for (const a of analysis) {
    if ((a.ply % 2 === 1) !== (side === 'w')) continue;
    out[a.classification] = (out[a.classification] ?? 0) + 1;
  }
  return out;
}
