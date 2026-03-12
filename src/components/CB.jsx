export function CB({ onClick, active, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#10b98118" : "#0a1621",
      border: `1px solid ${active ? "#10b981" : "#0d1a25"}`,
      color: active ? "#10b981" : "#4b5563",
      borderRadius: 4, padding: "3px 9px", fontSize: 12,
      cursor: "pointer", fontFamily: "monospace",
    }}>{children}</button>
  );
}
