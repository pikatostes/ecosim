export const ACHIEVEMENTS = [
  { id: "first_sell", name: "Primer Ingreso", icon: "💰", desc: "Vende tu primer material reciclado", check: s => s.totalEarned >= 1 },
  { id: "earn_1k", name: "Reciclador Novato", icon: "💵", desc: "Gana $1.000 en total", check: s => s.totalEarned >= 1000 },
  { id: "earn_5k", name: "Reciclador Avanzado", icon: "💶", desc: "Gana $5.000 en total", check: s => s.totalEarned >= 5000 },
  { id: "earn_10k", name: "Magnate del Reciclaje", icon: "💎", desc: "Gana $10.000 en total", check: s => s.totalEarned >= 10000 },

  { id: "first_process", name: "Primer Proceso", icon: "♻", desc: "Procesa tu primer residuo", check: s => s.processed >= 1 },
  { id: "process_100", name: "En Marcha", icon: "♻", desc: "Procesa 100 residuos", check: s => s.processed >= 100 },
  { id: "process_500", name: "Máquina Imparable", icon: "⚙", desc: "Procesa 500 residuos", check: s => s.processed >= 500 },

  { id: "first_filter", name: "Limpieza Inicial", icon: "🔧", desc: "Filtra tu primer residuo energético", check: s => s.filtered >= 1 },
  { id: "filter_100", name: "Limpieza Profunda", icon: "🔧", desc: "Filtra 100 residuos energéticos", check: s => s.filtered >= 100 },

  { id: "build_10", name: "Constructora", icon: "🏗", desc: "Coloca 10 edificios", check: s => s.buildings >= 10 },
  { id: "build_50", name: "Imperio Industrial", icon: "🏭", desc: "Coloca 50 edificios", check: s => s.buildings >= 50 },

  { id: "first_upgrade", name: "Investigador", icon: "🔬", desc: "Compra tu primera mejora", check: s => s.upgradeCount >= 1 },
  { id: "all_upgrades", name: "Científico", icon: "🧪", desc: "Compra todas las mejoras", check: s => s.allUpgrades },

  { id: "first_tier", name: "Descubrimiento", icon: "📦", desc: "Desbloquea tu segundo material", check: s => s.tierCount >= 2 },
  { id: "all_tiers", name: "Reciclaje Completo", icon: "🌟", desc: "Desbloquea todos los materiales", check: s => s.allTiers },

  { id: "cont_50", name: "Alerta Ambiental", icon: "⚠", desc: "La contaminación llega al 50%", check: s => s.contLevel >= 50 },
  { id: "cont_100", name: "Crisis Total", icon: "☣", desc: "La contaminación llega al 100%", check: s => s.contLevel >= 100 },

  { id: "tick_1000", name: "Persistencia", icon: "⏱", desc: "Alcanza 1000 ticks", check: s => s.tick >= 1000 },

  { id: "organic", name: "Energía Limpia", icon: "🌿", desc: "Desbloquea el material orgánico", check: s => s.hasOrganic },
  { id: "auto_clean_ach", name: "Automatización", icon: "🤖", desc: "Compra la mejora Limpieza Auto", check: s => s.hasAutoClean },
];
