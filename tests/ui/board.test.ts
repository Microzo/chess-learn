// @vitest-environment happy-dom
import { Chess } from 'chess.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Board } from '../../src/ui/board/board';
import { resetSettings, updateSettings } from '../../src/core/settings';
import { move, occupied, piecesOnBoard, sq, tap } from './helpers';

function mountBoard(view: ConstructorParameters<typeof Object>[0] = {}, chess = new Chess()) {
  document.body.innerHTML = '';
  const onMove = vi.fn();
  const board = new Board(onMove);
  document.body.append(board.el);
  board.set(chess, { movable: 'both', ...(view as object) });
  return { board, onMove, chess };
}

beforeEach(() => { document.body.innerHTML = ''; });

describe('Board', () => {
  it('menggambar 64 kotak dan 32 bidak', () => {
    mountBoard();
    expect(document.querySelectorAll('.board .sq')).toHaveLength(64);
    expect(piecesOnBoard(document)).toBe(32);
  });

  it('Putih di bawah secara bawaan, Hitam di bawah saat dibalik', () => {
    mountBoard();
    expect(document.querySelector('.board .sq')!.getAttribute('data-sq')).toBe('a8');
    mountBoard({ flip: true });
    expect(document.querySelector('.board .sq')!.getAttribute('data-sq')).toBe('h1');
  });

  it('memilih bidak menampilkan titik langkah legal', () => {
    mountBoard();
    tap(document, 'e2');
    expect(sq(document, 'e2').classList.contains('sel')).toBe(true);
    expect(sq(document, 'e3').classList.contains('dot')).toBe(true);
    expect(sq(document, 'e4').classList.contains('dot')).toBe(true);
    expect(sq(document, 'e5').classList.contains('dot')).toBe(false);
  });

  it('klik asal lalu tujuan memanggil onMove', () => {
    const { onMove } = mountBoard();
    move(document, 'e2', 'e4');
    expect(onMove).toHaveBeenCalledWith('e2', 'e4');
  });

  it('klik tujuan ilegal tidak memanggil onMove', () => {
    const { onMove } = mountBoard();
    move(document, 'e2', 'e5');
    expect(onMove).not.toHaveBeenCalled();
  });

  it('tidak bisa memilih bidak lawan', () => {
    mountBoard();
    tap(document, 'e7');
    expect(sq(document, 'e7').classList.contains('sel')).toBe(false);
  });

  it('movable null: papan hanya tampilan', () => {
    const { onMove } = mountBoard({ movable: null });
    move(document, 'e2', 'e4');
    expect(onMove).not.toHaveBeenCalled();
    expect(document.querySelector('.sel')).toBeNull();
  });

  it('movable satu sisi tidak menggerakkan sisi lain', () => {
    const { onMove } = mountBoard({ movable: 'b' });
    move(document, 'e2', 'e4');
    expect(onMove).not.toHaveBeenCalled();
  });

  it('sorotan langkah terakhir dan petunjuk', () => {
    mountBoard({ last: ['e2', 'e4'], hint: ['g1'] });
    expect(sq(document, 'e2').classList.contains('last')).toBe(true);
    expect(sq(document, 'e4').classList.contains('last')).toBe(true);
    expect(sq(document, 'g1').classList.contains('hint')).toBe(true);
  });

  it('raja yang diskak ditandai', () => {
    const c = new Chess('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1');
    mountBoard({}, c);
    expect(sq(document, 'e1').classList.contains('check')).toBe(true);
  });

  it('promosi bidak menampilkan pilihan dan mengirim buah terpilih', () => {
    const c = new Chess('8/P6k/8/8/8/8/8/K7 w - - 0 1');
    const { onMove } = mountBoard({}, c);
    move(document, 'a7', 'a8');
    const choices = document.querySelectorAll('.promo-btn');
    expect(choices).toHaveLength(4);
    (document.querySelector('[aria-label="n"]') as HTMLElement).click();
    expect(onMove).toHaveBeenCalledWith('a7', 'a8', 'n');
  });

  it('membatalkan pilihan promosi tidak memindahkan', () => {
    const c = new Chess('8/P6k/8/8/8/8/8/K7 w - - 0 1');
    const { onMove } = mountBoard({}, c);
    move(document, 'a7', 'a8');
    (document.querySelector('.promo') as HTMLElement).click();
    expect(onMove).not.toHaveBeenCalled();
    expect(document.querySelector('.promo')).toBeNull();
  });

  it('set() ulang menghapus pilihan lama', () => {
    const { board, chess } = mountBoard();
    tap(document, 'e2');
    board.set(chess, { movable: 'both' });
    expect(document.querySelector('.sel')).toBeNull();
    expect(occupied(document, 'e2')).toBe(true);
  });
});

describe('lencana kualitas langkah', () => {
  it('muncul hanya di petak yang ditunjuk, dengan simbol dan nama kategori', () => {
    const chess = new Chess();
    chess.move('e4');
    mountBoard({ badge: { sq: 'e4', cls: 'brilliant' } }, chess);
    const badges = document.querySelectorAll('.board .sq-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]!.parentElement!.getAttribute('data-sq')).toBe('e4');
    expect(badges[0]!.textContent).toBe('!!');
    expect(badges[0]!.classList.contains('brilliant')).toBe(true);
    expect(badges[0]!.getAttribute('aria-label')).toBeTruthy();
  });
  it('disembunyikan bila pengaturan Lencana langkah dimatikan', () => {
    const chess = new Chess();
    chess.move('e4');
    updateSettings({ badges: false });
    mountBoard({ badge: { sq: 'e4', cls: 'brilliant' } }, chess);
    expect(document.querySelectorAll('.sq-badge')).toHaveLength(0);
    resetSettings();
  });
  it('tidak ada lencana bila badge null', () => {
    mountBoard({ badge: null });
    expect(document.querySelectorAll('.sq-badge')).toHaveLength(0);
  });
});
