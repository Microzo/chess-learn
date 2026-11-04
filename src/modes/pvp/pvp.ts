import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { ChessClock, formatClock, TIME_CONTROLS, type Side, type TimeControl } from '../../core/game/clock';
import { hasMatingMaterial, statusOf, toPgn, type Result } from '../../core/game/game';
import { newId, saveGame } from '../../core/storage/games';
import { Board } from '../../ui/board/board';
import { tr } from '../../core/i18n';
import { h } from '../../ui/dom';
import { gameLayout } from '../../ui/layout';
import { MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';
import { replayScreen } from '../replay/replay';

export function pvpSetup(): Screen {
  const p1 = h('input', { value: tr('Player 1', 'Pemain 1'), maxlength: '20' }) as HTMLInputElement;
  const p2 = h('input', { value: tr('Player 2', 'Pemain 2'), maxlength: '20' }) as HTMLInputElement;
  let tc: TimeControl | null = null;
  const chips: HTMLElement[] = [];
  const paintChips = () => chips.forEach((c, i) => c.classList.toggle('on', (i === 0 ? tc === null : tc === TIME_CONTROLS[i - 1])));
  const chip = (label: string, value: TimeControl | null) => {
    const el = h('button', { class: 'chip', onclick: () => { tc = value; paintChips(); } }, label);
    chips.push(el);
    return el;
  };
  const chipRow = h('div', { class: 'chips' }, chip(tr('No clock', 'Tanpa jam'), null), ...TIME_CONTROLS.map((t) => chip(t.label, t)));
  paintChips();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, tr('Two Players (offline)', 'Main berdua (offline)'))),
    h('p', { class: 'muted' }, tr('Two players take turns on one device. When the game ends you can analyse it in Replay.', 'Dua pemain bergantian di satu perangkat. Setelah selesai, partai bisa dianalisa di Replay.')),
    h('label', { class: 'field' }, tr('White', 'Putih'), p1),
    h('label', { class: 'field' }, tr('Black', 'Hitam'), p2),
    h('div', { class: 'field' }, tr('Chess clock', 'Jam catur'), chipRow),
    h('button', {
      class: 'btn primary big',
      onclick: () => go(() => pvpGame(p1.value.trim() || tr('White', 'Putih'), p2.value.trim() || tr('Black', 'Hitam'), tc)),
    }, tr('Start', 'Mulai')),
  );
  return { el };
}

/** Papan tidak berputar sendiri (dimainkan dua orang di satu perangkat); ada tombol Putar manual. */
export function pvpGame(white: string, black: string, tc: TimeControl | null = null): Screen {
  const chess = new Chess();
  const id = newId();
  const createdAt = Date.now();
  let manualFlip = false;
  let last: [string, string] | null = null;
  let ended: Result | null = null;
  let timeoutText = '';
  const clock = tc ? new ChessClock(tc) : null;
  let timer: number | undefined;

  const board = new Board((from, to, promo) => {
    tick(); // bendera yang jatuh di antara dua tick tidak boleh lolos dengan langkah
    if (isOver()) return;
    const mover = chess.turn();
    const m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) });
    last = [m.from, m.to];
    clock?.press(mover, Date.now());
    persist();
    draw();
  });
  const clockEl: Record<Side, HTMLElement> = { w: h('div', { class: 'clock' }), b: h('div', { class: 'clock' }) };
  const topBar = h('div', { class: 'clockbar' });
  const bottomBar = h('div', { class: 'clockbar' });
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
    const flip = manualFlip;
    board.set(chess, { last, flip, movable: over ? null : 'both' });
    const bottom: Side = flip ? 'b' : 'w';
    const top: Side = bottom === 'w' ? 'b' : 'w';
    if (clock) {
      const label = (side: Side) => h('span', { class: 'clock-name' }, side === 'w' ? white : black);
      topBar.replaceChildren(label(top), clockEl[top]);
      bottomBar.replaceChildren(label(bottom), clockEl[bottom]);
      if (over) { clock.stop(Date.now()); window.clearInterval(timer); }
      tick();
    }
    moves.render(chess.history(), [], chess.history().length);
    status.textContent = ended
      ? (timeoutText || tr(`Finished: ${ended}`, `Selesai: ${ended}`))
      : statusOf(chess).over
        ? statusOf(chess).text
        : tr(`${name(chess.turn())} to move${chess.inCheck() ? ' (check!)' : ''}`, `Giliran ${name(chess.turn())}${chess.inCheck() ? ' (skak!)' : ''}`);
    if (over) showEnd();
  }

  /** Perbarui tampilan jam dan deteksi bendera jatuh. */
  function tick() {
    if (!clock) return;
    const now = Date.now();
    const flagged = !isOver() ? clock.flagged(now) : null;
    for (const side of ['w', 'b'] as const) {
      const ms = clock.remaining(side, now);
      clockEl[side].textContent = formatClock(ms);
      clockEl[side].classList.toggle('active', clock.active === side && !isOver());
      clockEl[side].classList.toggle('low', ms < 10_000);
    }
    if (flagged) {
      const winner: Side = flagged === 'w' ? 'b' : 'w';
      const canWin = hasMatingMaterial(chess, winner);
      ended = !canWin ? '1/2-1/2' : winner === 'w' ? '1-0' : '0-1';
      const loser = flagged === 'w' ? white : black;
      timeoutText = canWin
        ? tr(`${loser} ran out of time.`, `Waktu ${loser} habis.`)
        : tr('Time is up, but the opponent has no mating material: draw.', 'Waktu habis, tetapi lawan tidak punya materi untuk skakmat: remis.');
      draw();
    }
  }

  function showEnd() {
    const result = ended ?? statusOf(chess).result;
    persist();
    endBox.replaceChildren(
      h('div', { class: 'card end' },
        h('strong', {}, result === '1-0' ? tr(`${white} wins`, `${white} menang`) : result === '0-1' ? tr(`${black} wins`, `${black} menang`) : tr('Draw', 'Remis')),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => go(() => replayScreen(id)) }, tr('Replay & analysis', 'Replay & analisa')),
          h('button', { class: 'btn', onclick: () => go(pvpSetup) }, tr('Play again', 'Main lagi')),
        ),
      ),
    );
  }

  const undo = () => {
    if (clock || isOver() || chess.history().length === 0) return;
    chess.undo();
    last = null;
    persist();
    draw();
  };
  /** Tanya konfirmasi dengan jam dijeda (confirm() memblokir, tetapi Date.now() terus berjalan). */
  const ask = (text: string): boolean => {
    tick();
    if (isOver()) return false;
    clock?.pause(Date.now());
    const yes = confirm(text);
    clock?.resume(Date.now());
    return yes;
  };
  const resign = () => {
    if (isOver() || !ask(tr(`Does ${name(chess.turn())} resign?`, `${name(chess.turn())} menyerah?`))) return;
    ended = chess.turn() === 'w' ? '0-1' : '1-0';
    draw();
  };
  const draw_ = () => {
    if (isOver() || !ask(tr('Do both players agree to a draw?', 'Kedua pemain sepakat remis?'))) return;
    ended = '1/2-1/2';
    draw();
  };

  const el = gameLayout(
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, `${white} vs ${black}`)),
    [topBar, board.el, bottomBar, status],
    [h('div', { class: 'row' },
      clock ? null : h('button', { class: 'btn', onclick: undo }, tr('↶ Undo move', '↶ Batal langkah')),
      h('button', { class: 'btn', onclick: draw_ }, tr('½ Draw', '½ Remis')),
      h('button', { class: 'btn danger', onclick: resign }, tr('🏳 Resign', '🏳 Menyerah')),
      h('button', { class: 'btn', onclick: () => { manualFlip = !manualFlip; draw(); } }, tr('⟲ Flip', '⟲ Putar'))),
    endBox, moves.el],
  );
  draw();
  if (clock) timer = window.setInterval(tick, 100);
  return { el, destroy: () => window.clearInterval(timer) };
}
