import { go, type Screen } from '../../app/router';
import { learningSetup } from '../../modes/learning/learning';
import { lessonList } from '../../modes/lessons/lessons';
import { pvpSetup } from '../../modes/pvp/pvp';
import { replayList } from '../../modes/replay/replay';
import { h } from '../dom';
import { settingsScreen } from './settings';

export function homeScreen(): Screen {
  const menu = (icon: string, title: string, sub: string, fn: () => void) =>
    h('button', { class: 'menu-item', onclick: fn },
      h('span', { class: 'mi-icon' }, icon),
      h('span', {}, h('strong', {}, title), h('small', {}, sub)));

  const settings = h('button', { class: 'btn ghost settings-link', onclick: () => go(settingsScreen) }, '⚙ Pengaturan');

  const el = h('div', { class: 'screen home' },
    h('h1', {}, '♞ Chess Learn'),
    h('p', { class: 'muted' }, 'Belajar catur offline dengan analisa di setiap langkah.'),
    menu('📚', 'Belajar Strategi', 'Opening, taktik, endgame, dan istilah catur', () => go(lessonList)),
    menu('🎓', 'Belajar vs Bot', 'Analisa langsung tiap langkah', () => go(learningSetup)),
    menu('👥', 'Main berdua', 'Dua pemain, satu perangkat', () => go(pvpSetup)),
    menu('📼', 'Replay & Analisa', 'Putar ulang, grafik, akurasi, opening', () => go(replayList)),
    settings,
    h('p', { class: 'muted legal' },
      'Perangkat lunak bebas (GPL-3.0). Memakai Stockfish dan chess.js. ',
      h('a', { href: `${import.meta.env.BASE_URL}licenses/README.txt`, target: '_blank', rel: 'noopener' }, 'Lisensi dan atribusi'),
      ' · ',
      h('a', { href: 'https://github.com/Microzo/chess-learn', target: '_blank', rel: 'noopener' }, 'Kode sumber')),
  );
  return { el };
}
