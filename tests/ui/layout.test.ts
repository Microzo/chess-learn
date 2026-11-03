// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { listGames } from '../../src/core/storage/games';
import { pvpGame } from '../../src/modes/pvp/pvp';
import { replayList } from '../../src/modes/replay/replay';
import { button, show } from './helpers';

beforeEach(() => { localStorage.clear(); });

describe('tata letak layar permainan', () => {
  it('PvP: papan di kolom utama, tombol dan daftar langkah di kolom samping', () => {
    const root = show(() => pvpGame('A', 'B', false));
    const main = root.querySelector('.game-main')!;
    const side = root.querySelector('.game-side')!;
    expect(main.querySelector('.board')).not.toBeNull();
    expect(side.querySelector('.board')).toBeNull();
    expect(side.querySelector('.movelist')).not.toBeNull();
    expect(side.textContent).toContain('Menyerah');
    expect(root.querySelectorAll('.board')).toHaveLength(1);
  });
});

describe('impor PGN tanpa nama pemain', () => {
  it('header "?" diganti Putih dan Hitam', () => {
    const root = show(replayList);
    root.querySelector<HTMLTextAreaElement>('textarea')!.value = '[White "?"]\n[Black "  "]\n\n1. e4 e5 *';
    button(root, 'Impor').click();
    const g = listGames()[0]!;
    expect([g.white, g.black]).toEqual(['Putih', 'Hitam']);
  });

  it('nama asli tetap dipakai', () => {
    const root = show(replayList);
    root.querySelector<HTMLTextAreaElement>('textarea')!.value = '[White "Anna"]\n[Black "Budi"]\n\n1. e4 e5 *';
    button(root, 'Impor').click();
    const g = listGames()[0]!;
    expect([g.white, g.black]).toEqual(['Anna', 'Budi']);
  });
});
