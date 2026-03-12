export function Chip({ icon, val, color, label }) {
  return (
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
}
