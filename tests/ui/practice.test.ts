// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LESSONS } from '../../src/data/lessons';
import { lessonScreen } from '../../src/modes/lessons/lessons';
import { PracticeSession } from '../../src/modes/lessons/practice-core';
import { button, move, occupied, piecesOnBoard, show, sq, text } from './helpers';

const lesson = LESSONS.find((l) => l.id === 'scotch')!;
const open = () => {
  const root = show(() => lessonScreen('scotch'));
  const panel = root.querySelector('.practice') as HTMLElement;
  return { root, panel };
};
const practiceBoard = (panel: HTMLElement) => panel.querySelector('.board-wrap') as HTMLElement;

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => vi.useRealTimers());

describe('panel latihan opening', () => {
  it('hanya ada di pelajaran opening yang punya langkah', () => {
    expect(open().panel).not.toBeNull();
    expect(show(() => lessonScreen('garpu')).querySelector('.practice')).toBeNull();
    const dasar = LESSONS.find((l) => l.category === 'dasar')!;
    expect(show(() => lessonScreen(dasar.id)).querySelector('.practice')).toBeNull();
  });

  it('menu menawarkan dua sisi', () => {
    const { panel } = open();
    expect(button(panel, 'Putih')).toBeTruthy();
    expect(button(panel, 'Hitam')).toBeTruthy();
  });

  it('sebagai Putih: langkah teori diterima dan lawan membalas otomatis', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    const b = practiceBoard(panel);
    expect(piecesOnBoard(b)).toBe(32);
    move(b, 'e2', 'e4');
    expect(text(panel, '.demo-note')).toContain('e4');
    vi.advanceTimersByTime(600);
    expect(occupied(b, 'e5')).toBe(true);
    expect(text(panel, '.demo-counter')).toContain('Langkah 2 dari');
  });

  it('langkah saat lawan belum membalas diabaikan', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    const b = practiceBoard(panel);
    move(b, 'e2', 'e4');
    move(b, 'd2', 'd4');
    expect(occupied(b, 'd4')).toBe(false);
  });

  it('langkah legal non-teori dihitung salah dan posisi tidak berubah', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    const b = practiceBoard(panel);
    move(b, 'a2', 'a3');
    expect(text(panel, '.demo-note')).toContain('Bukan langkah teori');
    expect(occupied(b, 'a2')).toBe(true);
    expect(occupied(b, 'a3')).toBe(false);
    expect(text(panel, '.demo-counter')).toContain('1 kesalahan');
  });

  it('langkah ilegal tidak dihitung salah', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    move(practiceBoard(panel), 'e2', 'e5');
    expect(text(panel, '.demo-counter')).not.toContain('kesalahan');
  });

  it('petunjuk menyorot kotak asal langkah teori', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    button(panel, 'Petunjuk').click();
    expect(sq(practiceBoard(panel), 'e2').classList.contains('hint')).toBe(true);
  });

  it('sebagai Hitam: papan terbalik dan Putih jalan lebih dulu', () => {
    const { panel } = open();
    button(panel, 'Hitam').click();
    const b = practiceBoard(panel);
    expect(b.querySelector('.sq')!.getAttribute('data-sq')).toBe('h1');
    expect(occupied(b, 'e4')).toBe(false);
    vi.advanceTimersByTime(600);
    expect(occupied(b, 'e4')).toBe(true);
  });

  it('memainkan seluruh teori sampai selesai tanpa kesalahan', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    const b = practiceBoard(panel);
    const probe = new PracticeSession(lesson.demo!, 'w'); // penunjuk asal-tujuan tiap langkah
    let guard = 0;
    while (!probe.finished && guard++ < 100) {
      if (probe.opponentToMove) { probe.playOpponent(); vi.advanceTimersByTime(600); continue; }
      const e = probe.expected()!;
      probe.tryMove(e.from, e.to);
      move(b, e.from, e.to);
      vi.advanceTimersByTime(600);
    }
    expect(panel.textContent).toContain('Sempurna');
    expect(button(panel, 'Ulangi')).toBeTruthy();
    expect(panel.textContent).not.toContain('Petunjuk');
  });

  it('Ulangi mereset dan Ganti sisi kembali ke menu', () => {
    const { panel } = open();
    button(panel, 'Putih').click();
    move(practiceBoard(panel), 'a2', 'a3');
    button(panel, 'Ulangi').click();
    expect(text(panel, '.demo-counter')).toContain('Langkah 0');
    button(panel, 'Ganti sisi').click();
    expect(button(panel, 'Hitam')).toBeTruthy();
  });

  it('keluar dari pelajaran membatalkan balasan tertunda', () => {
    const { panel } = open();
    button(panel, 'Hitam').click();
    const b = practiceBoard(panel);
    show(() => lessonScreen('garpu')); // layar lama di-destroy
    vi.advanceTimersByTime(2000);
    expect(occupied(b, 'e4')).toBe(false);
  });
});
