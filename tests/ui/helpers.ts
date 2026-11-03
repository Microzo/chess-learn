import { go, mount, type Screen } from '../../src/app/router';

/** Pasang akar aplikasi baru dan tampilkan layar. */
export function show(make: () => Screen): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  const root = document.getElementById('app')!;
  mount(root);
  go(make);
  return root;
}

export const sq = (root: ParentNode, s: string): HTMLElement => {
  const el = root.querySelector<HTMLElement>(`[data-sq="${s}"]`);
  if (!el) throw new Error(`kotak ${s} tidak ada`);
  return el;
};

export const piecesOnBoard = (root: ParentNode) => root.querySelectorAll('.board .piece').length;
export const occupied = (root: ParentNode, s: string) => !!sq(root, s).querySelector('.piece');

/** Ketukan: pointerdown di kotak lalu pointerup (tanpa geser = klik biasa). */
export function tap(root: ParentNode, s: string) {
  const el = sq(root, s);
  const init = { pointerId: 1, button: 0, bubbles: true, clientX: 10, clientY: 10 };
  el.dispatchEvent(new PointerEvent('pointerdown', init));
  window.dispatchEvent(new PointerEvent('pointerup', init));
}

/** Klik-untuk-pindah: pilih asal, lalu tujuan. */
export function move(root: ParentNode, from: string, to: string) {
  tap(root, from);
  tap(root, to);
}

export const text = (root: ParentNode, sel: string) => root.querySelector(sel)?.textContent ?? '';

export function button(root: ParentNode, label: string | RegExp): HTMLButtonElement {
  const b = [...root.querySelectorAll<HTMLButtonElement>('button')].find((x) =>
    typeof label === 'string' ? x.textContent?.includes(label) : label.test(x.textContent ?? ''));
  if (!b) throw new Error(`tombol "${label}" tidak ada`);
  return b;
}
