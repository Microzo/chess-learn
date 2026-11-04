/** Versi aplikasi yang sedang berjalan; diisi saat build (lihat vite.config.ts). */
export const APP_VERSION = __APP_VERSION__;
export const APP_BUILD = __APP_BUILD__;
export const APP_DATE = __APP_DATE__;

/** Mis. "v0.2.0 · 7ec68f8 · 2026-11-04". */
export function versionLabel(): string {
  return `v${APP_VERSION} · ${APP_BUILD} · ${APP_DATE}`;
}
