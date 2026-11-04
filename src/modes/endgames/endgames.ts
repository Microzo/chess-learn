import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { currentLang, tr } from '../../core/i18n';
import { BOT_LEVELS } from '../../core/engine/levels';
import { engineReady, getAnalyzer, getEngine } from '../../core/engine/instance';
import { statusOf } from '../../core/game/game';
import { loadProgress, markEndgameDone } from '../../core/storage/progress';
import { ENDGAMES, type EndgameDrill } from '../../data/endgames';
import { LEVEL_LABEL } from '../../data/exam';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { gameLayout } from '../../ui/layout';
import { homeScreen } from '../../ui/screens/home';
import { lessonScreen } from '../lessons/lessons';

const pick = (p: readonly [string, string]) => (currentLang() === 'en' ? p[0] : p[1]);

/** Apakah hasil akhir memenuhi sasaran latihan bagi pemain? */
export function goalMet(d: Pick<EndgameDrill, 'goal' | 'player'>, result: '1-0' | '0-1' | '1/2-1/2' | '*'): boolean {
  const won = (d.player === 'w' && result === '1-0') || (d.player === 'b' && result === '0-1');
  if (d.goal === 'win') return won;
  return won || result === '1/2-1/2';
}

export function endgameList(): Screen {
  const done = loadProgress().endgames;
  const items = ENDGAMES.map((d) =>
    h('div', { class: 'item', 'data-id': d.id },
      h('button', { class: 'item-main', onclick: () => go(() => endgameScreen(d.id)) },
        h('strong', {}, `${done[d.id] ? '✔ ' : ''}${pick(d.title)}`),
        h('small', {}, `${d.goal === 'win' ? tr('Goal: win', 'Sasaran: menang') : tr('Goal: draw', 'Sasaran: remis')} · ${d.player === 'w' ? tr('you are White', 'kamu Putih') : tr('you are Black', 'kamu Hitam')}`)),
      h('span', { class: `level level-${d.level === 'beginner' ? 'pemula' : d.level === 'intermediate' ? 'menengah' : 'lanjut'}` }, pick(LEVEL_LABEL[d.level]))));
  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, tr('Endgame Practice', 'Latihan Endgame'))),
    h('p', { class: 'muted' }, tr(
      'Play out classic endgames against the strongest bot. Win the won positions and hold the drawn ones.',
      'Mainkan endgame klasik melawan bot terkuat. Menangkan posisi yang menang dan pertahankan posisi yang seri.')),
    h('div', { class: 'list' }, ...items));
  return { el };
}

export function endgameScreen(id: string): Screen {
  const drill = ENDGAMES.find((d) => d.id === id);
  if (!drill) return endgameList();
  const d: EndgameDrill = drill;
  const level = BOT_LEVELS[BOT_LEVELS.length - 1]!;
  const engine = getEngine();
  const analyzer = getAnalyzer();
  let chess = new Chess(d.fen);
  let busy = true;
  let destroyed = false;
  let resigned = false;
  let last: [string, string] | null = null;
  let hint: [string, string] | null = null;
  let token = 0; // membatalkan balasan bot yang tertunda setelah mengulang

  const board = new Board((from, to, promo) => void playerMove(from, to, promo));
  const status = h('div', { class: 'status' }, tr('Loading engine…', 'Memuat engine…'));
  const endBox = h('div', {});
  const hintBox = h('div', {});
  const hintBtn = h('button', { class: 'btn', onclick: () => void showHint() }, tr('💡 Hint', '💡 Saran'));
  const retryBtn = h('button', { class: 'btn', onclick: () => restart() }, tr('⟲ Restart', '⟲ Mulai ulang'));
  const resignBtn = h('button', { class: 'btn danger', onclick: () => resign() }, tr('🏳 Give up', '🏳 Menyerah'));

  const over = () => resigned || statusOf(chess).over;

  function draw() {
    board.set(chess, { last, hint, flip: d.player === 'b', movable: !busy && !over() ? d.player : null });
    for (const b of [hintBtn, resignBtn]) (b as HTMLButtonElement).disabled = busy || over();
    if (!busy) status.textContent = over() ? status.textContent : tr('Your move.', 'Giliranmu.');
  }

  function finish() {
    busy = false;
    const st = statusOf(chess);
    const result = resigned ? (d.player === 'w' ? '0-1' : '1-0') : st.result;
    const ok = !resigned && goalMet(d, result);
    if (ok) markEndgameDone(d.id);
    status.textContent = resigned ? tr('You gave up.', 'Kamu menyerah.') : st.text;
    endBox.replaceChildren(h('div', { class: `card end ${ok ? 'cls-best' : 'cls-mistake'}`, role: 'status' },
      h('strong', {}, ok ? tr('✔ Goal reached!', '✔ Sasaran tercapai!') : d.goal === 'win' && result === '1/2-1/2' ? tr('Only a draw: the position was winning.', 'Hanya remis: posisinya menang.') : tr('Goal not reached.', 'Sasaran belum tercapai.')),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => restart() }, tr('Try again', 'Coba lagi')),
        h('button', { class: 'btn', onclick: () => go(() => lessonScreen(d.lesson)) }, tr('📖 Related lesson', '📖 Pelajaran terkait')),
        h('button', { class: 'btn', onclick: () => go(endgameList) }, tr('All drills', 'Semua latihan')))));
    draw();
  }

  async function playerMove(from: string, to: string, promo?: string) {
    if (busy || over()) return;
    busy = true;
    hint = null;
    hintBox.replaceChildren();
    try {
      const m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) });
      last = [m.from, m.to];
    } catch {
      busy = false;
      draw();
      return;
    }
    draw();
    if (over()) return finish();
    await botTurn();
  }

  async function botTurn() {
    busy = true;
    const mine = token;
    status.textContent = tr('Bot is thinking…', 'Bot berpikir…');
    draw();
    try {
      const uci = await engine.botMove(chess.fen(), level.skill, level.movetime);
      if (destroyed || mine !== token) return;
      const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci[4] ? { promotion: uci[4] } : {}) });
      last = [m.from, m.to];
    } catch (e) {
      console.error(e);
      status.textContent = tr('Engine problem. Please reload the page.', 'Engine bermasalah. Muat ulang halaman.');
      return;
    }
    if (over()) return finish();
    busy = false;
    draw();
  }

  async function showHint() {
    if (busy || over()) return;
    busy = true;
    draw();
    const mine = token;
    try {
      const line = await analyzer.evaluate(chess.fen());
      if (destroyed || mine !== token) return;
      const u = line.bestMoveUci;
      hint = [u.slice(0, 2), u.slice(2, 4)];
      const san = new Chess(chess.fen()).move({ from: hint[0], to: hint[1], ...(u[4] ? { promotion: u[4] } : {}) }).san;
      hintBox.replaceChildren(h('div', { class: 'card' }, h('strong', {}, tr(`Engine hint: ${san}`, `Saran engine: ${san}`))));
    } catch (e) {
      console.error(e);
    }
    busy = false;
    draw();
  }

  function restart() {
    token++;
    chess = new Chess(d.fen);
    busy = true; resigned = false; last = null; hint = null;
    endBox.replaceChildren(); hintBox.replaceChildren();
    void begin();
  }

  function resign() {
    if (busy || over() || !confirm(tr('Give up this drill?', 'Menyerah pada latihan ini?'))) return;
    resigned = true;
    finish();
  }

  async function begin() {
    draw();
    try { await engineReady(); } catch { status.textContent = tr('Engine problem. Please reload the page.', 'Engine bermasalah. Muat ulang halaman.'); return; }
    if (destroyed) return;
    if (chess.turn() !== d.player) await botTurn();
    else { busy = false; draw(); }
  }

  const el = gameLayout(
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(endgameList) }, '←'),
      h('h2', {}, pick(d.title))),
    [board.el, status],
    [h('div', { class: 'card' }, h('strong', {}, pick(d.task)), h('small', { class: 'muted' }, pick(d.hint))),
      hintBox, h('div', { class: 'row' }, hintBtn, retryBtn, resignBtn), endBox]);

  void begin();
  return { el, destroy: () => { destroyed = true; } };
}
