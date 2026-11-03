export interface BotLevel {
  id: number;
  name: string;
  /** perkiraan kekuatan, hanya sebagai gambaran */
  hint: string;
  skill: number;     // Stockfish "Skill Level" 0..20
  movetime: number;  // ms
}

export const BOT_LEVELS: BotLevel[] = [
  { id: 1, name: 'Pemula', hint: '~600', skill: 0, movetime: 50 },
  { id: 2, name: 'Santai', hint: '~900', skill: 3, movetime: 80 },
  { id: 3, name: 'Klub', hint: '~1200', skill: 6, movetime: 120 },
  { id: 4, name: 'Menengah', hint: '~1500', skill: 9, movetime: 200 },
  { id: 5, name: 'Mahir', hint: '~1800', skill: 12, movetime: 300 },
  { id: 6, name: 'Expert', hint: '~2100', skill: 15, movetime: 500 },
  { id: 7, name: 'Master', hint: '~2500', skill: 18, movetime: 800 },
  { id: 8, name: 'Maksimal', hint: '2800+', skill: 20, movetime: 1000 },
];
