import { tr } from '../core/i18n';
import { h } from '../ui/dom';

/**
 * Service worker memakai cache-first: versi baru terpasang di latar belakang tetapi halaman yang sedang
 * terbuka tetap menjalankan kode lama sampai dimuat ulang. Modul ini memberi tahu pengguna.
 */
let banner: HTMLElement | null = null;

function showBanner() {
  if (banner) return;
  banner = h('div', { class: 'update-bar', role: 'status' },
    h('span', {}, tr('A new version is ready.', 'Versi baru sudah siap.')),
    h('button', { class: 'btn primary', onclick: () => location.reload() }, tr('Reload', 'Muat ulang')));
  document.body.append(banner);
}

/** Cek manual ke server; 'updated' bila versi baru ditemukan (spanduk muncul), 'current' bila sudah terbaru. */
export async function checkForUpdate(): Promise<'updated' | 'current' | 'unsupported'> {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return 'unsupported';
  try { await reg.update(); } catch { return 'current'; }
  return reg.installing || reg.waiting || banner ? 'updated' : 'current';
}

export function watchUpdates() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) showBanner(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void checkForUpdate(); });
  void checkForUpdate();
}
