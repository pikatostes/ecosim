import { describe, it, expect, beforeEach } from 'vitest';
import { simulate } from './simulation.js';
import { uid, resetUid } from './helpers.js';
import { GW, GH } from '../constants/config.js';

const emptyGrid = () => Array.from({ length: GH }, () => Array(GW).fill(null));

const cell = (type, overrides = {}) => ({
  type,
  id: uid(),
  item: null,
  proc: 0,
  energy_spawn_tick: 0,
  splitIdx: 0,
  ...overrides,
});

beforeEach(() => {
  resetUid();
});

describe('empty grid', () => {
  it('returns identical grid when no buildings exist', () => {
    const grid = emptyGrid();
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid).toEqual(grid);
    expect(result.moneyDelta).toBe(0);
    expect(result.contDelta).toBe(0);
    expect(result.events).toEqual([]);
  });
});

describe('waste storage', () => {
  it('spawns waste item when tick matches spawn rate', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic');
    const result = simulate({ grid, tick: 6, upgrades: {} });
    expect(result.grid[0][0].item).not.toBeNull();
    expect(result.grid[0][0].item.type).toBe('waste_plastic');
  });

  it('does not spawn waste on non-matching tick', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic');
    const result = simulate({ grid, tick: 5, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
  });

  it('does not overwrite existing item', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic', { item: { type: 'waste_plastic', id: 999 } });
    const result = simulate({ grid, tick: 6, upgrades: {} });
    expect(result.grid[0][0].item.id).toBe(999);
  });

  it('spawns waste for plastic at tick 6', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic');
    const r = simulate({ grid, tick: 6, upgrades: {} });
    expect(r.grid[0][0].item.type).toBe('waste_plastic');
  });

  it('spawns waste for paper at tick 5', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_paper');
    const r = simulate({ grid, tick: 5, upgrades: {} });
    expect(r.grid[0][0].item.type).toBe('waste_paper');
  });

  it('spawns waste for glass at tick 7', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_glass');
    const r = simulate({ grid, tick: 7, upgrades: {} });
    expect(r.grid[0][0].item.type).toBe('waste_glass');
  });

  it('spawns waste for organic at tick 4', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_organic');
    const r = simulate({ grid, tick: 4, upgrades: {} });
    expect(r.grid[0][0].item.type).toBe('waste_organic');
  });
});

describe('energy waste', () => {
  it('places energy waste on adjacent belt when timer expires', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    grid[1][0] = cell('belt_R');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[1][0].item).not.toBeNull();
    expect(result.grid[1][0].item.type).toContain('energy_waste');
    expect(result.contDelta).toBe(0);
  });

  it('leaks contamination when no adjacent belt', () => {
    const grid = emptyGrid();
    grid[5][5] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[5][5].item).toBeNull();
    expect(result.contDelta).toBe(2);
    expect(result.events.some(e => e.type === 'cont_leak')).toBe(true);
  });

  it('does not produce energy waste for solar (organic) tier', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_organic', { energy_spawn_tick: 999 });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.contDelta).toBe(0);
  });

  it('spawns slower with waste_slow upgrade', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    grid[1][0] = cell('belt_R');
    const result = simulate({ grid, tick: 1, upgrades: { waste_slow: true } });
    expect(result.grid[1][0].item).toBeNull();
  });
});

describe('plant processing', () => {
  it('processes waste after enough ticks', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('plant_plastic', { item: { type: 'waste_plastic', id: 10 }, proc: 3 });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item.type).toBe('processed_plastic');
    expect(result.grid[0][0].proc).toBe(0);
    expect(result.events.some(e => e.type === 'process')).toBe(true);
  });

  it('increments proc counter each tick during processing', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('plant_plastic', { item: { type: 'waste_plastic', id: 10 }, proc: 2 });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item.type).toBe('waste_plastic');
    expect(result.grid[0][0].proc).toBe(3);
  });

  it('processes faster with plant_boost upgrade', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('plant_plastic', { item: { type: 'waste_plastic', id: 10 }, proc: 2 });
    const result = simulate({ grid, tick: 1, upgrades: { plant_boost: true } });
    expect(result.grid[0][0].item.type).toBe('processed_plastic');
  });

  it('ignores items of wrong tier', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('plant_plastic', { item: { type: 'waste_paper', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item.type).toBe('waste_paper');
    expect(result.grid[0][0].proc).toBe(0);
  });
});

describe('shop selling', () => {
  it('sells processed item and adds money', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('shop', { item: { type: 'processed_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.moneyDelta).toBe(10);
    expect(result.events.some(e => e.type === 'sell')).toBe(true);
  });

  it('pays bonus with shop_bonus upgrade', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('shop', { item: { type: 'processed_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: { shop_bonus: true } });
    expect(result.moneyDelta).toBe(14);
  });

  it('ignores waste items', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('shop', { item: { type: 'waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.moneyDelta).toBe(0);
    expect(result.grid[0][0].item).not.toBeNull();
  });

  it('sells each tier for correct value', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('shop', { item: { type: 'processed_plastic', id: 10 } });
    grid[1][0] = cell('shop', { item: { type: 'processed_paper', id: 11 } });
    grid[2][0] = cell('shop', { item: { type: 'processed_glass', id: 12 } });
    grid[3][0] = cell('shop', { item: { type: 'processed_organic', id: 13 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.moneyDelta).toBe(10 + 15 + 20 + 25);
  });
});

describe('filter and incinerator', () => {
  it('filter removes energy waste with no penalty', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_handler', { item: { type: 'energy_waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.contDelta).toBe(0);
    expect(result.events.some(e => e.type === 'filter')).toBe(true);
  });

  it('incinerator removes energy waste but adds contamination', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('incinerator', { item: { type: 'energy_waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.contDelta).toBe(3);
    expect(result.events.some(e => e.type === 'incinerate')).toBe(true);
  });

  it('filter with auto_clean pulls energy waste from adjacent cell', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_handler');
    grid[0][1] = cell('belt_R', { item: { type: 'energy_waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: { auto_clean: true } });
    expect(result.grid[0][1].item).toBeNull();
    expect(result.events.some(e => e.type === 'filter')).toBe(true);
  });

  it('filter without auto_clean does not pull from adjacent', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_handler');
    grid[0][1] = cell('belt_R', { item: { type: 'energy_waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][1].item).not.toBeNull();
  });

  it('incinerator does not get auto_clean benefit', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('incinerator');
    grid[0][1] = cell('belt_R', { item: { type: 'energy_waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: { auto_clean: true } });
    expect(result.grid[0][1].item).not.toBeNull();
  });
});

describe('belt movement', () => {
  it('moves item right on belt_R', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('belt_R', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][1] = cell('belt_R');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.grid[0][1].item).not.toBeNull();
    expect(result.grid[0][1].item.type).toBe('waste_plastic');
  });

  it('moves item left on belt_L', () => {
    const grid = emptyGrid();
    grid[0][1] = cell('belt_L', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][0] = cell('belt_L');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item.type).toBe('waste_plastic');
  });

  it('moves item down on belt_D', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('belt_D', { item: { type: 'waste_plastic', id: 10 } });
    grid[1][0] = cell('belt_D');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[1][0].item.type).toBe('waste_plastic');
  });

  it('moves item up on belt_U', () => {
    const grid = emptyGrid();
    grid[1][0] = cell('belt_U', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][0] = cell('belt_U');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item.type).toBe('waste_plastic');
  });

  it('stops when target cell is occupied', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('belt_R', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][1] = cell('belt_R', { item: { type: 'waste_paper', id: 11 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).not.toBeNull();
    expect(result.grid[0][1].item.type).toBe('waste_paper');
  });

  it('item disappears when moving off grid edge', () => {
    const grid = emptyGrid();
    grid[0][GW - 1] = cell('belt_R', { item: { type: 'waste_plastic', id: 10 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][GW - 1].item).toBeNull();
  });
});

describe('splitter', () => {
  it('alternates output between right and down', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('splitter', { item: { type: 'waste_plastic', id: 10 }, splitIdx: 0 });
    grid[0][1] = cell('belt_R');
    grid[1][0] = cell('belt_D');
    const result1 = simulate({ grid, tick: 1, upgrades: {} });
    expect(result1.grid[0][1].item.type).toBe('waste_plastic'); // right first

    result1.grid[0][0].item = { type: 'waste_plastic', id: 11 };
    result1.grid[0][0].splitIdx = 1;
    result1.grid[0][1].item = null;
    const result2 = simulate({ grid: result1.grid, tick: 2, upgrades: {} });
    expect(result2.grid[1][0].item.type).toBe('waste_plastic'); // down second
  });
});

describe('item ejection from buildings', () => {
  it('waste_storage ejects item to the right', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][1] = cell('belt_R');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.grid[0][1].item.type).toBe('waste_plastic');
  });

  it('plant ejects processed item to the right', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('plant_plastic', { item: { type: 'processed_plastic', id: 10 }, proc: 4 });
    grid[0][1] = cell('belt_R');
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.grid[0][0].item).toBeNull();
    expect(result.grid[0][1].item.type).toBe('processed_plastic');
  });
});

describe('contamination accumulation', () => {
  it('multiple leaks in same tick add up contDelta', () => {
    const grid = emptyGrid();
    grid[5][5] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    grid[6][5] = cell('waste_storage_paper', { energy_spawn_tick: 9 });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.contDelta).toBe(4);
  });

  it('leak and incinerator contDelta stack in same tick', () => {
    const grid = emptyGrid();
    grid[5][5] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    grid[6][5] = cell('incinerator', { item: { type: 'energy_waste_plastic', id: 99 } });
    const result = simulate({ grid, tick: 1, upgrades: {} });
    expect(result.contDelta).toBe(5);
  });

  it('accumulates from multiple leaks', () => {
    const grid = emptyGrid();
    grid[5][5] = cell('waste_storage_plastic', { energy_spawn_tick: 11 });
    const r1 = simulate({ grid, tick: 1, upgrades: {} });
    expect(r1.contDelta).toBe(2);

    r1.grid[5][5].energy_spawn_tick = 11;
    const r2 = simulate({ grid: r1.grid, tick: 2, upgrades: {} });
    expect(r2.contDelta).toBe(2);
  });
});

describe('full pipeline integration', () => {
  it('waste -> belt -> plant -> belt -> shop generates money', () => {
    const grid = emptyGrid();
    grid[0][0] = cell('waste_storage_plastic', { item: { type: 'waste_plastic', id: 10 } });
    grid[0][1] = cell('belt_R');
    grid[0][2] = cell('belt_R');
    grid[0][3] = cell('plant_plastic', { proc: 3 });
    grid[0][4] = cell('belt_R');
    grid[0][5] = cell('shop');

    let state = { grid, moneyDelta: 0, contDelta: 0, events: [] };

    state = simulate({ grid: state.grid, tick: 1, upgrades: {} });
    expect(state.grid[0][1].item.type).toBe('waste_plastic');

    state = simulate({ grid: state.grid, tick: 2, upgrades: {} });
    expect(state.grid[0][2].item.type).toBe('waste_plastic');

    state = simulate({ grid: state.grid, tick: 3, upgrades: {} });
    expect(state.grid[0][3].item.type).toBe('waste_plastic');

    state = simulate({ grid: state.grid, tick: 4, upgrades: {} });
    expect(state.grid[0][4].item.type).toBe('processed_plastic');

    state = simulate({ grid: state.grid, tick: 5, upgrades: {} });
    expect(state.grid[0][5].item.type).toBe('processed_plastic');

    state = simulate({ grid: state.grid, tick: 6, upgrades: {} });
    expect(state.grid[0][5].item).toBeNull();
    expect(state.moneyDelta).toBe(10);
  });
});
