import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { accuracyOf, uciOf } from '../../core/analysis/analyzer';
import { BOT_LEVELS, type BotLevel } from '../../core/engine/levels';
import { engineReady, getAnalyzer, getEngine } from '../../core/engine/instance';
import { statusOf, toPgn, type Result } from '../../core/game/game';
import { newId, saveGame } from '../../core/storage/games';
import type { MoveAnalysis } from '../../types';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { analysisCard, badge, EvalBar, MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';
import { replayScreen } from '../replay/replay';

export function learningSetup(): Screen {
  let color: 'w' | 'b' | 'r' = 'w';
  let level = 3;

  const colorBtns = (['w', 'r', 'b'] as const).map((c) =>
    h('button', { class: 'chip', 'data-v': c, onclick: () => { color = c; sync(); } },
      c === 'w' ? '♔ Putih' : c === 'b' ? '♚ Hitam' : '🎲 Acak'),
  );
  const levelBtns = BOT_LEVELS.map((l) =>
    h('button', { class: 'chip', 'data-v': l.id, onclick: () => { level = l.id; sync(); } },
      h('b', {}, `${l.id}`), ` ${l.name} `, h('small', {}, l.hint)),
  );
  const sync = () => {
    colorBtns.forEach((b) => b.classList.toggle('on', b.dataset.v === color));
    levelBtns.forEach((b) => b.classList.toggle('on', b.dataset.v === String(level)));
  };
  sync();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, 'Belajar vs Bot')),
    h('p', { class: 'muted' }, 'Setiap langkahmu langsung dianalisa: opening, terbaik, bagus, kesalahan, blunder.'),
    h('h3', {}, 'Warna'), h('div', { class: 'chips' }, ...colorBtns),
    h('h3', {}, 'Level bot'), h('div', { class: 'chips' }, ...levelBtns),
    h('button', {
      class: 'btn primary big',
      onclick: () => {
        const p = color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
        go(() => learningGame(p, BOT_LEVELS.find((l) => l.id === level)!));
      },
    }, 'Mulai'),
  );
  return { el };
}

export function learningGame(player: 'w' | 'b', level: BotLevel): Screen {
  const chess = new Chess();
  const analyzer = getAnalyzer();
  const engine = getEngine();
  const id = newId();
  const createdAt = Date.now();
  const analyses: MoveAnalysis[] = [];
  const botName = `Bot ${level.name}`;

  let busy = true;
  let destroyed = false;
  let resigned: Result | null = null;
  let last: [string, string] | null = null;
  let hint: [string, string] | null = null;

  const board = new Board((f, t, p) => void playerMove(f, t, p));
  const evalBar = new EvalBar();
  const status = h('div', { class: 'status' }, 'Memuat engine…');
  const cardBox = h('div', { class: 'cardbox' }, analysisCard(null));
  const botLine = h('div', { class: 'botline muted' });
  const endBox = h('div', {});
  const moves = new MoveList();
  const hintBtn = h('button', { class: 'btn', onclick: () => void showHint() }, '💡 Saran');
  const undoBtn = h('button', { class: 'btn', onclick: () => undo() }, '↶ Ulangi');
  const resignBtn = h('button', { class: 'btn danger', onclick: () => resign() }, '🏳 Menyerah');

  const isOver = () => resigned !== null || statusOf(chess).over;

  function draw() {
    const over = isOver();
    board.set(chess, { last, hint, flip: player === 'b', movable: !busy && !over ? player : null });
    const n = chess.history().length;
    moves.render(chess.history(), analyses, n);
    const st = statusOf(chess);
    status.textContent = resigned ? 'Kamu menyerah.' : busy && !over ? status.textContent : st.text;
    for (const b of [hintBtn, undoBtn, resignBtn]) (b as HTMLButtonElement).disabled = busy || over;
  }

  function persist() {
    if (chess.history().length === 0) return;
    const result = resigned ?? statusOf(chess).result;
    saveGame({
      id, mode: 'learning', createdAt,
      white: player === 'w' ? 'Kamu' : botName,
      black: player === 'b' ? 'Kamu' : botName,
      pgn: toPgn(chess, player === 'w' ? 'Kamu' : botName, player === 'b' ? 'Kamu' : botName, result),
      result,
      analysis: analyses.slice(),
      accuracy: accuracyOf(analyses),
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
        h('strong', {}, resigned ? 'Kamu menyerah.' : statusOf(chess).text),
        h('p', {}, `Akurasimu: ${mine.toFixed(0)}%`),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => go(() => replayScreen(id)) }, 'Replay & analisa'),
          h('button', { class: 'btn', onclick: () => go(learningSetup) }, 'Main lagi'),
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
    status.textContent = 'Menganalisa…';
    cardBox.replaceChildren(analysisCard(null, { pending: true }));
    draw();
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
    status.textContent = `${botName} berpikir…`;
    draw();
    try {
      const fenBefore = chess.fen();
      const uci = await engine.botMove(fenBefore, level.skill, level.movetime);
      if (destroyed) return;
      const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci[4] ? { promotion: uci[4] } : {}) });
      last = [m.from, m.to];
      draw();
      const a = await analyzer.analyseMove(fenBefore, m.after, m.san, uciOf(m), chess.history().length);
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
      cardBox.replaceChildren(h('div', { class: 'card' }, h('strong', {}, `Saran engine: ${san}`), h('p', { class: 'muted' }, 'Petak asal dan tujuan ditandai di papan.')));
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
    cardBox.replaceChildren(analysisCard(null, { title: 'Langkah diulang. Coba langkah lain!' }));
    botLine.replaceChildren();
    const lastA = analyses[analyses.length - 1];
    evalBar.set(lastA ? lastA.evalAfter : { cp: 0, mate: null });
    persist();
    draw();
  }

  function resign() {
    if (busy || isOver() || !confirm('Menyerah dan akhiri partai?')) return;
    resigned = player === 'w' ? '0-1' : '1-0';
    finish();
  }

  function fail(e: unknown) {
    console.error(e);
    busy = true;
    status.textContent = 'Engine bermasalah. Muat ulang halaman.';
    cardBox.replaceChildren(h('div', { class: 'card cls-blunder' }, `Error: ${(e as Error).message}`));
  }

  const el = h('div', { class: 'screen game' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, `Belajar · ${botName}`)),
    evalBar.el, board.el, status, cardBox, botLine,
    h('div', { class: 'row' }, hintBtn, undoBtn, resignBtn),
    endBox, moves.el,
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
