import { getSettings, updateSettings } from '../core/settings';

/** Efek suara sintetis (WebAudio) — tanpa file, jalan offline. */
export type Sfx = 'move' | 'capture' | 'check' | 'end';

let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  return getSettings().muted;
}
export function setMuted(m: boolean) {
  updateSettings({ muted: m });
}

function tone(c: AudioContext, t: number, freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(Math.max(vol, 0.0002), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function play(kind: Sfx) {
  const { muted, volume } = getSettings();
  if (muted || volume <= 0) return;
  // skala tiap nada dengan volume pengguna (nada dasar sudah ditala ke ~0.25)
  const v = (base: number) => base * volume * 1.4;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    switch (kind) {
      case 'move': tone(ctx, t, 220, 0.07, 'triangle', v(0.25), 120); break;
      case 'capture': tone(ctx, t, 300, 0.12, 'square', v(0.18), 90); tone(ctx, t, 140, 0.12, 'triangle', v(0.25), 70); break;
      case 'check': tone(ctx, t, 660, 0.09, 'sine', v(0.22)); tone(ctx, t + 0.1, 880, 0.14, 'sine', v(0.22)); break;
      case 'end': [523, 392, 330].forEach((f, i) => tone(ctx!, t + i * 0.14, f, 0.3, 'sine', v(0.22))); break;
    }
  } catch { /* audio tidak tersedia */ }
}
