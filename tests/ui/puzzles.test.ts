// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PUZZLES } from '../../src/data/puzzles';
import { puzzleList, puzzleScreen } from '../../src/modes/lessons/puzzles';
import { button, move, occupied, show, sq, text } from './helpers';

const SOLVED = 'chess-learn:puzzles-solved';
const solved = () => JSON.parse(localStorage.getItem(SOLVED) ?? '[]') as string[];

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => vi.useRealTimers());

describe('daftar puzzle', () => {
  it('menampilkan semua puzzle dan jumlah terpecahkan', () => {
    const root = show(puzzleList);
    expect(root.querySelectorAll('.item')).toHaveLength(PUZZLES.length);
    expect(root.textContent).toContain(`0 dari ${PUZZLES.length}`);
  });

  it('menandai puzzle yang sudah selesai', () => {
    localStorage.setItem(SOLVED, JSON.stringify(['skakmat-1-ratu']));
    const root = show(puzzleList);
    expect(root.querySelector('.item strong')!.textContent).toContain('✔');
    expect(root.textContent).toContain(`1 dari ${PUZZLES.length}`);
  });
});

describe('layar puzzle', () => {
  it('langkah benar menyelesaikan dan menyimpan progres', () => {
    const root = show(() => puzzleScreen('skakmat-1-ratu'));
    move(root, 'g1', 'g7');
    expect(text(root, '.demo-note')).toContain('Benar');
    expect(solved()).toEqual(['skakmat-1-ratu']);
    expect(button(root, 'Ulangi')).toBeTruthy();
  });

  it('langkah salah dikembalikan dan tidak menyelesaikan', () => {
    const root = show(() => puzzleScreen('skakmat-1-ratu'));
    move(root, 'g1', 'a1');
    expect(text(root, '.demo-note')).toContain('Belum tepat');
    expect(occupied(root, 'g1')).toBe(true);
    expect(occupied(root, 'a1')).toBe(false);
    expect(solved()).toEqual([]);
  });

  it('petunjuk menyorot buah dan membuat puzzle tidak dihitung', () => {
    const root = show(() => puzzleScreen('skakmat-1-ratu'));
    button(root, 'Petunjuk').click();
    expect(sq(root, 'g1').classList.contains('hint')).toBe(true);
    move(root, 'g1', 'g7');
    expect(text(root, '.demo-note')).toContain('dengan bantuan');
    expect(solved()).toEqual([]);
  });

  it('bantuan tetap tercatat setelah Ulangi', () => {
    const root = show(() => puzzleScreen('skakmat-1-ratu'));
    button(root, 'Lihat jawaban').click();
    button(root, 'Ulangi').click();
    move(root, 'g1', 'g7');
    expect(solved()).toEqual([]);
  });

  it('puzzle bertahap: lawan membalas otomatis, langkah saat menunggu diabaikan', () => {
    const root = show(() => puzzleScreen('mat-tangga-2'));
    move(root, 'a2', 'a7'); // Ra7
    expect(text(root, '.demo-note')).toContain('Lawan membalas');
    move(root, 'b1', 'b8'); // diabaikan: lawan belum membalas
    expect(occupied(root, 'b8')).toBe(false);
    vi.advanceTimersByTime(500);
    expect(occupied(root, 'h8')).toBe(true); // Kh8
    move(root, 'b1', 'b8'); // Rb8#
    expect(text(root, '.demo-note')).toContain('Benar');
    expect(solved()).toEqual(['mat-tangga-2']);
  });

  it('langkah alternatif juga diterima', () => {
    const root = show(() => puzzleScreen('pin-kuda'));
    move(root, 'b4', 'e7'); // Bxe7
    expect(text(root, '.demo-note')).toContain('alternatif');
    expect(solved()).toEqual(['pin-kuda']);
  });

  it('keluar saat balasan tertunda: balasan tidak lagi dimainkan di papan lama', () => {
    const root = show(() => puzzleScreen('mat-tangga-2'));
    const oldBoard = root.querySelector('.board')!;
    move(root, 'a2', 'a7');
    show(puzzleList); // layar lama di-destroy, timer dibatalkan
    vi.advanceTimersByTime(1000);
    expect(oldBoard.querySelector('[data-sq="h8"] .piece')).toBeNull(); // Kh8 tidak dimainkan
    expect(oldBoard.querySelector('[data-sq="g8"] .piece')).not.toBeNull();
  });

  it('id tidak dikenal kembali ke daftar', () => {
    const root = show(() => puzzleScreen('tidak-ada'));
    expect(root.querySelectorAll('.item')).toHaveLength(PUZZLES.length);
  });

  it('puzzle yang dimainkan Hitam memutar papan', () => {
    const root = show(() => puzzleScreen('fools-mate'));
    expect(root.querySelector('.board .sq')!.getAttribute('data-sq')).toBe('h1');
  });
});
