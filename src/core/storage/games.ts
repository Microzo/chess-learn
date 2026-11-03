import type { SavedGame } from '../../types';

const KEY = 'chesslearn.games.v1';

function readAll(): SavedGame[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedGame[];
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

function isGame(x: unknown): x is SavedGame {
  const g = x as Partial<SavedGame> | null;
  return !!g && typeof g.id === 'string' && typeof g.pgn === 'string' && typeof g.white === 'string'
    && typeof g.black === 'string' && typeof g.createdAt === 'number';
}

/**
 * Gabungkan cadangan ke penyimpanan (id yang sama ditimpa). Mengembalikan jumlah partai yang
 * dipulihkan; melempar galat bila berkas bukan cadangan Chess Learn.
 */
export function importBackup(text: string): number {
  let data: { format?: string; games?: unknown[] };
  try { data = JSON.parse(text); } catch { throw new Error('Berkas bukan JSON yang valid.'); }
  if (data.format !== BACKUP_FORMAT || !Array.isArray(data.games)) throw new Error('Bukan berkas cadangan Chess Learn.');
  const incoming = data.games.filter(isGame);
  const all = readAll();
  for (const g of incoming) {
    const i = all.findIndex((x) => x.id === g.id);
    if (i >= 0) all[i] = g; else all.push(g);
  }
  writeAll(all);
  return incoming.length;
}
