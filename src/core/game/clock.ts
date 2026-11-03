export type Side = 'w' | 'b';

export interface TimeControl {
  id: string;
  label: string;
  /** waktu awal tiap pemain (ms) */
  baseMs: number;
  /** tambahan waktu tiap selesai melangkah (ms) */
  incMs: number;
}

const min = 60_000;
export const TIME_CONTROLS: TimeControl[] = [
  { id: '1+0', label: '1 menit', baseMs: 1 * min, incMs: 0 },
  { id: '3+0', label: '3 menit', baseMs: 3 * min, incMs: 0 },
  { id: '3+2', label: '3 | 2', baseMs: 3 * min, incMs: 2000 },
  { id: '5+0', label: '5 menit', baseMs: 5 * min, incMs: 0 },
  { id: '10+0', label: '10 menit', baseMs: 10 * min, incMs: 0 },
  { id: '10+5', label: '10 | 5', baseMs: 10 * min, incMs: 5000 },
  { id: '15+10', label: '15 | 10', baseMs: 15 * min, incMs: 10_000 },
];

/**
 * Jam catur dua pemain. Waktu `now` selalu disuntikkan dari luar (ms) supaya mudah dites.
 * Jam Putih mulai berjalan setelah langkah pertama Putih, dan langkah pertama tidak menambah inkremen.
 */
export class ChessClock {
  private left: Record<Side, number>;
  private running: Side | null = null;
  private since = 0;

  constructor(readonly tc: TimeControl) {
    this.left = { w: tc.baseMs, b: tc.baseMs };
  }

  /** Sisa waktu (ms), tidak pernah negatif. */
  remaining(side: Side, now: number): number {
    const used = this.running === side ? now - this.since : 0;
    return Math.max(0, this.left[side] - used);
  }

  get active(): Side | null {
    return this.running;
  }

  /** `side` selesai melangkah: jam lawan mulai berjalan. */
  press(side: Side, now: number) {
    const other: Side = side === 'w' ? 'b' : 'w';
    if (this.running === side) {
      this.left[side] = Math.max(0, this.left[side] - (now - this.since)) + this.tc.incMs;
    } else if (this.running === other) {
      return; // bukan giliran `side`; abaikan
    }
    this.running = other;
    this.since = now;
  }

  /** Hentikan jam (partai selesai). */
  stop(now: number) {
    if (this.running) this.left[this.running] = this.remaining(this.running, now);
    this.running = null;
  }

  private paused: Side | null = null;

  /** Jeda sementara (mis. saat dialog konfirmasi terbuka). */
  pause(now: number) {
    if (!this.running) return;
    this.paused = this.running;
    this.left[this.running] = this.remaining(this.running, now);
    this.running = null;
  }

  /** Lanjutkan jam yang dijeda. */
  resume(now: number) {
    if (!this.paused) return;
    this.running = this.paused;
    this.paused = null;
    this.since = now;
  }

  /** Pihak yang waktunya habis, bila ada. */
  flagged(now: number): Side | null {
    if (this.running && this.remaining(this.running, now) <= 0) return this.running;
    return null;
  }
}

/** mm:ss, atau m:ss.d saat tersisa kurang dari 10 detik. */
export function formatClock(ms: number): string {
  if (ms < 10_000) {
    const t = Math.floor(ms / 100);
    return `0:${String(Math.floor(t / 10)).padStart(2, '0')}.${t % 10}`;
  }
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
