// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { APP_BUILD, APP_VERSION, versionLabel } from '../src/core/version';
import { homeScreen } from '../src/ui/screens/home';
import { settingsScreen } from '../src/ui/screens/settings';

describe('versi aplikasi', () => {
  it('label berisi versi, commit, dan tanggal', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_BUILD.length).toBeGreaterThan(0);
    expect(versionLabel()).toMatch(/^v\d+\.\d+\.\d+ · \S+ · \d{4}-\d{2}-\d{2}$/);
  });
  it('tampil di beranda dan Pengaturan', () => {
    expect(homeScreen().el.querySelector('[data-testid="version"]')?.textContent).toBe(versionLabel());
    expect(settingsScreen().el.querySelector('[data-testid="version"]')?.textContent).toBe(versionLabel());
  });
});
