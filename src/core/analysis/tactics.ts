import { Chess } from 'chess.js';

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Selisih material (buah ringan/berat/bidak) dari sudut pandang `color`. */
export function materialBalance(chess: Chess, color: 'w' | 'b'): number {
  let sum = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell) sum += (cell.color === color ? 1 : -1) * (VALUE[cell.type] ?? 0);
    }
  }
  return sum;
}

/**
 * Pencarian "tenang" (hanya penangkapan, negamax + alpha-beta) pada material.
 * Mengembalikan nilai untuk pihak yang jalan. Pihak yang jalan boleh berhenti (stand pat).
 */
function quiescence(chess: Chess, alpha: number, beta: number, depth: number): number {
  const stand = materialBalance(chess, chess.turn());
  if (depth === 0) return stand;
  if (stand >= beta) return stand;
  if (stand > alpha) alpha = stand;
  const captures = chess
    .moves({ verbose: true })
    .filter((m) => m.captured)
    // tangkap bidak termahal dengan buah termurah dulu agar pemangkasan efektif
    .sort((a, b) => (VALUE[b.captured!] ?? 0) - (VALUE[a.captured!] ?? 0) || (VALUE[a.piece] ?? 0) - (VALUE[b.piece] ?? 0));
  for (const m of captures) {
    chess.move(m);
    const score = -quiescence(chess, -beta, -alpha, depth - 1);
    chess.undo();
    if (score >= beta) return score;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

/**
 * Apakah langkah ini sebuah pengorbanan? Ya bila, setelah lawan memilih rangkaian
 * penangkapan terbaiknya, pemain yang melangkah berakhir minimal `minLoss` poin material
 * di bawah posisi sebelum langkah (default 3 = setara satu buah ringan).
 */
export function isSacrifice(fenBefore: string, uci: string, minLoss = 3): boolean {
  const chess = new Chess(fenBefore);
  const mover = chess.turn();
  const before = baseline(fenBefore, mover);
  try {
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  } catch {
    return false;
  }
  if (chess.isGameOver()) return false;
  const afterForOpponent = quiescence(chess, -1000, 1000, 8);
  return -afterForOpponent <= before - minLoss;
}

/**
 * Nilai material acuan bagi pihak yang melangkah: material saat ini, atau (bila lebih rendah) apa yang
 * akan tersisa bila ia "melewatkan giliran" dan lawan menangkap sebanyak mungkin. Dengan begitu buah
 * yang sudah menggantung sebelum langkah tidak dihitung sebagai hasil pengorbanan.
 */
function baseline(fen: string, mover: 'w' | 'b'): number {
  const now = materialBalance(new Chess(fen), mover);
  try {
    const parts = fen.split(' ');
    parts[1] = mover === 'w' ? 'b' : 'w';
    parts[3] = '-'; // en passant tidak berlaku setelah giliran dilewati
    const passed = new Chess(parts.join(' '));
    return Math.min(now, -quiescence(passed, -1000, 1000, 8));
  } catch {
    return now; // posisi "lewat giliran" ilegal (mis. raja sedang skak)
  }
}

/** Jumlah langkah legal di posisi tersebut. */
export function legalMoveCount(fen: string): number {
  return new Chess(fen).moves().length;
}
