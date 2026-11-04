// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { CLASSICS } from '../../src/data/classics';
import { listGames } from '../../src/core/storage/games';
import { classicScreen, classicsList, notesFor } from '../../src/modes/classics/classics';
import { homeScreen } from '../../src/ui/screens/home';
import { button, piecesOnBoard, show } from './helpers';

beforeEach(() => { localStorage.clear(); });

const ply = (root: HTMLElement, n: number) => {
  const mv = [...root.querySelectorAll<HTMLElement>('.movelist .mv')][n - 1]!;
  mv.click();
};

describe('daftar partai legendaris', () => {
  it('menampilkan semua partai dengan pemain, tahun, pembukaan, dan tingkat', () => {
    const root = show(classicsList);
    const items = root.querySelectorAll('.item');
    expect(items).toHaveLength(CLASSICS.length);
    expect(root.textContent).toContain('Paul Morphy');
    expect(root.textContent).toContain('1858');
    expect(root.querySelector('.level')!.textContent).toBeTruthy();
    expect(root.textContent).toContain('17.Rd8#'); // contoh cara membaca notasi
  });

  it('dapat dibuka dari beranda', () => {
    const root = show(homeScreen);
    const item = [...root.querySelectorAll<HTMLElement>('.menu-item')].find((m) => m.textContent!.includes('Partai Legendaris'))!;
    item.click();
    expect(root.querySelector('h2')!.textContent).toBe('Partai Legendaris');
  });

  it('tombol notasi membuka pelajaran notasi aljabar', () => {
    const root = show(classicsList);
    button(root, 'Pelajari notasi aljabar').click();
    expect(root.querySelector('h2')!.textContent).toBe('Notasi aljabar');
  });

  it('memilih partai membuka replay-nya', () => {
    const root = show(classicsList);
    (root.querySelector('.item[data-id="opera"] .item-main') as HTMLElement).click();
    expect(root.querySelector('h2')!.textContent).toContain('Paul Morphy');
    expect(root.querySelectorAll('.movelist .mv')).toHaveLength(33);
  });
});

describe('replay partai legendaris', () => {
  it('mulai dari posisi akhir, bisa mundur ke awal, dan menampilkan intro dan poin belajar', () => {
    const root = show(() => classicScreen('opera'));
    expect(root.querySelector('.classic-intro')!.textContent).toContain('Yang bisa dipelajari');
    expect(root.querySelector('.eval-bar')!.classList.contains('idle')).toBe(true); // belum dianalisa
    expect(root.querySelectorAll('.classic-intro li').length).toBeGreaterThanOrEqual(3);
    button(root, '⏮').click();
    expect(piecesOnBoard(root)).toBe(32);
  });

  it('catatan muncul tepat di langkah yang dicatat dan hilang di langkah lain', () => {
    const root = show(() => classicScreen('opera'));
    ply(root, 1); // 1.e4 punya catatan
    expect(root.querySelector('.card.note')!.textContent).toContain('pusat');
    ply(root, 2); // 1...e5 tidak
    expect(root.querySelector('.card.note')).toBeNull();
    ply(root, 33); // 17.Rd8#
    expect(root.querySelector('.card.note')!.textContent).toContain('Skakmat');
  });

  it('semua kunci catatan berhasil dipetakan ke ply', () => {
    for (const c of CLASSICS) expect(Object.keys(notesFor(c))).toHaveLength(c.notes.length);
  });

  it('tidak menyimpan apa pun sendiri; "Simpan ke Replay saya" menyimpan satu salinan', () => {
    const root = show(() => classicScreen('immortal'));
    expect(listGames()).toHaveLength(0);
    const save = button(root, 'Simpan ke Replay saya') as HTMLButtonElement;
    save.click();
    expect(listGames()).toHaveLength(1);
    expect(listGames()[0]).toMatchObject({ white: 'Adolf Anderssen', black: 'Lionel Kieseritzky', result: '1-0', mode: 'import' });
    expect(save.disabled).toBe(true);
    expect(save.textContent).toContain('Tersimpan');
  });

  it('tombol kembali menuju daftar, dan id tidak dikenal kembali ke daftar', () => {
    const root = show(() => classicScreen('opera'));
    (root.querySelector('[aria-label="Kembali"]') as HTMLElement).click();
    expect(root.querySelector('h2')!.textContent).toBe('Partai Legendaris');
    const r2 = show(() => classicScreen('tidak-ada'));
    expect(r2.querySelector('h2')!.textContent).toBe('Partai Legendaris');
  });
});
