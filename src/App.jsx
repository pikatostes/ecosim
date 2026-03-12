import { useState } from "react";
import { Menu, Game } from "./components/index.js";

export default function EcoSim() {
  const [screen, setScreen] = useState("menu");

  if (screen === "menu") {
    return <Menu onStart={() => setScreen("game")} />;
  }

  return <Game />;
}
