// @vitest-environment happy-dom
import { Chess } from 'chess.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { ENDGAMES } from '../src/data/endgames';
import { BOARD_QUESTIONS, MC_PER_EXAM, MC_QUESTIONS } from '../src/data/exam';
import { LESSONS } from '../src/data/lessons';
import { PUZZLES } from '../src/data/puzzles';
import { EXAM_LEVELS, bestFor, exportProgress, importProgress, loadProgress, markEndgameDone, passed, questionStats, reachedLevel, recordExam, resetProgress } from '../src/core/storage/progress';
import { buildExam, shuffle } from '../src/modes/exam/exam';
import { goalMet } from '../src/modes/endgames/endgames';

beforeEach(() => { localStorage.clear(); });

const attempt = (level: 'beginner' | 'intermediate' | 'advanced', score: number, ts = Date.now(), wrong: string[] = []) =>
  ({ ts, level, score, total: 10, wrong, asked: ['b-values', 'b-fork'] });

describe('bank soal', () => {
  it('tiap level punya cukup soal, 4 pilihan, jawaban valid, id unik, pelajaran ada', () => {
    const ids = MC_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of EXAM_LEVELS) expect(MC_QUESTIONS.filter((q) => q.level === l).length).toBeGreaterThanOrEqual(MC_PER_EXAM);
    for (const q of MC_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(LESSONS.some((x) => x.id === q.lesson), q.id).toBe(true);
      for (const p of [q.q, q.why, ...q.options]) expect(p[0] && p[1], q.id).toBeTruthy();
      // pilihan tidak boleh sama dalam satu soal
      expect(new Set(q.options.map((o) => o[0])).size, q.id).toBe(4);
    }
  });
  it('soal papan merujuk puzzle yang ada', () => {
    for (const l of EXAM_LEVELS) for (const id of BOARD_QUESTIONS[l]) expect(PUZZLES.some((p) => p.id === id), id).toBe(true);
  });
  it('ujian berisi soal teori + soal papan tanpa duplikat', () => {
    for (const l of EXAM_LEVELS) {
      const qs = buildExam(l);
      expect(qs).toHaveLength(MC_PER_EXAM + BOARD_QUESTIONS[l].length);
      const ids = qs.map((q) => (q.kind === 'mc' ? q.q.id : q.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('shuffle mempertahankan isi', () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('latihan endgame', () => {
  it('FEN valid, sisi yang jalan sesuai, bukan sudah berakhir, pelajaran ada', () => {
    const ids = ENDGAMES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of ENDGAMES) {
      const c = new Chess(d.fen);
      expect(c.isGameOver(), d.id).toBe(false);
      expect(LESSONS.some((x) => x.id === d.lesson), d.id).toBe(true);
      // sisi pemain adalah sisi yang bermain; sasaran bertahan hanya bila pemain Hitam di posisi lebih lemah
      if (d.player === 'b' || d.goal === 'draw') expect(d.goal === 'draw').toBe(d.player === 'b');
    }
  });
  it('sasaran menang vs remis', () => {
    expect(goalMet({ goal: 'win', player: 'w' }, '1-0')).toBe(true);
    expect(goalMet({ goal: 'win', player: 'w' }, '1/2-1/2')).toBe(false);
    expect(goalMet({ goal: 'draw', player: 'b' }, '1/2-1/2')).toBe(true);
    expect(goalMet({ goal: 'draw', player: 'b' }, '0-1')).toBe(true);
    expect(goalMet({ goal: 'draw', player: 'b' }, '1-0')).toBe(false);
  });
});

describe('penyimpanan progres', () => {
  it('kosong di awal, mencatat percobaan, dan menentukan level', () => {
    expect(loadProgress().exams).toEqual([]);
    expect(reachedLevel()).toBeNull();
    recordExam(attempt('beginner', 8));
    expect(bestFor('beginner')).toBe(80);
    expect(passed('beginner')).toBe(true);
    expect(reachedLevel()).toBe('beginner');
    recordExam(attempt('advanced', 10));
    expect(reachedLevel()).toBe('beginner'); // level menengah belum lulus
    recordExam(attempt('intermediate', 7));
    expect(reachedLevel()).toBe('advanced');
    recordExam(attempt('beginner', 6, Date.now() + 1));
    expect(bestFor('beginner')).toBe(80); // skor terbaik bertahan
  });
  it('statistik soal dan latihan endgame', () => {
    recordExam(attempt('beginner', 8, 1, ['b-fork']));
    recordExam(attempt('beginner', 9, 2, []));
    expect(questionStats()['b-fork']).toEqual({ asked: 2, wrong: 1 });
    markEndgameDone('lucena');
    expect(loadProgress().endgames['lucena']).toBeGreaterThan(0);
  });
  it('ekspor lalu impor menggabungkan tanpa menggandakan', () => {
    recordExam(attempt('beginner', 8, 1000));
    markEndgameDone('kq-k');
    const dump = exportProgress();
    resetProgress();
    expect(importProgress(dump)).toBe(1);
    expect(importProgress(dump)).toBe(0);
    expect(loadProgress().exams).toHaveLength(1);
    expect(loadProgress().endgames['kq-k']).toBeGreaterThan(0);
  });
  it('menolak berkas yang bukan progres dan menyaring data rusak', () => {
    expect(() => importProgress('bukan json')).toThrow();
    expect(() => importProgress('{"format":"lain"}')).toThrow();
    const bad = JSON.stringify({ format: 'chess-learn-progress', exams: [{ ts: 1, level: 'x', score: 1, total: 1 }, { ts: 2, level: 'beginner', score: 99, total: 10, wrong: [1, 'a'], asked: 'z' }], endgames: { a: 'x', b: 5 } });
    expect(importProgress(bad)).toBe(1);
    const p = loadProgress();
    expect(p.exams[0]).toMatchObject({ score: 10, total: 10, wrong: ['a'], asked: [] });
    expect(p.endgames).toEqual({ b: 5 });
  });
  it('data rusak di localStorage tidak membuat galat', () => {
    localStorage.setItem('chesslearn.progress.v1', '{rusak');
    expect(loadProgress().exams).toEqual([]);
  });
});
