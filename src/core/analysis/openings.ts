import { Chess } from 'chess.js';
import { OPENING_LINES } from '../../data/openings';
import type { OpeningInfo } from '../../types';

/** Kunci posisi tanpa nomor langkah (4 field FEN pertama) -> transposisi ikut terdeteksi. */
export const posKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

let lineEnds: Map<string, OpeningInfo> | null = null;
let bookSet: Set<string> | null = null;

function build() {
  lineEnds = new Map();
  bookSet = new Set();
  for (const [eco, name, line] of OPENING_LINES) {
    const g = new Chess();
    try {
      for (const san of line.split(' ')) {
        g.move(san);
        bookSet.add(posKey(g.fen()));
      }
      lineEnds.set(posKey(g.fen()), { eco, name });
    } catch {
      console.warn('Opening tidak valid, dilewati:', name);
    }
  }
}

/** Apakah posisi ini masih teori (ada di salah satu jalur opening)? */
export function isBookPosition(fen: string): boolean {
  if (!bookSet) build();
  return bookSet!.has(posKey(fen));
}

/** Nama opening untuk posisi ini bila posisi adalah ujung salah satu jalur. */
export function openingAt(fen: string): OpeningInfo | undefined {
  if (!lineEnds) build();
  return lineEnds!.get(posKey(fen));
}
