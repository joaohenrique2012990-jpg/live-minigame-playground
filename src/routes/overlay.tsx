import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { NationsAtWarGame } from "@/components/games/NationsAtWarGame";
import { TugOfWarGame } from "@/components/games/TugOfWarGame";
import { SlapBattleGame } from "@/components/games/SlapBattleGame";
import { PlinkoGame } from "@/components/games/PlinkoGame";
import { LiveSimulatorToolbar } from "@/components/LiveSimulatorToolbar";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [
      { title: "Overlay OBS — Jogos TikTok Live" },
      { name: "description", content: "Overlay transparente para OBS Studio e TikTok Live Studio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OverlayView,
});

function OverlayView() {
  const [selectedGame, setSelectedGame] = useState<string>("nations-at-war");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const g = params.get("game");
      if (g) setSelectedGame(g);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col justify-center items-center p-2 sm:p-4 font-sans select-none">
      <div className="w-full max-w-4xl">
        {selectedGame === "nations-at-war" && <NationsAtWarGame isOverlay={true} />}
        {selectedGame === "tug-of-war" && <TugOfWarGame isOverlay={true} />}
        {selectedGame === "slap-battle" && <SlapBattleGame isOverlay={true} />}
        {selectedGame === "plinko-luck" && <PlinkoGame isOverlay={true} />}
      </div>

      {/* Simulator quick floating bar */}
      <LiveSimulatorToolbar />
    </div>
  );
}
