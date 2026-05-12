import { describe, it, expect, beforeEach } from 'vitest';
import { mkGrid, uid, resetUid, DIR, itemMeta } from './helpers.js';
import { GW, GH } from '../constants/config.js';

describe('mkGrid', () => {
  it('creates grid with correct dimensions', () => {
    const grid = mkGrid();
    expect(grid).toHaveLength(GH);
    grid.forEach(row => {
      expect(row).toHaveLength(GW);
    });
  });

  it('creates grid filled with null', () => {
    const grid = mkGrid();
    grid.forEach(row => {
      row.forEach(cell => {
        expect(cell).toBeNull();
      });
    });
  });

  it('returns independent rows (no shared references)', () => {
    const grid = mkGrid();
    grid[0][0] = 'x';
    expect(grid[1][0]).toBeNull();
  });
});

describe('DIR', () => {
  it('defines right direction', () => {
    expect(DIR.R).toEqual([1, 0]);
  });

  it('defines left direction', () => {
    expect(DIR.L).toEqual([-1, 0]);
  });

  it('defines down direction', () => {
    expect(DIR.D).toEqual([0, 1]);
  });

  it('defines up direction', () => {
    expect(DIR.U).toEqual([0, -1]);
  });
});

describe('uid', () => {
  beforeEach(() => {
    resetUid();
  });

  it('returns 1 on first call after reset', () => {
    expect(uid()).toBe(1);
  });

  it('increments on each call', () => {
    expect(uid()).toBe(1);
    expect(uid()).toBe(2);
    expect(uid()).toBe(3);
  });

  it('resets to 0 on resetUid', () => {
    uid();
    uid();
    resetUid();
    expect(uid()).toBe(1);
  });
});

describe('itemMeta', () => {
  it('returns fallback for null type', () => {
    const meta = itemMeta(null);
    expect(meta.color).toBe('#fff');
    expect(meta.icon).toBe('·');
  });

  it('returns fallback for undefined type', () => {
    const meta = itemMeta(undefined);
    expect(meta.color).toBe('#fff');
  });

  it('returns waste icon for waste_plastic', () => {
    const meta = itemMeta('waste_plastic');
    expect(meta.color).toBe('#6b7280');
    expect(meta.icon).toBe('🗑');
  });

  it('returns processed icon for processed_plastic', () => {
    const meta = itemMeta('processed_plastic');
    expect(meta.color).toBe('#f59e0b');
    expect(meta.icon).toBe('♻');
  });

  it('returns energy waste icon for energy_waste_plastic', () => {
    const meta = itemMeta('energy_waste_plastic');
    expect(meta.color).toBe('#ef4444');
    expect(meta.icon).toBe('☢');
  });

  it('returns processed icon with tier color for processed_paper', () => {
    const meta = itemMeta('processed_paper');
    expect(meta.color).toBe('#60a5fa');
  });

  it('returns fallback for unknown type', () => {
    const meta = itemMeta('unknown_type');
    expect(meta.color).toBe('#fff');
    expect(meta.icon).toBe('?');
  });
});
