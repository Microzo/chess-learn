import { Chess } from 'chess.js';
import type { SavedGame } from '../../types';

export type Result = SavedGame['result'];

export interface GameStatus {
  over: boolean;
  result: Result;
  text: string;
}

export function statusOf(chess: Chess): GameStatus {
  if (chess.isCheckmate()) {
    const whiteWon = chess.turn() === 'b';
    return { over: true, result: whiteWon ? '1-0' : '0-1', text: `Skakmat! ${whiteWon ? 'Putih' : 'Hitam'} menang.` };
  }
  if (chess.isStalemate()) return { over: true, result: '1/2-1/2', text: 'Remis: stalemate.' };
  if (chess.isInsufficientMaterial()) return { over: true, result: '1/2-1/2', text: 'Remis: materi tidak cukup.' };
  if (chess.isThreefoldRepetition()) return { over: true, result: '1/2-1/2', text: 'Remis: pengulangan tiga kali.' };
  if (chess.isDraw()) return { over: true, result: '1/2-1/2', text: 'Remis: aturan 50 langkah.' };
  const side = chess.turn() === 'w' ? 'Putih' : 'Hitam';
  return { over: false, result: '*', text: chess.inCheck() ? `Giliran ${side} (skak!)` : `Giliran ${side}` };
}

/** Petak tujuan yang legal dari sebuah petak. */
export function legalTargets(chess: Chess, from: string): string[] {
  return chess.moves({ square: from as never, verbose: true }).map((m) => m.to);
}

export function needsPromotion(chess: Chess, from: string, to: string): boolean {
  return chess
    .moves({ square: from as never, verbose: true })
    .some((m) => m.to === to && m.promotion !== undefined);
}

/** Rekonstruksi PGN lengkap dengan header. */
export function toPgn(chess: Chess, white: string, black: string, result: Result): string {
  const c = new Chess();
  c.setHeader('White', white);
  c.setHeader('Black', black);
  c.setHeader('Result', result);
  c.setHeader('Date', new Date().toISOString().slice(0, 10).replaceAll('-', '.'));
  for (const m of chess.history()) c.move(m);
  return c.pgn();
}

/**
 * Apakah `color` punya materi yang cukup untuk skakmat? Dipakai saat lawan kehabisan waktu:
 * bila tidak, hasilnya remis. Penyederhanaan: bidak/benteng/ratu atau dua buah ringan dianggap cukup.
 */
export function hasMatingMaterial(chess: Chess, color: 'w' | 'b'): boolean {
  let minors = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell || cell.color !== color) continue;
      if (cell.type === 'p' || cell.type === 'r' || cell.type === 'q') return true;
      if (cell.type === 'n' || cell.type === 'b') minors++;
    }
  }
  return minors >= 2;
}
