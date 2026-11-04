import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { currentLang, tr } from '../../core/i18n';
import {
  EXAM_LEVELS, PASS_PERCENT, bestFor, exportProgress, importProgress, loadProgress, percent, questionStats,
  reachedLevel, recordExam, resetProgress, type ExamLevel,
} from '../../core/storage/progress';
import {
  BOARD_QUESTIONS, LEVEL_LABEL, MC_PER_EXAM, MC_QUESTIONS, TOPIC_LABEL, type McQuestion, type Pair, type Topic,
} from '../../data/exam';
import { puzzleView } from '../../data/localize';
import { PUZZLES, type Puzzle } from '../../data/puzzles';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { downloadText, localDate } from '../../ui/download';
import { gameLayout } from '../../ui/layout';
import { homeScreen } from '../../ui/screens/home';
import { lessonScreen } from '../lessons/lessons';

const t = (p: Pair) => (currentLang() === 'en' ? p[0] : p[1]);
export const levelName = (l: ExamLevel) => t(LEVEL_LABEL[l]);

export function shuffle<T>(xs: readonly T[], rnd: () => number = Math.random): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

type Q = { kind: 'mc'; q: McQuestion } | { kind: 'board'; id: string; pz: Puzzle };

/** Susunan soal satu ujian: MC_PER_EXAM soal teori acak + semua soal papan level itu, diacak urutannya. */
export function buildExam(level: ExamLevel, rnd: () => number = Math.random): Q[] {
  const mc = shuffle(MC_QUESTIONS.filter((q) => q.level === level), rnd).slice(0, MC_PER_EXAM).map((q): Q => ({ kind: 'mc', q }));
  const board = BOARD_QUESTIONS[level].map((id) => PUZZLES.find((p) => p.id === id)!).map((pz): Q => ({ kind: 'board', id: `p:${pz.id}`, pz }));
  return shuffle([...mc, ...board], rnd);
}

const qid = (q: Q) => (q.kind === 'mc' ? q.q.id : q.id);

/** id soal → topik, untuk statistik area lemah. */
function topicOf(id: string): Topic | null {
  if (id.startsWith('p:')) return 'tactics';
  return MC_QUESTIONS.find((q) => q.id === id)?.topic ?? null;
}

function barRow(label: string, pct: number | null, note = ''): HTMLElement {
  const fill = h('div', { class: 'bar-fill' });
  fill.style.width = `${pct ?? 0}%`;
  fill.classList.toggle('ok', pct !== null && pct >= PASS_PERCENT);
  return h('div', { class: 'meter-row' },
    h('span', { class: 'meter-label' }, label),
    h('div', { class: 'bar-track' }, fill),
    h('span', { class: 'meter-val' }, pct === null ? '–' : `${pct}%${note}`));
}

export function examHome(): Screen {
  const p = loadProgress();
  const reached = reachedLevel(p);

  const levelCards = EXAM_LEVELS.map((l) => {
    const best = bestFor(l, p);
    const tries = p.exams.filter((a) => a.level === l).length;
    return h('div', { class: 'card exam-level', 'data-level': l },
      h('div', { class: 'card-head' },
        h('strong', {}, levelName(l)),
        best !== null && best >= PASS_PERCENT ? h('span', { class: 'level level-pemula' }, tr('Passed', 'Lulus')) : null),
      h('small', { class: 'muted' }, best === null
        ? tr('Not taken yet', 'Belum diambil')
        : tr(`Best score ${best}% · ${tries} attempt(s)`, `Skor terbaik ${best}% · ${tries} percobaan`)),
      h('button', { class: 'btn primary', onclick: () => go(() => examRun(l)) }, best === null ? tr('Start exam', 'Mulai ujian') : tr('Take again', 'Ulangi ujian')));
  });

  // akurasi per topik dari seluruh riwayat
  const stats = questionStats(p);
  const byTopic = new Map<Topic, { asked: number; wrong: number }>();
  for (const [id, s] of Object.entries(stats)) {
    const tp = topicOf(id);
    if (!tp) continue;
    const cur = byTopic.get(tp) ?? { asked: 0, wrong: 0 };
    cur.asked += s.asked; cur.wrong += s.wrong;
    byTopic.set(tp, cur);
  }
  const topicRows = [...byTopic.entries()].map(([tp, s]) => barRow(t(TOPIC_LABEL[tp]), Math.round(((s.asked - s.wrong) / s.asked) * 100), ` (${s.asked})`));

  const recent = p.exams.slice(-8).reverse().map((a) => {
    const d = new Date(a.ts);
    return barRow(`${localDate(d)} · ${levelName(a.level)}`, percent(a), ` (${a.score}/${a.total})`);
  });

  const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': tr('Import progress file', 'Impor berkas progres') }) as HTMLInputElement;
  const note = h('p', { class: 'muted', role: 'status' });
  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    file.value = '';
    if (!f) return;
    try {
      const n = importProgress(await f.text());
      go(examHome);
      void n;
    } catch (e) {
      note.textContent = (e as Error).message;
    }
  });

  const el = h('div', { class: 'screen exam-home' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(homeScreen) }, '←'),
      h('h2', {}, tr('Exam & Progress', 'Ujian & Progres'))),
    h('p', { class: 'muted' }, tr(
      `Each exam mixes theory questions with board puzzles. Score ${PASS_PERCENT}% or more to pass a level. Results are stored on this device only.`,
      `Tiap ujian memadukan soal teori dan puzzle papan. Nilai ${PASS_PERCENT}% ke atas untuk lulus satu level. Hasil hanya tersimpan di perangkat ini.`)),
    h('div', { class: 'card level-now' },
      h('small', { class: 'muted' }, tr('Your current level', 'Levelmu saat ini')),
      h('strong', { class: 'level-now-name' }, reached ? levelName(reached) : tr('Not rated yet', 'Belum dinilai'))),
    h('div', { class: 'list exam-levels' }, ...levelCards),
    h('h3', {}, tr('Strengths and weak spots', 'Kekuatan dan titik lemah')),
    topicRows.length ? h('div', { class: 'meters' }, ...topicRows) : h('p', { class: 'muted' }, tr('Take an exam to see your accuracy by topic.', 'Ambil ujian untuk melihat akurasimu per topik.')),
    h('h3', {}, tr('Recent attempts', 'Percobaan terakhir')),
    recent.length ? h('div', { class: 'meters' }, ...recent) : h('p', { class: 'muted' }, tr('No attempts yet.', 'Belum ada percobaan.')),
    h('h3', {}, tr('Move your progress', 'Pindahkan progresmu')),
    h('p', { class: 'muted' }, tr(
      'There are no accounts, so progress lives in this browser. Export it to keep a copy or to continue on another device.',
      'Tidak ada akun, jadi progres tersimpan di browser ini. Ekspor untuk menyimpan salinan atau melanjutkan di perangkat lain.')),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => downloadText(`${tr('chess-learn-progress', 'chess-learn-progres')}-${localDate()}.json`, exportProgress(), 'application/json') }, tr('⬇ Export', '⬇ Ekspor')),
      h('button', { class: 'btn', onclick: () => file.click() }, tr('⬆ Import', '⬆ Impor')),
      h('button', {
        class: 'btn danger',
        onclick: () => { if (confirm(tr('Delete all exam history and endgame progress?', 'Hapus semua riwayat ujian dan progres endgame?'))) { resetProgress(); go(examHome); } },
      }, tr('Reset', 'Reset'))),
    file, note,
  );
  return { el };
}

interface Run {
  level: ExamLevel;
  qs: Q[];
  asked: string[];
  wrong: string[];
  score: number;
}

export function examRun(level: ExamLevel, qs: Q[] = buildExam(level)): Screen {
  const run: Run = { level, qs, asked: [], wrong: [], score: 0 };
  return examQuestion(run, 0);
}

const header = (title: string) =>
  h('header', { class: 'bar' },
    h('button', {
      class: 'btn ghost', 'aria-label': tr('Quit exam', 'Keluar ujian'),
      onclick: () => { if (confirm(tr('Quit the exam? This attempt will not be saved.', 'Keluar dari ujian? Percobaan ini tidak akan disimpan.'))) go(examHome); },
    }, '✕'),
    h('h2', {}, title));

function examQuestion(run: Run, i: number): Screen {
  if (i >= run.qs.length) return examResult(run);
  const q = run.qs[i]!;
  const title = `${levelName(run.level)} · ${i + 1}/${run.qs.length}`;
  const progress = h('div', { class: 'bar-track' }, (() => { const f = h('div', { class: 'bar-fill ok' }); f.style.width = `${(i / run.qs.length) * 100}%`; return f; })());
  const last = i === run.qs.length - 1;
  const nextBtn = (): HTMLElement => h('button', { class: 'btn primary', onclick: () => go(() => examQuestion(run, i + 1)) }, last ? tr('See result', 'Lihat hasil') : tr('Next question →', 'Pertanyaan berikutnya →'));

  const record = (ok: boolean) => {
    run.asked.push(qid(q));
    if (ok) run.score++; else run.wrong.push(qid(q));
  };

  if (q.kind === 'mc') {
    const mc = q.q;
    const order = shuffle([0, 1, 2, 3] as const);
    const feedback = h('div', {});
    let answered = false;
    const buttons = order.map((idx) =>
      h('button', {
        class: 'opt', 'data-idx': String(idx),
        onclick: () => {
          if (answered) return;
          answered = true;
          const ok = idx === mc.answer;
          record(ok);
          buttons.forEach((b, k) => {
            (b as HTMLButtonElement).disabled = true;
            if (order[k] === mc.answer) b.classList.add('right');
            else if (order[k] === idx) b.classList.add('wrong');
          });
          feedback.replaceChildren(h('div', { class: `card ${ok ? 'cls-best' : 'cls-blunder'}`, role: 'status' },
            h('strong', {}, ok ? tr('✔ Correct!', '✔ Benar!') : tr('✘ Not quite', '✘ Kurang tepat')),
            h('p', {}, t(mc.why))), nextBtn());
        },
      }, t(mc.options[idx]!)));
    return {
      el: h('div', { class: 'screen exam-q' }, header(title), progress,
        h('div', { class: 'card' }, h('strong', { class: 'exam-prompt' }, t(mc.q))),
        h('div', { class: 'opts' }, ...buttons), feedback),
    };
  }

  // soal papan: satu kesempatan, langkah pertama dinilai
  const pz = puzzleView(q.pz);
  const chess = new Chess(pz.fen);
  for (const m of pz.setup ?? []) chess.move(m);
  const side = chess.turn();
  const feedback = h('div', {});
  let done = false;
  const board = new Board((from, to, promo) => {
    if (done) return;
    let m;
    try { m = chess.move({ from, to, ...(promo ? { promotion: promo } : {}) }); } catch { board.set(chess, { flip: side === 'b', movable: side }); return; }
    done = true;
    const ok = m.san === pz.solution[0] || !!pz.alts?.includes(m.san) || chess.isCheckmate();
    record(ok);
    board.set(chess, { flip: side === 'b', last: [from, to], movable: null });
    feedback.replaceChildren(h('div', { class: `card ${ok ? 'cls-best' : 'cls-blunder'}`, role: 'status' },
      h('strong', {}, ok ? tr('✔ Correct!', '✔ Benar!') : tr(`✘ The best move was ${pz.solution[0]}`, `✘ Langkah terbaik: ${pz.solution[0]}`)),
      h('p', {}, pz.explanation)), nextBtn());
  });
  board.set(chess, { flip: side === 'b', movable: side });
  const el = gameLayout(header(title),
    [board.el],
    [progress,
      h('div', { class: 'card' },
        h('strong', { class: 'exam-prompt' }, tr(`${side === 'w' ? 'White' : 'Black'} to move: find the best move.`, `${side === 'w' ? 'Putih' : 'Hitam'} jalan: temukan langkah terbaik.`)),
        h('small', { class: 'muted' }, pz.theme)),
      feedback]);
  return { el };
}

function examResult(run: Run): Screen {
  const total = run.qs.length;
  const attempt = { ts: Date.now(), level: run.level, score: run.score, total, wrong: run.wrong.slice(), asked: run.asked.slice() };
  recordExam(attempt);
  const pct = percent(attempt);
  const ok = pct >= PASS_PERCENT;
  const idx = EXAM_LEVELS.indexOf(run.level);
  const nextLevel = EXAM_LEVELS[idx + 1];

  const missed = run.qs.filter((q) => run.wrong.includes(qid(q))).map((q) => {
    if (q.kind === 'mc') {
      return h('div', { class: 'card' },
        h('strong', {}, t(q.q.q)),
        h('p', {}, t(q.q.options[q.q.answer]!)),
        h('small', { class: 'muted' }, t(q.q.why)),
        h('button', { class: 'btn', onclick: () => go(() => lessonScreen(q.q.lesson)) }, tr('📖 Review the lesson', '📖 Pelajari lagi')));
    }
    const pz = puzzleView(q.pz);
    return h('div', { class: 'card' }, h('strong', {}, `${pz.title} (${pz.theme})`), h('p', {}, pz.solution[0]!), h('small', { class: 'muted' }, pz.explanation));
  });

  const el = h('div', { class: 'screen exam-result' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(examHome) }, '←'),
      h('h2', {}, tr('Exam result', 'Hasil ujian'))),
    h('div', { class: `card end ${ok ? 'cls-best' : 'cls-mistake'}` },
      h('strong', { class: 'score' }, `${run.score}/${total} · ${pct}%`),
      h('p', {}, ok
        ? tr(`You passed the ${levelName(run.level)} level!${nextLevel ? ` Try ${levelName(nextLevel)} next.` : ' You have cleared every level.'}`,
            `Kamu lulus level ${levelName(run.level)}!${nextLevel ? ` Coba ${levelName(nextLevel)} berikutnya.` : ' Semua level sudah kamu lewati.'}`)
        : tr(`Not passed yet (${PASS_PERCENT}% needed). Review the missed questions and try again.`,
            `Belum lulus (butuh ${PASS_PERCENT}%). Pelajari soal yang salah lalu coba lagi.`))),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: () => go(() => examRun(run.level)) }, tr('Retake', 'Ulangi')),
      ok && nextLevel ? h('button', { class: 'btn', onclick: () => go(() => examRun(nextLevel)) }, tr(`Start ${levelName(nextLevel)}`, `Mulai ${levelName(nextLevel)}`)) : null,
      h('button', { class: 'btn', onclick: () => go(examHome) }, tr('Progress', 'Progres'))),
    missed.length ? h('h3', {}, tr('Review your mistakes', 'Tinjau kesalahanmu')) : h('p', { class: 'muted' }, tr('No mistakes. Perfect!', 'Tidak ada yang salah. Sempurna!')),
    ...missed,
  );
  return { el };
}
