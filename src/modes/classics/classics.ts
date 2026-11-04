import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { CLASSICS, parseNoteKey, type Classic } from '../../data/classics';
import type { SavedGame } from '../../types';
import { h } from '../../ui/dom';
import { homeScreen } from '../../ui/screens/home';
import { lessonScreen } from '../lessons/lessons';
import { replayView } from '../replay/replay';

const RESULT_TEXT = { '1-0': 'Putih menang', '0-1': 'Hitam menang' } as const;

/** Catatan per ply dari kunci seperti '17.Rd8#'. Kunci yang tidak cocok dengan langkah aslinya dibuang. */
export function notesFor(c: Classic): Record<number, string> {
  const sans = new Chess();
  sans.loadPgn(c.pgn);
  const played = sans.history();
  const out: Record<number, string> = {};
  for (const [key, text] of c.notes) {
    const p = parseNoteKey(key);
    if (p && played[p.ply - 1] === p.san) out[p.ply] = text;
  }
  return out;
}

export function classicsList(): Screen {
  const items = CLASSICS.map((c) =>
    h('div', { class: 'item', 'data-id': c.id },
      h('button', { class: 'item-main', onclick: () => go(() => classicScreen(c.id)) },
        h('strong', {}, c.title),
        h('small', {}, `${c.white} vs ${c.black} · ${c.year}`),
        h('small', {}, `${c.opening} · ${RESULT_TEXT[c.result]}`)),
      h('span', { class: `level level-${c.level.toLowerCase()}` }, c.level)));

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', 'aria-label': 'Kembali', onclick: () => go(homeScreen) }, '←'), h('h2', {}, 'Partai Legendaris')),
    h('p', { class: 'muted' }, 'Partai kelas dunia yang diputar ulang langkah demi langkah, lengkap dengan catatan di langkah penting. Perhatikan juga cara menulis tiap langkahnya (notasi).'),
    h('div', { class: 'card' },
      h('strong', {}, 'Cara membaca notasi'),
      h('p', {}, 'Contoh: ', h('code', {}, '17.Rd8#'), ' = langkah ke-17 Putih, benteng (R) ke kotak d8, skakmat (#). ',
        h('code', {}, '16...Nxb8'), ' = langkah ke-16 Hitam (tiga titik), kuda (N) memakan (x) bidak di b8.'),
      h('button', { class: 'btn', onclick: () => go(() => lessonScreen('notasi')) }, '📖 Pelajari notasi aljabar')),
    h('div', { class: 'list' }, ...items),
  );
  return { el };
}

export function classicScreen(id: string): Screen {
  const c = CLASSICS.find((x) => x.id === id);
  if (!c) return classicsList();

  const game: SavedGame = {
    id: `classic:${c.id}`, mode: 'import', createdAt: 0,
    white: c.white, black: c.black, pgn: c.pgn, result: c.result,
  };
  const intro = h('div', { class: 'card classic-intro' },
    h('strong', {}, c.title),
    h('small', {}, `${c.event} · ${c.opening}`),
    h('p', {}, c.summary),
    h('details', {}, h('summary', {}, 'Yang bisa dipelajari'),
      h('ul', { class: 'points' }, ...c.learn.map((t) => h('li', {}, t)))));

  return replayView(game, { back: classicsList, persist: false, notes: notesFor(c), intro });
}
