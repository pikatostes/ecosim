import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════════
const GW = 26, GH = 15, CS = 42;
const BASE_TICK = 550;

// ═══════════════════════════════════════════════════════════════════════
//  TIER PROGRESSION (4 tiers as requested)
// ═══════════════════════════════════════════════════════════════════════
const TIERS = [
  {
    id: "plastic",
    name: "Plástico",
    color: "#f59e0b",
    icon: "🧴",
    wasteIcon: "🗑",
    processedIcon: "♻",
    // Generation rates
    wasteSpawnRate: 6,        // ticks between waste spawns in storage
    energyWasteRate: 12,      // ticks between energy waste spawns
    processTime: 4,           // ticks to process 1 waste
    // Energy type
    energyType: "diesel",
    energyIcon: "🛢",
    energyWasteIcon: "☢",
    energyColor: "#78716c",
    // Money
    sellValue: 10,
    unlockCost: 500,          // money needed to unlock next tier
  },
  {
    id: "paper",
    name: "Papel",
    color: "#60a5fa",
    icon: "📄",
    wasteIcon: "🗑",
    processedIcon: "📋",
    wasteSpawnRate: 5,
    energyWasteRate: 10,
    processTime: 4,
    energyType: "coal",
    energyIcon: "🪨",
    energyWasteIcon: "☣",
    energyColor: "#57534e",
    sellValue: 15,
    unlockCost: 1000,
  },
  {
    id: "glass",
    name: "Vidrio",
    color: "#34d399",
    icon: "🍾",
    wasteIcon: "🗑",
    processedIcon: "🔷",
    wasteSpawnRate: 7,
    energyWasteRate: 14,
    processTime: 5,
    energyType: "gas",
    energyIcon: "💨",
    energyWasteIcon: "☠",
    energyColor: "#6ee7b7",
    sellValue: 20,
    unlockCost: 2000,
  },
  {
    id: "organic",
    name: "Orgánico",
    color: "#c084fc",
    icon: "🌿",
    wasteIcon: "🗑",
    processedIcon: "🌱",
    wasteSpawnRate: 4,
    energyWasteRate: 999, // solar = no waste
    processTime: 3,
    energyType: "solar",
    energyIcon: "☀",
    energyWasteIcon: "",
    energyColor: "#fde68a",
    sellValue: 25,
    unlockCost: 4000, // final tier
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  BUILDING DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════
const BDEF = {
  // ── Waste Storage (generates waste items) ──
  waste_storage_plastic: { name: "Almacén P", cat: "waste_storage", tier: "plastic", icon: "🗑", color: "#6b7280", cost: 40, desc: "Genera residuos de plástico" },
  waste_storage_paper: { name: "Almacén A", cat: "waste_storage", tier: "paper", icon: "🗑", color: "#6b7280", cost: 50, desc: "Genera residuos de papel" },
  waste_storage_glass: { name: "Almacén V", cat: "waste_storage", tier: "glass", icon: "🗑", color: "#6b7280", cost: 60, desc: "Genera residuos de vidrio" },
  waste_storage_organic: { name: "Almacén O", cat: "waste_storage", tier: "organic", icon: "🗑", color: "#6b7280", cost: 55, desc: "Genera residuos orgánicos" },

  // ── Processing Plants ──
  plant_plastic: { name: "Planta P", cat: "plant", tier: "plastic", icon: "🏭", color: "#f59e0b", cost: 100, desc: "Procesa residuos de plástico" },
  plant_paper: { name: "Planta A", cat: "plant", tier: "paper", icon: "🏗", color: "#60a5fa", cost: 120, desc: "Procesa residuos de papel" },
  plant_glass: { name: "Planta V", cat: "plant", tier: "glass", icon: "⚗", color: "#34d399", cost: 150, desc: "Procesa residuos de vidrio" },
  plant_organic: { name: "Planta O", cat: "plant", tier: "organic", icon: "🌿", color: "#c084fc", cost: 130, desc: "Procesa residuos orgánicos" },

  // ── Shop (single building - converts processed material to money) ──
  shop: { name: "Tienda", cat: "shop", icon: "💰", color: "#fbbf24", cost: 80, desc: "Vende material reciclado por dinero" },

  // ── Waste Handlers (consume energy waste items) ──
  waste_handler: { name: "Filtro", cat: "waste_handler", icon: "🔧", color: "#94a3b8", cost: 70, desc: "Elimina residuos energéticos de cualquier tipo" },
  incinerator: { name: "Incineradora", cat: "incinerator", icon: "🔥", color: "#ef4444", cost: 30, desc: "Destruye ítems pero genera contaminación" },

  // ── Belts ──
  belt_R: { name: "→", cat: "belt", dir: "R", icon: "→", color: "#374151", cost: 5, desc: "Cinta derecha" },
  belt_L: { name: "←", cat: "belt", dir: "L", icon: "←", color: "#374151", cost: 5, desc: "Cinta izquierda" },
  belt_D: { name: "↓", cat: "belt", dir: "D", icon: "↓", color: "#374151", cost: 5, desc: "Cinta abajo" },
  belt_U: { name: "↑", cat: "belt", dir: "U", icon: "↑", color: "#374151", cost: 5, desc: "Cinta arriba" },

  // ── Splitter ──
  splitter: { name: "Divisor", cat: "splitter", icon: "⤵", color: "#8b5cf6", cost: 40, desc: "Alterna salidas entre derecha y abajo" },
};

// ═══════════════════════════════════════════════════════════════════════
//  UPGRADES
// ═══════════════════════════════════════════════════════════════════════
const UPGRADES = [
  { id: "belt_2x", name: "Cintas Rápidas", icon: "⚡", desc: "Cintas mueven ítems 2× más rápido", cost: 300, req: [] },
  { id: "plant_boost", name: "Plantas Eficientes", icon: "📈", desc: "Plantas procesan 1.5× más rápido", cost: 400, req: [] },
  { id: "shop_bonus", name: "Precios Premium", icon: "💎", desc: "La tienda paga 40% más", cost: 500, req: ["plant_boost"] },
  { id: "waste_slow", name: "Filtros Mejorados", icon: "🔬", desc: "Residuos energéticos se generan 2× más lento", cost: 600, req: ["belt_2x"] },
  { id: "auto_clean", name: "Limpieza Auto", icon: "🤖", desc: "Los filtros trabajan automáticamente", cost: 800, req: ["waste_slow", "shop_bonus"] },
  { id: "overclock", name: "Overclocking", icon: "🔥", desc: "Todo el sistema va 1.5× más rápido", cost: 1500, req: ["auto_clean"] },
];

// ═══════════════════════════════════════════════════════════════════════
//  ITEM TYPES & HELPERS
// ═══════════════════════════════════════════════════════════════════════
// Item types: "waste_X", "processed_X", "energy_waste_X"
const itemMeta = (type) => {
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

const mkGrid = () => Array.from({ length: GH }, () => Array(GW).fill(null));
const DIR = { R: [1, 0], L: [-1, 0], D: [0, 1], U: [0, -1] };
let _uid = 0;
const uid = () => ++_uid;

// ═══════════════════════════════════════════════════════════════════════
//  SIMULATION
// ═══════════════════════════════════════════════════════════════════════
function simulate({ grid, tick, upgrades, unlockedTiers }) {
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

  // ── 1. Waste storages spawn waste + energy_waste items ──
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x]; if (!c) continue;
    const def = BDEF[c.type]; if (def?.cat !== "waste_storage") continue;
    const tier = TIERS.find(t => t.id === def.tier); if (!tier) continue;

    // Spawn main waste
    if (tick % tier.wasteSpawnRate === 0 && !c.item) {
      c.item = { type: `waste_${tier.id}`, id: uid() };
    }

    // Spawn energy waste (only if not solar)
    if (tier.energyType !== "solar") {
      const ewRate = Math.round(tier.energyWasteRate * wasteMult);
      c.energy_spawn_tick = (c.energy_spawn_tick ?? 0) + 1;
      if (c.energy_spawn_tick >= ewRate) {
        c.energy_spawn_tick = 0;
        // Try to push energy waste to adjacent belt
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
          // No belt adjacent → accumulate contamination
          contDelta += 2;
          events.push({ type: "cont_leak", x, y });
        }
      }
    }
  }

  // ── 2. Plants process waste → processed ──
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

  // ── 3. Shop consumes processed → money ──
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


  // ── 4. Waste handlers consume energy_waste ──
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

  // ── 5. Belt movement ──
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
      // push right by default
      dx = 1; dy = 0;
    } else if (def.cat === "plant") {
      // push right
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

// ═══════════════════════════════════════════════════════════════════════
//  CELL RENDERER
// ═══════════════════════════════════════════════════════════════════════
function Cell({ cell, x, y, onClick, onRightClick, isHovered, selTool, delMode }) {
  const def = cell ? BDEF[cell.type] : null;
  const selDef = selTool ? BDEF[selTool] : null;
  const isBelt = def?.cat === "belt";

  const border = cell
    ? `1.5px solid ${def?.color ?? "#374151"}44`
    : isHovered
      ? `1.5px solid ${delMode ? "#ef4444" : "#10b981"}aa`
      : "1px solid #0d1a25";

  const bg = cell
    ? isBelt ? "#0a1621dd" : `${def?.color ?? "#374151"}11`
    : isHovered
      ? delMode ? "#ef444412" : "#10b98112"
      : "#07101a";

  return (
    <div
      onClick={onClick}
      onContextMenu={e => { e.preventDefault(); onRightClick(); }}
      style={{
        width: CS, height: CS,
        background: bg, border,
        boxSizing: "border-box",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", overflow: "hidden",
        transition: "background .08s",
        flexShrink: 0,
      }}
    >
      {/* Belt animation */}
      {isBelt && (
        <div style={{
          position: "absolute", inset: 0, opacity: .25,
          backgroundImage: `repeating-linear-gradient(
            ${def.dir === "R" || def.dir === "L" ? "90deg" : "0deg"},
            #1e3a2f 0px, #1e3a2f 5px, transparent 5px, transparent 10px
          )`,
          animation: `belt${def.dir} .4s linear infinite`,
        }} />
      )}

      {/* Building icon */}
      {cell && (
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", lineHeight: 1 }}>
          <div style={{
            fontSize: isBelt ? 14 : 17,
            filter: `drop-shadow(0 0 4px ${def?.color ?? "#fff"}77)`,
          }}>{def?.icon}</div>

          {/* Processing progress bar */}
          {def?.cat === "plant" && cell.item?.type?.startsWith("waste_") && (
            <div style={{
              position: "absolute", bottom: -2, left: 0, right: 0,
              height: 2, background: "#0d1a25", borderRadius: 1,
            }}>
              <div style={{
                height: "100%", borderRadius: 1,
                background: TIERS.find(t => t.id === def.tier)?.color ?? "#10b981",
                width: `${((cell.proc ?? 0) / TIERS.find(t => t.id === def.tier)?.processTime) * 100}%`,
                transition: "width .2s",
              }} />
            </div>
          )}
        </div>
      )}

      {/* Item traveling on cell */}
      {cell?.item && (() => {
        const meta = itemMeta(cell.item.type);
        return (
          <div style={{
            position: "absolute", bottom: 4, right: 4,
            width: 9, height: 9, borderRadius: "50%",
            background: meta.color,
            boxShadow: `0 0 5px ${meta.color}`,
            zIndex: 4,
            animation: "itemBounce .5s ease-in-out infinite alternate",
          }} />
        );
      })()}

      {/* Ghost preview */}
      {!cell && isHovered && selDef && !delMode && (
        <span style={{ fontSize: 15, opacity: .2, zIndex: 2 }}>{selDef.icon}</span>
      )}

      {/* Delete X */}
      {cell && isHovered && delMode && (
        <div style={{
          position: "absolute", inset: 0, background: "#ef444428",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "#ef4444", zIndex: 10,
        }}>✕</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  UNLOCK MODAL
// ═══════════════════════════════════════════════════════════════════════
function UnlockModal({ tier, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000dd",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: "#070f14", border: `1px solid ${tier.color}`,
        borderRadius: 16, padding: "32px 36px", maxWidth: 400, width: "90%",
        textAlign: "center", boxShadow: `0 0 50px ${tier.color}33`,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{tier.icon}</div>
        <h2 style={{ fontSize: 20, color: tier.color, letterSpacing: 3, marginBottom: 10 }}>
          {tier.name.toUpperCase()} DESBLOQUEADA
        </h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 8, lineHeight: 1.7 }}>
          Ya puedes construir almacenes y plantas de <strong style={{ color: tier.color }}>{tier.name}</strong>.
        </p>
        <p style={{ color: "#4b5563", fontSize: 11, marginBottom: 24 }}>
          Tipo de energía: {tier.energyIcon} {tier.energyType.toUpperCase()}
        </p>
        <button onClick={onClose} style={{
          background: `${tier.color}22`, border: `1px solid ${tier.color}`,
          color: tier.color, borderRadius: 8, padding: "10px 28px",
          cursor: "pointer", fontFamily: "monospace", fontSize: 13, letterSpacing: 2,
        }}>CONTINUAR</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  CONTAMINATION WARNING
// ═══════════════════════════════════════════════════════════════════════
function ContWarning({ level }) {
  if (level < 40) return null;
  return (
    <div style={{
      position: "fixed", top: 60, right: 16, zIndex: 80,
      background: "#1a0505", border: "1px solid #ef4444",
      borderRadius: 10, padding: "12px 16px", maxWidth: 220,
      boxShadow: "0 0 24px #ef444444",
      animation: "pulse .9s infinite alternate",
    }}>
      <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
        ⚠ CONTAMINACIÓN {Math.round(level)}%
      </div>
      <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>
        {level < 70
          ? "Coloca filtros en las rutas de residuos energéticos."
          : "¡NIVEL CRÍTICO! Demasiados residuos sin tratar."}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function EcoSim() {
  const [screen, setScreen] = useState("menu");
  const [grid, setGrid] = useState(mkGrid);
  const [inv, setInv] = useState({ money: 400 });
  const [upgrades, setUpgrades] = useState({});
  const [unlocked, setUnlocked] = useState(["plastic"]);
  const [contLevel, setCont] = useState(0);
  const [tick, setTick] = useState(0);
  const [tool, setTool] = useState("waste_storage_plastic");
  const [delMode, setDelMode] = useState(false);
  const [panel, setPanel] = useState("build");
  const [hovered, setHovered] = useState(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const [showModal, setModal] = useState(null);
  const [stats, setStats] = useState({ totalEarned: 0, processed: 0, filtered: 0 });

  const gridRef = useRef(grid);
  gridRef.current = grid;

  // ── SIMULATION ───────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game" || paused) return;
    const ms = BASE_TICK / speed / (upgrades["overclock"] ? 1.5 : 1);
    const id = setInterval(() => {
      const t = tick + 1;
      setTick(t);

      setGrid(prev => {
        const { grid: next, moneyDelta, contDelta, events: evts } =
          simulate({ grid: prev, tick: t, upgrades, unlockedTiers: unlocked });

        if (moneyDelta) setInv(i => ({ ...i, money: (i.money ?? 0) + moneyDelta }));
        if (contDelta) setCont(c => Math.min(100, c + contDelta));

        if (evts.length) {
          const stamped = evts.map(e => ({ ...e, uid: uid(), born: Date.now() }));
          setEvents(p => [...p, ...stamped].slice(-16));
          setStats(s => ({
            ...s,
            totalEarned: s.totalEarned + moneyDelta,
            processed: s.processed + evts.filter(e => e.type === "process").length,
            filtered: s.filtered + evts.filter(e => e.type === "filter").length,
          }));
        }

        return next;
      });
    }, Math.max(50, ms));
    return () => clearInterval(id);
  }, [screen, paused, speed, upgrades, unlocked, tick]);

  // Clean old events
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setEvents(e => e.filter(ev => now - ev.born < 900));
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Check unlock conditions
  useEffect(() => {
    TIERS.forEach((tier, i) => {
      if (i === TIERS.length - 1 || unlocked.includes(tier.id)) return;
      const cost = TIERS[i - 1]?.unlockCost; if (!cost) return;
      if ((inv.money ?? 0) >= cost && !unlocked.includes(tier.id)) {
        setUnlocked(u => [...u, tier.id]);
        setModal(tier.id);
      }
    });
  }, [inv.money, unlocked]);

  // Keyboard
  useEffect(() => {
    const h = e => {
      if (e.key === "Delete" || e.key === "Backspace") setDelMode(d => !d);
      if (e.key === " ") { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Place/delete
  const handleCell = useCallback((x, y) => {
    if (delMode) {
      setGrid(g => { const n = g.map(r => [...r]); n[y][x] = null; return n; });
      return;
    }
    if (!tool) return;
    const def = BDEF[tool]; if (!def) return;
    if ((inv.money ?? 0) < def.cost) return;
    setGrid(g => {
      const n = g.map(r => [...r]);
      if (n[y][x]) return g;
      n[y][x] = { type: tool, id: uid(), item: null, proc: 0, energy_spawn_tick: 0, splitIdx: 0 };
      return n;
    });
    setInv(i => ({ ...i, money: i.money - def.cost }));
  }, [tool, delMode, inv]);

  // Buy upgrade
  const buyUpgrade = useCallback((upg) => {
    if (upgrades[upg.id]) return;
    if (!upg.req.every(r => upgrades[r])) return;
    if ((inv.money ?? 0) < upg.cost) return;
    setUpgrades(u => ({ ...u, [upg.id]: true }));
    setInv(i => ({ ...i, money: i.money - upg.cost }));
  }, [upgrades, inv]);

  // Derived
  const availableBuildings = useMemo(() => {
    const tiers = new Set(unlocked);
    return Object.entries(BDEF).filter(([, d]) => !d.tier || tiers.has(d.tier));
  }, [unlocked]);

  const contColor = contLevel < 30 ? "#10b981" : contLevel < 65 ? "#f59e0b" : "#ef4444";

  const CATS = [
    { id: "waste_storage", label: "① ALMACÉN RESIDUOS" },
    { id: "plant", label: "② PLANTA PROCESADO" },
    { id: "shop", label: "③ TIENDA" },
    { id: "belt", label: "CINTAS" },
    { id: "splitter", label: "DIVISOR" },
    { id: "waste_handler", label: "GESTIÓN RESIDUOS" },
    { id: "incinerator", label: "INCINERADORA" },
  ];

  // ══════════════════════════════════════════════════════════
  //  MENU
  // ══════════════════════════════════════════════════════════
  if (screen === "menu") return (
    <div style={S.root}>
      <GS />
      <div style={S.menuBg}>
        <div style={S.menuCard}>
          <div style={S.menuHead}>
            <div style={{ fontSize: 54, filter: "drop-shadow(0 0 18px #10b981)", lineHeight: 1 }}>♻</div>
            <h1 style={S.menuTitle}>ECOSIM</h1>
            <p style={S.menuSub}>RECYCLING AUTOMATION SYSTEM</p>
          </div>
          <div style={S.menuBody}>
            <div style={S.chainRow}>
              {TIERS.map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    background: `${t.color}15`, border: `1px solid ${t.color}66`,
                    borderRadius: 9, padding: "10px 12px", textAlign: "center",
                    opacity: i === 0 ? 1 : 0.4,
                  }}>
                    <div style={{ fontSize: 24 }}>{t.icon}</div>
                    <div style={{ fontSize: 9, color: t.color, marginTop: 3, letterSpacing: 1 }}>{t.name.toUpperCase()}</div>
                  </div>
                  {i < TIERS.length - 1 && <span style={{ color: "#1a3a2f", fontSize: 16 }}>→</span>}
                </div>
              ))}
            </div>

            <div style={S.menuSteps}>
              {[
                ["🗑", "Almacén de Residuos", "Genera residuos automáticamente cada N ticks."],
                ["➡", "Cintas", "Transporta residuos a las plantas de procesado."],
                ["🏭", "Planta de Procesado", "Convierte residuos en material reciclado."],
                ["💰", "Tienda", "Vende el material por dinero. Desbloquea nuevas plantas."],
                ["🔧", "Gestión de Residuos", "Los almacenes generan residuos energéticos. Debes enrutarlos a filtros o contaminarás."],
              ].map(([ic, t, d]) => (
                <div key={t} style={S.menuStep}>
                  <span style={{ fontSize: 19, width: 30, flexShrink: 0 }}>{ic}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#d1d5db", fontWeight: 700 }}>{t}</div>
                    <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>

            <button style={S.startBtn} onClick={() => setScreen("game")}>
              ▶  INICIAR PLANTA
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  //  GAME
  // ══════════════════════════════════════════════════════════
  return (
    <div style={S.root}>
      <GS />

      {showModal && (() => {
        const t = TIERS.find(t => t.id === showModal);
        return t ? <UnlockModal tier={t} onClose={() => setModal(null)} /> : null;
      })()}
      <ContWarning level={contLevel} />

      {/* TOP BAR */}
      <div style={S.topBar}>
        <span style={S.topLogo}>♻ ECOSIM</span>
        <div style={S.topRes}>
          <Chip icon="💰" val={Math.floor(inv.money ?? 0)} color="#fbbf24" label="Dinero" />
          <div style={S.sep} />
          {TIERS.filter((t, i) => unlocked.includes(t.id) && i < TIERS.length - 1).map(t => {
            const need = t.unlockCost;
            const have = inv.money ?? 0;
            return (
              <Chip key={t.id} icon={t.icon} val={`${have}/${need}`} color={t.color} label={`→${TIERS[TIERS.indexOf(t) + 1]?.name}`} />
            );
          })}
          <div style={S.sep} />
          <Chip icon="☣" val={`${Math.round(contLevel)}%`} color={contColor} label="Contam." />
        </div>
        <div style={S.topCtrl}>
          <CB active={paused} onClick={() => setPaused(p => !p)}>{paused ? "▶" : "⏸"}</CB>
          <CB active={speed === 2} onClick={() => setSpeed(s => s === 1 ? 2 : 1)}>×{speed}</CB>
          <span style={{ fontSize: 9, color: "#1f3a40", marginLeft: 4 }}>T:{tick}</span>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={S.layout}>

        {/* LEFT PANEL */}
        <div style={S.left}>
          <div style={S.tabs}>
            {[["build", "🔧"], ["tech", "🔬"], ["info", "📊"]].map(([id, ic]) => (
              <button key={id} onClick={() => setPanel(id)}
                style={{ ...S.tab, ...(panel === id ? S.tabOn : {}) }}>
                {ic}
              </button>
            ))}
          </div>

          {panel === "build" && (
            <div style={S.pBody}>
              <button onClick={() => setDelMode(d => !d)}
                style={{ ...S.delBtn, ...(delMode ? S.delBtnOn : {}) }}>
                {delMode ? "🗑 DEMOLICIÓN [ON]" : "🗑 Demoler [Del]"}
              </button>

              <div style={S.catLabel}>PROGRESO</div>
              {TIERS.map((tier, i) => {
                const isUnlocked = unlocked.includes(tier.id);
                const prevTier = TIERS[i - 1];
                const isNext = !isUnlocked && prevTier && unlocked.includes(prevTier.id);
                const need = prevTier?.unlockCost ?? 0;
                const have = inv.money ?? 0;
                return (
                  <div key={tier.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 3px", opacity: isUnlocked ? 1 : isNext ? .85 : .25,
                  }}>
                    <span style={{ fontSize: 15 }}>{tier.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 9, color: isUnlocked ? tier.color : "#374151",
                        fontWeight: isUnlocked ? 700 : 400, letterSpacing: .5
                      }}>
                        {tier.name} {isUnlocked ? "✓" : ""}
                      </div>
                      {isNext && (
                        <div style={{
                          height: 3, background: "#0d1a25", borderRadius: 2, marginTop: 2,
                        }}>
                          <div style={{
                            height: "100%", borderRadius: 2, background: tier.color,
                            width: `${Math.min(100, (have / need) * 100)}%`, transition: "width .5s",
                          }} />
                        </div>
                      )}
                    </div>
                    {isNext && <span style={{ fontSize: 8, color: "#374151" }}>{have}/{need}</span>}
                  </div>
                );
              })}

              {CATS.map(cat => {
                const items = availableBuildings.filter(([, d]) => d.cat === cat.id);
                if (!items.length) return null;
                return (
                  <div key={cat.id}>
                    <div style={S.catLabel}>{cat.label}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 4 }}>
                      {items.map(([id, def]) => {
                        const afford = (inv.money ?? 0) >= def.cost;
                        const sel = tool === id && !delMode;
                        return (
                          <button key={id}
                            onClick={() => { setTool(id); setDelMode(false); }}
                            title={`${def.name}\n${def.desc}\n$${def.cost}`}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center",
                              gap: 2, padding: "5px 3px",
                              background: sel ? `${def.color}22` : "#0a1621",
                              border: `1px solid ${sel ? def.color : "#0d1a25"}`,
                              borderRadius: 5, cursor: "pointer",
                              opacity: afford ? 1 : .4,
                              fontFamily: "monospace",
                              transition: "all .1s",
                            }}>
                            <span style={{ fontSize: 15, filter: `drop-shadow(0 0 3px ${def.color}88)` }}>
                              {def.icon}
                            </span>
                            <div style={{ fontSize: 8, color: sel ? def.color : "#4b5563", textAlign: "center", lineHeight: 1.2 }}>
                              {def.name}
                            </div>
                            <div style={{ fontSize: 8, color: afford ? "#fbbf24" : "#374151" }}>
                              ${def.cost}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {panel === "tech" && (
            <div style={S.pBody}>
              <div style={S.catLabel}>INVESTIGACIÓN</div>
              {UPGRADES.map(upg => {
                const done = !!upgrades[upg.id];
                const prereq = upg.req.every(r => upgrades[r]);
                const canBuy = !done && prereq && (inv.money ?? 0) >= upg.cost;
                const locked = !done && !prereq;
                return (
                  <div key={upg.id} style={{
                    background: done ? "#071a0f" : "#0a1621",
                    border: `1px solid ${done ? "#10b98144" : locked ? "#0d1a25" : "#1f2e37"}`,
                    borderRadius: 6, padding: "8px", marginBottom: 5,
                    opacity: locked ? .3 : 1,
                  }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16 }}>{upg.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: done ? "#10b981" : "#d1d5db" }}>
                          {upg.name} {done && "✓"}
                        </div>
                        <div style={{ fontSize: 8, color: "#4b5563", marginTop: 2, lineHeight: 1.4 }}>{upg.desc}</div>
                        {upg.req.length > 0 && !done && (
                          <div style={{ fontSize: 7, marginTop: 2, color: prereq ? "#10b98155" : "#ef444455" }}>
                            {prereq ? "✓" : "✗"} req: {upg.req.join(", ")}
                          </div>
                        )}
                      </div>
                      {!done && (
                        <button onClick={() => buyUpgrade(upg)} disabled={!canBuy}
                          style={{
                            background: canBuy ? "#071a0f" : "transparent",
                            border: `1px solid ${canBuy ? "#10b981" : "#1f2e37"}`,
                            color: canBuy ? "#10b981" : "#374151",
                            borderRadius: 4, padding: "3px 6px", fontSize: 8,
                            cursor: canBuy ? "pointer" : "default", fontFamily: "monospace",
                            flexShrink: 0,
                          }}>
                          💰{upg.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {panel === "info" && (
            <div style={S.pBody}>
              <div style={S.catLabel}>PRODUCCIÓN</div>
              {[
                ["Total ganado", `$${stats.totalEarned}`, "#fbbf24"],
                ["Procesados", stats.processed, "#10b981"],
                ["Residuos filtrados", stats.filtered, "#94a3b8"],
                ["Contaminación", `${Math.round(contLevel)}%`, contColor],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 2px", borderBottom: "1px solid #0d1a25" }}>
                  <span style={{ fontSize: 9, color: "#4b5563" }}>{l}</span>
                  <span style={{ fontSize: 9, color: c, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={S.catLabel}>PLANTA</div>
              {[
                ["Edificios", grid.flat().filter(c => c).length, "#94a3b8"],
                ["Ítems", grid.flat().filter(c => c?.item).length, "#60a5fa"],
                ["Ticks", tick, "#374151"],
                ["Mejoras", `${Object.keys(upgrades).length}/${UPGRADES.length}`, "#10b981"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 2px", borderBottom: "1px solid #0d1a25" }}>
                  <span style={{ fontSize: 9, color: "#4b5563" }}>{l}</span>
                  <span style={{ fontSize: 9, color: c, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GRID */}
        <div style={S.gridArea} onMouseLeave={() => setHovered(null)}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg,${contColor} ${contLevel}%,transparent ${contLevel}%)`,
            zIndex: 10, transition: "background 1s",
          }} />

          {paused && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20, background: "#00000088",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: "#10b981", letterSpacing: 4, pointerEvents: "none",
            }}>⏸ PAUSADO</div>
          )}

          {events.map(ev => (
            ev.type === "sell" ? (
              <div key={ev.uid} style={{
                position: "absolute",
                left: ev.x * CS + CS / 2, top: ev.y * CS - 10,
                fontSize: 10, fontWeight: 700, color: "#fbbf24",
                pointerEvents: "none", zIndex: 15,
                animation: "flashUp .8s ease-out forwards",
                transform: "translateX(-50%)",
              }}>+${ev.val}</div>
            ) : ev.type === "process" ? (
              <div key={ev.uid} style={{
                position: "absolute",
                left: ev.x * CS + CS / 2, top: ev.y * CS - 10,
                fontSize: 9, color: TIERS.find(t => t.id === ev.tier)?.color,
                pointerEvents: "none", zIndex: 15,
                animation: "flashUp .8s ease-out forwards",
                transform: "translateX(-50%)",
              }}>♻</div>
            ) : ev.type === "cont_leak" || ev.type === "incinerate" ? (
              <div key={ev.uid} style={{
                position: "absolute",
                left: ev.x * CS + CS / 2, top: ev.y * CS - 10,
                fontSize: 9, color: "#ef4444",
                pointerEvents: "none", zIndex: 15,
                animation: "flashUp .8s ease-out forwards",
                transform: "translateX(-50%)",
              }}>☣</div>
            ) : ev.type === "filter" ? (
              <div key={ev.uid} style={{
                position: "absolute",
                left: ev.x * CS + CS / 2, top: ev.y * CS - 10,
                fontSize: 8, color: "#94a3b8",
                pointerEvents: "none", zIndex: 15,
                animation: "flashUp .8s ease-out forwards",
                transform: "translateX(-50%)",
              }}>✓</div>
            ) : null
          ))}

          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GW},${CS}px)`,
            gridTemplateRows: `repeat(${GH},${CS}px)`,
          }}>
            {grid.map((row, y) => row.map((cell, x) => (
              <Cell key={`${x},${y}`}
                cell={cell} x={x} y={y}
                onClick={() => handleCell(x, y)}
                onRightClick={() => { setGrid(g => { const n = g.map(r => [...r]); n[y][x] = null; return n; }); }}
                isHovered={hovered?.[0] === x && hovered?.[1] === y}
                selTool={tool}
                delMode={delMode}
                onMouseEnter={() => setHovered([x, y])}
              />
            )))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={S.right}>
          <div style={S.catLabel}>SELECCIONADO</div>
          {delMode ? (
            <div style={{ textAlign: "center", padding: 12 }}>
              <div style={{ fontSize: 26, color: "#ef4444" }}>🗑</div>
              <div style={{ fontSize: 9, color: "#ef4444", marginTop: 4, letterSpacing: 1 }}>DEMOLICIÓN</div>
              <div style={{ fontSize: 8, color: "#374151", marginTop: 2 }}>Click o RClick</div>
            </div>
          ) : tool && BDEF[tool] ? (() => {
            const def = BDEF[tool];
            const tier = def.tier ? TIERS.find(t => t.id === def.tier) : null;
            return (
              <div style={{ padding: "4px 0" }}>
                <div style={{
                  textAlign: "center", fontSize: 26,
                  filter: `drop-shadow(0 0 8px ${def.color}88)`, marginBottom: 6
                }}>
                  {def.icon}
                </div>
                <div style={{ fontSize: 10, color: "#d1d5db", fontWeight: 700, marginBottom: 4 }}>{def.name}</div>
                <div style={{ fontSize: 9, color: "#4b5563", lineHeight: 1.5, marginBottom: 6 }}>{def.desc}</div>
                <div style={{ fontSize: 10, color: "#fbbf24" }}>💰 ${def.cost}</div>
                {tier && <div style={{ fontSize: 9, color: tier.color, marginTop: 3 }}>{tier.icon} {tier.name}</div>}
              </div>
            );
          })() : null}

          <div style={{ height: 1, background: "#0d1a25", margin: "8px 0" }} />
          <div style={S.catLabel}>FLUJO</div>
          {[
            ["🗑", "Almacén", "Genera residuos + energía"],
            ["➡", "Cinta", "Transporta ítems"],
            ["🏭", "Planta", "Procesa residuos"],
            ["💰", "Tienda", "Vende material"],
            ["🔧", "Filtro", "Elimina residuos energía"],
          ].map(([ic, t, d], i) => (
            <div key={i} style={{ display: "flex", gap: 6, padding: "3px 0", alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, width: 18, flexShrink: 0, marginTop: 1 }}>{ic}</span>
              <div>
                <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: 8, color: "#1f3a40" }}>{d}</div>
              </div>
            </div>
          ))}

          <div style={{ height: 1, background: "#0d1a25", margin: "8px 0" }} />
          <div style={S.catLabel}>CONTROLES</div>
          {[["LClick", "Colocar"], ["RClick", "Demoler"], ["Del", "Toggle"], ["Espacio", "Pausar"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <kbd style={{
                background: "#0d1a25", border: "1px solid #0d1a25", borderRadius: 3,
                padding: "1px 4px", color: "#4b5563", fontSize: 7
              }}>{k}</kbd>
              <span style={{ fontSize: 8, color: "#1f3a40" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
const Chip = ({ icon, val, color, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 5,
    background: "#0a1621", border: "1px solid #0d1a25",
    borderRadius: 5, padding: "3px 8px"
  }}>
    <span style={{ fontSize: 12 }}>{icon}</span>
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{val}</div>
      <div style={{ fontSize: 7, color: "#374151" }}>{label}</div>
    </div>
  </div>
);

const CB = ({ onClick, active, children }) => (
  <button onClick={onClick} style={{
    background: active ? "#10b98118" : "#0a1621",
    border: `1px solid ${active ? "#10b981" : "#0d1a25"}`,
    color: active ? "#10b981" : "#4b5563",
    borderRadius: 4, padding: "3px 9px", fontSize: 12,
    cursor: "pointer", fontFamily: "monospace",
  }}>{children}</button>
);

// ═══════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════
const GS = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#040a0f;overflow:hidden;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:#1f2e37;border-radius:3px;}
    @keyframes beltR{from{background-position:0 0}to{background-position:20px 0}}
    @keyframes beltL{from{background-position:0 0}to{background-position:-20px 0}}
    @keyframes beltD{from{background-position:0 0}to{background-position:0 20px}}
    @keyframes beltU{from{background-position:0 0}to{background-position:0 -20px}}
    @keyframes itemBounce{from{transform:scale(.75);opacity:.6}to{transform:scale(1.2);opacity:1}}
    @keyframes flashUp{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-24px)}}
    @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  `}</style>
);

const S = {
  root: {
    width: "100vw", height: "100vh", overflow: "hidden",
    background: "#040a0f", color: "#9ca3af",
    fontFamily: "'Share Tech Mono','Courier New',monospace",
    display: "flex", flexDirection: "column", userSelect: "none",
  },
  menuBg: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 40%,#071a0d 0%,#040a0f 70%)",
  },
  menuCard: {
    width: 560, background: "#070f14",
    border: "1px solid #10b98133", borderRadius: 16,
    boxShadow: "0 0 60px #10b98112", overflow: "hidden",
  },
  menuHead: {
    background: "#040a0f", borderBottom: "1px solid #10b98122",
    padding: "28px 24px", textAlign: "center",
  },
  menuTitle: {
    fontSize: 48, fontWeight: 900, letterSpacing: 12,
    color: "#10b981", textShadow: "0 0 22px #10b98177",
    margin: "8px 0 4px",
  },
  menuSub: {
    fontSize: 9, letterSpacing: 4, color: "#1f3a40", textTransform: "uppercase",
  },
  menuBody: { padding: "22px 26px" },
  chainRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 20,
  },
  menuSteps: {
    display: "flex", flexDirection: "column", gap: 9, marginBottom: 22,
  },
  menuStep: {
    display: "flex", gap: 10, alignItems: "flex-start",
    background: "#0a1621", border: "1px solid #0d1a25",
    borderRadius: 8, padding: "11px 13px",
  },
  startBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#064e32,#10b981)",
    border: "1px solid #10b981", borderRadius: 8,
    color: "#ecfdf5", fontSize: 14, fontWeight: 700, letterSpacing: 4,
    cursor: "pointer", boxShadow: "0 0 22px #10b98122",
    fontFamily: "'Share Tech Mono','Courier New',monospace",
  },
  topBar: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#040a0f", borderBottom: "1px solid #0d1a25",
    padding: "5px 12px", flexShrink: 0, flexWrap: "wrap",
  },
  topLogo: {
    fontSize: 13, fontWeight: 900, color: "#10b981",
    letterSpacing: 3, textShadow: "0 0 8px #10b98177", marginRight: 4,
  },
  topRes: { display: "flex", gap: 8, flex: 1, flexWrap: "wrap" },
  sep: { width: 1, background: "#0d1a25", margin: "0 4px" },
  topCtrl: { display: "flex", gap: 5, alignItems: "center" },
  layout: { flex: 1, display: "flex", overflow: "hidden", minHeight: 0 },
  left: {
    width: 190, flexShrink: 0,
    background: "#070f14", borderRight: "1px solid #0d1a25",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  tabs: { display: "flex", borderBottom: "1px solid #0d1a25", flexShrink: 0 },
  tab: {
    flex: 1, padding: "6px 2px", background: "transparent", border: "none",
    color: "#1f3a40", cursor: "pointer", fontSize: 8, letterSpacing: .5,
    borderBottom: "2px solid transparent", fontFamily: "monospace",
  },
  tabOn: { color: "#10b981", borderBottom: "2px solid #10b981", background: "#040a0f" },
  pBody: { flex: 1, overflowY: "auto", padding: "6px 8px" },
  catLabel: {
    fontSize: 7, letterSpacing: 2, color: "#1a3a40",
    padding: "7px 0 3px", textTransform: "uppercase",
    borderBottom: "1px solid #0d1a25", marginBottom: 3,
  },
  delBtn: {
    width: "100%", padding: "5px", background: "transparent",
    border: "1px solid #1f2e37", borderRadius: 4, color: "#374151",
    cursor: "pointer", fontSize: 8, fontFamily: "monospace", marginBottom: 5, letterSpacing: .5,
  },
  delBtnOn: { background: "#200808", border: "1px solid #ef4444", color: "#ef4444" },
  gridArea: {
    flex: 1, overflow: "auto", background: "#040a0f", position: "relative",
  },
  right: {
    width: 140, flexShrink: 0,
    background: "#070f14", borderLeft: "1px solid #0d1a25",
    overflowY: "auto", padding: "8px", fontSize: 10,
  },
};