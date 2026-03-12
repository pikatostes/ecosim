export function UnlockModal({ tier, onClose }) {
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
