import type { Chess } from 'chess.js';
import { legalTargets, needsPromotion } from '../../core/game/game';
import { clear, h } from '../dom';

const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const FILES = 'abcdefgh';

export interface BoardView {
  last?: [string, string] | null;
  hint?: [string, string] | null;
  flip?: boolean;
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

  constructor(private onMove: MoveHandler) {
    this.el.append(this.grid);
  }

  set(chess: Chess, view: BoardView = {}) {
    this.chess = chess;
    this.view = view;
    this.selected = null;
    this.targets = [];
    this.render();
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

  private askPromotion(from: string, to: string) {
    const color = this.chess.turn();
    const pick = (p: string) => {
      overlay.remove();
      this.onMove(from, to, p);
    };
    const overlay = h(
      'div',
      { class: 'promo', onclick: () => { overlay.remove(); this.selected = null; this.targets = []; this.render(); } },
      h(
        'div',
        { class: 'promo-box', onclick: (e: Event) => e.stopPropagation() },
        ...(['q', 'r', 'b', 'n'] as const).map((p) =>
          h('button', { class: `piece piece-${color}`, 'aria-label': p, onclick: () => pick(p) }, GLYPH[p]! + '︎'),
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

        const el = h('div', { class: cls.join(' '), 'data-sq': sq, onclick: () => this.click(sq) });
        if (cell) el.append(h('span', { class: `piece piece-${cell.color}` }, GLYPH[cell.type]! + '︎'));
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
