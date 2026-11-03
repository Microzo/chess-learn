// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TIME_CONTROLS } from '../../src/core/game/clock';
import { listGames } from '../../src/core/storage/games';
import { pvpGame, pvpSetup } from '../../src/modes/pvp/pvp';
import { button, move, occupied, show, spyDialog, text } from './helpers';

const tc3 = TIME_CONTROLS.find((t) => t.id === '3+0')!;
const clocks = (root: HTMLElement) => [...root.querySelectorAll('.clock')].map((c) => c.textContent);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PvP tanpa jam', () => {
  it('dua pemain bergantian, batal langkah tersedia', () => {
    const root = show(() => pvpGame('A', 'B', false));
    expect(root.querySelectorAll('.clock')).toHaveLength(0);
    move(root, 'e2', 'e4');
    move(root, 'e7', 'e5');
    expect(occupied(root, 'e5')).toBe(true);
    button(root, 'Batal langkah').click();
    expect(occupied(root, 'e5')).toBe(false);
    expect(text(root, '.status')).toContain('B');
  });

  it('menyimpan partai ke penyimpanan setelah langkah pertama', () => {
    const root = show(() => pvpGame('A', 'B', false));
    expect(listGames()).toHaveLength(0);
    move(root, 'e2', 'e4');
    expect(listGames()).toHaveLength(1);
    expect(listGames()[0]!.pgn).toContain('e4');
  });

  it('skakmat mengakhiri partai dan menampilkan pemenang', () => {
    const root = show(() => pvpGame('A', 'B', false));
    for (const [f, t] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']] as const) move(root, f, t);
    expect(root.querySelector('.end')!.textContent).toContain('B menang');
    expect(listGames()[0]!.result).toBe('0-1');
  });

  it('menyerah memerlukan konfirmasi', () => {
    const root = show(() => pvpGame('A', 'B', false));
    move(root, 'e2', 'e4');
    const confirmSpy = spyDialog('confirm').mockReturnValue(false);
    button(root, 'Menyerah').click();
    expect(root.querySelector('.end')).toBeNull();
    confirmSpy.mockReturnValue(true);
    button(root, 'Menyerah').click();
    expect(root.querySelector('.end')!.textContent).toContain('A menang');
  });
});

describe('PvP dengan jam', () => {
  it('setup menawarkan semua kontrol waktu dan memilih satu', () => {
    const root = show(pvpSetup);
    const chips = [...root.querySelectorAll<HTMLElement>('.chip')];
    expect(chips).toHaveLength(TIME_CONTROLS.length + 1);
    chips[2]!.click();
    expect(root.querySelectorAll('.chip.on')).toHaveLength(1);
    expect(chips[2]!.classList.contains('on')).toBe(true);
  });

  it('jam mulai setelah langkah pertama dan berpindah tiap giliran', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    expect(clocks(root)).toEqual(['3:00', '3:00']);
    move(root, 'e2', 'e4');
    vi.advanceTimersByTime(5000);
    expect(root.querySelector('.clock.active')!.textContent).toBe('2:55');
    move(root, 'e7', 'e5');
    vi.advanceTimersByTime(2000);
    expect(root.querySelector('.clock.active')!.textContent).toBe('2:58');
  });

  it('batal langkah tidak tersedia saat memakai jam', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    expect([...root.querySelectorAll('button')].some((b) => b.textContent?.includes('Batal'))).toBe(false);
  });

  it('waktu habis mengakhiri partai untuk pihak yang benar', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    move(root, 'e2', 'e4');
    move(root, 'e7', 'e5');
    vi.advanceTimersByTime(181_000); // jam Putih habis
    expect(text(root, '.status')).toContain('Waktu A habis');
    expect(root.querySelector('.end')!.textContent).toContain('B menang');
    expect(root.querySelector('.clock.active')).toBeNull();
  });

  it('langkah setelah bendera jatuh ditolak walau interval belum berdetak', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    move(root, 'e2', 'e4');
    move(root, 'e7', 'e5');
    vi.setSystemTime(Date.now() + 200_000); // lompat waktu tanpa menjalankan timer
    move(root, 'g1', 'f3');
    expect(occupied(root, 'f3')).toBe(false);
    expect(root.querySelector('.end')!.textContent).toContain('B menang');
  });

  it('jam dijeda saat dialog menyerah terbuka', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    move(root, 'e2', 'e4');
    spyDialog('confirm').mockImplementation(() => {
      vi.setSystemTime(Date.now() + 20_000); // dialog terbuka 20 detik
      return false;
    });
    button(root, 'Menyerah').click();
    vi.advanceTimersByTime(100);
    expect(root.querySelector('.end')).toBeNull();
    expect(root.querySelector('.clock.active')!.textContent).toBe('3:00');
  });

  it('menyerah menghentikan jam', () => {
    const root = show(() => pvpGame('A', 'B', false, tc3));
    move(root, 'e2', 'e4');
    spyDialog('confirm').mockReturnValue(true);
    button(root, 'Menyerah').click();
    const before = clocks(root);
    vi.advanceTimersByTime(5000);
    expect(clocks(root)).toEqual(before);
  });

  it('meninggalkan layar menghentikan interval jam', () => {
    show(() => pvpGame('A', 'B', false, tc3));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    show(pvpSetup);
    expect(vi.getTimerCount()).toBe(0);
  });
});
