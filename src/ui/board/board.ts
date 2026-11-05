import type { Chess } from 'chess.js';
import { CLASS_LABEL, CLASS_SYMBOL } from '../../core/analysis/analyzer';
import { legalTargets, needsPromotion } from '../../core/game/game';
import { getSettings } from '../../core/settings';
import type { MoveClass } from '../../types';
import { clear, h } from '../dom';
import { play } from '../sound';

const pieceUrl = (color: string, type: string) =>
  `${import.meta.env.BASE_URL}pieces/original/${color}${type.toUpperCase()}.svg`;
const pieceImg = (color: string, type: string) =>
  h('img', { class: 'piece', src: pieceUrl(color, type), alt: '', draggable: 'false' });
const FILES = 'abcdefgh';

export interface BoardView {
  last?: [string, string] | null;
  hint?: string[] | null;
  flip?: boolean;
  /** lencana kualitas langkah (Brilian, Blunder, ...) di pojok kanan atas bidak pada petak `sq` */
  badge?: { sq: string; cls: MoveClass } | null;
  /** pihak yang boleh digerakkan lewat klik; null = papan hanya tampilan */
  movable?: 'w' | 'b' | 'both' | null;
}

export type MoveHandler = (from: string, to: string, promotion?: string) => void;

/** Papan klik-untuk-pindah (cocok untuk layar sentuh maupun mouse). */
export class Board {
  readonly el = h('div', { class: 'board-wrap' });
  private grid = h('div', { class: 'board' });
  private chess!: Chess;
  private view: BoardView = {};
  private selected: string | null = null;
  private targets: string[] = [];
  private prevPly = -1;
  private prevFen = '';
  private dropMove: string | null = null; // langkah hasil drag: tidak perlu dianimasikan
  private activePointer: number | null = null;

  constructor(private onMove: MoveHandler) {
    this.el.append(this.grid);
    this.grid.addEventListener('pointerdown', (e) => this.pointerDown(e));
  }

  set(chess: Chess, view: BoardView = {}) {
    this.chess = chess;
    this.view = view;
    this.selected = null;
    this.targets = [];
    this.render();
    this.afterSet();
  }

  /** Animasi geser + suara bila posisi maju tepat satu langkah. */
  private afterSet() {
    const hist = this.chess.history({ verbose: true });
    const ply = hist.length;
    const m = hist[ply - 1];
    // hanya bila posisi sebelumnya persis posisi sebelum langkah terakhir
    if (m && this.prevPly >= 0 && ply === this.prevPly + 1 && m.before === this.prevFen) {
      if (this.dropMove !== m.from + m.to) this.slide(m.from, m.to);
      play(this.chess.isGameOver() ? 'end' : this.chess.inCheck() ? 'check' : m.captured ? 'capture' : 'move');
    }
    this.dropMove = null;
    this.prevPly = ply;
    this.prevFen = this.chess.fen();
  }

  private sqEl(sq: string): HTMLElement | null {
    return this.grid.querySelector<HTMLElement>(`[data-sq="${sq}"]`);
  }

  private slide(from: string, to: string) {
    const a = this.sqEl(from)?.getBoundingClientRect();
    const b = this.sqEl(to)?.getBoundingClientRect();
    const img = this.sqEl(to)?.querySelector<HTMLElement>('.piece');
    if (!a || !b || !img || !img.animate) return;
    img.style.zIndex = '3';
    img.animate(
      [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'translate(0, 0)' }],
      { duration: 140, easing: 'ease-out' },
    );
  }

  private pointerDown(e: PointerEvent) {
    if (e.button !== 0 || this.activePointer !== null || !this.chess) return;
    const sq = (e.target as HTMLElement).closest<HTMLElement>('.sq')?.dataset.sq;
    if (!sq) return;
    this.dropMove = null;
    const pid = e.pointerId;
    const x0 = e.clientX, y0 = e.clientY;
    let img: HTMLElement | null = null;
    let dragged = false;
    let justSelected = false;

    const piece = this.canMove() ? this.chess.get(sq as never) : undefined;
    if (piece && piece.color === this.chess.turn()) {
      if (sq !== this.selected) {
        this.selected = sq;
        this.targets = legalTargets(this.chess, sq);
        justSelected = true;
        this.render();
      }
      img = this.sqEl(sq)?.querySelector<HTMLElement>('.piece') ?? null;
    }
    this.activePointer = pid;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pid || !img) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!dragged && Math.hypot(dx, dy) < 6) return;
      dragged = true;
      img.style.zIndex = '10';
      img.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      this.activePointer = null;
      const reset = () => { if (img) { img.style.zIndex = ''; img.style.transform = ''; } };
      if (ev.type === 'pointercancel') return reset();
      if (!dragged) {
        if (!justSelected) this.click(sq); // tap biasa: pilih / pindah / batal pilih
        return;
      }
      // drop: abaikan bila papan sudah di-render ulang selama drag
      const to = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>('.sq')?.dataset.sq;
      if (this.selected !== sq || !to || !this.targets.includes(to)) return reset();
      if (needsPromotion(this.chess, sq, to)) {
        reset();
        this.askPromotion(sq, to, true);
      } else {
        this.dropMove = sq + to;
        const ply = this.chess.history().length;
        reset();
        this.onMove(sq, to);
        // langkah ditolak (mis. giliran bot): gambar ulang agar bidak tidak macet
        if (this.chess.history().length === ply) {
          this.dropMove = null;
          this.render();
        }
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  private canMove(): boolean {
    const m = this.view.movable;
    if (!m) return false;
    return m === 'both' || m === this.chess.turn();
  }

  private click(sq: string) {
    if (!this.canMove()) return;
    if (this.selected && this.targets.includes(sq)) {
      const from = this.selected;
      if (needsPromotion(this.chess, from, sq)) {
        this.askPromotion(from, sq);
      } else {
        this.onMove(from, sq);
      }
      return;
    }
    const piece = this.chess.get(sq as never);
    if (piece && piece.color === this.chess.turn() && sq !== this.selected) {
      this.selected = sq;
      this.targets = legalTargets(this.chess, sq);
    } else {
      this.selected = null;
      this.targets = [];
    }
    this.render();
  }

  private askPromotion(from: string, to: string, fromDrag = false) {
    const color = this.chess.turn();
    const pick = (p: string) => {
      overlay.remove();
      if (fromDrag) this.dropMove = from + to;
      this.onMove(from, to, p);
    };
    const overlay = h(
      'div',
      { class: 'promo', onclick: () => { overlay.remove(); this.selected = null; this.targets = []; this.render(); } },
      h(
        'div',
        { class: 'promo-box', onclick: (e: Event) => e.stopPropagation() },
        ...(['q', 'r', 'b', 'n'] as const).map((p) =>
          h('button', { class: 'promo-btn', 'aria-label': p, onclick: () => pick(p) }, pieceImg(color, p)),
        ),
      ),
    );
    this.el.append(overlay);
  }

  private render() {
    clear(this.grid);
    const flip = !!this.view.flip;
    const board = this.chess.board();
    const checkSq = this.chess.inCheck() ? this.kingSquare(this.chess.turn()) : null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const rank = flip ? r : 7 - r; // 0..7 (rank 1 = 0)
        const file = flip ? 7 - c : c;
        const sq = FILES[file]! + (rank + 1);
        const cell = board[7 - rank]![file];
        const dark = (file + rank) % 2 === 0;
        const cls = ['sq', dark ? 'dark' : 'light'];
        if (this.view.last?.includes(sq)) cls.push('last');
        if (this.view.hint?.includes(sq)) cls.push('hint');
        if (sq === this.selected) cls.push('sel');
        if (sq === checkSq) cls.push('check');
        if (this.targets.includes(sq)) cls.push(cell ? 'cap' : 'dot');

        const el = h('div', { class: cls.join(' '), 'data-sq': sq });
        if (cell) el.append(pieceImg(cell.color, cell.type));
        if (this.view.badge?.sq === sq && getSettings().badges) {
          el.append(h('span', { class: `sq-badge ${this.view.badge.cls}`, title: CLASS_LABEL[this.view.badge.cls], 'aria-label': CLASS_LABEL[this.view.badge.cls] }, CLASS_SYMBOL[this.view.badge.cls]));
        }
        if (c === 0) el.append(h('i', { class: 'coord rank' }, String(rank + 1)));
        if (r === 7) el.append(h('i', { class: 'coord file' }, FILES[file]!));
        this.grid.append(el);
      }
    }
  }

  private kingSquare(color: 'w' | 'b'): string | null {
    for (const row of this.chess.board())
      for (const cell of row) if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    return null;
  }
}
