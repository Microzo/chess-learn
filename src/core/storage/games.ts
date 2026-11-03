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
