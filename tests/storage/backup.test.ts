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

describe('keamanan impor cadangan', () => {
  const wrap = (games: unknown[]) => JSON.stringify({ format: 'chess-learn-backup', games });
  const ok = (over: Record<string, unknown> = {}) => ({
    id: 'x1', mode: 'pvp', createdAt: 1, white: 'A', black: 'B', pgn: '1. e4 e5', result: '*', ...over,
  });

  it('menolak PGN yang tidak bisa dibaca atau kosong', () => {
    expect(importBackup(wrap([ok({ pgn: 'ini bukan pgn @@@' })]))).toBe(0);
    expect(importBackup(wrap([ok({ pgn: '1. e4 e5 2. Ke7' })]))).toBe(0);
    expect(listGames()).toHaveLength(0);
  });

  it('menolak result, mode, id, dan tipe yang tidak valid', () => {
    expect(importBackup(wrap([ok({ result: '2-0' }), ok({ mode: 'hack' }), ok({ id: '' }), ok({ id: 'a'.repeat(100) }),
      ok({ createdAt: 'x' }), ok({ white: 5 }), ok({ createdAt: Infinity })]))).toBe(0);
  });

  it('membuang analisa dan field tak dikenal dari berkas luar', () => {
    importBackup(wrap([ok({ analysis: [{ evil: true }], accuracy: 'x', polluted: 1 })]));
    const g = listGames()[0] as unknown as Record<string, unknown>;
    expect(g.analysis).toBeUndefined();
    expect(g.accuracy).toBeUndefined();
    expect(g.polluted).toBeUndefined();
  });

  it('nama pemain dipotong dan tidak ada prototype pollution', () => {
    const evil = '{"format":"chess-learn-backup","games":[{"id":"p1","mode":"pvp","createdAt":1,"white":"' + 'W'.repeat(500) +
      '","black":"B","pgn":"1. e4 e5","result":"*","__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}]}';
    importBackup(evil);
    expect(listGames()[0]!.white).toHaveLength(80);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('menolak berkas dan PGN yang terlalu besar', () => {
    expect(() => importBackup('x'.repeat(20_000_001))).toThrow(/besar/);
    expect(importBackup(wrap([ok({ pgn: '1. e4 e5 ' + '{c} '.repeat(60_000) })]))).toBe(0);
  });

  it('hanya sebagian entri valid yang masuk', () => {
    expect(importBackup(wrap([ok(), ok({ id: 'x2', result: 'bad' }), null, 5, 'str'] as unknown[]))).toBe(1);
  });
});

describe('penyimpanan yang rusak', () => {
  it('data bukan array atau entri rusak tidak membuat daftar error', () => {
    localStorage.setItem('chesslearn.games.v1', '{"a":1}');
    expect(listGames()).toEqual([]);
    localStorage.setItem('chesslearn.games.v1', JSON.stringify([{ id: 'ok', pgn: '1. e4', white: 'A', black: 'B', createdAt: 5, mode: 'pvp', result: '*' },
      { id: 7, pgn: 5 }, null, 'x', { id: 'bad', pgn: '1. e4', white: 'A', black: 'B', createdAt: 1, analysis: 'bukan array' }]));
    expect(listGames().map((g) => g.id)).toEqual(['ok']);
  });
});
