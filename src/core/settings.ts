/** Pengaturan pengguna: disimpan di localStorage, divalidasi saat dibaca, diterapkan lewat atribut <html>. */
export const BOARD_THEMES = {
  hijau: { name: 'Hijau', light: '#ebecd0', dark: '#739552' },
  cokelat: { name: 'Cokelat', light: '#f0d9b5', dark: '#b58863' },
  biru: { name: 'Biru', light: '#dee3e6', dark: '#8ca2ad' },
  abu: { name: 'Abu-abu', light: '#e8e8e8', dark: '#9a9a9a' },
} as const;
export type BoardTheme = keyof typeof BOARD_THEMES;

export const THEMES = { gelap: 'Gelap', terang: 'Terang' } as const;
export type Theme = keyof typeof THEMES;

export interface Settings {
  theme: Theme;
  board: BoardTheme;
  coords: boolean;
  evalBar: boolean;
  muted: boolean;
  /** 0..1 */
  volume: number;
}

const KEY = 'chesslearn.settings';
const OLD_MUTED_KEY = 'chesslearn.muted'; // dipakai sebelum ada layar pengaturan

export const DEFAULTS: Settings = { theme: 'gelap', board: 'hijau', coords: true, evalBar: true, muted: false, volume: 0.7 };

let current: Settings | null = null;

function sanitize(raw: unknown, fallback: Settings): Settings {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const vol = typeof o['volume'] === 'number' && Number.isFinite(o['volume']) ? Math.min(1, Math.max(0, o['volume'])) : fallback.volume;
  return {
    theme: typeof o['theme'] === 'string' && Object.hasOwn(THEMES, o['theme']) ? (o['theme'] as Theme) : fallback.theme,
    board: typeof o['board'] === 'string' && Object.hasOwn(BOARD_THEMES, o['board']) ? (o['board'] as BoardTheme) : fallback.board,
    coords: typeof o['coords'] === 'boolean' ? o['coords'] : fallback.coords,
    evalBar: typeof o['evalBar'] === 'boolean' ? o['evalBar'] : fallback.evalBar,
    muted: typeof o['muted'] === 'boolean' ? o['muted'] : fallback.muted,
    volume: vol,
  };
}

function load(): Settings {
  const base: Settings = { ...DEFAULTS };
  try {
    const stored = localStorage.getItem(KEY);
    if (stored !== null) return sanitize(JSON.parse(stored), base);
    if (localStorage.getItem(OLD_MUTED_KEY) === '1') base.muted = true; // migrasi
  } catch { /* penyimpanan tidak tersedia atau JSON rusak: pakai bawaan */ }
  return base;
}

export function getSettings(): Settings {
  current ??= load();
  return { ...current };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  current = sanitize({ ...getSettings(), ...patch }, DEFAULTS);
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* abaikan */ }
  applySettings();
  return { ...current };
}

export function resetSettings(): Settings {
  return updateSettings({ ...DEFAULTS });
}

/** Terapkan ke dokumen: warna papan lewat variabel CSS, sisanya lewat atribut data-*. */
export function applySettings(s: Settings = getSettings()) {
  const root = document.documentElement;
  const b = BOARD_THEMES[s.board];
  root.style.setProperty('--light', b.light);
  root.style.setProperty('--dark', b.dark);
  root.dataset['theme'] = s.theme;
  root.dataset['coords'] = s.coords ? 'on' : 'off';
  root.dataset['evalbar'] = s.evalBar ? 'on' : 'off';
}

/** Hanya untuk tes: lupakan cache agar bacaan berikutnya mengambil dari localStorage. */
export function _resetCacheForTests() {
  current = null;
}
