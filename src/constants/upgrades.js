export const UPGRADES = [
  { id: "belt_2x", name: "Cintas Rápidas", icon: "⚡", desc: "Cintas mueven ítems 2× más rápido", cost: 300, req: [] },
  { id: "plant_boost", name: "Plantas Eficientes", icon: "📈", desc: "Plantas procesan 1.5× más rápido", cost: 400, req: [] },
  { id: "shop_bonus", name: "Precios Premium", icon: "💎", desc: "La tienda paga 40% más", cost: 500, req: ["plant_boost"] },
  { id: "waste_slow", name: "Filtros Mejorados", icon: "🔬", desc: "Residuos energéticos se generan 2× más lento", cost: 600, req: ["belt_2x"] },
  { id: "auto_clean", name: "Limpieza Auto", icon: "🤖", desc: "Los filtros trabajan automáticamente", cost: 800, req: ["waste_slow", "shop_bonus"] },
  { id: "overclock", name: "Overclocking", icon: "🔥", desc: "Todo el sistema va 1.5× más rápido", cost: 1500, req: ["auto_clean"] },
];
