import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { CLASSICS, parseNoteKey } from '../../src/data/classics';

/** Jumlah ply dan akhir partai menurut sumber (Wikipedia) untuk tiap partai. */
const EXPECTED: Record<string, { plies: number; end: 'mate' | 'resign'; lastSan: string }> = {
  opera: { plies: 33, end: 'mate', lastSan: 'Rd8#' },
  immortal: { plies: 45, end: 'mate', lastSan: 'Be7#' },
  'game-of-the-century': { plies: 82, end: 'mate', lastSan: 'Rc2#' },
  'kasparov-topalov': { plies: 87, end: 'resign', lastSan: 'Qa7' },
  'deep-blue': { plies: 37, end: 'resign', lastSan: 'c4' },
  'fischer-spassky-6': { plies: 81, end: 'resign', lastSan: 'Qf4' },
};

describe('data partai legendaris', () => {
  it('id unik dan setiap partai punya data pengujian', () => {
    const ids = CLASSICS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  for (const c of CLASSICS) {
    describe(c.title, () => {
      const exp = EXPECTED[c.id]!;
      const chess = new Chess();
      chess.loadPgn(c.pgn); // melempar galat bila ada langkah ilegal
      const sans = chess.history();

      it('semua langkah legal dan jumlahnya cocok dengan sumber', () => {
        expect(sans).toHaveLength(exp.plies);
        expect(sans[sans.length - 1]).toBe(exp.lastSan);
      });

      it('hasil dan pemain di header cocok dengan data', () => {
        const h = chess.getHeaders();
        expect(h['Result']).toBe(c.result);
        expect(h['White']).toBe(c.white);
        expect(h['Black']).toBe(c.black);
        // pemenang: skakmat → yang melangkah terakhir menang; menyerah → sesuai hasil
        const lastMoverWhite = sans.length % 2 === 1;
        expect(c.result).toBe(lastMoverWhite ? '1-0' : '0-1');
      });

      it(exp.end === 'mate' ? 'berakhir skakmat' : 'tidak berakhir skakmat (lawan menyerah)', () => {
        expect(chess.isCheckmate()).toBe(exp.end === 'mate');
      });

      it('setiap kunci catatan cocok dengan langkah yang benar-benar dimainkan', () => {
        expect(c.notes.length).toBeGreaterThanOrEqual(8);
        const seen = new Set<number>();
        for (const [key, text] of c.notes) {
          const p = parseNoteKey(key);
          expect(p, `kunci tidak valid: ${key}`).not.toBeNull();
          expect(sans[p!.ply - 1], `kunci ${key} tidak cocok dengan langkah asli (${sans[p!.ply - 1]})`).toBe(p!.san);
          expect(seen.has(p!.ply), `kunci ganda ${key}`).toBe(false);
          seen.add(p!.ply);
          expect(text.length).toBeGreaterThan(20);
        }
      });

      it('punya ringkasan dan poin pelajaran', () => {
        expect(c.summary.length).toBeGreaterThan(30);
        expect(c.learn.length).toBeGreaterThanOrEqual(3);
      });
    });
  }

  it('parseNoteKey membaca langkah Putih dan Hitam dan menolak kunci salah', () => {
    expect(parseNoteKey('17.Rd8#')).toEqual({ ply: 33, san: 'Rd8#' });
    expect(parseNoteKey('16...Nxb8')).toEqual({ ply: 32, san: 'Nxb8' });
    expect(parseNoteKey('1.e4')).toEqual({ ply: 1, san: 'e4' });
    expect(parseNoteKey('1..e4')).toBeNull();
    expect(parseNoteKey('e4')).toBeNull();
  });
});
