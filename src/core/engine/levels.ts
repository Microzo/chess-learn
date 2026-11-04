import { tr } from '../i18n';

export interface BotLevel {
  id: number;
  name: string;
  /** perkiraan kekuatan, hanya sebagai gambaran */
  hint: string;
  skill: number;     // Stockfish "Skill Level" 0..20
  movetime: number;  // ms
}

/** Nama level memakai getter agar mengikuti bahasa yang sedang dipakai. */
const level = (id: number, en: string, idn: string, hint: string, skill: number, movetime: number): BotLevel => ({
  id, hint, skill, movetime,
  get name() { return tr(en, idn); },
});

export const BOT_LEVELS: BotLevel[] = [
  level(1, 'Beginner', 'Pemula', '~600', 0, 50),
  level(2, 'Casual', 'Santai', '~900', 3, 80),
  level(3, 'Club', 'Klub', '~1200', 6, 120),
  level(4, 'Intermediate', 'Menengah', '~1500', 9, 200),
  level(5, 'Advanced', 'Mahir', '~1800', 12, 300),
  level(6, 'Expert', 'Expert', '~2100', 15, 500),
  level(7, 'Master', 'Master', '~2500', 18, 800),
  level(8, 'Maximum', 'Maksimal', '2800+', 20, 1000),
];
