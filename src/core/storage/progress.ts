import { tr } from '../i18n';

/**
 * Progres belajar: riwayat ujian dan latihan endgame yang selesai. Disimpan di perangkat (localStorage)
 * karena aplikasi tidak punya akun; pindah perangkat lewat ekspor/impor berkas JSON.
 */
export type ExamLevel = 'beginner' | 'intermediate' | 'advanced';
export const EXAM_LEVELS: ExamLevel[] = ['beginner', 'intermediate', 'advanced'];

export interface ExamAttempt {
  ts: number;
  level: ExamLevel;
  score: number;
  total: number;
  /** id pertanyaan yang salah (untuk topik lemah) */
  wrong: string[];
  /** id semua pertanyaan yang muncul */
  asked: string[];
}

export interface Progress {
  exams: ExamAttempt[];
  /** id latihan endgame -> waktu selesai (ms) */
  endgames: Record<string, number>;
}

const KEY = 'chesslearn.progress.v1';
const FORMAT = 'chess-learn-progress';
const MAX_ATTEMPTS = 200;
const MAX_FILE = 2_000_000;

const empty = (): Progress => ({ exams: [], endgames: {} });

const isLevel = (x: unknown): x is ExamLevel => typeof x === 'string' && (EXAM_LEVELS as string[]).includes(x);
const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const strs = (x: unknown): string[] => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string' && s.length <= 64).slice(0, 100) : []);

function cleanAttempt(x: unknown): ExamAttempt | null {
  const a = x as Record<string, unknown> | null;
  if (!a || typeof a !== 'object') return null;
  if (!num(a.ts) || !isLevel(a.level) || !num(a.score) || !num(a.total)) return null;
  const total = Math.max(1, Math.min(100, Math.floor(a.total)));
  const score = Math.max(0, Math.min(total, Math.floor(a.score)));
  return { ts: a.ts, level: a.level, score, total, wrong: strs(a.wrong), asked: strs(a.asked) };
}

function clean(raw: unknown): Progress {
  const r = raw as Record<string, unknown> | null;
  const out = empty();
  if (!r || typeof r !== 'object') return out;
  if (Array.isArray(r.exams)) {
    out.exams = r.exams.slice(-MAX_ATTEMPTS).map(cleanAttempt).filter((a): a is ExamAttempt => a !== null);
  }
  const eg = r.endgames as Record<string, unknown> | null;
  if (eg && typeof eg === 'object') {
    for (const [k, v] of Object.entries(eg).slice(0, 200)) {
      if (k.length <= 64 && num(v)) out.endgames[k] = v;
    }
  }
  return out;
}

export function loadProgress(): Progress {
  try { return clean(JSON.parse(localStorage.getItem(KEY) ?? 'null')); } catch { return empty(); }
}

function save(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* penyimpanan penuh atau diblokir */ }
}

export function recordExam(a: ExamAttempt) {
  const p = loadProgress();
  p.exams.push(a);
  p.exams = p.exams.slice(-MAX_ATTEMPTS);
  save(p);
}

export function markEndgameDone(id: string) {
  const p = loadProgress();
  p.endgames[id] = Date.now();
  save(p);
}

export const PASS_PERCENT = 70;
export const percent = (a: Pick<ExamAttempt, 'score' | 'total'>) => Math.round((a.score / a.total) * 100);

export function bestFor(level: ExamLevel, p = loadProgress()): number | null {
  const xs = p.exams.filter((a) => a.level === level).map(percent);
  return xs.length ? Math.max(...xs) : null;
}

export function passed(level: ExamLevel, p = loadProgress()): boolean {
  const b = bestFor(level, p);
  return b !== null && b >= PASS_PERCENT;
}

/** Level tertinggi yang sudah lulus berurutan (beginner dulu), atau null. */
export function reachedLevel(p = loadProgress()): ExamLevel | null {
  let reached: ExamLevel | null = null;
  for (const l of EXAM_LEVELS) {
    if (passed(l, p)) reached = l; else break;
  }
  return reached;
}

/** Akurasi per id pertanyaan dari seluruh riwayat: { asked, wrong }. */
export function questionStats(p = loadProgress()): Record<string, { asked: number; wrong: number }> {
  const out: Record<string, { asked: number; wrong: number }> = {};
  for (const a of p.exams) {
    for (const id of a.asked) (out[id] ??= { asked: 0, wrong: 0 }).asked++;
    for (const id of a.wrong) (out[id] ??= { asked: 0, wrong: 0 }).wrong++;
  }
  return out;
}

export function exportProgress(): string {
  return JSON.stringify({ format: FORMAT, version: 1, exportedAt: Date.now(), ...loadProgress() });
}

/** Gabungkan berkas progres ke penyimpanan. Mengembalikan jumlah ujian baru yang ditambahkan. */
export function importProgress(text: string): number {
  if (text.length > MAX_FILE) throw new Error(tr('File is too large.', 'Berkas terlalu besar.'));
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new Error(tr('The file is not valid JSON.', 'Berkas bukan JSON yang valid.')); }
  if (!data || data.format !== FORMAT) throw new Error(tr('Not a Chess Learn progress file.', 'Bukan berkas progres Chess Learn.'));
  const incoming = clean(data);
  const cur = loadProgress();
  const seen = new Set(cur.exams.map((a) => `${a.ts}:${a.level}`));
  let added = 0;
  for (const a of incoming.exams) {
    if (seen.has(`${a.ts}:${a.level}`)) continue;
    cur.exams.push(a);
    added++;
  }
  cur.exams.sort((a, b) => a.ts - b.ts);
  cur.exams = cur.exams.slice(-MAX_ATTEMPTS);
  for (const [k, v] of Object.entries(incoming.endgames)) cur.endgames[k] = Math.max(cur.endgames[k] ?? 0, v);
  save(cur);
  return added;
}

export function resetProgress() {
  try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
}
