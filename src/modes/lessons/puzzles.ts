import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { PUZZLES, type Puzzle } from '../../data/puzzles';
import { Board } from '../../ui/board/board';
import { tr } from '../../core/i18n';
import { puzzleView } from '../../data/localize';
import { h } from '../../ui/dom';
import { gameLayout } from '../../ui/layout';
import { lessonList } from './lessons';

const SOLVED_KEY = 'chess-learn:puzzles-solved';

function loadSolved(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(SOLVED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveSolved(s: Set<string>) {
  try { localStorage.setItem(SOLVED_KEY, JSON.stringify([...s])); } catch { /* penyimpanan tidak tersedia */ }
}

export function solvedCount(): number {
  const s = loadSolved();
  return PUZZLES.filter((p) => s.has(p.id)).length;
}

export function puzzleList(): Screen {
  const solved = loadSolved();
  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(lessonList) }, '←'),
      h('h2', {}, tr('Tactics practice', 'Latihan taktik'))),
    h('p', { class: 'muted' }, tr(
      `${PUZZLES.filter((p) => solved.has(p.id)).length} of ${PUZZLES.length} puzzles solved. Find the best move; every puzzle has a hint.`,
      `${PUZZLES.filter((p) => solved.has(p.id)).length} dari ${PUZZLES.length} puzzle terpecahkan. Temukan langkah terbaik; tiap puzzle punya petunjuk.`)),
    h('div', { class: 'list' }, ...PUZZLES.map(puzzleView).map((p) =>
      h('div', { class: 'item' },
        h('button', { class: 'item-main', onclick: () => go(() => puzzleScreen(p.id)) },
          h('strong', {}, `${solved.has(p.id) ? '✔ ' : ''}${p.title}`),
          h('small', {}, p.theme))))),
  );
  return { el };
}

function build(p: Puzzle): Chess {
  const chess = new Chess(p.fen);
  for (const m of p.setup ?? []) chess.move(m);
  return chess;
}

export function puzzleScreen(id: string): Screen {
  const base = PUZZLES.find((p) => p.id === id);
  if (!base) return puzzleList();
  const pz: Puzzle = puzzleView(base);
  const nextBase: Puzzle | undefined = PUZZLES[PUZZLES.indexOf(base) + 1];
  const nextPuzzle: Puzzle | undefined = nextBase ? puzzleView(nextBase) : undefined;
  const solved = loadSolved();

  let chess = build(pz);
  const side = chess.turn();
  let step = 0; // indeks langkah solusi yang harus dimainkan pemain
  let finished = false;
  let usedHelp = false;
  let busy = false; // balasan lawan sedang menunggu
  let hintSq: string[] | null = null;
  let last: [string, string] | null = null;
  let timer: number | undefined;

  const board = new Board((from, to, promo) => attempt(from, to, promo));
  const feedback = h('div', { class: 'card demo-note' });
  const hintBtn = h('button', { class: 'btn', onclick: () => showHint() }, tr('💡 Hint', '💡 Petunjuk'));
  const answerBtn = h('button', { class: 'btn', onclick: () => showAnswer() }, tr('👁 Show answer', '👁 Lihat jawaban'));
  const retryBtn = h('button', { class: 'btn', onclick: () => reset() }, tr('⟲ Retry', '⟲ Ulangi'));
  const nextBtn = h('button', { class: 'btn primary', onclick: () => nextPuzzle && go(() => puzzleScreen(nextPuzzle.id)) }, tr('Next puzzle →', 'Puzzle berikutnya →'));
  const actions = h('div', { class: 'row' });

  function say(text: string, strong?: string) {
    feedback.replaceChildren(...(strong ? [h('strong', {}, strong)] : []), h('p', {}, text));
  }

  function draw() {
    board.set(chess, { flip: side === 'b', last, hint: hintSq, movable: finished || busy ? null : side });
    actions.replaceChildren(
      ...(finished ? [retryBtn, ...(nextPuzzle ? [nextBtn] : [])] : [hintBtn, answerBtn, retryBtn]),
    );
  }

  function reset() {
    window.clearTimeout(timer);
    chess = build(pz);
    step = 0; finished = false; busy = false; hintSq = null; last = null; // usedHelp tetap sepanjang sesi
    say(tr(`${side === 'w' ? 'White' : 'Black'} to move. Find the best move.`, `${side === 'w' ? 'Putih' : 'Hitam'} jalan. Temukan langkah terbaik.`), pz.theme);
    draw();
  }

  function finish(msg: string) {
    finished = true;
    hintSq = null;
    if (!usedHelp) { solved.add(pz.id); saveSolved(solved); }
    say(`${msg} ${pz.explanation}`, usedHelp ? tr('Done (with help)', 'Selesai (dengan bantuan)') : tr('✔ Correct!', '✔ Benar!'));
    draw();
  }

  function attempt(from: string, to: string, promo?: string) {
    if (finished || busy) return;
    let m;
    try {
      m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) });
    } catch {
      draw();
      return;
    }
    const expected = pz.solution[step];
    const isAlt = step === 0 && !!pz.alts?.includes(m.san);
    const ok = m.san === expected || isAlt || chess.isCheckmate();
    if (!ok) {
      chess.undo();
      hintSq = null;
      say(tr('Not the best move in this position. Try again, or ask for a hint.', 'Bukan langkah terbaik di posisi ini. Coba lagi, atau minta petunjuk.'), tr('Not quite', 'Belum tepat'));
      draw();
      return;
    }
    last = [m.from, m.to];
    hintSq = null;
    step++;
    if (isAlt || chess.isGameOver() || step >= pz.solution.length) {
      draw();
      finish(isAlt ? tr('This alternative move also wins.', 'Langkah alternatif ini juga menang.') : tr('Puzzle complete.', 'Puzzle selesai.'));
      return;
    }
    // balasan lawan (sudah ditentukan dalam solusi)
    busy = true;
    say(tr('Nice! The opponent replies…', 'Bagus! Lawan membalas…'), tr('Correct', 'Benar'));
    draw();
    timer = window.setTimeout(() => {
      const reply = chess.move(pz.solution[step]!);
      last = [reply.from, reply.to];
      hintSq = null;
      step++;
      busy = false;
      if (step >= pz.solution.length || chess.isGameOver()) {
        draw();
        finish(tr('Puzzle complete.', 'Puzzle selesai.'));
      } else {
        say(tr('Keep going: find the next move.', 'Lanjutkan: temukan langkah berikutnya.'), tr('Correct', 'Benar'));
        draw();
      }
    }, 450);
  }

  function showHint() {
    usedHelp = true;
    const from = firstSquare();
    hintSq = from ? [from] : null;
    say(pz.hint, tr('Hint', 'Petunjuk'));
    draw();
  }

  /** Kotak asal langkah solusi berikutnya. */
  function firstSquare(): string | null {
    const g = new Chess(chess.fen());
    try {
      return g.move(pz.solution[step]!).from;
    } catch {
      return null;
    }
  }

  function showAnswer() {
    usedHelp = true;
    const rest = pz.solution.slice(step);
    say(tr(`Answer: ${rest.join('  ')}`, `Jawaban: ${rest.join('  ')}`), tr('Answer', 'Jawaban'));
    const from = firstSquare();
    hintSq = from ? [from] : null;
    draw();
  }

  const el = gameLayout(
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(puzzleList) }, '←'),
      h('h2', {}, pz.title)),
    [board.el],
    [feedback, actions],
  );
  reset();
  return { el, destroy: () => window.clearTimeout(timer) };
}
