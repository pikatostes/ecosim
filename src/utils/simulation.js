import { TIERS } from '../constants/tiers.js';
import { BDEF } from '../constants/buildings.js';
import { GW, GH } from '../constants/config.js';
import { DIR, uid } from './helpers.js';

export function simulate({ grid, tick, upgrades, unlockedTiers }) {
  const g = grid.map(row => row.map(c => c ? {
    ...c,
    item: c.item ? { ...c.item } : null,
    proc: c.proc ?? 0,
    energy_spawn_tick: c.energy_spawn_tick ?? 0,
    splitIdx: c.splitIdx ?? 0,
  } : null));

  let moneyDelta = 0;
  let contDelta = 0;
  const events = [];

  const wasteMult = upgrades["waste_slow"] ? 2 : 1;
  const plantMult = upgrades["plant_boost"] ? 0.65 : 1;

  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x]; if (!c) continue;
    const def = BDEF[c.type]; if (def?.cat !== "waste_storage") continue;
    const tier = TIERS.find(t => t.id === def.tier); if (!tier) continue;

    if (tick % tier.wasteSpawnRate === 0 && !c.item) {
      c.item = { type: `waste_${tier.id}`, id: uid() };
    }

    if (tier.energyType !== "solar") {
      const ewRate = Math.round(tier.energyWasteRate * wasteMult);
      c.energy_spawn_tick = (c.energy_spawn_tick ?? 0) + 1;
      if (c.energy_spawn_tick >= ewRate) {
        c.energy_spawn_tick = 0;
        const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        let placed = false;
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= GW || ny < 0 || ny >= GH) continue;
          const target = g[ny][nx];
          if (target && !target.item && BDEF[target.type]?.cat === "belt") {
            target.item = { type: `energy_waste_${tier.id}`, id: uid() };
            placed = true;
            break;
          }
        }
        if (!placed) {
          contDelta += 2;
          events.push({ type: "cont_leak", x, y });
        }
      }
    }
  }

  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x]; if (!c) continue;
    const def = BDEF[c.type]; if (def?.cat !== "plant") continue;
    const tier = TIERS.find(t => t.id === def.tier); if (!tier) continue;
    if (c.item?.type === `waste_${tier.id}`) {
      const procTime = Math.max(1, Math.round(tier.processTime * plantMult));
      c.proc++;
      if (c.proc >= procTime) {
        c.item = { type: `processed_${tier.id}`, id: uid() };
        c.proc = 0;
        events.push({ type: "process", tier: tier.id, x, y });
      }
    }
  }

  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const c = g[y][x];
      if (!c) continue;

      const def = BDEF[c.type];
      if (def?.cat !== "shop") continue;

      const itemType = c.item?.type;
      if (!itemType || !itemType.startsWith("processed_")) continue;

      const tierId = itemType.replace("processed_", "");
      const tier = TIERS.find(t => t.id === tierId);
      if (!tier) continue;

      const bonus = upgrades["shop_bonus"] ? 1.4 : 1;
      const earned = Math.round(tier.sellValue * bonus);

      moneyDelta += earned;
      events.push({ type: "sell", tier: tierId, x, y, val: earned });

      c.item = null;
    }
  }

  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x]; if (!c) continue;
    const def = BDEF[c.type];
    if (def?.cat === "waste_handler" || def?.cat === "incinerator") {
      if (c.item?.type?.startsWith("energy_waste_")) {
        if (def.cat === "incinerator") {
          contDelta += 3;
          events.push({ type: "incinerate", x, y });
        } else {
          events.push({ type: "filter", x, y });
        }
        c.item = null;
      }
    }
  }

  const moved = new Set();
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x];
    if (!c?.item || moved.has(`${x},${y}`)) continue;
    const def = BDEF[c.type]; if (!def) continue;

    let dx = 0, dy = 0;
    if (def.cat === "belt") {
      [dx, dy] = DIR[def.dir];
    } else if (def.cat === "splitter") {
      const opts = [DIR.R, DIR.D];
      [dx, dy] = opts[c.splitIdx % 2];
    } else if (def.cat === "waste_storage") {
      dx = 1; dy = 0;
    } else if (def.cat === "plant") {
      dx = 1; dy = 0;
    } else continue;

    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= GW || ny < 0 || ny >= GH) { c.item = null; continue; }
    const target = g[ny][nx];
    if (!target || target.item) continue;
    target.item = { ...c.item };
    c.item = null;
    moved.add(`${nx},${ny}`);
    if (def.cat === "splitter") c.splitIdx++;
  }

  return { grid: g, moneyDelta, contDelta, events };
}
