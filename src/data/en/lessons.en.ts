import { GLOSSARY_DEFS } from './glossary.en';
import { LESSONS_A } from './lessons-a.en';
import { LESSONS_B } from './lessons-b.en';
import { LESSONS_C } from './lessons-c.en';
import { LESSONS_D } from './lessons-d.en';
import { LESSONS_E } from './lessons-e.en';

export interface LessonText {
  title: string;
  summary: string;
  body: string[];
  points: string[];
  demo?: { intro: string; notes: string[] };
}

export const LESSONS_EN: Record<string, LessonText> = {
  ...LESSONS_A, ...LESSONS_B, ...LESSONS_C, ...LESSONS_D, ...LESSONS_E,
};

export const CATEGORY_EN: Record<string, { title: string; sub: string }> = {
  dasar: { title: 'Basics', sub: 'Principles, piece values, castling, how games are won and drawn' },
  opening: { title: 'Openings', sub: 'Openings tested over decades' },
  taktik: { title: 'Tactics', sub: 'Patterns that win material' },
  strategi: { title: 'Middlegame strategy', sub: 'Pawn structure, piece placement, plans' },
  endgame: { title: 'Endgames', sub: 'Turning an advantage into a win' },
  mat: { title: 'Checkmate patterns', sub: 'How the enemy king gets trapped' },
};

export const GLOSSARY_EN: Record<string, string> = GLOSSARY_DEFS;
