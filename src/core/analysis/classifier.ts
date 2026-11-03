import type { Evaluation, MoveClass } from '../../types';

/** cp (sudut pandang putih) -> peluang menang putih 0..100 (kurva ala Lichess). */
export function winPercent(e: Evaluation): number {
  if (e.mate !== null) return e.mate > 0 ? 100 : 0;
  const cp = e.cp ?? 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/** Penurunan peluang menang bagi pemain yang melangkah (>= 0). */
export function winLoss(before: Evaluation, after: Evaluation, mover: 'w' | 'b'): number {
  const b = winPercent(before);
  const a = winPercent(after);
  const loss = mover === 'w' ? b - a : a - b;
  return Math.max(0, loss);
}

export interface ClassifyInput {
  loss: number;
  playedUci: string;
  engineBestUci: string;
  isBook: boolean;
}

/** Ambang batas dapat di-tuning; semua dalam persen peluang menang. */
export const THRESHOLDS = { excellent: 2, good: 5, inaccuracy: 10, mistake: 20 } as const;

export function classify({ loss, playedUci, engineBestUci, isBook }: ClassifyInput): MoveClass {
  if (isBook) return 'book';
  if (playedUci === engineBestUci || loss < 0.5) return 'best';
  if (loss < THRESHOLDS.excellent) return 'excellent';
  if (loss < THRESHOLDS.good) return 'good';
  if (loss < THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (loss < THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

/** Akurasi per langkah (rumus Lichess) -> rata-rata = akurasi pemain. */
export function moveAccuracy(loss: number): number {
  const v = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.min(100, Math.max(0, v));
}
