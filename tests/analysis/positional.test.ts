import { afterEach, describe, expect, it } from 'vitest';
import { _forceLang } from '../../src/core/i18n';
import { positionalNotes } from '../../src/core/analysis/positional';

afterEach(() => _forceLang('id'));
_forceLang('en');

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const run = (fen: string, uci: string, after: string, ply = 5) => positionalNotes(fen, after, uci, ply).join(' | ');

describe('positionalNotes', () => {
  it('pion pusat', () => {
    _forceLang('en');
    expect(run(START, 'e2e4', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', 1)).toContain('centre');
  });
  it('bidak ganda', () => {
    _forceLang('en');
    expect(run('4k3/8/8/2p5/1P6/8/2P5/4K3 w - - 0 1', 'b4c5', '4k3/8/8/2P5/8/8/2P5/4K3 b - - 0 1')).toContain('doubled');
  });
  it('benteng ke kolom terbuka', () => {
    _forceLang('en');
    const f = '4k3/pp3ppp/8/8/8/8/PP3PPP/R3K3 w - - 0 1';
    expect(run(f, 'a1d1', '4k3/pp3ppp/8/8/8/8/PP3PPP/3RK3 b - - 1 1')).toContain('open d-file');
  });
  it('bidak lolos', () => {
    _forceLang('en');
    const f = '4k3/8/8/4p3/3P4/8/8/4K3 w - - 0 1';
    expect(run(f, 'd4e5', '4k3/8/8/4P3/8/8/8/4K3 b - - 0 1')).toContain('passed pawn');
  });
  it('ancaman: kuda menyerang benteng tak terjaga', () => {
    _forceLang('en');
    expect(run('6k1/8/3r4/8/8/2N5/8/4K3 w - - 0 1', 'c3b5', '6k1/8/3r4/1N6/8/8/8/4K3 b - - 1 1')).toContain('attacks the rook on d6');
  });
  it('tidak ada ancaman bila buah mendarat di petak yang dijaga bidak lawan', () => {
    _forceLang('en');
    expect(run('6k1/8/2pr4/8/8/2N5/8/4K3 w - - 0 1', 'c3b5', '6k1/8/2pr4/1N6/8/8/8/4K3 b - - 1 1')).not.toContain('attacks');
  });
  it('pertahanan: ratu yang diserang dipindahkan ke tempat aman', () => {
    _forceLang('en');
    expect(run('4k3/8/2n5/8/3Q4/8/8/4K3 w - - 0 1', 'd4d3', '4k3/8/2n5/8/8/3Q4/8/4K3 b - - 1 1')).toContain('moves the attacked queen to safety');
  });
  it('tidak melempar pada FEN rusak', () => {
    expect(positionalNotes('x', 'y', 'e2e4', 1)).toEqual([]);
  });
});
