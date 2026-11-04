import { afterEach, describe, expect, it } from 'vitest';
import { _forceLang } from '../src/core/i18n';
import { CLASSICS } from '../src/data/classics';
import { CLASSICS_EN } from '../src/data/en/classics.en';
import { LESSONS_EN } from '../src/data/en/lessons.en';
import { PUZZLES_EN } from '../src/data/en/puzzles.en';
import { GLOSSARY, LESSONS } from '../src/data/lessons';
import { GLOSSARY_EN, CATEGORY_EN } from '../src/data/en/lessons.en';
import { PUZZLES } from '../src/data/puzzles';
import { classicView, glossaryView, lessonView, puzzleView } from '../src/data/localize';

afterEach(() => _forceLang('id'));

describe('cakupan terjemahan Inggris', () => {
  it('setiap pelajaran punya teks Inggris dengan jumlah yang sama', () => {
    for (const l of LESSONS) {
      const e = LESSONS_EN[l.id];
      expect(e, l.id).toBeTruthy();
      expect(e!.body.length, `${l.id} body`).toBe(l.body.length);
      expect(e!.points.length, `${l.id} points`).toBe(l.points.length);
      if (l.demo) expect(e!.demo?.notes.length, `${l.id} demo`).toBe(l.demo.steps.length);
    }
  });
  it('kategori, glosarium, puzzle, dan partai klasik tercakup', () => {
    for (const k of ['dasar', 'opening', 'taktik', 'strategi', 'endgame', 'mat']) expect(CATEGORY_EN[k]).toBeTruthy();
    for (const g of GLOSSARY) expect(GLOSSARY_EN[g.term], g.term).toBeTruthy();
    for (const p of PUZZLES) expect(PUZZLES_EN[p.id], p.id).toBeTruthy();
    for (const c of CLASSICS) {
      expect(CLASSICS_EN[c.id], c.id).toBeTruthy();
      expect(CLASSICS_EN[c.id]!.notes.length, `${c.id} notes`).toBe(c.notes.length);
    }
  });
});

describe('tampilan mengikuti bahasa', () => {
  it('Inggris memakai teks Inggris, Indonesia teks asli', () => {
    _forceLang('en');
    expect(lessonView(LESSONS[0]!).title).toBe(LESSONS_EN[LESSONS[0]!.id]!.title);
    expect(puzzleView(PUZZLES[0]!).title).toBe(PUZZLES_EN[PUZZLES[0]!.id]!.title);
    expect(classicView(CLASSICS[0]!).title).toBe(CLASSICS_EN[CLASSICS[0]!.id]!.title);
    expect(glossaryView(GLOSSARY[0]!).def).toBe(GLOSSARY_EN[GLOSSARY[0]!.term]);
    _forceLang('id');
    expect(lessonView(LESSONS[0]!).title).toBe(LESSONS[0]!.title);
    expect(puzzleView(PUZZLES[0]!).title).toBe(PUZZLES[0]!.title);
  });
});
