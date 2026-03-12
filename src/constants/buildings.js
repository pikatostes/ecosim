export const BDEF = {
  waste_storage_plastic: { name: "Almacén P", cat: "waste_storage", tier: "plastic", icon: "🗑", color: "#6b7280", cost: 40, desc: "Genera residuos de plástico" },
  waste_storage_paper: { name: "Almacén A", cat: "waste_storage", tier: "paper", icon: "🗑", color: "#6b7280", cost: 50, desc: "Genera residuos de papel" },
  waste_storage_glass: { name: "Almacén V", cat: "waste_storage", tier: "glass", icon: "🗑", color: "#6b7280", cost: 60, desc: "Genera residuos de vidrio" },
  waste_storage_organic: { name: "Almacén O", cat: "waste_storage", tier: "organic", icon: "🗑", color: "#6b7280", cost: 55, desc: "Genera residuos orgánicos" },

  plant_plastic: { name: "Planta P", cat: "plant", tier: "plastic", icon: "🏭", color: "#f59e0b", cost: 100, desc: "Procesa residuos de plástico" },
  plant_paper: { name: "Planta A", cat: "plant", tier: "paper", icon: "🏗", color: "#60a5fa", cost: 120, desc: "Procesa residuos de papel" },
  plant_glass: { name: "Planta V", cat: "plant", tier: "glass", icon: "⚗", color: "#34d399", cost: 150, desc: "Procesa residuos de vidrio" },
  plant_organic: { name: "Planta O", cat: "plant", tier: "organic", icon: "🌿", color: "#c084fc", cost: 130, desc: "Procesa residuos orgánicos" },

  shop: { name: "Tienda", cat: "shop", icon: "💰", color: "#fbbf24", cost: 80, desc: "Vende material reciclado por dinero" },

  waste_handler: { name: "Filtro", cat: "waste_handler", icon: "🔧", color: "#94a3b8", cost: 70, desc: "Elimina residuos energéticos de cualquier tipo" },
  incinerator: { name: "Incineradora", cat: "incinerator", icon: "🔥", color: "#ef4444", cost: 30, desc: "Destruye ítems pero genera contaminación" },

  belt_R: { name: "→", cat: "belt", dir: "R", icon: "→", color: "#374151", cost: 5, desc: "Cinta derecha" },
  belt_L: { name: "←", cat: "belt", dir: "L", icon: "←", color: "#374151", cost: 5, desc: "Cinta izquierda" },
  belt_D: { name: "↓", cat: "belt", dir: "D", icon: "↓", color: "#374151", cost: 5, desc: "Cinta abajo" },
  belt_U: { name: "↑", cat: "belt", dir: "U", icon: "↑", color: "#374151", cost: 5, desc: "Cinta arriba" },

  splitter: { name: "Divisor", cat: "splitter", icon: "⤵", color: "#8b5cf6", cost: 40, desc: "Alterna salidas entre derecha y abajo" },
};

export const CATEGORIES = [
  { id: "waste_storage", label: "① ALMACÉN RESIDUOS" },
  { id: "plant", label: "② PLANTA PROCESADO" },
  { id: "shop", label: "③ TIENDA" },
  { id: "belt", label: "CINTAS" },
  { id: "splitter", label: "DIVISOR" },
  { id: "waste_handler", label: "GESTIÓN RESIDUOS" },
  { id: "incinerator", label: "INCINERADORA" },
];
