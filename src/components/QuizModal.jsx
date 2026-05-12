import { useState } from "react";

export function QuizModal({ question, onAnswer }) {
  const [phase, setPhase] = useState("question");
  const [selected, setSelected] = useState(null);

  const handleClick = (idx) => {
    setSelected(idx);
    setPhase("result");
    setTimeout(() => onAnswer(idx), 2000);
  };

  const correct = selected === question.correct;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000dd",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }}>
      <div style={{
        background: "#070f14", border: "1px solid #10b98155",
        borderRadius: 16, padding: "28px 32px", maxWidth: 460, width: "90%",
        boxShadow: "0 0 50px #10b98122",
      }}>
        {phase === "question" ? (
          <>
            <div style={{
              fontSize: 9, color: "#10b981", letterSpacing: 3,
              marginBottom: 12, textAlign: "center",
            }}>
              ❓ PREGUNTA DE RECICLAJE
            </div>
            <div style={{
              fontSize: 14, color: "#d1d5db", lineHeight: 1.6,
              marginBottom: 18, textAlign: "center",
            }}>
              {question.q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {question.options.map((opt, i) => (
                <button key={i} onClick={() => handleClick(i)} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "10px 14px", background: "#0a1621",
                  border: "1px solid #0d1a25", borderRadius: 8,
                  color: "#9ca3af", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, textAlign: "left", transition: "all .15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0d1a25"; e.currentTarget.style.borderColor = "#1f2e37"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#0a1621"; e.currentTarget.style.borderColor = "#0d1a25"; }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#0d1a25", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 10, fontWeight: 700,
                    color: "#4b5563", flexShrink: 0,
                  }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ lineHeight: 1.3 }}>{opt}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>{correct ? "✅" : "❌"}</div>
            <div style={{
              fontSize: 18, fontWeight: 700,
              color: correct ? "#10b981" : "#ef4444",
              letterSpacing: 3, marginBottom: 8,
            }}>
              {correct ? "¡CORRECTO!" : "INCORRECTO"}
            </div>
            <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, marginBottom: 12 }}>
              {question.options[question.correct]}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.5 }}>
              {correct ? "+$300 · -10% contaminación" : "-$150 · +15% contaminación"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
