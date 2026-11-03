// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listGames, saveGame } from '../../src/core/storage/games';
import { replayList, replayScreen } from '../../src/modes/replay/replay';
import * as download from '../../src/ui/download';
import type { SavedGame } from '../../src/types';
import { button, show, spyDialog } from './helpers';

const game = (id: string, white = 'Ana B', black = 'Cici/D'): SavedGame => ({
  id, mode: 'pvp', createdAt: Date.now(), white, black, pgn: '1. e4 e5 2. Nf3 Nc6', result: '*',
}) as SavedGame;

beforeEach(() => { localStorage.clear(); });
afterEach(() => vi.restoreAllMocks());

describe('daftar partai', () => {
  it('menampilkan pesan kosong tanpa partai', () => {
    expect(show(replayList).textContent).toContain('Belum ada partai tersimpan');
  });

  it('menampilkan partai tersimpan', () => {
    saveGame(game('a1'));
    saveGame(game('a2', 'X', 'Y'));
    const root = show(replayList);
    expect(root.querySelectorAll('.item')).toHaveLength(2);
    expect(root.textContent).toContain('X vs Y');
  });

  it('menghapus partai setelah konfirmasi', () => {
    saveGame(game('a1'));
    const root = show(replayList);
    spyDialog('confirm').mockReturnValue(false);
    (root.querySelector('[aria-label="Hapus"]') as HTMLElement).click();
    expect(listGames()).toHaveLength(1);
    spyDialog('confirm').mockReturnValue(true);
    (root.querySelector('[aria-label="Hapus"]') as HTMLElement).click();
    expect(listGames()).toHaveLength(0);
  });
});

describe('cadangan dari layar', () => {
  it('Cadangkan tanpa partai memberi tahu dan tidak mengunduh', () => {
    const root = show(replayList);
    const alertSpy = spyDialog('alert').mockImplementation(() => undefined);
    const dl = vi.spyOn(download, 'downloadText').mockImplementation(() => undefined);
    button(root, 'Cadangkan').click();
    expect(alertSpy).toHaveBeenCalled();
    expect(dl).not.toHaveBeenCalled();
  });

  it('Cadangkan mengunduh JSON berisi partai dengan nama berkas tanggal lokal', () => {
    saveGame(game('a1'));
    const root = show(replayList);
    const dl = vi.spyOn(download, 'downloadText').mockImplementation(() => undefined);
    button(root, 'Cadangkan').click();
    const [name, body, mime] = dl.mock.calls[0]!;
    expect(name).toMatch(/^chess-learn-cadangan-\d{4}-\d{2}-\d{2}\.json$/);
    expect(mime).toBe('application/json');
    expect(JSON.parse(body).games).toHaveLength(1);
  });

  it('Pulihkan dari berkas mengembalikan partai dan memberi tahu jumlahnya', async () => {
    saveGame(game('a1'));
    const root = show(replayList);
    let body = '';
    vi.spyOn(download, 'downloadText').mockImplementation((_n, t) => { body = t; });
    button(root, 'Cadangkan').click();
    localStorage.clear();
    root.querySelector('.item')?.remove();

    const alertSpy = spyDialog('alert').mockImplementation(() => undefined);
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([body], 'cadangan.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(alertSpy).toHaveBeenCalledWith('1 partai dipulihkan.'));
    expect(listGames()).toHaveLength(1);
    expect(root.querySelectorAll('.item')).toHaveLength(1);
  });

  it('berkas yang bukan cadangan ditolak tanpa mengubah data', async () => {
    const root = show(replayList);
    const alertSpy = spyDialog('alert').mockImplementation(() => undefined);
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [new File(['{"a":1}'], 'x.json')], configurable: true });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Bukan berkas cadangan Chess Learn.'));
    expect(listGames()).toHaveLength(0);
  });
});

describe('ekspor PGN dari replay', () => {
  it('Unduh PGN memakai nama berkas aman dan isi PGN partai', () => {
    saveGame(game('a1'));
    const root = show(() => replayScreen('a1'));
    const dl = vi.spyOn(download, 'downloadText').mockImplementation(() => undefined);
    button(root, 'Unduh PGN').click();
    const [name, body] = dl.mock.calls[0]!;
    expect(name).toBe('Ana_B-vs-Cici_D.pgn');
    expect(body).toBe('1. e4 e5 2. Nf3 Nc6');
  });

  it('Salin PGN menyalin teks dan menampilkan konfirmasi sementara', async () => {
    vi.useFakeTimers();
    saveGame(game('a1'));
    const root = show(() => replayScreen('a1'));
    const copy = vi.spyOn(download, 'copyText').mockResolvedValue(true);
    const btn = button(root, 'Salin PGN');
    btn.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(copy).toHaveBeenCalledWith('1. e4 e5 2. Nf3 Nc6');
    expect(btn.textContent).toContain('Tersalin');
    await vi.advanceTimersByTimeAsync(2000);
    expect(btn.textContent).toContain('Salin PGN');
    vi.useRealTimers();
  });

  it('Salin PGN yang ditolak browser menampilkan kegagalan', async () => {
    vi.useFakeTimers();
    saveGame(game('a1'));
    const root = show(() => replayScreen('a1'));
    vi.spyOn(download, 'copyText').mockResolvedValue(false);
    const btn = button(root, 'Salin PGN');
    btn.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(btn.textContent).toContain('Gagal');
    vi.useRealTimers();
  });
});

describe('utilitas unduh', () => {
  it('safeFilename mengganti karakter tak aman dan tidak pernah kosong', () => {
    expect(download.safeFilename('Ana B-vs-Cici/D')).toBe('Ana_B-vs-Cici_D');
    expect(download.safeFilename('///')).toBe('partai');
    expect(download.safeFilename('Renée ☃')).toMatch(/^Rene/);
    expect(download.safeFilename('../../etc/passwd')).not.toContain('/');
  });

  it('localDate memakai tanggal lokal, bukan UTC', () => {
    expect(download.localDate(new Date(2026, 10, 4, 0, 30))).toBe('2026-11-04');
    expect(download.localDate(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09');
  });
});
