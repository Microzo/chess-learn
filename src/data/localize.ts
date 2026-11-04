/**
 * Lapisan bahasa untuk data materi. Data dasar (lessons.ts, puzzles.ts, classics.ts) berbahasa Indonesia;
 * terjemahan Inggris ada di src/data/en/* dan dipasang saat tampil. Bila terjemahan belum ada, data asli dipakai.
 */
import { currentLang } from '../core/i18n';
import type { Classic } from './classics';
import { CLASSICS_EN } from './en/classics.en';
import { CATEGORY_EN, GLOSSARY_EN, LESSONS_EN } from './en/lessons.en';
import { PUZZLES_EN } from './en/puzzles.en';
import { CATEGORY_LABEL, type Category, type GlossaryEntry, type Lesson } from './lessons';
import type { Puzzle } from './puzzles';

const english = () => currentLang() === 'en';

export function lessonView(l: Lesson): Lesson {
  const e = english() ? LESSONS_EN[l.id] : undefined;
  if (!e) return l;
  return {
    ...l,
    title: e.title,
    summary: e.summary,
    body: e.body,
    points: e.points,
    ...(l.demo
      ? {
          demo: {
            ...l.demo,
            intro: e.demo?.intro ?? l.demo.intro,
            steps: l.demo.steps.map((s, i) => ({ ...s, note: e.demo?.notes[i] ?? s.note })),
          },
        }
      : {}),
  };
}

export function categoryView(cat: Category): { icon: string; title: string; sub: string } {
  const base = CATEGORY_LABEL[cat];
  const e = english() ? CATEGORY_EN[cat] : undefined;
  return e ? { icon: base.icon, ...e } : base;
}

export interface GlossaryView {
  /** istilah yang ditampilkan di judul */
  term: string;
  /** istilah dalam bahasa lain, ditampilkan kecil di sebelahnya */
  alt?: string;
  def: string;
  /** teks yang bisa dicari (kedua bahasa) */
  search: string;
}

export function glossaryView(g: GlossaryEntry): GlossaryView {
  const en = g.en ?? g.term;
  const enDef = GLOSSARY_EN[g.term];
  if (english() && enDef) {
    return {
      term: en,
      ...(g.term.toLowerCase() !== en.toLowerCase() ? { alt: g.term } : {}),
      def: enDef,
      search: `${en} ${g.term} ${enDef}`.toLowerCase(),
    };
  }
  return {
    term: g.term,
    ...(g.en && g.en.toLowerCase() !== g.term.toLowerCase() ? { alt: g.en } : {}),
    def: g.def,
    search: `${g.term} ${g.en ?? ''} ${g.def}`.toLowerCase(),
  };
}

export function puzzleView(p: Puzzle): Puzzle {
  const e = english() ? PUZZLES_EN[p.id] : undefined;
  return e ? { ...p, theme: e.theme, title: e.title, hint: e.hint, explanation: e.explanation } : p;
}

export function classicView(c: Classic): Classic {
  const e = english() ? CLASSICS_EN[c.id] : undefined;
  if (!e) return c;
  return {
    ...c,
    title: e.title,
    white: e.white,
    black: e.black,
    event: e.event,
    opening: e.opening,
    summary: e.summary,
    learn: e.learn,
    notes: c.notes.map(([key], i) => [key, e.notes[i] ?? c.notes[i]![1]] as [string, string]),
  };
}

/** Teks tingkat kesulitan partai legendaris. */
export function levelLabel(level: Classic['level']): string {
  if (!english()) return level;
  return { Pemula: 'Beginner', Menengah: 'Intermediate', Lanjut: 'Advanced' }[level];
}
