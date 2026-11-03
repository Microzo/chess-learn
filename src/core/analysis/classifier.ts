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

export interface UpgradeInput {
  cls: MoveClass;
  /** peluang menang (0..100) pemain yang melangkah, sebelum dan sesudah langkah */
  winBefore: number;
  winAfter: number;
  sacrifice: boolean;
  /** selisih peluang menang antara langkah terbaik dan terbaik kedua; null bila tidak diketahui */
  gapToSecond: number | null;
  legalMoves: number;
  givesMate: boolean;
}

/** Batas yang bisa di-tuning (persen peluang menang). */
export const UPGRADE = { alreadyWinning: 90, minAfterForBrilliant: 50, onlyMoveGap: 20 } as const;

/**
 * Naikkan "Terbaik" menjadi "Brilian" atau "Hebat".
 * Brilian: langkah terbaik yang mengorbankan material dan tidak merusak posisi.
 * Hebat: langkah terbaik yang unik (alternatif terbaik kedua jauh lebih buruk).
 * Tidak diberikan bila posisi sudah menang telak, langkahnya skakmat, atau tidak ada pilihan lain.
 */
export function upgradeClass(i: UpgradeInput): MoveClass {
  if (i.cls !== 'best') return i.cls;
  if (i.givesMate || i.legalMoves < 2 || i.winBefore >= UPGRADE.alreadyWinning) return i.cls;
  if (i.sacrifice && i.winAfter >= UPGRADE.minAfterForBrilliant) return 'brilliant';
  if (i.gapToSecond !== null && i.gapToSecond >= UPGRADE.onlyMoveGap) return 'great';
  return i.cls;
}

/** Akurasi per langkah (rumus Lichess) -> rata-rata = akurasi pemain. */
export function moveAccuracy(loss: number): number {
  const v = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.min(100, Math.max(0, v));
}
