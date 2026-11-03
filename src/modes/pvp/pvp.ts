import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { statusOf, toPgn, type Result } from '../../core/game/game';
import { newId, saveGame } from '../../core/storage/games';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';
import { replayScreen } from '../replay/replay';

export function pvpSetup(): Screen {
  const p1 = h('input', { value: 'Pemain 1', maxlength: '20' }) as HTMLInputElement;
  const p2 = h('input', { value: 'Pemain 2', maxlength: '20' }) as HTMLInputElement;
  const auto = h('input', { type: 'checkbox', checked: true }) as HTMLInputElement;

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, 'Main berdua (offline)')),
    h('p', { class: 'muted' }, 'Dua pemain bergantian di satu perangkat. Setelah selesai, partai bisa dianalisa di Replay.'),
    h('label', { class: 'field' }, 'Putih', p1),
    h('label', { class: 'field' }, 'Hitam', p2),
    h('label', { class: 'check' }, auto, ' Putar papan otomatis tiap giliran'),
    h('button', {
      class: 'btn primary big',
      onclick: () => go(() => pvpGame(p1.value.trim() || 'Putih', p2.value.trim() || 'Hitam', auto.checked)),
    }, 'Mulai'),
  );
  return { el };
}

export function pvpGame(white: string, black: string, autoFlip: boolean): Screen {
  const chess = new Chess();
  const id = newId();
  const createdAt = Date.now();
  let manualFlip = false;
  let last: [string, string] | null = null;
  let ended: Result | null = null;

  const board = new Board((from, to, promo) => {
    const m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) });
    last = [m.from, m.to];
    persist();
    draw();
  });
  const status = h('div', { class: 'status' });
  const moves = new MoveList();
  const endBox = h('div', {});

  const name = (c: 'w' | 'b') => (c === 'w' ? white : black);
  const isOver = () => ended !== null || statusOf(chess).over;

  function persist() {
    if (chess.history().length === 0) return;
    const result = ended ?? statusOf(chess).result;
    saveGame({ id, mode: 'pvp', createdAt, white, black, pgn: toPgn(chess, white, black, result), result });
  }

  function draw() {
    const over = isOver();
    const flip = autoFlip ? chess.turn() === 'b' : manualFlip;
    board.set(chess, { last, flip, movable: over ? null : 'both' });
    moves.render(chess.history(), [], chess.history().length);
    status.textContent = ended
      ? `Selesai: ${ended}`
      : statusOf(chess).over
        ? statusOf(chess).text
        : `Giliran ${name(chess.turn())}${chess.inCheck() ? ' (skak!)' : ''}`;
    if (over) showEnd();
  }

  function showEnd() {
    const result = ended ?? statusOf(chess).result;
    persist();
    endBox.replaceChildren(
      h('div', { class: 'card end' },
        h('strong', {}, result === '1-0' ? `${white} menang` : result === '0-1' ? `${black} menang` : 'Remis'),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => go(() => replayScreen(id)) }, 'Replay & analisa'),
          h('button', { class: 'btn', onclick: () => go(pvpSetup) }, 'Main lagi'),
        ),
      ),
    );
  }

  const undo = () => {
    if (isOver() || chess.history().length === 0) return;
    chess.undo();
    last = null;
    persist();
    draw();
  };
  const resign = () => {
    if (isOver() || !confirm(`${name(chess.turn())} menyerah?`)) return;
    ended = chess.turn() === 'w' ? '0-1' : '1-0';
    draw();
  };
  const draw_ = () => {
    if (isOver() || !confirm('Kedua pemain sepakat remis?')) return;
    ended = '1/2-1/2';
    draw();
  };

  const el = h('div', { class: 'screen game' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, `${white} vs ${black}`)),
    board.el, status,
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: undo }, '↶ Batal langkah'),
      h('button', { class: 'btn', onclick: draw_ }, '½ Remis'),
      h('button', { class: 'btn danger', onclick: resign }, '🏳 Menyerah'),
      autoFlip ? null : h('button', { class: 'btn', onclick: () => { manualFlip = !manualFlip; draw(); } }, '⟲ Putar')),
    endBox, moves.el,
  );
  draw();
  return { el };
}
