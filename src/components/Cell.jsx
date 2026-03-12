import { BDEF } from '../constants/buildings.js';
import { TIERS } from '../constants/tiers.js';
import { CS } from '../constants/config.js';
import { itemMeta } from '../utils/helpers.js';

export function Cell({ cell, x, y, onClick, onRightClick, isHovered, selTool, delMode }) {
  const def = cell ? BDEF[cell.type] : null;
  const selDef = selTool ? BDEF[selTool] : null;
  const isBelt = def?.cat === "belt";

  const border = cell
    ? `1.5px solid ${def?.color ?? "#374151"}44`
    : isHovered
      ? `1.5px solid ${delMode ? "#ef4444" : "#10b981"}aa`
      : "1px solid #0d1a25";

  const bg = cell
    ? isBelt ? "#0a1621dd" : `${def?.color ?? "#374151"}11`
    : isHovered
      ? delMode ? "#ef444412" : "#10b98112"
      : "#07101a";

  return (
    <div
      onClick={onClick}
      onContextMenu={e => { e.preventDefault(); onRightClick(); }}
      onMouseEnter={() => onMouseEnter?.()}
      style={{
        width: CS, height: CS,
        background: bg, border,
        boxSizing: "border-box",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", overflow: "hidden",
        transition: "background .08s",
        flexShrink: 0,
      }}
    >
      {isBelt && (
        <div style={{
          position: "absolute", inset: 0, opacity: .25,
          backgroundImage: `repeating-linear-gradient(
            ${def.dir === "R" || def.dir === "L" ? "90deg" : "0deg"},
            #1e3a2f 0px, #1e3a2f 5px, transparent 5px, transparent 10px
          )`,
          animation: `belt${def.dir} .4s linear infinite`,
        }} />
      )}

      {cell && (
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", lineHeight: 1 }}>
          <div style={{
            fontSize: isBelt ? 14 : 17,
            filter: `drop-shadow(0 0 4px ${def?.color ?? "#fff"}77)`,
          }}>{def?.icon}</div>

          {def?.cat === "plant" && cell.item?.type?.startsWith("waste_") && (
            <div style={{
              position: "absolute", bottom: -2, left: 0, right: 0,
              height: 2, background: "#0d1a25", borderRadius: 1,
            }}>
              <div style={{
                height: "100%", borderRadius: 1,
                background: TIERS.find(t => t.id === def.tier)?.color ?? "#10b981",
                width: `${((cell.proc ?? 0) / TIERS.find(t => t.id === def.tier)?.processTime) * 100}%`,
                transition: "width .2s",
              }} />
            </div>
          )}
        </div>
      )}

      {cell?.item && (() => {
        const meta = itemMeta(cell.item.type);
        return (
          <div style={{
            position: "absolute", bottom: 4, right: 4,
            width: 9, height: 9, borderRadius: "50%",
            background: meta.color,
            boxShadow: `0 0 5px ${meta.color}`,
            zIndex: 4,
            animation: "itemBounce .5s ease-in-out infinite alternate",
          }} />
        );
      })()}

      {!cell && isHovered && selDef && !delMode && (
        <span style={{ fontSize: 15, opacity: .2, zIndex: 2 }}>{selDef.icon}</span>
      )}

      {cell && isHovered && delMode && (
        <div style={{
          position: "absolute", inset: 0, background: "#ef444428",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "#ef4444", zIndex: 10,
        }}>✕</div>
      )}
    </div>
  );
}
