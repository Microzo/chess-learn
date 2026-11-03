import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { CATEGORY_LABEL, CATEGORY_ORDER, GLOSSARY, LESSONS, type Demo, type Lesson } from '../../data/lessons';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { homeScreen } from '../../ui/screens/home';
import { puzzleList, solvedCount } from './puzzles';
import { PUZZLES } from '../../data/puzzles';
import { PracticeSession, type Side } from './practice-core';

const DONE_KEY = 'chess-learn:lessons-done';

function loadDone(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveDone(done: Set<string>) {
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...done])); } catch { /* penyimpanan tidak tersedia */ }
}

/** Posisi demo setelah `n` langkah; dibangun dari awal agar riwayat (untuk animasi/suara) tersedia. */
function positionAt(demo: Demo, n: number): Chess {
  const chess = new Chess(demo.fen);
  for (let i = 0; i < n; i++) {
    const san = demo.steps[i]?.san;
    if (san) chess.move(san);
  }
  return chess;
}

export function lessonList(): Screen {
  const done = loadDone();
  const total = LESSONS.length;

  const sections = CATEGORY_ORDER.map((cat) => {
    const info = CATEGORY_LABEL[cat];
    const items = LESSONS.filter((l) => l.category === cat);
    return h('section', { class: 'lesson-cat' },
      h('h3', {}, `${info.icon} ${info.title}`),
      h('small', {}, info.sub),
      h('div', { class: 'list' }, ...items.map((l) =>
        h('div', { class: 'item' },
          h('button', { class: 'item-main', onclick: () => go(() => lessonScreen(l.id)) },
            h('strong', {}, `${done.has(l.id) ? '✔ ' : ''}${l.title}`),
            h('small', {}, l.summary))))));
  });

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': 'Kembali', onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, 'Belajar Strategi')),
    h('p', { class: 'muted' }, `${done.size} dari ${total} pelajaran selesai. Semua materi bisa dibaca offline.`),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: () => go(puzzleList) }, `🧩 Latihan taktik (${solvedCount()}/${PUZZLES.length})`),
      h('button', { class: 'btn', onclick: () => go(glossaryScreen) }, '📖 Glosarium')),
    ...sections,
  );
  return { el };
}

export function lessonScreen(id: string): Screen {
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) return lessonList();
  const idx = LESSONS.indexOf(lesson);
  const next: Lesson | undefined = LESSONS[idx + 1];
  const done = loadDone();

  const el = h('div', { class: 'screen lesson' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': 'Kembali', onclick: () => go(lessonList) }, '←'),
      h('h2', {}, lesson.title)),
    h('small', {}, `${CATEGORY_LABEL[lesson.category].icon} ${CATEGORY_LABEL[lesson.category].title}`),
  );

  let cleanup: (() => void) | undefined;
  if (lesson.demo) {
    el.append(demoPlayer(lesson.demo));
    if (lesson.category === 'opening' && lesson.demo.steps.some((st) => st.san)) {
      const p = practicePanel(lesson.demo);
      cleanup = p.destroy;
      el.append(p.el);
    }
  }

  el.append(
    h('div', { class: 'lesson-text' }, ...lesson.body.map((p) => h('p', {}, p))),
    h('div', { class: 'card' },
      h('strong', {}, 'Poin penting'),
      h('ul', { class: 'points' }, ...lesson.points.map((p) => h('li', {}, p)))),
  );

  const doneBtn = h('button', { class: 'btn' });
  const paint = () => {
    doneBtn.textContent = done.has(lesson.id) ? '✔ Selesai (ketuk untuk batal)' : 'Tandai selesai';
    doneBtn.classList.toggle('primary', !done.has(lesson.id));
  };
  doneBtn.onclick = () => {
    if (done.has(lesson.id)) done.delete(lesson.id); else done.add(lesson.id);
    saveDone(done);
    paint();
  };
  paint();

  el.append(
    h('div', { class: 'row' },
      doneBtn,
      next && h('button', { class: 'btn', onclick: () => go(() => lessonScreen(next.id)) }, 'Pelajaran berikutnya →')),
  );
  return { el, destroy: () => cleanup?.() };
}

function demoPlayer(demo: Demo): HTMLElement {
  let n = 0; // jumlah langkah yang sudah dimainkan (0 = posisi awal)
  let flip = !!demo.flip;
  const total = demo.steps.length;

  const board = new Board(() => undefined);
  const note = h('div', { class: 'card demo-note' });
  const counter = h('small', { class: 'demo-counter' });
  const prev = h('button', { class: 'btn', 'aria-label': 'Langkah sebelumnya', onclick: () => step(-1) }, '◀');
  const nextBtn = h('button', { class: 'btn primary', 'aria-label': 'Langkah berikutnya', onclick: () => step(1) }, '▶');
  const reset = h('button', { class: 'btn', onclick: () => { n = 0; show(); } }, '⟲ Ulang');
  const flipBtn = h('button', { class: 'btn', 'aria-label': 'Balik papan', onclick: () => { flip = !flip; show(); } }, '⇅');

  function step(d: number) {
    n = Math.min(total, Math.max(0, n + d));
    show();
  }

  function show() {
    const chess = positionAt(demo, n);
    const cur = n > 0 ? demo.steps[n - 1] : undefined;
    const lastMove = cur?.san ? chess.history({ verbose: true }).at(-1) : undefined;
    board.set(chess, {
      flip,
      movable: null,
      last: lastMove ? [lastMove.from, lastMove.to] : null,
      hint: (cur ? cur.hint : demo.hint) ?? null,
    });
    note.replaceChildren(
      ...(cur?.san ? [h('strong', {}, cur.san)] : []),
      h('p', {}, cur ? cur.note : demo.intro),
    );
    counter.textContent = total ? `Langkah ${n} dari ${total}` : '';
    prev.toggleAttribute('disabled', n === 0);
    nextBtn.toggleAttribute('disabled', n === total);
  }
  show();

  return h('div', { class: 'demo' },
    board.el,
    counter,
    note,
    total > 0
      ? h('div', { class: 'row nav' }, reset, prev, nextBtn, flipBtn)
      : h('div', { class: 'row nav' }, flipBtn),
  );
}

export function glossaryScreen(): Screen {
  const listBox = h('div', { class: 'list' });
  const search = h('input', { type: 'search', placeholder: 'Cari istilah…', 'aria-label': 'Cari istilah' }) as HTMLInputElement;

  const render = () => {
    const q = search.value.trim().toLowerCase();
    const rows = GLOSSARY.filter((g) => !q || g.term.toLowerCase().includes(q) || (g.en ?? '').toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, 'id'));
    listBox.replaceChildren(
      ...(rows.length === 0
        ? [h('p', { class: 'muted' }, 'Istilah tidak ditemukan.')]
        : rows.map((g) =>
            h('div', { class: 'card gloss' },
              h('strong', {}, g.term, g.en && g.en.toLowerCase() !== g.term.toLowerCase() ? h('small', {}, ` · ${g.en}`) : null),
              h('p', {}, g.def)))),
    );
  };
  search.addEventListener('input', render);
  render();

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': 'Kembali', onclick: () => go(lessonList) }, '←'),
      h('h2', {}, 'Glosarium')),
    h('div', { class: 'field' }, search),
    listBox,
  );
  return { el };
}

/** Latihan: pemain memainkan satu sisi dari teori, lawan dimainkan otomatis. */
function practicePanel(demo: Demo): { el: HTMLElement; destroy: () => void } {
  let session: PracticeSession | null = null;
  let timer: number | undefined;
  let last: [string, string] | null = null;
  let hint: string[] | null = null;
  let busy = false;

  const board = new Board((from, to, promo) => attempt(from, to, promo));
  const feedback = h('div', { class: 'card demo-note' });
  const progress = h('small', { class: 'demo-counter' });
  const body = h('div', { class: 'practice-body' });
  const box = h('details', { class: 'practice' }, h('summary', {}, '🎯 Latih sendiri'), body);

  function menu() {
    window.clearTimeout(timer);
    session = null;
    body.replaceChildren(
      h('p', { class: 'muted' }, 'Mainkan teori ini sendiri: pilih sisi, lalu temukan langkah yang benar. Lawan membalas otomatis.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => start('w') }, 'Main sebagai Putih'),
        h('button', { class: 'btn primary', onclick: () => start('b') }, 'Main sebagai Hitam')),
    );
  }

  function start(side: Side) {
    window.clearTimeout(timer);
    session = new PracticeSession(demo, side);
    last = null; hint = null; busy = false;
    feedback.replaceChildren(h('p', {}, `Anda ${side === 'w' ? 'Putih' : 'Hitam'}. ${demo.intro}`));
    body.replaceChildren(board.el, progress, feedback, actions);
    draw();
    scheduleOpponent();
  }

  const hintBtn = h('button', { class: 'btn', onclick: () => showHint() }, '💡 Petunjuk');
  const againBtn = h('button', { class: 'btn', onclick: () => session && start(session.side) }, '⟲ Ulangi');
  const backBtn = h('button', { class: 'btn', onclick: () => menu() }, 'Ganti sisi');
  const actions = h('div', { class: 'row' });

  function draw() {
    const s = session!;
    board.set(s.chess, { flip: s.side === 'b', last, hint, movable: busy || s.finished ? null : s.side });
    const done = s.demo.steps.filter((_, i) => i < s.step).length;
    progress.textContent = `Langkah ${done} dari ${s.total}${s.mistakes ? ` · ${s.mistakes} kesalahan` : ''}`;
    actions.replaceChildren(...(s.finished ? [againBtn, backBtn] : [hintBtn, againBtn, backBtn]));
  }

  function scheduleOpponent() {
    const s = session!;
    if (!s.opponentToMove) { busy = false; draw(); return; }
    busy = true;
    draw();
    timer = window.setTimeout(() => {
      const m = s.playOpponent();
      if (m) { last = [m.from, m.to]; hint = null; feedback.replaceChildren(h('strong', {}, m.san), h('p', {}, m.note)); }
      busy = false;
      if (s.finished) finish(); else draw();
    }, 500);
  }

  function finish() {
    const s = session!;
    draw();
    feedback.append(h('p', {}, s.mistakes === 0
      ? '✔ Sempurna! Teori dimainkan tanpa kesalahan.'
      : `Selesai dengan ${s.mistakes} kesalahan. Ulangi sampai lancar.`));
  }

  function attempt(from: string, to: string, promo?: string) {
    const s = session;
    if (!s || busy || s.finished) return;
    const r = s.tryMove(from, to, promo);
    if (r.result === 'illegal' || r.result === 'blocked') { draw(); return; }
    if (r.result === 'wrong') {
      hint = null;
      feedback.replaceChildren(h('strong', {}, 'Bukan langkah teori'), h('p', {}, 'Langkah itu legal, tetapi bukan yang dimainkan di variasi ini. Coba lagi atau minta petunjuk.'));
      draw();
      return;
    }
    last = [from, to];
    hint = null;
    const san = s.chess.history().at(-1) ?? '';
    feedback.replaceChildren(h('strong', {}, `✔ ${san}`), h('p', {}, r.note ?? ''));
    if (s.finished) { finish(); return; }
    scheduleOpponent();
  }

  function showHint() {
    const e = session?.expected();
    if (!e) return;
    hint = [e.from];
    feedback.replaceChildren(h('strong', {}, 'Petunjuk'), h('p', {}, 'Gerakkan buah yang disorot.'));
    draw();
  }

  menu();
  return { el: box, destroy: () => window.clearTimeout(timer) };
}
