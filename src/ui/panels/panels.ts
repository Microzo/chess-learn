import { CLASS_LABEL, CLASS_SYMBOL } from '../../core/analysis/analyzer';
import { winPercent } from '../../core/analysis/classifier';
import type { Evaluation, MoveAnalysis, MoveClass } from '../../types';
import { clear, h } from '../dom';

export function formatEval(e: Evaluation): string {
  if (e.mate !== null) return `${e.mate > 0 ? '+' : '-'}M${Math.abs(e.mate)}`;
  const cp = e.cp ?? 0;
  if (Math.abs(cp) >= 9000) return cp > 0 ? '1-0' : '0-1';
  return `${cp >= 0 ? '+' : ''}${(cp / 100).toFixed(1)}`;
}

export function badge(cls: MoveClass, withText = true): HTMLElement {
  return h('span', { class: `badge ${cls}` }, CLASS_SYMBOL[cls], withText ? ` ${CLASS_LABEL[cls]}` : '');
}

/** Bar evaluasi horizontal: bagian putih = peluang menang putih. */
export class EvalBar {
  readonly el: HTMLElement;
  private fill = h('div', { class: 'eval-fill' });
  private label = h('span', { class: 'eval-label' }, '0.0');

  constructor() {
    this.el = h('div', { class: 'eval-bar' }, this.fill, this.label);
    this.set({ cp: 0, mate: null });
  }

  set(e: Evaluation) {
    this.fill.style.width = `${winPercent(e)}%`;
    this.label.textContent = formatEval(e);
  }
}

/** Daftar langkah berpasangan dengan penanda kualitas. */
export class MoveList {
  readonly el = h('div', { class: 'movelist' });

  constructor(private onSelect?: (ply: number) => void) {}

  render(sans: string[], analysis: MoveAnalysis[], current: number) {
    clear(this.el);
    for (let i = 0; i < sans.length; i += 2) {
      const row = h('div', { class: 'mrow' }, h('span', { class: 'mno' }, `${i / 2 + 1}.`));
      for (const ply of [i + 1, i + 2]) {
        const san = sans[ply - 1];
        if (san === undefined) continue;
        const a = analysis[ply - 1];
        row.append(
          h(
            'button',
            { class: `mv${ply === current ? ' cur' : ''}`, onclick: () => this.onSelect?.(ply) },
            san,
            a ? h('span', { class: `dot-badge ${a.classification}`, title: CLASS_LABEL[a.classification] }, CLASS_SYMBOL[a.classification]) : null,
          ),
        );
      }
      this.el.append(row);
    }
    // gulir ke langkah terbaru / terpilih
    const cur = this.el.querySelector('.cur');
    if (cur) (cur as HTMLElement).scrollIntoView({ block: 'nearest' });
    else this.el.scrollTop = this.el.scrollHeight;
  }
}

/** Kartu analisa satu langkah. */
export function analysisCard(a: MoveAnalysis | null, opts: { pending?: boolean; title?: string } = {}): HTMLElement {
  if (opts.pending) return h('div', { class: 'card pending' }, 'Menganalisa langkah…');
  if (!a) return h('div', { class: 'card muted' }, opts.title ?? 'Lakukan langkah, analisa akan muncul di sini.');
  const moverIsWhite = a.ply % 2 === 1;
  return h(
    'div',
    { class: `card cls-${a.classification}` },
    h(
      'div',
      { class: 'card-head' },
      h('strong', {}, `${Math.ceil(a.ply / 2)}${moverIsWhite ? '.' : '...'} ${a.san}`),
      badge(a.classification),
      h('span', { class: 'ev' }, `${formatEval(a.evalBefore)} → ${formatEval(a.evalAfter)}`),
    ),
    h('p', {}, a.comment),
    a.opening && a.classification !== 'book' ? h('p', { class: 'muted' }, `Opening: ${a.opening.name}`) : null,
  );
}

/** Grafik peluang menang sepanjang partai; klik untuk loncat ke langkah. */
export function evalGraph(evals: Evaluation[], current: number, onSelect: (ply: number) => void): SVGElement {
  const W = 300;
  const H = 70;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'graph');
  svg.setAttribute('preserveAspectRatio', 'none');

  const n = Math.max(1, evals.length - 1);
  const x = (i: number) => (i / n) * W;
  const y = (e: Evaluation) => H - (winPercent(e) / 100) * H;

  const area = document.createElementNS(ns, 'polygon');
  const pts = evals.map((e, i) => `${x(i)},${y(e)}`);
  area.setAttribute('points', `0,${H} ${pts.join(' ')} ${W},${H}`);
  area.setAttribute('class', 'graph-area');
  svg.append(area);

  const mid = document.createElementNS(ns, 'line');
  mid.setAttribute('x1', '0'); mid.setAttribute('x2', String(W));
  mid.setAttribute('y1', String(H / 2)); mid.setAttribute('y2', String(H / 2));
  mid.setAttribute('class', 'graph-mid');
  svg.append(mid);

  const cur = document.createElementNS(ns, 'line');
  cur.setAttribute('x1', String(x(current))); cur.setAttribute('x2', String(x(current)));
  cur.setAttribute('y1', '0'); cur.setAttribute('y2', String(H));
  cur.setAttribute('class', 'graph-cur');
  svg.append(cur);

  svg.addEventListener('click', (ev) => {
    const r = svg.getBoundingClientRect();
    const i = Math.round(((ev.clientX - r.left) / r.width) * n);
    onSelect(Math.max(0, Math.min(n, i)));
  });
  return svg;
}
