import { Chess, type Color } from 'chess.js';
import { tr } from '../i18n';

/** Catatan posisional untuk langkah `uci` dari `fenBefore`: struktur bidak, kolom, raja, mobilitas. Murni, tanpa engine. */

type Board = ReturnType<Chess['board']>;
const FILES = 'abcdefgh';
const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const NAME: Record<string, readonly [string, string]> = {
  p: ['pawn', 'bidak'], n: ['knight', 'kuda'], b: ['bishop', 'gajah'], r: ['rook', 'benteng'], q: ['queen', 'ratu'], k: ['king', 'raja'],
};
const nm = (t: string) => tr(NAME[t]![0], NAME[t]![1]);

interface PawnInfo { doubled: number; isolated: number; passed: number }

function pawnInfo(board: Board, side: Color): PawnInfo {
  const mine: number[][] = FILES.split('').map(() => []); // rank index (0 = rank 8) per file
  const theirs: number[][] = FILES.split('').map(() => []);
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const c = board[r]![f];
      if (c?.type === 'p') (c.color === side ? mine : theirs)[f]!.push(r);
    }
  }
  let doubled = 0; let isolated = 0; let passed = 0;
  for (let f = 0; f < 8; f++) {
    const m = mine[f]!;
    if (m.length > 1) doubled += m.length - 1;
    if (!m.length) continue;
    const neighbours = [f - 1, f + 1].filter((x) => x >= 0 && x < 8);
    if (neighbours.every((n) => mine[n]!.length === 0)) isolated += m.length;
    // bidak lolos: tidak ada bidak lawan di kolom sendiri/sebelah yang berada di depannya
    for (const r of m) {
      const ahead = (rr: number) => (side === 'w' ? rr < r : rr > r);
      const blocked = [f - 1, f, f + 1].some((x) => x >= 0 && x < 8 && theirs[x]!.some(ahead));
      if (!blocked) passed++;
    }
  }
  return { doubled, isolated, passed };
}

function bishops(board: Board, side: Color): number {
  return board.flat().filter((c) => c && c.color === side && c.type === 'b').length;
}

/** Status kolom bagi benteng di file `f`: 'open' tanpa bidak sama sekali, 'semi' tanpa bidak sendiri. */
function fileState(board: Board, f: number, side: Color): 'open' | 'semi' | 'closed' {
  let own = false; let any = false;
  for (let r = 0; r < 8; r++) {
    const c = board[r]![f];
    if (c?.type === 'p') { any = true; if (c.color === side) own = true; }
  }
  return !any ? 'open' : !own ? 'semi' : 'closed';
}

/** Jumlah langkah legal bidak mover seandainya gilirannya; null bila posisi tak dapat dihitung. */
function mobility(fen: string, side: Color): number | null {
  try {
    const parts = fen.split(' ');
    parts[1] = side; parts[3] = '-';
    return new Chess(parts.join(' ')).moves().length;
  } catch {
    return null;
  }
}

/** Buah `color` yang sedang terancam: diserang dan tidak terjaga, atau diserang buah yang lebih murah. */
function enPrise(g: Chess, color: Color): { sq: string; type: string }[] {
  const foe: Color = color === 'w' ? 'b' : 'w';
  const out: { sq: string; type: string }[] = [];
  for (const row of g.board()) {
    for (const c of row) {
      if (!c || c.color !== color || c.type === 'k') continue;
      const att = g.attackers(c.square, foe);
      if (!att.length) continue;
      const lowest = Math.min(...att.map((a) => VAL[g.get(a as never)!.type] ?? 100));
      const defended = g.attackers(c.square, color).length > 0;
      if (!defended || lowest < VAL[c.type]!) out.push({ sq: c.square, type: c.type });
    }
  }
  return out;
}

export function positionalNotes(fenBefore: string, fenAfter: string, uci: string, ply: number): string[] {
  const out: string[] = [];
  let before: Chess; let after: Chess;
  try {
    before = new Chess(fenBefore);
    after = new Chess(fenAfter);
  } catch {
    return out;
  }
  const side = before.turn();
  const opp: Color = side === 'w' ? 'b' : 'w';
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const piece = before.get(from as never);
  if (!piece) return out;
  const bb = before.board();
  const ab = after.board();

  // pusat
  if (piece.type === 'p' && 'de'.includes(to[0]!) && (to[1] === '4' || to[1] === '5') && ply <= 20) {
    out.push(tr('The pawn takes space in the centre, which gives the pieces more room.', 'Bidak merebut ruang di pusat, sehingga buah-buah lain punya ruang gerak lebih.'));
  }

  // struktur bidak (dilewati bila ini pertukaran yang bisa langsung dibalas: strukturnya belum final)
  const exchange = !!before.get(to as never) && after.isAttacked(to as never, opp);
  if (!exchange) {
  const pb = pawnInfo(bb, side); const pa = pawnInfo(ab, side);
  if (pa.doubled > pb.doubled) out.push(tr('It creates doubled pawns, a structural weakness that is hard to undo.', 'Menciptakan bidak ganda, kelemahan struktur yang sulit diperbaiki.'));
  if (pa.isolated > pb.isolated) out.push(tr('It leaves an isolated pawn with no neighbouring pawns to defend it.', 'Meninggalkan bidak terisolasi tanpa bidak tetangga yang membelanya.'));
  if (pa.passed > pb.passed) out.push(tr('It creates a passed pawn: no enemy pawn can stop it on its way to promotion.', 'Menciptakan bidak lolos: tidak ada bidak lawan yang dapat menghentikannya menuju promosi.'));
  const ob = pawnInfo(bb, opp); const oa = pawnInfo(ab, opp);
  if (oa.doubled > ob.doubled) out.push(tr('It forces the opponent into doubled pawns.', 'Memaksa lawan memiliki bidak ganda.'));
  if (oa.isolated > ob.isolated) out.push(tr('It leaves the opponent with an isolated pawn.', 'Membuat lawan memiliki bidak terisolasi.'));

  }

  // pasangan gajah
  if (bishops(bb, opp) === 2 && bishops(ab, opp) < 2) out.push(tr("It removes the opponent's bishop pair.", 'Menghilangkan pasangan gajah lawan.'));
  if (bishops(bb, side) === 2 && bishops(ab, side) < 2) out.push(tr('It gives up its own bishop pair.', 'Melepas pasangan gajah sendiri.'));

  // benteng ke kolom terbuka
  if (piece.type === 'r' && from[0] !== to[0]) {
    const f = FILES.indexOf(to[0]!);
    const st = fileState(ab, f, side);
    if (st === 'open') out.push(tr(`The rook takes the open ${to[0]}-file, where it can reach the enemy position.`, `Benteng menguasai kolom ${to[0]} yang terbuka, tempat ia dapat menembus posisi lawan.`));
    else if (st === 'semi') out.push(tr(`The rook goes to the half-open ${to[0]}-file, pressuring the enemy pawn there.`, `Benteng ke kolom ${to[0]} yang setengah terbuka, menekan bidak lawan di sana.`));
  }

  // keamanan raja
  const king = ab.flat().find((c) => c?.type === 'k' && c.color === side);
  const kf = king ? FILES.indexOf(king.square[0]!) : -1;
  const kr = king?.square[1];
  const castled = kr === (side === 'w' ? '1' : '8') && (kf >= 6 || kf <= 2) && kf !== 3 && kf !== 4;
  if (castled && piece.type === 'p' && piece.color === side && (to[0] === 'f' || to[0] === 'g' || to[0] === 'h' || to[0] === 'a' || to[0] === 'b' || to[0] === 'c') && Math.abs(FILES.indexOf(to[0]!) - kf) <= 1 && from[0] === to[0]) {
    out.push(tr('A pawn move in front of the castled king loosens its shelter, so it needs a concrete purpose.', 'Gerakan bidak di depan raja yang sudah rokade melonggarkan perlindungannya, jadi perlu tujuan yang jelas.'));
  }
  if (!castled && piece.type === 'k' && ply <= 30 && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) <= 1) {
    out.push(tr('The king moves without castling, so it loses castling rights and may be exposed.', 'Raja berjalan tanpa rokade, sehingga kehilangan hak rokade dan bisa terbuka.'));
  }

  // ancaman baru: buah yang baru pindah menyerang buah lawan yang tak terjaga atau lebih bernilai
  const moved = after.get(to as never);
  if (moved && !before.get(to as never) && moved.type !== 'k' && !after.inCheck()) {
    const lowestAttacker = Math.min(100, ...after.attackers(to as never, opp).map((a) => VAL[after.get(a as never)!.type] ?? 100));
    if (lowestAttacker >= VAL[moved.type]!) {
      let target: { sq: string; type: string; free: boolean } | null = null;
      for (const row of ab) {
        for (const c of row) {
          if (!c || c.color !== opp || c.type === 'k' || c.type === 'p') continue;
          if (!after.attackers(c.square, side).includes(to as never)) continue;
          const free = after.attackers(c.square, opp).length === 0;
          if (!free && VAL[c.type]! <= VAL[moved.type]!) continue;
          if (!target || VAL[c.type]! > VAL[target.type]!) target = { sq: c.square, type: c.type, free };
        }
      }
      if (target) out.push(tr(
        `The ${nm(moved.type)} now attacks the ${nm(target.type)} on ${target.sq}${target.free ? ', which is undefended' : ', a more valuable piece'}, creating a threat.`,
        `${nm(moved.type)[0]!.toUpperCase()}${nm(moved.type).slice(1)} kini menyerang ${nm(target.type)} di ${target.sq}${target.free ? ' yang tidak terjaga' : ', buah yang lebih bernilai'}, sehingga menciptakan ancaman.`));
    }
  }

  // pertahanan: langkah menyelamatkan atau melindungi buah sendiri yang terancam
  if (!after.inCheck() && !before.inCheck()) {
    const was = enPrise(before, side);
    const now = enPrise(after, side).map((x) => x.sq);
    const saved = was.filter((x) => (x.sq === from ? !now.includes(to) : !now.includes(x.sq)))
      .sort((a, b) => VAL[b.type]! - VAL[a.type]!)[0];
    if (saved && saved.type !== 'p') {
      out.push(saved.sq === from
        ? tr(`It moves the attacked ${nm(saved.type)} to safety.`, `${nm(saved.type)[0]!.toUpperCase()}${nm(saved.type).slice(1)} yang diserang dipindahkan ke tempat aman.`)
        : tr(`It deals with the threat to the ${nm(saved.type)} on ${saved.sq}.`, `Langkah ini mengatasi ancaman terhadap ${nm(saved.type)} di ${saved.sq}.`));
    }
  }

  // mobilitas
  const mb = mobility(fenBefore, side); const ma = mobility(fenAfter, side);
  if (mb !== null && ma !== null && !out.length && !after.inCheck()) {
    if (ma - mb >= 8) out.push(tr(`It frees the pieces: ${ma} possible moves instead of ${mb}.`, `Membebaskan buah-buah: ${ma} langkah mungkin, sebelumnya ${mb}.`));
  }

  // pinggir papan di opening
  if (ply <= 12 && piece.type === 'p' && (to[0] === 'a' || to[0] === 'h') && !out.length) {
    out.push(tr('An edge-pawn move this early does little for development or the centre.', 'Langkah bidak pinggir sedini ini kurang membantu pengembangan atau pusat.'));
  }
  return out.slice(0, 3);
}
