import { TIERS } from '../constants/tiers.js';
import { BDEF, CATEGORIES } from '../constants/buildings.js';
import { UPGRADES } from '../constants/upgrades.js';
import { S } from '../styles/theme.js';

export function Panel({
  panel, setPanel, delMode, setDelMode, tool, setTool,
  unlocked, inv, upgrades, buyUpgrade, availableBuildings
}) {
  return (
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

          {CATEGORIES.map(cat => {
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
            ["Total ganado", `$${inv.totalEarned}`, "#fbbf24"],
            ["Procesados", inv.processed, "#10b981"],
            ["Residuos filtrados", inv.filtered, "#94a3b8"],
            ["Contaminación", `${Math.round(inv.contLevel)}%`, inv.contColor],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 2px", borderBottom: "1px solid #0d1a25" }}>
              <span style={{ fontSize: 9, color: "#4b5563" }}>{l}</span>
              <span style={{ fontSize: 9, color: c, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <div style={S.catLabel}>PLANTA</div>
          {[
            ["Edificios", inv.buildings, "#94a3b8"],
            ["Ítems", inv.items, "#60a5fa"],
            ["Ticks", inv.tick, "#374151"],
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
  );
}
