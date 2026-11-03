import { describe, it, expect } from 'vitest';
import { classify, winLoss } from '../../src/core/analysis/classifier';

describe('classifier', () => {
  it('menandai blunder saat peluang menang turun besar', () => {
    const loss = winLoss({ cp: 300, mate: null }, { cp: -300, mate: null }, 'w');
    expect(classify({ loss, playedUci: 'a2a3', engineBestUci: 'e2e4', isBook: false })).toBe('blunder');
  });

  it('langkah sama dengan engine = best', () => {
    expect(classify({ loss: 0, playedUci: 'e2e4', engineBestUci: 'e2e4', isBook: false })).toBe('best');
  });

  it('langkah teori = book', () => {
    expect(classify({ loss: 0, playedUci: 'e2e4', engineBestUci: 'd2d4', isBook: true })).toBe('book');
  });
});
