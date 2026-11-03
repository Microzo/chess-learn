import { clear } from '../ui/dom';

export interface Screen {
  el: HTMLElement;
  destroy?: () => void;
}

let root: HTMLElement;
let current: Screen | null = null;

export function mount(el: HTMLElement) {
  root = el;
}

/** Ganti layar aktif; layar lama dibersihkan lebih dulu. */
export function go(make: () => Screen) {
  current?.destroy?.();
  current = make();
  clear(root);
  root.append(current.el);
  window.scrollTo(0, 0);
}
