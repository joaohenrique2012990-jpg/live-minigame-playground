import { createFileRoute } from "@tanstack/react-router";
import { TorreDeBlocosGame } from "@/components/games/TorreDeBlocosGame";
import { LiveSimulatorToolbar } from "@/components/LiveSimulatorToolbar";

export const Route = createFileRoute("/overlay_/torre")({
  head: () => ({
    meta: [
      { title: "Torre de Blocos — Jogo da Live" },
      { name: "description", content: "Jogo de torre de blocos para live: presentes sobem ou derrubam a torre." },
      { property: "og:title", content: "Torre de Blocos — Jogo da Live" },
      { property: "og:description", content: "Chegue a 300 de altura e acumule 20 vitórias." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TorreOverlay,
});

function TorreOverlay() {
  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col justify-center items-center font-sans select-none">
      <TorreDeBlocosGame isOverlay={true} />
      <LiveSimulatorToolbar />
    </div>
  );
}
