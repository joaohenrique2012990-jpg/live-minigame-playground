import React, { useState, useEffect } from "react";
import { tikTokManager, playSound, TikTokChatEvent, TikTokGiftEvent, TikTokLikeEvent } from "@/lib/tiktok";
import { Trophy, Volume2, VolumeX, RotateCcw, Heart, Gift, MessageCircle } from "lucide-react";

export function TugOfWarGame({ isOverlay = false }: { isOverlay?: boolean }) {
  // Posição da corda: -100 (Vitória Rosa) a +100 (Vitória Azul)
  const [position, setPosition] = useState<number>(0);
  const [pinkScore, setPinkScore] = useState<number>(120);
  const [blueScore, setBlueScore] = useState<number>(120);
  const [winner, setWinner] = useState<"pink" | "blue" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAction, setLastAction] = useState<string>("Digite #rosa ou #azul no chat para puxar!");

  const pullRope = (side: "pink" | "blue", force: number, user: string, actionName: string) => {
    if (winner) return;

    if (soundEnabled) {
      playSound(force >= 15 ? "explosion" : "pop");
    }

    setPosition((curr) => {
      const delta = side === "pink" ? -force : force;
      const next = Math.max(-100, Math.min(100, curr + delta));

      if (side === "pink") {
        setPinkScore((s) => s + force * 2);
      } else {
        setBlueScore((s) => s + force * 2);
      }

      if (next <= -80 && !winner) {
        setWinner("pink");
        if (soundEnabled) playSound("victory");
      } else if (next >= 80 && !winner) {
        setWinner("blue");
        if (soundEnabled) playSound("victory");
      }

      return next;
    });

    const teamEmoji = side === "pink" ? "🌸 Time Rosa" : "🔵 Time Azul";
    setLastAction(`${teamEmoji}: @${user} puxou com ${actionName} (+${force})!`);
  };

  useEffect(() => {
    const unsubChat = tikTokManager.onChat((event: TikTokChatEvent) => {
      const text = event.comment.toLowerCase();
      if (text.includes("rosa") || text.includes("#rosa") || text.includes("1") || text.includes("pink")) {
        pullRope("pink", 2, event.user.uniqueId, "comentário");
      } else if (text.includes("azul") || text.includes("#azul") || text.includes("2") || text.includes("blue")) {
        pullRope("blue", 2, event.user.uniqueId, "comentário");
      }
    });

    const unsubGift = tikTokManager.onGift((event: TikTokGiftEvent) => {
      const force = Math.max(10, (event.diamondCount || 1) * 4);
      // Decide lado baseado na preferência ou alterna
      const side = Math.random() > 0.5 ? "pink" : "blue";
      pullRope(side, force, event.user.uniqueId, `${event.giftName || "Presente"}`);
    });

    const unsubLike = tikTokManager.onLike((event: TikTokLikeEvent) => {
      const force = Math.max(1, Math.floor(event.likeCount / 3));
      const side = Math.random() > 0.5 ? "pink" : "blue";
      pullRope(side, force, event.user.uniqueId, "curtidas");
    });

    return () => {
      unsubChat();
      unsubGift();
      unsubLike();
    };
  }, [winner, soundEnabled]);

  const restart = () => {
    setPosition(0);
    setPinkScore(100);
    setBlueScore(100);
    setWinner(null);
    setLastAction("Nova disputa de Cabo de Guerra iniciada!");
    if (soundEnabled) playSound("pop");
  };

  return (
    <div className={`relative flex flex-col rounded-2xl ${isOverlay ? "h-full w-full bg-slate-950/85 p-4 text-white backdrop-blur-md" : "border border-border/80 bg-slate-950/90 p-5 shadow-2xl"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🪢 CABO DE GUERRA AO VIVO
            <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-xs font-semibold text-pink-400 border border-pink-500/30">
              TIME ROSA vs TIME AZUL
            </span>
          </h2>
          <p className="text-xs text-slate-400">Comente #rosa ou #azul • Curtidas e presentes puxam com força máxima!</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Teams Header Bar */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Pink Team */}
        <div
          onClick={() => pullRope("pink", 5, "Você", "clique")}
          className="cursor-pointer rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 to-slate-900 p-4 transition-all hover:border-pink-500"
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-pink-400 text-lg flex items-center gap-1.5">
              🌸 TIME ROSA
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
              #rosa
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-display text-white">{pinkScore.toLocaleString()} pts</span>
            <span className="text-xs text-pink-400/80 hover:underline">+ puxar</span>
          </div>
        </div>

        {/* Blue Team */}
        <div
          onClick={() => pullRope("blue", 5, "Você", "clique")}
          className="cursor-pointer rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-900 p-4 transition-all hover:border-blue-500"
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-blue-400 text-lg flex items-center gap-1.5">
              🔵 TIME AZUL
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
              #azul
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-display text-white">{blueScore.toLocaleString()} pts</span>
            <span className="text-xs text-blue-400/80 hover:underline">+ puxar</span>
          </div>
        </div>
      </div>

      {/* Arena Canvas / Rope Simulation */}
      <div className="relative my-2 rounded-xl border border-slate-800 bg-slate-950 p-6 overflow-hidden">
        {/* Middle Line Marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-yellow-400/40 border-r border-dashed border-yellow-400" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-yellow-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-yellow-400/30">
          ZONA CENTRAL
        </div>

        {/* Rope Track */}
        <div className="relative flex items-center justify-between my-12">
          {/* Pink Pullers */}
          <div className="flex items-center gap-2 z-10">
            <div className="text-3xl animate-bounce" style={{ animationDuration: "0.8s" }}>🏃‍♀️</div>
            <div className="text-2xl animate-bounce" style={{ animationDuration: "0.9s" }}>🤼‍♀️</div>
            <div className="text-4xl animate-bounce" style={{ animationDuration: "0.7s" }}>🦍</div>
          </div>

          {/* The Rope */}
          <div className="relative flex-1 mx-3 h-5 rounded-full bg-gradient-to-r from-pink-500 via-amber-600 to-blue-500 shadow-lg shadow-amber-500/20 overflow-visible flex items-center">
            {/* Knot / Red Bandana Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 flex flex-col items-center"
              style={{ left: `${((position + 100) / 200) * 100}%` }}
            >
              <div className="h-9 w-9 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-xs font-black text-white ring-4 ring-rose-500/30">
                🎀
              </div>
            </div>
          </div>

          {/* Blue Pullers */}
          <div className="flex items-center gap-2 z-10 flex-row-reverse">
            <div className="text-3xl animate-bounce" style={{ animationDuration: "0.8s" }}>🏃‍♂️</div>
            <div className="text-2xl animate-bounce" style={{ animationDuration: "0.9s" }}>🤼‍♂️</div>
            <div className="text-4xl animate-bounce" style={{ animationDuration: "0.7s" }}>🤖</div>
          </div>
        </div>

        {/* Tension Indicators */}
        <div className="flex justify-between text-xs font-mono font-bold text-slate-400 px-2">
          <span className="text-pink-400">VITÓRIA ROSA (&lt; -80%)</span>
          <span className="text-slate-300">TENSÃO: {Math.abs(position)}%</span>
          <span className="text-blue-400">VITÓRIA AZUL (&gt; +80%)</span>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-9 w-9 animate-bounce" />
            </div>
            <h3 className="font-display text-3xl font-extrabold text-white mb-1">
              {winner === "pink" ? "🌸 TIME ROSA VENCEU!" : "🔵 TIME AZUL VENCEU!"}
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mb-4">
              A força do chat e dos presentes puxou a corda até o limite e conquistou a vitória épica!
            </p>
            <button
              onClick={restart}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:scale-105 transition-transform"
            >
              Jogar Nova Partida
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Guide */}
      <div className="grid grid-cols-3 gap-2 my-2 text-[11px] text-slate-400">
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex items-center gap-2">
          <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Comentários: +2 força</span>
        </div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-400" />
          <span>Curtidas: +5 força</span>
        </div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex items-center gap-2">
          <Gift className="h-3.5 w-3.5 text-amber-400" />
          <span>Presentes: +20 a +100</span>
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs">
        <span className="text-slate-300 truncate">{lastAction}</span>
        <span className="font-mono text-[10px] text-emerald-400">AO VIVO</span>
      </div>
    </div>
  );
}
