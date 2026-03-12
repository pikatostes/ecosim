import { TIERS } from '../constants/tiers.js';
import { GW, GH } from '../constants/config.js';

export const itemMeta = (type) => {
  if (!type) return { color: "#fff", icon: "·" };
  if (type.startsWith("energy_waste_")) {
    const tierId = type.replace("energy_waste_", "");
    const tier = TIERS.find(t => t.id === tierId);
    return { color: "#ef4444", icon: tier?.energyWasteIcon ?? "☢" };
  }
  if (type.startsWith("waste_")) {
    const tierId = type.replace("waste_", "");
    const tier = TIERS.find(t => t.id === tierId);
    return { color: "#6b7280", icon: tier?.wasteIcon ?? "🗑" };
  }
  if (type.startsWith("processed_")) {
    const tierId = type.replace("processed_", "");
    const tier = TIERS.find(t => t.id === tierId);
    return { color: tier?.color ?? "#10b981", icon: tier?.processedIcon ?? "♻" };
  }
  return { color: "#fff", icon: "?" };
};

export const mkGrid = () => Array.from({ length: GH }, () => Array(GW).fill(null));

export const DIR = { R: [1, 0], L: [-1, 0], D: [0, 1], U: [0, -1] };

let _uid = 0;
export const uid = () => ++_uid;

export const resetUid = () => { _uid = 0; };
