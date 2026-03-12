import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TIERS } from '../constants/tiers.js';
import { BDEF, CATEGORIES } from '../constants/buildings.js';
import { UPGRADES } from '../constants/upgrades.js';
import { GW, GH, CS, BASE_TICK } from '../constants/config.js';
import { mkGrid, uid } from '../utils/helpers.js';
import { simulate } from '../utils/simulation.js';
import { S } from '../styles/theme.js';
import { Cell } from './Cell.jsx';
import { UnlockModal } from './UnlockModal.jsx';
import { ContWarning } from './ContWarning.jsx';
import { Chip } from './Chip.jsx';
import { CB } from './CB.jsx';
import { Panel } from "./Panel.jsx";

export function Game() {
  const [screen, setScreen] = useState("game");
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

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setEvents(e => e.filter(ev => now - ev.born < 900));
    }, 250);
    return () => clearInterval(id);
  }, []);

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

  useEffect(() => {
    const h = e => {
      if (e.key === "Delete" || e.key === "Backspace") setDelMode(d => !d);
      if (e.key === " ") { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

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

  const buyUpgrade = useCallback((upg) => {
    if (upgrades[upg.id]) return;
    if (!upg.req.every(r => upgrades[r])) return;
    if ((inv.money ?? 0) < upg.cost) return;
    setUpgrades(u => ({ ...u, [upg.id]: true }));
    setInv(i => ({ ...i, money: i.money - upg.cost }));
  }, [upgrades, inv]);

  const availableBuildings = useMemo(() => {
    const tiers = new Set(unlocked);
    return Object.entries(BDEF).filter(([, d]) => !d.tier || tiers.has(d.tier));
  }, [unlocked]);

  const contColor = contLevel < 30 ? "#10b981" : contLevel < 65 ? "#f59e0b" : "#ef4444";

  return (
    <div style={S.root}>
      <GlobalStyles />

      {showModal && (() => {
        const t = TIERS.find(t => t.id === showModal);
        return t ? <UnlockModal tier={t} onClose={() => setModal(null)} /> : null;
      })()}
      <ContWarning level={contLevel} />

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

      <div style={S.layout}>
        <Panel
          panel={panel} setPanel={setPanel}
          delMode={delMode} setDelMode={setDelMode}
          tool={tool} setTool={setTool}
          unlocked={unlocked} inv={{ ...inv, ...stats, contLevel, contColor, tick, buildings: grid.flat().filter(c => c).length, items: grid.flat().filter(c => c?.item).length }}
          upgrades={upgrades} buyUpgrade={buyUpgrade}
          availableBuildings={availableBuildings}
        />

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

function GlobalStyles() {
  return (
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
}
