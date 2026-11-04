import { go, type Screen } from '../../app/router';
import { endgameList } from '../../modes/endgames/endgames';
import { examHome } from '../../modes/exam/exam';
import { classicsList } from '../../modes/classics/classics';
import { learningSetup } from '../../modes/learning/learning';
import { lessonList } from '../../modes/lessons/lessons';
import { pvpSetup } from '../../modes/pvp/pvp';
import { replayList } from '../../modes/replay/replay';
import { tr } from '../../core/i18n';
import { versionLabel } from '../../core/version';
import { h } from '../dom';
import { settingsScreen } from './settings';

export function homeScreen(): Screen {
  const menu = (icon: string, title: string, sub: string, fn: () => void) =>
    h('button', { class: 'menu-item', onclick: fn },
      h('span', { class: 'mi-icon' }, icon),
      h('span', {}, h('strong', {}, title), h('small', {}, sub)));

  const settings = h('button', { class: 'btn ghost settings-link', onclick: () => go(settingsScreen) }, tr('⚙ Settings', '⚙ Pengaturan'));

  const el = h('div', { class: 'screen home' },
    h('h1', {}, '♞ Chess Learn'),
    h('p', { class: 'muted' }, tr('Learn chess offline with analysis on every move.', 'Belajar catur offline dengan analisa di setiap langkah.')),
    menu('📚', tr('Learn Strategy', 'Belajar Strategi'), tr('Openings, tactics, endgames and chess terms', 'Opening, taktik, endgame, dan istilah catur'), () => go(lessonList)),
    menu('🎓', tr('Learn vs Bot', 'Belajar vs Bot'), tr('Live analysis of every move', 'Analisa langsung tiap langkah'), () => go(learningSetup)),
    menu('👥', tr('Two Players', 'Main berdua'), tr('Two players, one device', 'Dua pemain, satu perangkat'), () => go(pvpSetup)),
    menu('🏆', tr('Legendary Games', 'Partai Legendaris'), tr('Study the moves and notation of world-class games', 'Pelajari langkah dan notasi dari partai kelas dunia'), () => go(classicsList)),
    menu('♟', tr('Endgame Practice', 'Latihan Endgame'), tr('Win and hold classic endgames against the bot', 'Menangkan dan pertahankan endgame klasik melawan bot'), () => go(endgameList)),
    menu('📝', tr('Exam & Progress', 'Ujian & Progres'), tr('Level exams and your progress over time', 'Ujian per level dan perkembanganmu'), () => go(examHome)),
    menu('📼', tr('Replay & Analysis', 'Replay & Analisa'), tr('Replay, graph, accuracy, openings', 'Putar ulang, grafik, akurasi, opening'), () => go(replayList)),
    settings,
    h('p', { class: 'muted legal' },
      tr('Free software (GPL-3.0). Uses Stockfish and chess.js. ', 'Perangkat lunak bebas (GPL-3.0). Memakai Stockfish dan chess.js. '),
      h('a', { href: `${import.meta.env.BASE_URL}licenses/README.txt`, target: '_blank', rel: 'noopener' }, tr('Licenses and attribution', 'Lisensi dan atribusi')),
      ' · ',
      h('a', { href: 'https://github.com/Microzo/chess-learn', target: '_blank', rel: 'noopener' }, tr('Source code', 'Kode sumber'))),
    h('p', { class: 'muted legal version', 'data-testid': 'version' }, versionLabel()),
  );
  return { el };
}
