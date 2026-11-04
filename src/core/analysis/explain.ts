import { Chess } from 'chess.js';
import type { EngineLine, Evaluation, MoveAnalysis } from '../../types';
import { tr } from '../i18n';
import { commentFor, type Analyzer } from './analyzer';
import { THRESHOLDS, winPercent } from './classifier';
import { bestCaptureGain, isSacrifice } from './tactics';

/** Penjelasan mendalam satu langkah: mengapa ia mendapat kategori dan skor tersebut. */
export interface Explanation {
  summary: string;
  points: string[];
  /** garis yang disukai engine dari posisi sebelum langkah (kosong bila sama dengan langkah dimainkan) */
  bestLine: string;
  /** lanjutan yang diperkirakan engine setelah langkah dimainkan */
  replyLine: string;
}

const PIECE: Record<string, readonly [string, string]> = {
  p: ['pawn', 'bidak'], n: ['knight', 'kuda'], b: ['bishop', 'gajah'], r: ['rook', 'benteng'], q: ['queen', 'ratu'], k: ['king', 'raja'],
};
const pieceName = (t: string) => tr(PIECE[t]?.[0] ?? 'piece', PIECE[t]?.[1] ?? 'bidak');
const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

const fmtEval = (e: Evaluation) => {
  if (e.mate !== null) return `${e.mate > 0 ? '+' : '-'}M${Math.abs(e.mate)}`;
  const cp = e.cp ?? 0;
  return `${cp >= 0 ? '+' : ''}${(cp / 100).toFixed(1)}`;
};

/** Garis UCI menjadi teks SAN bernomor, mis. "12.Nf3 Nc6 13.Bb5". Berhenti bila ada langkah ilegal. */
export function lineText(fen: string, ucis: string[], max = 5): string {
  const g = new Chess(fen);
  const out: string[] = [];
  let n = Number(fen.split(' ')[5]) || 1;
  for (let i = 0; i < Math.min(max, ucis.length); i++) {
    const u = ucis[i]!;
    const white = g.turn() === 'w';
    let m;
    try { m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), ...(u[4] ? { promotion: u[4] } : {}) }); } catch { break; }
    out.push(white ? `${n}.${m.san}` : i === 0 ? `${n}...${m.san}` : m.san);
    if (!white) n++;
  }
  return out.join(' ');
}

interface Feat { san: string; piece: string; captured?: string; promotion?: string; check: boolean; mate: boolean; castle: boolean; from: string; to: string }

function featuresOf(fen: string, uci: string): Feat | null {
  try {
    const m = new Chess(fen).move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci[4] ? { promotion: uci[4] } : {}) });
    return {
      san: m.san, piece: m.piece, from: m.from, to: m.to,
      ...(m.captured ? { captured: m.captured } : {}), ...(m.promotion ? { promotion: m.promotion } : {}),
      check: m.san.includes('+') || m.san.includes('#'), mate: m.san.includes('#'), castle: m.flags.includes('k') || m.flags.includes('q'),
    };
  } catch {
    return null;
  }
}

/** Ciri taktis sebuah langkah dalam bentuk frasa, mis. "memakan benteng, memberi skak". */
function describe(f: Feat): string {
  const parts: string[] = [];
  if (f.mate) parts.push(tr('delivers checkmate', 'memberi skakmat'));
  else if (f.check) parts.push(tr('gives check', 'memberi skak'));
  if (f.captured) parts.push(tr(`captures a ${pieceName(f.captured)}`, `memakan ${pieceName(f.captured)}`));
  if (f.promotion) parts.push(tr('promotes a pawn', 'mempromosikan bidak'));
  if (f.castle) parts.push(tr('castles to make the king safe', 'rokade untuk mengamankan raja'));
  return parts.join(', ');
}

const moverWinPct = (e: Evaluation, mover: 'w' | 'b') => (mover === 'w' ? winPercent(e) : 100 - winPercent(e));

/**
 * Susun penjelasan dari data yang sudah ada (murni, tanpa engine). `gap` = selisih peluang menang ke langkah
 * terbaik kedua, bila diketahui (hanya relevan untuk "Hebat").
 */
export function explainFrom(a: MoveAnalysis, before: EngineLine, after: EngineLine, gap: number | null = null): Explanation {
  const mover = (a.fenBefore.split(' ')[1] ?? 'w') as 'w' | 'b';
  const side = mover === 'w' ? tr('White', 'Putih') : tr('Black', 'Hitam');
  const wb = moverWinPct(a.evalBefore, mover);
  const wa = moverWinPct(a.evalAfter, mover);
  const loss = a.winLossPct;
  const pts: string[] = [];

  pts.push(tr(
    `Evaluation: ${fmtEval(a.evalBefore)} → ${fmtEval(a.evalAfter)}. ${side}'s win chance went from ${wb.toFixed(0)}% to ${wa.toFixed(0)}%${loss >= 0.5 ? ` (a loss of ${loss.toFixed(0)} points)` : ' (essentially unchanged)'}.`,
    `Evaluasi: ${fmtEval(a.evalBefore)} → ${fmtEval(a.evalAfter)}. Peluang menang ${side} berubah dari ${wb.toFixed(0)}% menjadi ${wa.toFixed(0)}%${loss >= 0.5 ? ` (turun ${loss.toFixed(0)} poin)` : ' (nyaris tidak berubah)'}.`));

  const playedBest = a.uci === a.engineBest.uci;
  switch (a.classification) {
    case 'book':
      pts.push(a.opening
        ? tr(`This is a known opening move (${a.opening.eco} ${a.opening.name}), so it is rated as theory regardless of the engine.`, `Ini langkah opening yang dikenal (${a.opening.eco} ${a.opening.name}), jadi dinilai sebagai teori terlepas dari engine.`)
        : tr('This position is in the opening book.', 'Posisi ini ada di buku opening.'));
      break;
    case 'brilliant': {
      const sac = isSacrifice(a.fenBefore, a.uci);
      pts.push(tr(
        `Brilliant needs three things: it is the engine's best move, it gives up material${sac ? ' (it does: a sacrifice of at least 3 points)' : ''}, and ${side} still keeps at least 50% win chance afterwards (${wa.toFixed(0)}%).`,
        `Brilian butuh tiga hal: langkah terbaik engine, mengorbankan material${sac ? ' (benar: pengorbanan minimal 3 poin)' : ''}, dan ${side} tetap punya peluang menang minimal 50% sesudahnya (${wa.toFixed(0)}%).`));
      break;
    }
    case 'great':
      pts.push(gap !== null
        ? tr(`Great marks a standout move: it is the best, and the next best alternative would be about ${gap.toFixed(0)} points worse in win chance.`, `Hebat menandai langkah yang menonjol: ia yang terbaik, dan alternatif terbaik berikutnya sekitar ${gap.toFixed(0)} poin lebih buruk dalam peluang menang.`)
        : tr('Great marks a standout move: the best move, with a much worse next best alternative (at least 20 points).', 'Hebat menandai langkah yang menonjol: terbaik, dengan alternatif berikutnya jauh lebih buruk (minimal 20 poin).'));
      break;
    case 'best':
      pts.push(playedBest
        ? tr("It is exactly the engine's top choice.", 'Persis pilihan teratas engine.')
        : tr("It is not the engine's top choice but loses almost nothing (under 0.5 points), so it counts as best.", 'Bukan pilihan teratas engine, tetapi nyaris tidak merugikan (di bawah 0,5 poin), jadi dihitung terbaik.'));
      break;
    default:
      pts.push(tr(
        `Categories follow the drop in win chance: Excellent < ${THRESHOLDS.excellent}, Good < ${THRESHOLDS.good}, Inaccuracy < ${THRESHOLDS.inaccuracy}, Mistake < ${THRESHOLDS.mistake}, Blunder ≥ ${THRESHOLDS.mistake}. This move lost ${loss.toFixed(1)}.`,
        `Kategori mengikuti penurunan peluang menang: Sangat baik < ${THRESHOLDS.excellent}, Bagus < ${THRESHOLDS.good}, Kurang akurat < ${THRESHOLDS.inaccuracy}, Kesalahan < ${THRESHOLDS.mistake}, Blunder ≥ ${THRESHOLDS.mistake}. Langkah ini kehilangan ${loss.toFixed(1)}.`));
  }

  // skakmat: terlewat atau diizinkan
  const mateFor = (e: Evaluation) => (e.mate === null ? null : mover === 'w' ? e.mate : -e.mate); // > 0: mover yang mematikan
  const mb = mateFor(a.evalBefore);
  const ma = mateFor(a.evalAfter);
  if (mb !== null && mb > 0 && (ma === null || ma < 0 || ma > mb + 1) && loss >= 5) {
    pts.push(tr(`It missed a forced checkmate in ${mb}${a.engineBest.san ? ` (${a.engineBest.san})` : ''}.`, `Melewatkan skakmat paksa dalam ${mb} langkah${a.engineBest.san ? ` (${a.engineBest.san})` : ''}.`));
  }
  if (ma !== null && ma < 0) {
    pts.push(tr(`It allows a forced checkmate in ${Math.abs(ma)} for the opponent.`, `Langkah ini memberi lawan skakmat paksa dalam ${Math.abs(ma)} langkah.`));
  }

  // buah yang menggantung
  if (loss >= 5) {
    const hang = bestCaptureGain(a.fenAfter);
    if (hang && hang.gain >= 2) {
      pts.push(tr(`After this move the opponent can win material with ${hang.san} (about ${hang.gain} points).`, `Setelah langkah ini lawan bisa memenangkan material dengan ${hang.san} (sekitar ${hang.gain} poin).`));
    }
  }

  // ciri langkah yang dimainkan
  const played = featuresOf(a.fenBefore, a.uci);
  if (played) {
    const d = describe(played);
    if (d) pts.push(tr(`The move ${played.san} ${d}.`, `Langkah ${played.san} ${d}.`));
    if (a.ply <= 10 && played.piece === 'q' && loss >= 2) {
      pts.push(tr('Bringing the queen out this early often costs time because it can be attacked.', 'Mengeluarkan ratu sedini ini sering membuang waktu karena mudah diserang.'));
    }
    if (a.ply <= 16 && (played.piece === 'n' || played.piece === 'b') && /[18]$/.test(played.from) && loss < 5) {
      pts.push(tr('It develops a minor piece from the back rank, in line with opening principles.', 'Mengembangkan bidak ringan dari barisan awal, sesuai prinsip opening.'));
    }
  }

  // alternatif terbaik
  let bestLine = '';
  if (!playedBest && a.engineBest.uci && a.engineBest.uci !== '(none)') {
    const f = featuresOf(a.fenBefore, a.engineBest.uci);
    const d = f ? describe(f) : '';
    if (loss >= 2) {
      pts.push(d
        ? tr(`The engine preferred ${a.engineBest.san}, which ${d}.`, `Engine lebih suka ${a.engineBest.san}, yang ${d}.`)
        : tr(`The engine preferred ${a.engineBest.san}, a quieter move that keeps the position stronger.`, `Engine lebih suka ${a.engineBest.san}, langkah tenang yang menjaga posisi tetap lebih kuat.`));
      if (f?.captured && (VALUE[f.captured] ?? 0) >= 3 && played && !played.captured) {
        pts.push(tr('A capture of real value was available but not taken.', 'Ada penangkapan bernilai yang tidak diambil.'));
      }
    }
    bestLine = lineText(a.fenBefore, before.pv);
  }
  const replyLine = lineText(a.fenAfter, after.pv);

  return { summary: commentFor(a), points: pts, bestLine, replyLine };
}

/** Jalankan penjelasan lengkap; memakai cache evaluasi Analyzer sehingga umumnya instan. */
export async function explainMove(a: MoveAnalysis, analyzer: Analyzer): Promise<Explanation> {
  const before = await analyzer.evaluate(a.fenBefore);
  const after = await analyzer.evaluate(a.fenAfter);
  let gap: number | null = null;
  if (a.classification === 'great') {
    const mover = (a.fenBefore.split(' ')[1] ?? 'w') as 'w' | 'b';
    const multi = await analyzer.evaluateMulti(a.fenBefore);
    if (multi.second && multi.bestMoveUci === a.uci) gap = moverWinPct(multi.eval, mover) - moverWinPct(multi.second.eval, mover);
  }
  return explainFrom(a, before, after, gap);
}
