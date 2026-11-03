import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { accuracyOf, classCounts, CLASS_LABEL } from '../../core/analysis/analyzer';
import { openingAt } from '../../core/analysis/openings';
import { engineReady, getAnalyzer } from '../../core/engine/instance';
import { deleteGame, exportBackup, getGame, importBackup, listGames, newId, saveGame } from '../../core/storage/games';
import type { Evaluation, MoveAnalysis, MoveClass, SavedGame } from '../../types';
import { Board } from '../../ui/board/board';
import { h } from '../../ui/dom';
import { copyText, downloadText, localDate, safeFilename } from '../../ui/download';
import { analysisCard, badge, EvalBar, evalGraph, MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';

const MODE_LABEL = { learning: 'Belajar', pvp: 'PvP', import: 'Impor' } as const;
const MAX_PGN = 200_000;
const SHOWN: MoveClass[] = ['book', 'brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];

export function replayList(): Screen {
  const listBox = h('div', { class: 'list' });
  const pgnBox = h('textarea', { rows: '5', placeholder: 'Tempel PGN di sini…' }) as HTMLTextAreaElement;

  const render = () => {
    const games = listGames();
    listBox.replaceChildren(
      ...(games.length === 0
        ? [h('p', { class: 'muted' }, 'Belum ada partai tersimpan. Mainkan satu partai atau impor PGN.')]
        : games.map((g) =>
            h('div', { class: 'item' },
              h('button', { class: 'item-main', onclick: () => go(() => replayScreen(g.id)) },
                h('strong', {}, `${g.white} vs ${g.black}`),
                h('small', {}, `${MODE_LABEL[g.mode]} · ${g.result} · ${new Date(g.createdAt).toLocaleString('id-ID')}${g.analysis ? ' · ✔ teranalisa' : ''}`)),
              h('button', { class: 'btn ghost', 'aria-label': 'Hapus', onclick: () => { if (confirm('Hapus partai ini?')) { deleteGame(g.id); render(); } } }, '🗑')))),
    );
  };
  render();

  const importPgn = () => {
    try {
      const c = new Chess();
      if (pgnBox.value.length > MAX_PGN) throw new Error('terlalu besar');
      c.loadPgn(pgnBox.value);
      if (c.history().length === 0) throw new Error('kosong');
      const hd = c.getHeaders();
      const id = newId();
      saveGame({
        id, mode: 'import', createdAt: Date.now(),
        white: hd['White'] || 'Putih', black: hd['Black'] || 'Hitam',
        pgn: c.pgn(), result: (hd['Result'] as SavedGame['result']) || '*',
      });
      go(() => replayScreen(id));
    } catch {
      alert('PGN tidak valid.');
    }
  };

  const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true }) as HTMLInputElement;
  fileIn.onchange = async () => {
    const f = fileIn.files?.[0];
    fileIn.value = '';
    if (!f) return;
    try {
      const n = importBackup(await f.text());
      render();
      alert(`${n} partai dipulihkan.`);
    } catch (e) {
      alert((e as Error).message);
    }
  };
  const backup = () => {
    if (listGames().length === 0) { alert('Belum ada partai untuk dicadangkan.'); return; }
    downloadText(`chess-learn-cadangan-${localDate()}.json`, exportBackup(), 'application/json');
  };

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, 'Replay & Analisa')),
    listBox,
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: backup }, '⬇ Cadangkan semua'), h('button', { class: 'btn', onclick: () => fileIn.click() }, '⬆ Pulihkan'), fileIn),
    h('details', {}, h('summary', {}, 'Impor PGN'), pgnBox, h('button', { class: 'btn', onclick: importPgn }, 'Impor')),
  );
  return { el };
}

export function replayScreen(id: string): Screen {
  const game = getGame(id);
  if (!game) return replayList();

  const parser = new Chess();
  try {
    parser.loadPgn(game.pgn);
  } catch {
    return replayList(); // PGN tersimpan rusak: jangan membuat layar error
  }
  const verbose = parser.history({ verbose: true });
  const sans = verbose.map((m) => m.san);
  const fens = [verbose[0]?.before ?? new Chess().fen(), ...verbose.map((m) => m.after)];

  let idx = fens.length - 1;
  let showBest = false;
  let flip = false;
  let destroyed = false;

  const board = new Board(() => undefined);
  const evalBar = new EvalBar();
  const cardBox = h('div', { class: 'cardbox' });
  const summary = h('div', { class: 'card summary' });
  const graphBox = h('div', { class: 'graphbox' });
  const opening = h('div', { class: 'opening' });
  const progress = h('div', { class: 'muted' });
  const moves = new MoveList((ply) => { idx = ply; show(); });
  const bestBtn = h('button', { class: 'btn', onclick: () => { showBest = !showBest; show(); } }, '💡 Alt');
  const analyseBtn = h('button', { class: 'btn primary', onclick: () => void runAnalysis() }, '🔍 Analisa partai');

  const copyBtn = h('button', { class: 'btn', onclick: async () => {
    const ok = await copyText(game.pgn);
    copyBtn.textContent = ok ? '✔ Tersalin' : 'Gagal menyalin';
    setTimeout(() => { copyBtn.textContent = '📋 Salin PGN'; }, 1500);
  } }, '📋 Salin PGN');

  const analysis = (): MoveAnalysis[] => game!.analysis ?? [];

  function show() {
    const a = analysis();
    const cur: MoveAnalysis | undefined = idx > 0 ? a[idx - 1] : undefined;
    const alt = showBest && cur && cur.engineBest.uci && cur.engineBest.uci !== '(none)';
    // dibangun dari posisi awal agar riwayat tersedia: papan bisa menganimasikan dan berbunyi saat maju satu langkah
    let chess: Chess;
    if (alt) chess = new Chess(cur!.fenBefore);
    else {
      chess = new Chess(fens[0]!);
      for (let i = 0; i < idx; i++) chess.move(sans[i]!);
    }
    const m = idx > 0 ? verbose[idx - 1] : undefined;
    board.set(chess, {
      flip,
      movable: null,
      last: alt ? null : m ? [m.from, m.to] : null,
      hint: alt ? [cur!.engineBest.uci.slice(0, 2), cur!.engineBest.uci.slice(2, 4)] : null,
    });

    evalBar.set(cur ? cur.evalAfter : { cp: 0, mate: null });
    moves.render(sans, a, idx);

    if (idx === 0) cardBox.replaceChildren(h('div', { class: 'card muted' }, 'Posisi awal.'));
    else if (cur) {
      cardBox.replaceChildren(analysisCard(cur));
      if (alt) cardBox.append(h('div', { class: 'card' }, h('strong', {}, `Alternatif lebih baik: ${cur.engineBest.san}`), h('p', { class: 'muted' }, 'Papan menampilkan posisi sebelum langkah.')));
    } else {
      cardBox.replaceChildren(h('div', { class: 'card muted' }, `${Math.ceil(idx / 2)}${idx % 2 ? '.' : '...'} ${sans[idx - 1]} · jalankan analisa untuk melihat penilaian.`));
    }

    // nama opening dari posisi (tanpa engine)
    let op = undefined as ReturnType<typeof openingAt>;
    for (let i = idx; i >= 1 && !op; i--) op = openingAt(fens[i]!);
    opening.textContent = op ? `📖 ${op.eco} · ${op.name}` : '';

    bestBtn.toggleAttribute('disabled', a.length === 0 || idx === 0);
    bestBtn.classList.toggle('on', showBest);
    graphBox.replaceChildren();
    if (a.length) {
      const evals: Evaluation[] = [{ cp: 0, mate: null }, ...a.map((x) => x.evalAfter)];
      graphBox.append(evalGraph(evals, idx, (p) => { idx = p; show(); }));
    }
  }

  function renderSummary() {
    const a = analysis();
    analyseBtn.style.display = a.length ? 'none' : '';
    if (!a.length) { summary.replaceChildren(h('p', { class: 'muted' }, 'Belum dianalisa. Tekan "Analisa partai" untuk melihat kualitas tiap langkah, akurasi, dan grafik evaluasi.')); return; }
    const acc = game!.accuracy ?? accuracyOf(a);
    const col = (title: string, name: string, pct: number, side: 'w' | 'b') => {
      const counts = classCounts(a, side);
      return h('div', { class: 'sumcol' },
        h('small', {}, title), h('strong', {}, name),
        h('div', { class: 'acc' }, `${pct.toFixed(0)}%`),
        h('div', { class: 'counts' }, ...SHOWN.filter((c) => counts[c]).map((c) =>
          h('span', { class: 'cnt', title: CLASS_LABEL[c] }, badge(c, false), ` ${counts[c]}`))));
    };
    summary.replaceChildren(h('div', { class: 'sumgrid' }, col('Putih', game!.white, acc.white, 'w'), col('Hitam', game!.black, acc.black, 'b')));
  }

  async function runAnalysis() {
    (analyseBtn as HTMLButtonElement).disabled = true;
    progress.textContent = 'Memuat engine…';
    try {
      await engineReady();
      const res = await getAnalyzer().analysePgn(game!.pgn, (d, t) => {
        if (!destroyed) progress.textContent = `Menganalisa langkah ${d}/${t}…`;
      });
      game!.analysis = res;
      game!.accuracy = accuracyOf(res);
      saveGame(game!);
      if (destroyed) return;
      progress.textContent = '';
      renderSummary();
      show();
    } catch (e) {
      progress.textContent = `Gagal menganalisa: ${(e as Error).message}`;
      (analyseBtn as HTMLButtonElement).disabled = false;
    }
  }

  const step = (d: number) => { idx = Math.max(0, Math.min(fens.length - 1, idx + d)); show(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Home') step(-999);
    else if (e.key === 'End') step(999);
  };
  document.addEventListener('keydown', onKey);

  const el = h('div', { class: 'screen game' },
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', onclick: () => go(replayList) }, '←'),
      h('h2', {}, `${game.white} vs ${game.black}`)),
    opening, evalBar.el, board.el,
    h('div', { class: 'row nav' },
      h('button', { class: 'btn', onclick: () => step(-999) }, '⏮'),
      h('button', { class: 'btn', onclick: () => step(-1) }, '◀'),
      h('button', { class: 'btn', onclick: () => step(1) }, '▶'),
      h('button', { class: 'btn', onclick: () => step(999) }, '⏭'),
      bestBtn,
      h('button', { class: 'btn', onclick: () => { flip = !flip; show(); } }, '⟲')),
    cardBox, graphBox, summary, analyseBtn, progress, moves.el,
    h('div', { class: 'row' },
      copyBtn,
      h('button', { class: 'btn', onclick: () => downloadText(`${safeFilename(`${game.white}-vs-${game.black}`)}.pgn`, game.pgn, 'application/x-chess-pgn') }, '⬇ Unduh PGN')),
  );

  renderSummary();
  show();
  return { el, destroy: () => { destroyed = true; document.removeEventListener('keydown', onKey); } };
}
