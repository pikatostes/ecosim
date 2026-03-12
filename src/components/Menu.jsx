import { TIERS } from '../constants/tiers.js';
import { S } from '../styles/theme.js';

export function Menu({ onStart }) {
  return (
    <div style={S.root}>
      <GlobalStyles />
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

            <button style={S.startBtn} onClick={onStart}>
              ▶  INICIAR PLANTA
            </button>
          </div>
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
