import { Chess } from 'chess.js';
import type { SavedGame } from '../../types';

const KEY = 'chesslearn.games.v1';

/** Bentuk minimal yang dibutuhkan UI; entri lain (mis. hasil suntingan manual) dilewati. */
function looksValid(x: unknown): x is SavedGame {
  const g = x as Partial<SavedGame> | null;
  return !!g && typeof g === 'object' && typeof g.id === 'string' && typeof g.pgn === 'string'
    && typeof g.white === 'string' && typeof g.black === 'string' && typeof g.createdAt === 'number'
    && (g.analysis === undefined || Array.isArray(g.analysis));
}

function readAll(): SavedGame[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter(looksValid) : [];
  } catch {
    return [];
  }
}

function writeAll(games: SavedGame[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    console.warn('Gagal menyimpan partai (penyimpanan penuh/diblokir).');
  }
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function listGames(): SavedGame[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getGame(id: string): SavedGame | undefined {
  return readAll().find((g) => g.id === id);
}

export function saveGame(game: SavedGame) {
  const all = readAll();
  const i = all.findIndex((g) => g.id === game.id);
  if (i >= 0) all[i] = game;
  else all.push(game);
  writeAll(all);
}

export function deleteGame(id: string) {
  writeAll(readAll().filter((g) => g.id !== id));
}

const BACKUP_FORMAT = 'chess-learn-backup';

/** Seluruh partai sebagai teks JSON untuk cadangan. */
export function exportBackup(): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: Date.now(), games: readAll() });
}

const MAX_FILE = 20_000_000; // karakter
const MAX_GAMES = 5000;
const MAX_PGN = 200_000;
const MAX_NAME = 80;
const RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];
const MODES = ['learning', 'pvp', 'import'];

/** Salinan bersih satu partai dari data tak tepercaya, atau null bila tidak valid. */
function sanitize(x: unknown): SavedGame | null {
  const g = x as Record<string, unknown> | null;
  if (!g || typeof g !== 'object') return null;
  const { id, mode, createdAt, white, black, pgn, result } = g;
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return null;
  if (typeof mode !== 'string' || !MODES.includes(mode)) return null;
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null;
  if (typeof white !== 'string' || typeof black !== 'string') return null;
  if (typeof pgn !== 'string' || pgn.length === 0 || pgn.length > MAX_PGN) return null;
  if (typeof result !== 'string' || !RESULTS.includes(result)) return null;
  try {
    const c = new Chess();
    c.loadPgn(pgn);
    if (c.history().length === 0) return null;
  } catch {
    return null;
  }
  // analisa/akurasi sengaja dibuang: bisa dihitung ulang dan tidak boleh dipercaya dari berkas luar
  return { id, mode: mode as SavedGame['mode'], createdAt, white: white.slice(0, MAX_NAME), black: black.slice(0, MAX_NAME), pgn, result: result as SavedGame['result'] };
}

/**
 * Gabungkan cadangan ke penyimpanan (id yang sama ditimpa). Mengembalikan jumlah partai yang
 * dipulihkan; melempar galat bila berkas bukan cadangan Chess Learn.
 */
export function importBackup(text: string): number {
  if (text.length > MAX_FILE) throw new Error('Berkas terlalu besar.');
  let data: { format?: string; games?: unknown[] };
  try { data = JSON.parse(text); } catch { throw new Error('Berkas bukan JSON yang valid.'); }
  if (data.format !== BACKUP_FORMAT || !Array.isArray(data.games)) throw new Error('Bukan berkas cadangan Chess Learn.');
  const incoming = data.games.slice(0, MAX_GAMES).map(sanitize).filter((x): x is SavedGame => x !== null);
  const all = readAll();
  for (const g of incoming) {
    const i = all.findIndex((x) => x.id === g.id);
    if (i >= 0) all[i] = g; else all.push(g);
  }
  writeAll(all);
  return incoming.length;
}
