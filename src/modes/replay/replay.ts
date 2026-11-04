import { Chess } from 'chess.js';
import { go, type Screen } from '../../app/router';
import { accuracyOf, classCounts, CLASS_LABEL } from '../../core/analysis/analyzer';
import { explainMove } from '../../core/analysis/explain';
import { openingAt } from '../../core/analysis/openings';
import { engineReady, getAnalyzer } from '../../core/engine/instance';
import { deleteGame, exportBackup, getGame, importBackup, listGames, newId, saveGame } from '../../core/storage/games';
import type { Evaluation, MoveAnalysis, MoveClass, SavedGame } from '../../types';
import { Board } from '../../ui/board/board';
import { tr } from '../../core/i18n';
import { h } from '../../ui/dom';
import { boardWithBar, gameLayout } from '../../ui/layout';
import { copyText, downloadText, localDate, safeFilename } from '../../ui/download';
import { analysisCard, badge, deepCard, EvalBar, evalGraph, MoveList } from '../../ui/panels/panels';
import { homeScreen } from '../../ui/screens/home';

const MODE_LABEL = {
  get learning() { return tr('Learn', 'Belajar'); },
  pvp: 'PvP',
  get import() { return tr('Import', 'Impor'); },
};
const MAX_PGN = 200_000;
/** Header PGN memakai "?" untuk nama yang tidak diketahui. */
const named = (v: string | null | undefined, fallback: string) => (v && v.trim() && v.trim() !== '?' ? v : fallback);
const SHOWN: MoveClass[] = ['book', 'brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];

export function replayList(): Screen {
  const listBox = h('div', { class: 'list' });
  const pgnBox = h('textarea', { rows: '5', placeholder: tr('Paste PGN here…', 'Tempel PGN di sini…') }) as HTMLTextAreaElement;

  const render = () => {
    const games = listGames();
    listBox.replaceChildren(
      ...(games.length === 0
        ? [h('p', { class: 'muted' }, tr('No saved games yet. Play a game or import a PGN.', 'Belum ada partai tersimpan. Mainkan satu partai atau impor PGN.'))]
        : games.map((g) =>
            h('div', { class: 'item' },
              h('button', { class: 'item-main', onclick: () => go(() => replayScreen(g.id)) },
                h('strong', {}, `${g.white} vs ${g.black}`),
                h('small', {}, `${MODE_LABEL[g.mode]} · ${g.result} · ${new Date(g.createdAt).toLocaleString('id-ID')}${g.analysis ? tr(' · ✔ analysed', ' · ✔ teranalisa') : ''}`)),
              h('button', { class: 'btn ghost', 'aria-label': tr('Delete', 'Hapus'), onclick: () => { if (confirm(tr('Delete this game?', 'Hapus partai ini?'))) { deleteGame(g.id); render(); } } }, '🗑')))),
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
        white: named(hd['White'], tr('White', 'Putih')), black: named(hd['Black'], tr('Black', 'Hitam')),
        pgn: c.pgn(), result: (hd['Result'] as SavedGame['result']) || '*',
      });
      go(() => replayScreen(id));
    } catch {
      alert(tr('Invalid PGN.', 'PGN tidak valid.'));
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
      alert(tr(`${n} game(s) restored.`, `${n} partai dipulihkan.`));
    } catch (e) {
      alert((e as Error).message);
    }
  };
  const backup = () => {
    if (listGames().length === 0) { alert(tr('No games to back up yet.', 'Belum ada partai untuk dicadangkan.')); return; }
    downloadText(`${tr('chess-learn-backup', 'chess-learn-cadangan')}-${localDate()}.json`, exportBackup(), 'application/json');
  };

  const el = h('div', { class: 'screen' },
    h('header', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go(homeScreen) }, '←'), h('h2', {}, tr('Replay & Analysis', 'Replay & Analisa'))),
    listBox,
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: backup }, tr('⬇ Back up all', '⬇ Cadangkan semua')), h('button', { class: 'btn', onclick: () => fileIn.click() }, tr('⬆ Restore', '⬆ Pulihkan')), fileIn),
    h('details', {}, h('summary', {}, tr('Import PGN', 'Impor PGN')), pgnBox, h('button', { class: 'btn', onclick: importPgn }, tr('Import', 'Impor'))),
  );
  return { el };
}

export function replayScreen(id: string): Screen {
  const game = getGame(id);
  if (!game) return replayList();
  return replayView(game, { back: replayList, persist: true });
}

export interface ReplayOptions {
  /** layar tujuan tombol kembali */
  back: () => Screen;
  /** true: hasil analisa disimpan ke partai tersimpan. false: hanya di memori (mis. partai bawaan). */
  persist: boolean;
  /** catatan per langkah, kunci = nomor ply (1 = langkah pertama Putih) */
  notes?: Record<number, string>;
  /** kartu pengantar di bagian atas kolom info */
  intro?: Node;
}

/** Penampil replay untuk satu partai: papan, navigasi, analisa engine, dan (opsional) catatan per langkah. */
export function replayView(game: SavedGame, opts: ReplayOptions): Screen {
  const { notes } = opts;

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
  let deep = false;
  let deepToken = 0;

  const board = new Board(() => undefined);
  const deepBox = h('div', { class: 'cardbox' });
  const deepBtn = h('button', { class: 'btn', 'aria-pressed': 'false', onclick: () => { deep = !deep; show(); } }, tr('🔍 Deep', '🔍 Mendalam'));
  const evalBar = new EvalBar();
  const cardBox = h('div', { class: 'cardbox' });
  const summary = h('div', { class: 'card summary' });
  const graphBox = h('div', { class: 'graphbox' });
  const opening = h('div', { class: 'opening' });
  const progress = h('div', { class: 'muted' });
  const moves = new MoveList((ply) => { idx = ply; show(); });
  const bestBtn = h('button', { class: 'btn', onclick: () => { showBest = !showBest; show(); } }, '💡 Alt');
  const analyseBtn = h('button', { class: 'btn primary', onclick: () => void runAnalysis() }, tr('🔍 Analyse game', '🔍 Analisa partai'));

  const copyBtn = h('button', { class: 'btn', onclick: async () => {
    const ok = await copyText(game.pgn);
    copyBtn.textContent = ok ? tr('✔ Copied', '✔ Tersalin') : tr('Copy failed', 'Gagal menyalin');
    setTimeout(() => { copyBtn.textContent = tr('📋 Copy PGN', '📋 Salin PGN'); }, 1500);
  } }, tr('📋 Copy PGN', '📋 Salin PGN'));

  const analysis = (): MoveAnalysis[] => game!.analysis ?? [];

  const saveCopy = (ev: Event) => {
    const btn = ev.currentTarget as HTMLButtonElement;
    saveGame({ ...game, id: newId(), mode: 'import', createdAt: Date.now() });
    btn.textContent = tr('✔ Saved to Replay', '✔ Tersimpan di Replay');
    btn.disabled = true;
  };

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
      badge: !alt && cur && m ? { sq: m.to, cls: cur.classification } : null,
    });
    refreshDeep(cur);

    evalBar.set(cur ? cur.evalAfter : { cp: 0, mate: null });
    evalBar.setFlip(flip);
    evalBar.el.classList.toggle('idle', a.length === 0); // belum dianalisa: bar tidak menunjukkan apa-apa
    moves.render(sans, a, idx);

    if (idx === 0) cardBox.replaceChildren(h('div', { class: 'card muted' }, tr('Starting position.', 'Posisi awal.')));
    else if (cur) {
      cardBox.replaceChildren(analysisCard(cur));
      if (alt) cardBox.append(h('div', { class: 'card' }, h('strong', {}, tr(`Better alternative: ${cur.engineBest.san}`, `Alternatif lebih baik: ${cur.engineBest.san}`)), h('p', { class: 'muted' }, tr('The board shows the position before the move.', 'Papan menampilkan posisi sebelum langkah.'))));
    } else {
      cardBox.replaceChildren(h('div', { class: 'card muted' }, `${Math.ceil(idx / 2)}${idx % 2 ? '.' : '...'} ${sans[idx - 1]} ${tr('· run the analysis to see the evaluation.', '· jalankan analisa untuk melihat penilaian.')}`));
    }

    const note = notes?.[idx];
    if (note) {
      cardBox.append(h('div', { class: 'card note' }, h('strong', {}, tr('📝 Note', '📝 Catatan')), h('p', {}, note)));
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

  /** Analisa mendalam langkah saat ini; hasil lama dibuang bila pengguna sudah pindah langkah. */
  function refreshDeep(cur: MoveAnalysis | undefined) {
    const token = ++deepToken;
    deepBtn.classList.toggle('on', deep);
    deepBtn.setAttribute('aria-pressed', String(deep));
    deepBtn.toggleAttribute('disabled', !cur);
    if (!deep || !cur) { deepBox.replaceChildren(); return; }
    deepBox.replaceChildren(deepCard(null, { pending: true }));
    (async () => {
      try {
        await engineReady();
        const ex = await explainMove(cur, getAnalyzer());
        if (!destroyed && token === deepToken) deepBox.replaceChildren(deepCard(ex));
      } catch {
        if (token === deepToken) deepBox.replaceChildren();
      }
    })();
  }

  function renderSummary() {
    const a = analysis();
    analyseBtn.style.display = a.length ? 'none' : '';
    if (!a.length) { summary.replaceChildren(h('p', { class: 'muted' }, tr('Not analysed yet. Press "Analyse game" to see the quality of every move, accuracy and the evaluation graph.', 'Belum dianalisa. Tekan "Analisa partai" untuk melihat kualitas tiap langkah, akurasi, dan grafik evaluasi.'))); return; }
    const acc = game!.accuracy ?? accuracyOf(a);
    const col = (title: string, name: string, pct: number, side: 'w' | 'b') => {
      const counts = classCounts(a, side);
      return h('div', { class: 'sumcol' },
        h('small', {}, title), h('strong', {}, name),
        h('div', { class: 'acc' }, `${pct.toFixed(0)}%`),
        h('div', { class: 'counts' }, ...SHOWN.filter((c) => counts[c]).map((c) =>
          h('span', { class: 'cnt', title: CLASS_LABEL[c] }, badge(c, false), ` ${counts[c]}`))));
    };
    summary.replaceChildren(h('div', { class: 'sumgrid' }, col(tr('White', 'Putih'), game!.white, acc.white, 'w'), col(tr('Black', 'Hitam'), game!.black, acc.black, 'b')));
  }

  async function runAnalysis() {
    (analyseBtn as HTMLButtonElement).disabled = true;
    progress.textContent = tr('Loading engine…', 'Memuat engine…');
    try {
      await engineReady();
      const res = await getAnalyzer().analysePgn(game!.pgn, (d, t) => {
        if (!destroyed) progress.textContent = tr(`Analysing move ${d}/${t}…`, `Menganalisa langkah ${d}/${t}…`);
      });
      game!.analysis = res;
      game!.accuracy = accuracyOf(res);
      if (opts.persist) saveGame(game!);
      if (destroyed) return;
      progress.textContent = '';
      renderSummary();
      show();
    } catch (e) {
      progress.textContent = tr(`Analysis failed: ${(e as Error).message}`, `Gagal menganalisa: ${(e as Error).message}`);
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

  const el = gameLayout(
    h('header', { class: 'bar' },
      h('button', { class: 'btn ghost', 'aria-label': tr('Back', 'Kembali'), onclick: () => go(opts.back) }, '←'),
      h('h2', {}, `${game.white} vs ${game.black}`)),
    [opening, boardWithBar(evalBar.el, board.el)],
    [opts.intro ?? null, h('div', { class: 'row nav' },
      h('button', { class: 'btn', onclick: () => step(-999) }, '⏮'),
      h('button', { class: 'btn', onclick: () => step(-1) }, '◀'),
      h('button', { class: 'btn', onclick: () => step(1) }, '▶'),
      h('button', { class: 'btn', onclick: () => step(999) }, '⏭'),
      bestBtn, deepBtn,
      h('button', { class: 'btn', onclick: () => { flip = !flip; show(); } }, '⟲')),
    cardBox, deepBox, graphBox, summary, analyseBtn, progress, moves.el,
    h('div', { class: 'row' },
      copyBtn,
      opts.persist ? null : h('button', { class: 'btn', onclick: saveCopy }, tr('💾 Save to my Replay', '💾 Simpan ke Replay saya')),
      h('button', { class: 'btn', onclick: () => downloadText(`${safeFilename(`${game.white}-vs-${game.black}`)}.pgn`, game.pgn, 'application/x-chess-pgn') }, tr('⬇ Download PGN', '⬇ Unduh PGN')))],
  );

  renderSummary();
  show();
  return { el, destroy: () => { destroyed = true; document.removeEventListener('keydown', onKey); } };
}
