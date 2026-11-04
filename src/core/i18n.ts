import { getSettings, type Lang } from './settings';

/**
 * Teks antarmuka dwibahasa. Bahasa Inggris adalah bawaan; bahasa Indonesia bisa dipilih di Pengaturan.
 * Pemakaian: tr('Settings', 'Pengaturan'). Urutan argumen selalu (Inggris, Indonesia).
 * Layar dibangun saat dibuka, jadi pergantian bahasa berlaku di layar berikutnya.
 */
let forced: Lang | null = null;

export function currentLang(): Lang {
  return forced ?? getSettings().lang;
}

export function tr(en: string, id: string): string {
  return currentLang() === 'id' ? id : en;
}

/** Hanya untuk tes: paksa bahasa tanpa menyentuh pengaturan tersimpan (null = ikut pengaturan). */
export function _forceLang(l: Lang | null) {
  forced = l;
}

/** Pilih satu dari dua nilai (data) sesuai bahasa. */
export function pick<T>(en: T, id: T): T {
  return currentLang() === 'id' ? id : en;
}
