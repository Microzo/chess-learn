import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { CATEGORY_LABEL, CATEGORY_ORDER, GLOSSARY, LESSONS, type Demo, type Lesson } from '../../data/lessons';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { homeScreen } from '../../ui/screens/home';

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
    h('button', { class: 'btn', onclick: () => go(glossaryScreen) }, '📖 Glosarium istilah catur'),
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

  if (lesson.demo) el.append(demoPlayer(lesson.demo));

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
  return { el };
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
