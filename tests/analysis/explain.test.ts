import { afterEach, describe, expect, it } from 'vitest';
import { _forceLang } from '../../src/core/i18n';
import { explainFrom, lineText } from '../../src/core/analysis/explain';
import { bestCaptureGain } from '../../src/core/analysis/tactics';
import type { EngineLine, MoveAnalysis, MoveClass } from '../../src/types';

afterEach(() => _forceLang('id'));

const line = (cp: number, pv: string[] = [], mate: number | null = null): EngineLine =>
  ({ eval: { cp: mate === null ? cp : null, mate }, bestMoveUci: pv[0] ?? '', pv, depth: 12 });

function analysis(over: Partial<MoveAnalysis> & { classification: MoveClass }): MoveAnalysis {
  return {
    ply: 21, san: 'Qe5', uci: 'a1e5', fenBefore: '4k3/8/3p4/8/8/8/8/Q3K3 w - - 0 1',
    fenAfter: '4k3/8/3p4/4Q3/8/8/8/4K3 b - - 1 1', winLossPct: 40,
    evalBefore: { cp: 900, mate: null }, evalAfter: { cp: -100, mate: null },
    engineBest: { san: 'Qa7', uci: 'a1a7' }, comment: '', ...over,
  };
}

describe('lineText', () => {
  it('memberi nomor langkah dan menangani giliran Hitam', () => {
    expect(lineText('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e2e4', 'e7e5', 'g1f3'])).toBe('1.e4 e5 2.Nf3');
    expect(lineText('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', ['e7e5', 'g1f3'])).toBe('1...e5 2.Nf3');
  });
  it('berhenti pada langkah ilegal', () => {
    expect(lineText('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e2e4', 'a1a8'])).toBe('1.e4');
  });
});

describe('bestCaptureGain', () => {
  it('menemukan penangkapan ratu yang menggantung', () => {
    const r = bestCaptureGain('4k3/8/3p4/4Q3/8/8/8/4K3 b - - 1 1');
    expect(r?.san).toBe('dxe5');
    expect(r?.gain).toBeGreaterThanOrEqual(8);
  });
  it('null bila tidak ada penangkapan menguntungkan', () => {
    expect(bestCaptureGain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toBeNull();
  });
});

describe('explainFrom', () => {
  it('blunder: menyebut penurunan peluang, buah menggantung, dan alternatif engine', () => {
    _forceLang('en');
    const e = explainFrom(analysis({ classification: 'blunder' }), line(900, ['a1a7']), line(-100, ['d6e5']));
    const text = e.points.join('\n');
    expect(text).toContain('win chance');
    expect(text).toContain('Blunder');
    expect(text).toContain('dxe5');
    expect(text).toContain('Qa7');
    expect(e.bestLine).toBe('1.Qa7');
    expect(e.replyLine).toBe('1...dxe5');
  });
  it('bahasa Indonesia mengikuti pilihan bahasa', () => {
    _forceLang('id');
    const e = explainFrom(analysis({ classification: 'blunder' }), line(900, ['a1a7']), line(-100, ['d6e5']));
    expect(e.points.join('\n')).toContain('Peluang menang');
  });
  it('mendeteksi skakmat yang terlewat', () => {
    _forceLang('en');
    const a = analysis({ classification: 'blunder', evalBefore: { cp: null, mate: 2 }, evalAfter: { cp: 50, mate: null } });
    expect(explainFrom(a, line(0, ['a1a7']), line(50)).points.join('\n')).toContain('missed a forced checkmate in 2');
  });
  it('mendeteksi skakmat yang diberikan ke lawan', () => {
    _forceLang('en');
    const a = analysis({ classification: 'blunder', evalAfter: { cp: null, mate: -3 } });
    expect(explainFrom(a, line(900), line(0)).points.join('\n')).toContain('allows a forced checkmate in 3');
  });
  it('langkah terbaik, teori, hebat, brilian punya penjelasan sesuai kategori', () => {
    _forceLang('en');
    const same = { uci: 'a1a7', san: 'Qa7' };
    const best = explainFrom(analysis({ classification: 'best', winLossPct: 0, ...same }), line(900, ['a1a7']), line(900));
    expect(best.points.join('\n')).toContain("engine's top choice");
    expect(best.bestLine).toBe('');
    const book = explainFrom(analysis({ classification: 'book', winLossPct: 0, ...same, opening: { eco: 'C50', name: 'Italian Game' } }), line(0), line(0));
    expect(book.points.join('\n')).toContain('Italian Game');
    expect(explainFrom(analysis({ classification: 'great', winLossPct: 0, ...same }), line(0), line(0), 31).points.join('\n')).toContain('31 points worse');
    expect(explainFrom(analysis({ classification: 'brilliant', winLossPct: 0, ...same }), line(0), line(0)).points.join('\n')).toContain('Brilliant needs three things');
  });
  it('kategori sedang menampilkan ambang batas', () => {
    _forceLang('en');
    const e = explainFrom(analysis({ classification: 'inaccuracy', winLossPct: 7, evalAfter: { cp: 500, mate: null } }), line(900, ['a1a7']), line(500));
    expect(e.points.join('\n')).toContain('Inaccuracy < 10');
  });
});
