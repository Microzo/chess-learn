import { go, type Screen } from '../../app/router';
import { learningSetup } from '../../modes/learning/learning';
import { pvpSetup } from '../../modes/pvp/pvp';
import { replayList } from '../../modes/replay/replay';
import { h } from '../dom';

export function homeScreen(): Screen {
  const menu = (icon: string, title: string, sub: string, fn: () => void) =>
    h('button', { class: 'menu-item', onclick: fn },
      h('span', { class: 'mi-icon' }, icon),
      h('span', {}, h('strong', {}, title), h('small', {}, sub)));

  const el = h('div', { class: 'screen home' },
    h('h1', {}, '♞ Chess Learn'),
    h('p', { class: 'muted' }, 'Belajar catur offline dengan analisa di setiap langkah.'),
    menu('🎓', 'Belajar vs Bot', 'Analisa langsung tiap langkah', () => go(learningSetup)),
    menu('👥', 'Main berdua', 'Dua pemain, satu perangkat', () => go(pvpSetup)),
    menu('📼', 'Replay & Analisa', 'Putar ulang, grafik, akurasi, opening', () => go(replayList)),
  );
  return { el };
}
