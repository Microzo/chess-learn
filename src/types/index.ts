/** Kategori kualitas langkah (mirip chess.com). */
export type MoveClass =
  | 'book'        // langkah teori opening
  | 'brilliant'   // langkah terbaik yang mengorbankan material tanpa merusak posisi
  | 'great'       // langkah terbaik yang unik: alternatif terbaik kedua jauh lebih buruk
  | 'best'        // langkah pilihan engine
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

/** Evaluasi posisi dari sudut pandang PUTIH. */
export interface Evaluation {
  /** centipawn; null jika mate */
  cp: number | null;
  /** mate in N (positif = putih menang), null jika bukan mate */
  mate: number | null;
}

export interface EngineLine {
  eval: Evaluation;
  /** langkah terbaik dalam UCI, mis. "e2e4" */
  bestMoveUci: string;
  /** principal variation (UCI) */
  pv: string[];
  depth: number;
  /** langkah terbaik kedua (hanya bila dicari dengan MultiPV 2) */
  second?: { uci: string; eval: Evaluation };
}

export interface OpeningInfo {
  eco: string;   // mis. "B20"
  name: string;  // mis. "Sicilian Defense"
}

/** Hasil analisa satu langkah. Dipakai oleh mode Learning (live) dan Replay. */
export interface MoveAnalysis {
  ply: number;                 // 1 = langkah putih pertama
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  classification: MoveClass;
  winLossPct: number;          // penurunan peluang menang bagi pemain yang melangkah
  evalBefore: Evaluation;
  evalAfter: Evaluation;
  engineBest: { san: string; uci: string };
  opening?: OpeningInfo;
  /** penjelasan singkat yang ditampilkan ke pemain */
  comment: string;
}

export type GameMode = 'learning' | 'pvp' | 'import';

export interface SavedGame {
  id: string;
  mode: GameMode;
  createdAt: number;
  white: string;
  black: string;
  pgn: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  /** terisi untuk mode learning, atau setelah analisa replay dijalankan */
  analysis?: MoveAnalysis[];
  accuracy?: { white: number; black: number };
}
