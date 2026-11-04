import { tr } from '../core/i18n';
/** Unduh teks sebagai berkas (tanpa server). */
export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: mime + ';charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Salin teks ke papan klip; false bila ditolak browser. */
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/** Nama berkas aman: huruf/angka/titik/strip, selain itu menjadi garis bawah. */
export function safeFilename(name: string): string {
  const cleaned = name.normalize('NFKD').replace(/[^A-Za-z0-9.-]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned || tr('game', 'partai');
}

/** Tanggal lokal YYYY-MM-DD (bukan UTC). */
export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
