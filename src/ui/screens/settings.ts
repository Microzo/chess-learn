import { go, type Screen } from '../../app/router';
import { BOARD_THEMES, THEMES, getSettings, resetSettings, updateSettings, type BoardTheme, type Theme } from '../../core/settings';
import { h } from '../dom';
import { play } from '../sound';
import { homeScreen } from './home';

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
    const vol = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(s.volume * 100)), 'aria-label': 'Volume suara', class: 'vol' }) as HTMLInputElement;
    vol.value = String(Math.round(s.volume * 100));
    vol.oninput = () => { updateSettings({ volume: Number(vol.value) / 100 }); volLabel.textContent = `${vol.value}%`; };
    vol.onchange = () => play('move'); // contoh suara setelah geser selesai
    const volLabel = h('small', {}, `${vol.value}%`);

    box.replaceChildren(
      h('section', { class: 'card' },
        h('h3', {}, 'Tampilan'),
        h('div', { class: 'field' }, h('small', {}, 'Tema'),
          chips(Object.entries(THEMES) as [Theme, string][], s.theme, (v) => { updateSettings({ theme: v }); render(); })),
        h('div', { class: 'field' }, h('small', {}, 'Warna papan'),
          chips(Object.entries(BOARD_THEMES).map(([k, v]) => [k, v.name] as [BoardTheme, string]), s.board,
            (v) => { updateSettings({ board: v }); render(); }, (v) => swatch(v))),
        toggle('set-coords', 'Koordinat papan', 'Huruf a–h dan angka 1–8 di tepi papan', s.coords, (v) => updateSettings({ coords: v })),
        toggle('set-eval', 'Bar dominasi', 'Menunjukkan siapa yang unggul saat Belajar vs Bot dan Replay', s.evalBar, (v) => updateSettings({ evalBar: v }))),
      h('section', { class: 'card' },
        h('h3', {}, 'Suara'),
        toggle('set-sound', 'Efek suara', 'Bunyi saat bidak bergerak, memakan, skak, dan partai berakhir', !s.muted, (v) => { updateSettings({ muted: !v }); if (v) play('move'); }),
        h('div', { class: 'field' }, h('small', {}, 'Volume'), h('div', { class: 'row vol-row' }, vol, volLabel))),
      h('button', { class: 'btn danger', onclick: () => { resetSettings(); render(); } }, 'Kembalikan ke bawaan'),
    );
  };
  render();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', 'aria-label': 'Kembali', onclick: () => go(homeScreen) }, '←'), h('h2', {}, 'Pengaturan')),
    box,
  );
  return { el };
}
