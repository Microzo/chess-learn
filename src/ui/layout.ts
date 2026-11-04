import { h } from './dom';

type Kid = Node | null | undefined | false;

/**
 * Layar permainan: papan di satu kolom, info (kartu, tombol, daftar langkah) di kolom lain.
 * Di HP keduanya bertumpuk seperti biasa; di layar lebar CSS menjadikannya dua kolom.
 */
export function gameLayout(header: Node, main: Kid[], side: Kid[]): HTMLElement {
  return h('div', { class: 'screen game' },
    header,
    h('div', { class: 'game-main' }, ...main),
    h('div', { class: 'game-side' }, ...side));
}

/** Papan dengan bar dominasi vertikal di sisi kirinya (tinggi bar mengikuti papan). */
export function boardWithBar(bar: Node, board: Node): HTMLElement {
  return h('div', { class: 'board-with-bar' }, bar, board);
}
