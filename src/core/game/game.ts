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
 * Apakah `color` bisa menang saat waktu lawan habis? Aturan FIDE: menang bila skakmat masih mungkin
 * lewat rangkaian langkah legal apa pun (termasuk bantuan lawan). Hasilnya remis bila tidak mungkin:
 * - tanpa bidak/benteng/ratu dan tanpa buah ringan;
 * - melawan raja telanjang: satu buah ringan, atau gajah-gajah sewarna saja, tidak cukup.
 * Dua kuda melawan raja telanjang dianggap cukup (skakmat tetap mungkin dengan bantuan).
 */
export function hasMatingMaterial(chess: Chess, color: 'w' | 'b'): boolean {
  let knights = 0;
  let bishops = 0;
  const bishopColors = new Set<number>();
  let loserOtherPieces = 0;
  chess.board().forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return;
      if (cell.color !== color) {
        if (cell.type !== 'k') loserOtherPieces++;
        return;
      }
      if (cell.type === 'p' || cell.type === 'r' || cell.type === 'q') knights += 100; // cukup
      if (cell.type === 'n') knights++;
      if (cell.type === 'b') { bishops++; bishopColors.add((r + c) % 2); }
    });
  });
  if (knights >= 100) return true;
  const minors = knights + bishops;
  if (minors === 0) return false;
  if (loserOtherPieces > 0) return true; // lawan punya buah yang bisa "membantu" skakmat
  if (minors >= 2) return !(knights === 0 && bishopColors.size === 1);
  return false;
}
