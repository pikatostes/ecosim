import { useState, useEffect, useCallback, useRef } from "react";

const WASTE_TYPES = {
  plastic: { label: "Plástico", emoji: "🧴", color: "#f59e0b", bin: "Amarillo" },
  paper: { label: "Papel", emoji: "📄", color: "#3b82f6", bin: "Azul" },
  glass: { label: "Vidrio", emoji: "🍾", color: "#10b981", bin: "Verde" },
  organic: { label: "Orgánico", emoji: "🍌", color: "#a16207", bin: "Marrón" },
  mixed: { label: "No reciclable", emoji: "🗑️", color: "#6b7280", bin: "Gris" },
};

const BINS = [
  { id: "amarillo", label: "Amarillo", accepts: "plastic", color: "#fbbf24" },
  { id: "azul", label: "Azul", accepts: "paper", color: "#60a5fa" },
  { id: "verde", label: "Verde", accepts: "glass", color: "#34d399" },
  { id: "marron", label: "Marrón", accepts: "organic", color: "#92400e" },
  { id: "gris", label: "Gris", accepts: "mixed", color: "#9ca3af" },
];

const LEVELS = [
  { level: 1, types: ["plastic"], speed: 4000, label: "Solo plástico", bins: 1 },
  { level: 2, types: ["plastic", "glass"], speed: 3200, label: "+ Vidrio", bins: 2 },
  { level: 3, types: ["plastic", "glass", "paper", "organic"], speed: 2500, label: "+ Papel y Orgánico", bins: 4 },
  { level: 4, types: ["plastic", "glass", "paper", "organic", "mixed"], speed: 1800, label: "Flujo rápido", bins: 5 },
  { level: 5, types: ["plastic", "glass", "paper", "organic", "mixed"], speed: 1100, label: "Gestión total", bins: 5 },
];

const TIPS = [
  "El plástico va al contenedor Amarillo 🟡", "El vidrio al Verde 🟢",
  "El papel al Azul 🔵", "Residuos orgánicos al Marrón 🟤",
  "Lo no reciclable al Gris ⚫", "Las rachas dan puntos extra ⭐",
  "Evita desbordamientos o contaminarás la planta ☣️", "¡A reciclar se aprende jugando! 🌿",
];

const MAX_Q = 8, ERR_PTS = 15, OK_PTS = 10, STREAK_BONUS = 5, CONT_ERR = 12, CONT_OVF = 20, MAX_CONT = 100;
let uid = 0;
const mkW = t => ({ id: ++uid, type: t[Math.floor(Math.random() * t.length)] });

export default function EcoSim() {
  const [scr, setScr] = useState("menu");
  const [pts, setPts] = useState(0);
  const [cont, setCont] = useState(0);
  const [q, setQ] = useState([]);
  const [sel, setSel] = useState(null);
  const [lvl, setLvl] = useState(0);
  const [str, setStr] = useState(0);
  const [fb, setFb] = useState(null);
  const [tip, setTip] = useState(TIPS[0]);
  const [fl, setFl] = useState([]);
  const [hs, setHs] = useState(0);
  const sRef = useRef(), tRef = useRef(), fRef = useRef(), qRef = useRef(q);
  qRef.current = q;

  const cfg = LEVELS[Math.min(lvl, LEVELS.length - 1)];

  useEffect(() => { if (scr === "game") setLvl(Math.min(Math.floor(pts / 150), LEVELS.length - 1)); }, [pts, scr]);

  useEffect(() => {
    if (scr !== "game") return;
    clearInterval(sRef.current);
    sRef.current = setInterval(() => {
      const cur = qRef.current;
      if (cur.length >= MAX_Q) { setCont(c => Math.min(MAX_CONT, c + CONT_OVF)); showFb("¡Desbordamiento! ☣️", false); setQ(p => p.slice(1)); }
      else setQ(p => [...p, mkW(cfg.types)]);
    }, cfg.speed);
    return () => clearInterval(sRef.current);
  }, [scr, cfg.speed, cfg.types]);

  useEffect(() => {
    if (scr !== "game") return;
    tRef.current = setInterval(() => setTip(TIPS[Math.floor(Math.random() * TIPS.length)]), 6000);
    return () => clearInterval(tRef.current);
  }, [scr]);

  useEffect(() => {
    if (cont >= MAX_CONT && scr === "game") { clearInterval(sRef.current); clearInterval(tRef.current); setHs(h => Math.max(h, pts)); setScr("gameover"); }
  }, [cont, scr, pts]);

  const showFb = useCallback((t, ok) => { clearTimeout(fRef.current); setFb({ t, ok }); fRef.current = setTimeout(() => setFb(null), 1700); }, []);
  const addFl = (t, ok) => { const id = Date.now() + Math.random(); setFl(f => [...f, { id, t, ok }]); setTimeout(() => setFl(f => f.filter(x => x.id !== id)), 1100); };

  const pick = (id) => setSel(p => p === id ? null : id);

  const drop = (bid) => {
    if (!sel) return;
    const waste = qRef.current.find(w => w.id === sel); if (!waste) return;
    const bin = BINS.find(b => b.id === bid);
    const ok = bin.accepts === waste.type;
    setQ(p => p.filter(w => w.id !== sel)); setSel(null);
    if (ok) {
      const ns = str + 1; setStr(ns);
      const bonus = ns > 2 ? STREAK_BONUS * Math.floor(ns / 3) : 0;
      const g = OK_PTS + bonus; setPts(p => p + g);
      const msg = bonus > 0 ? `+${g} ⭐ Racha ×${ns}!` : `+${g} ✓`;
      showFb(msg, true); addFl(bonus > 0 ? `+${g} 🔥` : `+${g}`, true);
    } else {
      setStr(0); setPts(p => Math.max(0, p - ERR_PTS)); setCont(c => Math.min(MAX_CONT, c + CONT_ERR));
      const cor = BINS.find(b => b.accepts === waste.type);
      showFb(`✗ Era contenedor ${cor?.label}`, false); addFl(`−${ERR_PTS}`, false);
    }
  };

  const start = () => { uid = 0; setPts(0); setCont(0); setQ([]); setSel(null); setLvl(0); setStr(0); setFb(null); setFl([]); setScr("game"); };
  const sw = qRef.current.find(w => w.id === sel);
  const cc = cont < 40 ? "#10b981" : cont < 70 ? "#f59e0b" : "#ef4444";
  const activeBins = BINS.filter((_, i) => i < cfg.bins);

  if (scr === "menu") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0c1a0e,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#f1f5f9" }}>
      <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 20, padding: "40px 28px", maxWidth: 460, width: "90%", textAlign: "center", boxShadow: "0 0 48px #10b98122" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>♻️</div>
        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: 6, color: "#10b981", margin: "0 0 4px" }}>ECOSIM</h1>
        <p style={{ color: "#6b7280", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Gestión de una Planta de Reciclaje</p>
        <div style={{ background: "#1f2937", borderRadius: 12, padding: "14px", marginBottom: 18, fontSize: 13, color: "#d1d5db", lineHeight: 1.7 }}>
          Clasifica los residuos antes de que saturen la planta. Cada error aumenta la contaminación. ¡Supera tu récord!
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          {BINS.map(b => <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><span style={{ fontSize: 22 }}>{WASTE_TYPES[b.accepts].emoji}</span><span style={{ fontSize: 11, color: b.color, fontWeight: 700 }}>{b.label}</span></div>)}
        </div>
        {hs > 0 && <p style={{ color: "#fbbf24", marginBottom: 8 }}>🏆 Récord: {hs} pts</p>}
        <button onClick={start} style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: 1 }}>🎮 JUGAR</button>
      </div>
    </div>
  );

  if (scr === "gameover") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0c1a0e,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#f1f5f9" }}>
      <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 20, padding: "40px 28px", maxWidth: 460, width: "90%", textAlign: "center", boxShadow: "0 0 48px #ef444422" }}>
        <div style={{ fontSize: 60 }}>☣️</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: "#ef4444", margin: "8px 0 4px", letterSpacing: 4 }}>PLANTA SATURADA</h1>
        <p style={{ color: "#6b7280", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 22 }}>La contaminación superó el límite</p>
        <p style={{ fontSize: 42, fontWeight: 900, color: "#fbbf24", margin: "0 0 6px" }}>{pts} pts</p>
        {pts >= hs && pts > 0 ? <p style={{ color: "#10b981", fontWeight: 700 }}>🏆 ¡Nuevo récord!</p> : <p style={{ color: "#6b7280", fontSize: 13 }}>Récord: {hs} pts</p>}
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>Nivel {cfg.level} — {cfg.label}</p>
        <button onClick={start} style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 8 }}>🔄 Reintentar</button>
        <button onClick={() => setScr("menu")} style={{ background: "#1f2937", color: "#9ca3af", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, cursor: "pointer", width: "100%" }}>← Menú</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0c1a0e,#0f172a)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "system-ui", color: "#f1f5f9", paddingBottom: 32 }}>
      <style>{`@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-55px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* HUD */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "100%", maxWidth: 720, background: "#0f172a", borderBottom: "1px solid #1f2937", padding: "10px 20px", marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1 }}>PUNTOS</span><span style={{ fontSize: 26, fontWeight: 900, color: "#fbbf24" }}>{pts}</span></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1 }}>NIVEL</span><span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700 }}>Nv.{cfg.level} {cfg.label}</span></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1 }}>CONTAMINACIÓN</span>
          <div style={{ width: 110, height: 9, background: "#1f2937", borderRadius: 5, overflow: "hidden" }}><div style={{ height: "100%", width: `${cont}%`, background: cc, transition: "width .4s,background .4s" }} /></div>
          <span style={{ fontSize: 11, color: cc, fontWeight: 700 }}>{Math.round(cont)}%</span>
        </div>
        {str > 2 && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#fbbf24" }}><span style={{ fontSize: 10, letterSpacing: 1 }}>RACHA</span><span style={{ fontSize: 22, fontWeight: 900 }}>×{str} 🔥</span></div>}
      </div>

      {/* Floats */}
      <div style={{ position: "fixed", top: "40%", left: "50%", pointerEvents: "none", zIndex: 300 }}>
        {fl.map(f => <div key={f.id} style={{ position: "absolute", fontWeight: 900, fontSize: 18, color: f.ok ? "#34d399" : "#f87171", animation: "floatUp 1.05s ease-out forwards", whiteSpace: "nowrap" }}>{f.t}</div>)}
      </div>

      {/* Tip */}
      <div style={{ width: "100%", maxWidth: 720, background: "#0d2e20", border: "1px solid #064e32", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#6ee7b7", textAlign: "center", marginBottom: 8 }}>🤖 <em>{tip}</em></div>

      {/* Conveyor */}
      <div style={{ width: "100%", maxWidth: 720, background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: "12px 14px 8px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, marginBottom: 8 }}>🏭 CINTA TRANSPORTADORA</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, minHeight: 78, alignItems: "center" }}>
          {q.length === 0 ? <p style={{ color: "#4b5563", margin: "auto", fontSize: 13 }}>Esperando residuos…</p> :
            q.map(w => {
              const wt = WASTE_TYPES[w.type], isSel = sel === w.id, urg = q.length >= MAX_Q - 1;
              return (
                <button key={w.id} onClick={() => pick(w.id)} title={`${wt.label} → ${wt.bin}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 60, minWidth: 60, height: 72, borderRadius: 12, cursor: "pointer",
                    border: `2.5px solid ${isSel ? wt.color : urg ? "#ef4444" : "#374151"}`, background: isSel ? wt.color + "28" : "#1f2937",
                    transform: isSel ? "scale(1.12)" : "scale(1)", boxShadow: isSel ? `0 0 14px ${wt.color}88` : "none",
                    transition: "all .15s", padding: 4, animation: urg && !isSel ? "pulse .6s infinite" : "none"
                  }}>
                  <span style={{ fontSize: 28 }}>{wt.emoji}</span>
                  {isSel && <span style={{ fontSize: 9, color: wt.color, marginTop: 2 }}>{wt.label}</span>}
                </button>
              );
            })}
        </div>
        <div style={{ textAlign: "right", fontSize: 11, marginTop: 4, color: q.length >= MAX_Q - 1 ? "#ef4444" : "#4b5563" }}>{q.length}/{MAX_Q} residuos</div>
      </div>

      {/* Instruction */}
      <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 10, textAlign: "center", minHeight: 18 }}>
        {sw ? `Seleccionado: ${WASTE_TYPES[sw.type].emoji} ${WASTE_TYPES[sw.type].label} — elige el contenedor 👇` : "👆 Toca un residuo y luego el contenedor correcto"}
      </div>

      {/* Bins */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 720 }}>
        {activeBins.map(b => {
          const isC = !!(sw && b.accepts === sw.type), can = !!sw;
          return (
            <button key={b.id} onClick={() => drop(b.id)} disabled={!can} title={`${b.label} — ${WASTE_TYPES[b.accepts].label}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 100, height: 115, borderRadius: 14, gap: 3,
                border: `2.5px solid ${can ? (isC ? b.color : "#374151") : "#1f2937"}`,
                background: can ? (isC ? b.color + "22" : "#111827") : "#0a0f1a",
                cursor: can ? "pointer" : "default",
                boxShadow: isC && can ? `0 0 22px ${b.color}66` : "none",
                transform: isC && can ? "scale(1.1)" : "scale(1)", transition: "all .18s"
              }}>
              <span style={{ fontSize: 34 }}>🗑️</span>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
              <span style={{ fontSize: 12, color: b.color, fontWeight: 700 }}>{b.label}</span>
              <span style={{ fontSize: 10, color: "#4b5563" }}>{WASTE_TYPES[b.accepts].emoji}</span>
            </button>
          );
        })}
      </div>

      {/* Toast */}
      {fb && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: fb.ok ? "#064e32" : "#7f1d1d", border: `1px solid ${fb.ok ? "#10b981" : "#ef4444"}`, borderRadius: 12, padding: "11px 22px", fontWeight: 700, fontSize: 14, zIndex: 200, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 4px 24px #0009" }}>{fb.t}</div>}
    </div>
  );
}