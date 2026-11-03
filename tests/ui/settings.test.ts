// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { _resetCacheForTests, applySettings, BOARD_THEMES, DEFAULTS, getSettings, updateSettings } from '../../src/core/settings';
import { EvalBar } from '../../src/ui/panels/panels';
import { settingsScreen } from '../../src/ui/screens/settings';
import { isMuted, setMuted } from '../../src/ui/sound';
import { show } from './helpers';

const KEY = 'chesslearn.settings';
const fresh = () => { localStorage.clear(); _resetCacheForTests(); document.documentElement.removeAttribute('data-theme'); };
beforeEach(fresh);

describe('penyimpanan pengaturan', () => {
  it('memakai nilai bawaan bila belum ada', () => {
    expect(getSettings()).toEqual(DEFAULTS);
  });

  it('perubahan tersimpan dan terbaca setelah muat ulang', () => {
    updateSettings({ theme: 'terang', board: 'cokelat', coords: false, volume: 0.3 });
    _resetCacheForTests();
    expect(getSettings()).toMatchObject({ theme: 'terang', board: 'cokelat', coords: false, volume: 0.3 });
  });

  it('data rusak atau berbahaya diabaikan field demi field', () => {
    localStorage.setItem(KEY, JSON.stringify({ theme: '__proto__', board: 'ungu', coords: 'ya', volume: 9, evalBar: false, muted: 1 }));
    expect(getSettings()).toEqual({ ...DEFAULTS, volume: 1, evalBar: false });
    _resetCacheForTests();
    localStorage.setItem(KEY, '{bukan json');
    expect(getSettings()).toEqual(DEFAULTS);
    _resetCacheForTests();
    localStorage.setItem(KEY, 'null');
    expect(getSettings()).toEqual(DEFAULTS);
    _resetCacheForTests();
    localStorage.setItem(KEY, JSON.stringify({ volume: -4 }));
    expect(getSettings().volume).toBe(0);
  });

  it('memigrasi pilihan bisu dari versi lama', () => {
    localStorage.setItem('chesslearn.muted', '1');
    expect(getSettings().muted).toBe(true);
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
  });
});

describe('penerapan ke tampilan', () => {
  it('warna papan, tema, koordinat, dan bar dominasi masuk ke <html>', () => {
    updateSettings({ theme: 'terang', board: 'biru', coords: false, evalBar: false });
    const root = document.documentElement;
    expect(root.dataset['theme']).toBe('terang');
    expect(root.style.getPropertyValue('--light')).toBe(BOARD_THEMES.biru.light);
    expect(root.style.getPropertyValue('--dark')).toBe(BOARD_THEMES.biru.dark);
    expect(root.dataset['coords']).toBe('off');
    expect(root.dataset['evalbar']).toBe('off');
    updateSettings({ coords: true, evalBar: true });
    expect(root.dataset['coords']).toBe('on');
    expect(root.dataset['evalbar']).toBe('on');
    applySettings();
  });
});

describe('layar pengaturan', () => {
  it('memilih tema terang dan warna papan menyimpan dan menandai pilihan', () => {
    const root = show(settingsScreen);
    (root.querySelector('.chip[data-v="terang"]') as HTMLElement).click();
    expect(getSettings().theme).toBe('terang');
    expect(root.querySelector('.chip[data-v="terang"]')!.getAttribute('aria-pressed')).toBe('true');
    (root.querySelector('.chip[data-v="cokelat"]') as HTMLElement).click();
    expect(getSettings().board).toBe('cokelat');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toMatchObject({ theme: 'terang', board: 'cokelat' });
  });

  it('sakelar koordinat, bar dominasi, dan suara bekerja', () => {
    const root = show(settingsScreen);
    const box = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)!;
    expect(box('set-coords').checked).toBe(true);
    box('set-coords').click();
    expect(getSettings().coords).toBe(false);
    box('set-eval').click();
    expect(getSettings().evalBar).toBe(false);
    expect(box('set-sound').checked).toBe(true);
    box('set-sound').click();
    expect(getSettings().muted).toBe(true);
  });

  it('volume digeser disimpan dan "Kembalikan ke bawaan" memulihkan semuanya', () => {
    const root = show(settingsScreen);
    const vol = root.querySelector<HTMLInputElement>('.vol')!;
    vol.value = '25';
    vol.dispatchEvent(new Event('input'));
    expect(getSettings().volume).toBe(0.25);
    (root.querySelector('.chip[data-v="abu"]') as HTMLElement).click();
    [...root.querySelectorAll('button')].find((b) => b.textContent === 'Kembalikan ke bawaan')!.click();
    expect(getSettings()).toEqual(DEFAULTS);
    expect(root.querySelector<HTMLInputElement>('.vol')!.value).toBe('70');
  });
});

describe('bar dominasi', () => {
  it('menandai pemain yang unggul dan memberi label yang bisa dibaca pembaca layar', () => {
    const bar = new EvalBar();
    bar.set({ cp: 300, mate: null });
    expect(bar.el.dataset['lead']).toBe('w');
    expect(bar.el.getAttribute('aria-label')).toContain('Putih unggul');
    bar.set({ cp: -300, mate: null });
    expect(bar.el.dataset['lead']).toBe('b');
    expect(bar.el.title).toContain('Hitam unggul');
    bar.set({ cp: 10, mate: null });
    expect(bar.el.dataset['lead']).toBe('even');
    expect(bar.el.title).toContain('Seimbang');
    bar.set({ cp: null, mate: -2 });
    expect(bar.el.dataset['lead']).toBe('b');
    expect(bar.el.textContent).toBe('-M2');
  });
});
