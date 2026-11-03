/** Efek suara sintetis (WebAudio) — tanpa file, jalan offline. */
export type Sfx = 'move' | 'capture' | 'check' | 'end';

const KEY = 'chesslearn.muted';
let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function setMuted(m: boolean) {
  try { localStorage.setItem(KEY, m ? '1' : '0'); } catch { /* abaikan */ }
}

function tone(c: AudioContext, t: number, freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function play(kind: Sfx) {
  if (isMuted()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    switch (kind) {
      case 'move': tone(ctx, t, 220, 0.07, 'triangle', 0.25, 120); break;
      case 'capture': tone(ctx, t, 300, 0.12, 'square', 0.18, 90); tone(ctx, t, 140, 0.12, 'triangle', 0.25, 70); break;
      case 'check': tone(ctx, t, 660, 0.09, 'sine', 0.22); tone(ctx, t + 0.1, 880, 0.14, 'sine', 0.22); break;
      case 'end': [523, 392, 330].forEach((f, i) => tone(ctx!, t + i * 0.14, f, 0.3, 'sine', 0.22)); break;
    }
  } catch { /* audio tidak tersedia */ }
}
