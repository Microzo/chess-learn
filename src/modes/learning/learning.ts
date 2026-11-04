import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { accuracyOf, uciOf } from '../../core/analysis/analyzer';
import { BOT_LEVELS, type BotLevel } from '../../core/engine/levels';
import { engineReady, getAnalyzer, getEngine } from '../../core/engine/instance';
import { statusOf, toPgn, type Result } from '../../core/game/game';
import { newId, saveGame } from '../../core/storage/games';
import type { MoveAnalysis } from '../../types';
import { Board } from '../../ui/board/board';
import { tr } from '../../core/i18n';
import { h } from '../../ui/dom';
import { boardWithBar, gameLayout } from '../../ui/layout';
import { analysisCard, badge, EvalBar, MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';
import { replayScreen } from '../replay/replay';

export function learningSetup(): Screen {
  let color: 'w' | 'b' | 'r' = 'w';
  let level = 3;
  let guided = true;

  const colorBtns = (['w', 'r', 'b'] as const).map((c) =>
    h('button', { class: 'chip', 'data-v': c, onclick: () => { color = c; sync(); } },
      c === 'w' ? tr('♔ White', '♔ Putih') : c === 'b' ? tr('♚ Black', '♚ Hitam') : tr('🎲 Random', '🎲 Acak')),
  );
  const levelBtns = BOT_LEVELS.map((l) =>
    h('button', { class: 'chip', 'data-v': l.id, onclick: () => { level = l.id; sync(); } },
      h('b', {}, `${l.id}`), ` ${l.name} `, h('small', {}, l.hint)),
  );
  const guideBtns = ([[true, tr('🧭 With guidance', '🧭 Dengan panduan')], [false, tr('🎯 No guidance', '🎯 Tanpa panduan')]] as const).map(([v, label]) =>
    h('button', { class: 'chip', 'data-v': v ? 'guide' : 'free', onclick: () => { guided = v; sync(); } }, label));
  const guideNote = h('p', { class: 'muted guide-note' });
  const sync = () => {
    guideBtns.forEach((b) => b.classList.toggle('on', (b.dataset.v === 'guide') === guided));
    guideNote.textContent = guided
      ? tr('Every move you make is analysed instantly (opening, best, mistake, blunder), with an advantage bar and a Hint button.',
          'Setiap langkahmu langsung dianalisa (opening, terbaik, kesalahan, blunder), ada bar dominasi dan tombol Saran.')
      : tr('Pure play against the bot: no analysis, no bar, no hints. The game is still saved and can be analysed later in Replay.',
          'Main murni melawan bot: tanpa analisa, tanpa bar, tanpa saran. Partai tetap tersimpan, analisa nanti lewat Replay.');
    colorBtns.forEach((b) => b.classList.toggle('on', b.dataset.v === color));
    levelBtns.forEach((b) => b.classList.toggle('on', b.dataset.v === String(level)));
  };
  sync();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, tr('Learn vs Bot', 'Belajar vs Bot'))),
    h('h3', {}, tr('Mode', 'Mode')), h('div', { class: 'chips' }, ...guideBtns), guideNote,
    h('h3', {}, tr('Colour', 'Warna')), h('div', { class: 'chips' }, ...colorBtns),
    h('h3', {}, tr('Bot level', 'Level bot')), h('div', { class: 'chips' }, ...levelBtns),
    h('button', {
      class: 'btn primary big',
      onclick: () => {
        const p = color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
        go(() => learningGame(p, BOT_LEVELS.find((l) => l.id === level)!, guided));
      },
    }, tr('Start', 'Mulai')),
  );
  return { el };
}

/**
 * guided=true: analisa tiap langkah, bar dominasi, saran. guided=false: main murni lawan bot, tanpa
 * analisa sama sekali (hemat CPU juga); partai disimpan tanpa analisa dan bisa dianalisa lewat Replay.
 */
export function learningGame(player: 'w' | 'b', level: BotLevel, guided = true): Screen {
  const chess = new Chess();
  const analyzer = getAnalyzer();
  const engine = getEngine();
  const id = newId();
  const createdAt = Date.now();
  const analyses: MoveAnalysis[] = [];
  const botName = `Bot ${level.name}`;
  const youName = tr('You', 'Kamu');

  let busy = true;
  let destroyed = false;
  let resigned: Result | null = null;
  let last: [string, string] | null = null;
  let hint: [string, string] | null = null;

  const board = new Board((f, t, p) => void playerMove(f, t, p));
  const evalBar = new EvalBar();
  evalBar.setFlip(player === 'b');
  const status = h('div', { class: 'status' }, tr('Loading engine…', 'Memuat engine…'));
  const cardBox = h('div', { class: 'cardbox' }, analysisCard(null));
  const botLine = h('div', { class: 'botline muted' });
  const endBox = h('div', {});
  const moves = new MoveList();
  const hintBtn = h('button', { class: 'btn', onclick: () => void showHint() }, tr('💡 Hint', '💡 Saran'));
  const undoBtn = h('button', { class: 'btn', onclick: () => undo() }, tr('↶ Take back', '↶ Ulangi'));
  const resignBtn = h('button', { class: 'btn danger', onclick: () => resign() }, tr('🏳 Resign', '🏳 Menyerah'));

  const isOver = () => resigned !== null || statusOf(chess).over;

  function draw() {
    const over = isOver();
    board.set(chess, { last, hint, flip: player === 'b', movable: !busy && !over ? player : null });
    const n = chess.history().length;
    moves.render(chess.history(), analyses, n);
    const st = statusOf(chess);
    status.textContent = resigned ? tr('You resigned.', 'Kamu menyerah.') : busy && !over ? status.textContent : st.text;
    for (const b of [hintBtn, undoBtn, resignBtn]) (b as HTMLButtonElement).disabled = busy || over;
  }

  function persist() {
    if (chess.history().length === 0) return;
    const result = resigned ?? statusOf(chess).result;
    saveGame({
      id, mode: 'learning', createdAt,
      white: player === 'w' ? youName : botName,
      black: player === 'b' ? youName : botName,
      pgn: toPgn(chess, player === 'w' ? youName : botName, player === 'b' ? youName : botName, result),
      result,
      ...(guided ? { analysis: analyses.slice(), accuracy: accuracyOf(analyses) } : {}),
    });
  }

  function finish() {
    busy = false;
    persist();
    draw();
    const acc = accuracyOf(analyses);
    const mine = player === 'w' ? acc.white : acc.black;
    endBox.replaceChildren(
      h('div', { class: 'card end' },
        h('strong', {}, resigned ? tr('You resigned.', 'Kamu menyerah.') : statusOf(chess).text),
        guided
          ? h('p', {}, tr(`Your accuracy: ${mine.toFixed(0)}%`, `Akurasimu: ${mine.toFixed(0)}%`))
          : h('p', { class: 'muted' }, tr('No-guidance mode: press Replay & analysis to see how well you played.', 'Mode tanpa panduan: tekan Replay & analisa untuk melihat kualitas langkahmu.')),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => go(() => replayScreen(id)) }, tr('Replay & analysis', 'Replay & analisa')),
          h('button', { class: 'btn', onclick: () => go(learningSetup) }, tr('Play again', 'Main lagi')),
        ),
      ),
    );
  }

  async function playerMove(from: string, to: string, promo?: string) {
    if (busy || isOver()) return;
    busy = true;
    hint = null;
    const fenBefore = chess.fen();
    const m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) });
    last = [from, to];
    if (guided) {
      status.textContent = tr('Analysing…', 'Menganalisa…');
      cardBox.replaceChildren(analysisCard(null, { pending: true }));
    }
    draw();
    if (!guided) {
      if (isOver()) return finish();
      return botTurn();
    }
    try {
      const a = await analyzer.analyseMove(fenBefore, m.after, m.san, uciOf(m), chess.history().length);
      if (destroyed) return;
      analyses.push(a);
      cardBox.replaceChildren(analysisCard(a));
      evalBar.set(a.evalAfter);
      persist();
    } catch (e) {
      return fail(e);
    }
    if (isOver()) return finish();
    await botTurn();
  }

  async function botTurn() {
    busy = true;
    status.textContent = tr(`${botName} is thinking…`, `${botName} berpikir…`);
    draw();
    try {
      const fenBefore = chess.fen();
      const uci = await engine.botMove(fenBefore, level.skill, level.movetime);
      if (destroyed) return;
      const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci[4] ? { promotion: uci[4] } : {}) });
      last = [m.from, m.to];
      draw();
      if (!guided) {
        persist();
        if (isOver()) return finish();
        busy = false;
        status.textContent = '';
        draw();
        return;
      }
      // langkah bot: lewati pencarian MultiPV untuk 'Hebat' agar balasan tidak tertunda
      const a = await analyzer.analyseMove(fenBefore, m.after, m.san, uciOf(m), chess.history().length, false);
      if (destroyed) return;
      analyses.push(a);
      evalBar.set(a.evalAfter);
      botLine.replaceChildren(`${botName}: ${a.san} `, badge(a.classification));
      persist();
    } catch (e) {
      return fail(e);
    }
    if (isOver()) return finish();
    busy = false;
    draw();
  }

  async function showHint() {
    if (busy || isOver()) return;
    busy = true;
    draw();
    try {
      const line = await analyzer.evaluate(chess.fen());
      if (destroyed) return;
      const u = line.bestMoveUci;
      hint = [u.slice(0, 2), u.slice(2, 4)];
      const san = new Chess(chess.fen()).move({ from: hint[0], to: hint[1], ...(u[4] ? { promotion: u[4] } : {}) }).san;
      cardBox.replaceChildren(h('div', { class: 'card' }, h('strong', {}, tr(`Engine hint: ${san}`, `Saran engine: ${san}`)), h('p', { class: 'muted' }, tr('The from and to squares are highlighted on the board.', 'Petak asal dan tujuan ditandai di papan.'))));
    } catch (e) {
      return fail(e);
    }
    busy = false;
    draw();
  }

  function undo() {
    if (busy || isOver()) return;
    const n = chess.history().length;
    const count = chess.turn() === player ? 2 : 1;
    if (n < count + (player === 'b' ? 1 : 0)) return;
    for (let i = 0; i < count; i++) { chess.undo(); analyses.pop(); }
    last = null; hint = null;
    cardBox.replaceChildren(analysisCard(null, { title: tr('Move taken back. Try another move!', 'Langkah diulang. Coba langkah lain!') }));
    botLine.replaceChildren();
    const lastA = analyses[analyses.length - 1];
    evalBar.set(lastA ? lastA.evalAfter : { cp: 0, mate: null });
    persist();
    draw();
  }

  function resign() {
    if (busy || isOver() || !confirm(tr('Resign and end the game?', 'Menyerah dan akhiri partai?'))) return;
    resigned = player === 'w' ? '0-1' : '1-0';
    finish();
  }

  function fail(e: unknown) {
    console.error(e);
    busy = true;
    status.textContent = tr('Engine problem. Please reload the page.', 'Engine bermasalah. Muat ulang halaman.');
    cardBox.replaceChildren(h('div', { class: 'card cls-blunder' }, `Error: ${(e as Error).message}`));
  }

  const el = gameLayout(
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, tr(`Learn · ${botName}`, `Belajar · ${botName}`))),
    [guided ? boardWithBar(evalBar.el, board.el) : board.el, status],
    guided
      ? [cardBox, botLine, h('div', { class: 'row' }, hintBtn, undoBtn, resignBtn), endBox, moves.el]
      : [h('div', { class: 'row' }, undoBtn, resignBtn), endBox, moves.el],
  );

  (async () => {
    draw();
    try {
      await engineReady();
    } catch (e) {
      return fail(e);
    }
    if (destroyed) return;
    if (chess.turn() !== player) await botTurn();
    else { busy = false; status.textContent = ''; draw(); }
  })();

  return { el, destroy: () => { destroyed = true; } };
}
