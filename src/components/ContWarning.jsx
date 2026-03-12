export function ContWarning({ level }) {
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
