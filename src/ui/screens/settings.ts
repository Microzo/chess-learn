import { go, type Screen } from '../../app/router';
import { checkForUpdate } from '../../app/update';
import { tr } from '../../core/i18n';
import { versionLabel } from '../../core/version';
import { BOARD_THEMES, LANGS, getSettings, resetSettings, updateSettings, type BoardTheme, type Lang, type Theme } from '../../core/settings';
import { h } from '../dom';
import { play } from '../sound';
import { homeScreen } from './home';

const themeName = (t: Theme) => (t === 'gelap' ? tr('Dark', 'Gelap') : tr('Light', 'Terang'));
const boardName = (b: BoardTheme) => ({
  hijau: tr('Green', 'Hijau'),
  cokelat: tr('Brown', 'Cokelat'),
  biru: tr('Blue', 'Biru'),
  abu: tr('Grey', 'Abu-abu'),
})[b];

export function settingsScreen(): Screen {
  const box = h('div', { class: 'settings' });

  const chips = <T extends string>(items: [T, string][], active: T, pick: (v: T) => void, extra?: (v: T) => Node) =>
    h('div', { class: 'chips' },
      ...items.map(([v, label]) =>
        h('button', { class: `chip${v === active ? ' on' : ''}`, 'data-v': v, 'aria-pressed': String(v === active), onclick: () => pick(v) },
          extra?.(v), label)));

  const toggle = (id: string, label: string, hint: string, on: boolean, set: (v: boolean) => void) => {
    const input = h('input', { type: 'checkbox', id, checked: on }) as HTMLInputElement;
    input.checked = on;
    input.onchange = () => set(input.checked);
    return h('label', { class: 'setting-row check', for: id }, input, h('span', {}, h('strong', {}, label), h('small', {}, hint)));
  };

  const swatch = (b: BoardTheme) => {
    const t = BOARD_THEMES[b];
    const s = h('span', { class: 'swatch' });
    // lewat CSSOM, bukan atribut style: CSP (style-src 'self') memblokir atribut inline
    s.style.background = `linear-gradient(90deg, ${t.light} 50%, ${t.dark} 50%)`;
    return s;
  };

  const render = () => {
    const s = getSettings();
    const vol = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(s.volume * 100)), 'aria-label': tr('Sound volume', 'Volume suara'), class: 'vol' }) as HTMLInputElement;
    vol.value = String(Math.round(s.volume * 100));
    vol.oninput = () => { updateSettings({ volume: Number(vol.value) / 100 }); volLabel.textContent = `${vol.value}%`; };
    vol.onchange = () => play('move'); // contoh suara setelah geser selesai
    const volLabel = h('small', {}, `${vol.value}%`);
    const updateMsg = h('small', { role: 'status' });
    const updateBtn = h('button', { class: 'btn', onclick: () => {
      updateMsg.textContent = tr('Checking…', 'Memeriksa…');
      void checkForUpdate().then((r) => {
        updateMsg.textContent = r === 'updated' ? tr('New version found. Use the Reload button at the bottom.', 'Versi baru ditemukan. Pakai tombol Muat ulang di bawah.')
          : r === 'current' ? tr('You are on the latest version.', 'Kamu sudah di versi terbaru.')
          : tr('Updates are checked only in the installed web app.', 'Pembaruan hanya dicek di aplikasi web yang terpasang.');
      });
    } }, tr('Check for updates', 'Cek pembaruan'));

    box.replaceChildren(
      h('section', { class: 'card' },
        h('h3', {}, 'Language / Bahasa'),
        chips(Object.entries(LANGS) as [Lang, string][], s.lang, (v) => {
          updateSettings({ lang: v });
          go(settingsScreen); // bangun ulang layar ini dalam bahasa baru
        })),
      h('section', { class: 'card' },
        h('h3', {}, tr('Appearance', 'Tampilan')),
        h('div', { class: 'field' }, h('small', {}, tr('Theme', 'Tema')),
          chips((['gelap', 'terang'] as Theme[]).map((t) => [t, themeName(t)] as [Theme, string]), s.theme, (v) => { updateSettings({ theme: v }); render(); })),
        h('div', { class: 'field' }, h('small', {}, tr('Board colours', 'Warna papan')),
          chips(Object.keys(BOARD_THEMES).map((k) => [k, boardName(k as BoardTheme)] as [BoardTheme, string]), s.board,
            (v) => { updateSettings({ board: v }); render(); }, (v) => swatch(v))),
        toggle('set-coords', tr('Board coordinates', 'Koordinat papan'), tr('Letters a–h and numbers 1–8 around the board', 'Huruf a–h dan angka 1–8 di tepi papan'), s.coords, (v) => updateSettings({ coords: v })),
        toggle('set-eval', tr('Advantage bar', 'Bar dominasi'), tr('Shows who is ahead in Learn vs Bot and Replay', 'Menunjukkan siapa yang unggul saat Belajar vs Bot dan Replay'), s.evalBar, (v) => updateSettings({ evalBar: v }))),
      h('section', { class: 'card' },
        h('h3', {}, tr('Sound', 'Suara')),
        toggle('set-sound', tr('Sound effects', 'Efek suara'), tr('Plays when pieces move or capture, on check, and when the game ends', 'Bunyi saat bidak bergerak, memakan, skak, dan partai berakhir'), !s.muted, (v) => { updateSettings({ muted: !v }); if (v) play('move'); }),
        h('div', { class: 'field' }, h('small', {}, tr('Volume', 'Volume')), h('div', { class: 'row vol-row' }, vol, volLabel))),
      h('section', { class: 'card' },
        h('h3', {}, tr('About', 'Tentang')),
        h('div', { class: 'field' }, h('small', {}, tr('Version', 'Versi')), h('strong', { 'data-testid': 'version' }, versionLabel())),
        h('div', { class: 'row' }, updateBtn, updateMsg)),
      h('button', { class: 'btn danger', onclick: () => { resetSettings(); go(settingsScreen); } }, tr('Reset to defaults', 'Kembalikan ke bawaan')),
    );
  };
  render();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(homeScreen) }, '←'), h('h2', {}, tr('Settings', 'Pengaturan'))),
    box,
  );
  return { el };
}
