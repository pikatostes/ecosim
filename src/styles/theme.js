export const S = {
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
    color: "#4b5563", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
  },
  tabOn: { background: "#0a1621", color: "#10b981" },
  pBody: {
    flex: 1, overflowY: "auto", padding: 8,
  },
  delBtn: {
    width: "100%", padding: "6px", marginBottom: 8,
    background: "#0a1621", border: "1px solid #0d1a25",
    borderRadius: 6, color: "#4b5563", fontSize: 9,
    cursor: "pointer", fontFamily: "inherit", letterSpacing: 1,
  },
  delBtnOn: {
    background: "#1a0505", borderColor: "#ef4444", color: "#ef4444",
  },
  catLabel: {
    fontSize: 8, color: "#1f3a40", letterSpacing: 2,
    marginTop: 8, marginBottom: 4,
  },
  gridArea: {
    flex: 1, position: "relative", overflow: "auto",
    background: "#040a0f", display: "flex", alignItems: "center", justifyContent: "center",
  },
  right: {
    width: 140, flexShrink: 0,
    background: "#070f14", borderLeft: "1px solid #0d1a25",
    padding: 10, overflowY: "auto",
  },
};
