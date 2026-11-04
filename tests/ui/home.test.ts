// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/lessons';
import { glossaryScreen, lessonList, lessonScreen } from '../../src/modes/lessons/lessons';
import { homeScreen } from '../../src/ui/screens/home';
import { button, show } from './helpers';

beforeEach(() => { localStorage.clear(); });

describe('layar utama', () => {
  it('menampilkan lima mode dan tautan lisensi serta kode sumber', () => {
    const root = show(homeScreen);
    expect(root.querySelectorAll('.menu-item')).toHaveLength(5);
    const links = [...root.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links.some((h) => h?.endsWith('licenses/README.txt'))).toBe(true);
    expect(links).toContain('https://github.com/Microzo/chess-learn');
    root.querySelectorAll('a').forEach((a) => expect(a.getAttribute('rel')).toContain('noopener'));
  });

  it('tombol Pengaturan membuka layar pengaturan', () => {
    const root = show(homeScreen);
    (root.querySelector('.settings-link') as HTMLElement).click();
    expect(root.querySelector('h2')!.textContent).toBe('Pengaturan');
  });

  it('menu Belajar Strategi membuka daftar pelajaran', () => {
    const root = show(homeScreen);
    (root.querySelectorAll('.menu-item')[0] as HTMLElement).click();
    expect(root.textContent).toContain(`dari ${LESSONS.length} pelajaran selesai`);
  });
});

describe('daftar dan layar pelajaran', () => {
  it('semua pelajaran tampil, dikelompokkan per kategori', () => {
    const root = show(lessonList);
    expect(root.querySelectorAll('.item')).toHaveLength(LESSONS.length);
    expect(root.querySelectorAll('.lesson-cat').length).toBeGreaterThanOrEqual(6);
  });

  it('setiap pelajaran bisa dibuka tanpa galat dan punya papan bila ada demo', () => {
    for (const l of LESSONS) {
      const root = show(() => lessonScreen(l.id));
      expect(root.querySelector('h2')!.textContent).toBe(l.title);
      if (l.demo) expect(root.querySelectorAll('.demo .board .sq')).toHaveLength(64);
    }
  });

  it('demo: maju, mundur, dan ulang mengubah penghitung', () => {
    const l = LESSONS.find((x) => x.id === 'scotch')!;
    const root = show(() => lessonScreen(l.id));
    const counter = () => root.querySelector('.demo .demo-counter')!.textContent;
    expect(counter()).toContain('Langkah 0');
    (root.querySelector('[aria-label="Langkah berikutnya"]') as HTMLElement).click();
    expect(counter()).toContain('Langkah 1');
    (root.querySelector('[aria-label="Langkah sebelumnya"]') as HTMLElement).click();
    expect(counter()).toContain('Langkah 0');
    (root.querySelector('[aria-label="Langkah berikutnya"]') as HTMLElement).click();
    button(root.querySelector('.demo') as HTMLElement, 'Ulang').click();
    expect(counter()).toContain('Langkah 0');
  });

  it('menandai selesai tersimpan dan tampil di daftar', () => {
    const root = show(() => lessonScreen(LESSONS[0]!.id));
    button(root, 'Tandai selesai').click();
    expect(JSON.parse(localStorage.getItem('chess-learn:lessons-done')!)).toEqual([LESSONS[0]!.id]);
    const list = show(lessonList);
    expect(list.textContent).toContain(`1 dari ${LESSONS.length}`);
  });
});

describe('glosarium', () => {
  it('pencarian menyaring istilah dan menampilkan pesan bila kosong', () => {
    const root = show(glossaryScreen);
    const total = root.querySelectorAll('.gloss').length;
    expect(total).toBeGreaterThan(30);
    const input = root.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zugzwang';
    input.dispatchEvent(new Event('input'));
    const some = root.querySelectorAll('.gloss').length;
    expect(some).toBeGreaterThan(0);
    expect(some).toBeLessThan(total);
    input.value = 'xyzxyz-tidak-ada';
    input.dispatchEvent(new Event('input'));
    expect(root.textContent).toContain('Istilah tidak ditemukan');
  });
});
