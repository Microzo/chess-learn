import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, listGames, saveGame } from '../../src/core/storage/games';
import type { SavedGame } from '../../src/types';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

const game = (id: string, pgn = '1. e4 e5'): SavedGame =>
  ({ id, mode: 'pvp', createdAt: Number.parseInt(id.replace(/\D/g, '') || '1', 10), white: 'A', black: 'B', pgn, result: '*' }) as SavedGame;

beforeEach(() => store.clear());

describe('cadangan partai', () => {
  it('ekspor lalu impor memulihkan partai', () => {
    saveGame(game('g1')); saveGame(game('g2'));
    const text = exportBackup();
    store.clear();
    expect(importBackup(text)).toBe(2);
    expect(listGames().map((g) => g.id).sort()).toEqual(['g1', 'g2']);
  });

  it('id yang sama ditimpa, bukan digandakan', () => {
    saveGame(game('g1', '1. d4'));
    const text = exportBackup();
    saveGame(game('g1', '1. c4'));
    importBackup(text);
    expect(listGames()).toHaveLength(1);
    expect(listGames()[0]!.pgn).toBe('1. d4');
  });

  it('menolak berkas yang bukan cadangan', () => {
    expect(() => importBackup('bukan json')).toThrow();
    expect(() => importBackup('{"foo":1}')).toThrow();
  });

  it('melewati entri rusak', () => {
    const text = JSON.stringify({ format: 'chess-learn-backup', games: [{ id: 1 }, game('g3')] });
    expect(importBackup(text)).toBe(1);
  });
});
