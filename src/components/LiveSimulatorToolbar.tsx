import React, { useState } from "react";
import { tikTokManager, playSound } from "@/lib/tiktok";
import { Play, Pause, MessageSquare, Heart, Gift, Sparkles, Volume2, Shield } from "lucide-react";

export function LiveSimulatorToolbar() {
  const [autoPlay, setAutoPlay] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleAuto = () => {
    const next = !autoPlay;
    setAutoPlay(next);
    tikTokManager.toggleAutoSimulation(next);
    if (next) playSound("pop");
  };

  const simulateComment = (comment: string) => {
    tikTokManager.emitChat({
      user: { uniqueId: "espectador_live", nickname: "Espectador VIP" },
      comment,
      timestamp: Date.now(),
    });
  };

  const simulateLike = (count: number) => {
    tikTokManager.emitLike({
      user: { uniqueId: "tiktoker_ativo", nickname: "Fã da Live" },
      likeCount: count,
      totalLikes: 1000,
      timestamp: Date.now(),
    });
  };

  const simulateGift = (giftName: string, diamondCount: number) => {
    tikTokManager.emitGift({
      user: { uniqueId: "super_apoiador", nickname: "Top Donator 👑" },
      giftName,
      diamondCount,
      repeatCount: 1,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md text-white animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="font-display font-bold text-sm">Simulador de Eventos TikTok</span>
            </div>
            <button
              onClick={toggleAuto}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                autoPlay ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoPlay ? "Pausar Auto" : "Auto Live"}
            </button>
          </div>

          <div className="space-y-3 mt-3 text-xs">
            {/* Nations at War shortcuts */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-400" /> Comentários Rápidos (Times / Nações)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => simulateComment("#brasil")}
                  className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 py-1.5 font-bold text-emerald-300 hover:bg-emerald-900/80"
                >
                  🇧🇷 #brasil
                </button>
                <button
                  onClick={() => simulateComment("#usa")}
                  className="rounded-lg bg-blue-950/60 border border-blue-500/40 py-1.5 font-bold text-blue-300 hover:bg-blue-900/80"
                >
                  🇺🇸 #usa
                </button>
                <button
                  onClick={() => simulateComment("#argentina")}
                  className="rounded-lg bg-sky-950/60 border border-sky-500/40 py-1.5 font-bold text-sky-300 hover:bg-sky-900/80"
                >
                  🇦🇷 #ar
                </button>
                <button
                  onClick={() => simulateComment("#japao")}
                  className="rounded-lg bg-rose-950/60 border border-rose-500/40 py-1.5 font-bold text-rose-300 hover:bg-rose-900/80"
                >
                  🇯🇵 #japao
                </button>
              </div>
            </div>

            {/* Tug of war & 1v1 */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">Cabo de Guerra / Duelo</span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => simulateComment("#rosa")}
                  className="rounded-lg bg-pink-950/60 border border-pink-500/40 py-1.5 font-bold text-pink-300 hover:bg-pink-900/80"
                >
                  🌸 #rosa
                </button>
                <button
                  onClick={() => simulateComment("#azul")}
                  className="rounded-lg bg-blue-950/60 border border-blue-500/40 py-1.5 font-bold text-blue-300 hover:bg-blue-900/80"
                >
                  🔵 #azul
                </button>
                <button
                  onClick={() => simulateComment("#1")}
                  className="rounded-lg bg-red-950/60 border border-red-500/40 py-1.5 font-bold text-red-300 hover:bg-red-900/80"
                >
                  🥊 Lutador 1
                </button>
                <button
                  onClick={() => simulateComment("#2")}
                  className="rounded-lg bg-purple-950/60 border border-purple-500/40 py-1.5 font-bold text-purple-300 hover:bg-purple-900/80"
                >
                  🥊 Lutador 2
                </button>
              </div>
            </div>

            {/* Likes & Gifts */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                <Gift className="h-3 w-3 text-amber-400" /> Presentes e Curtidas
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => simulateLike(25)}
                  className="rounded-lg bg-slate-800 border border-slate-700 py-1.5 font-bold text-rose-400 hover:bg-slate-700"
                >
                  ❤️ +25 Likes
                </button>
                <button
                  onClick={() => simulateGift("Rosa", 1)}
                  className="rounded-lg bg-slate-800 border border-slate-700 py-1.5 font-bold text-rose-300 hover:bg-slate-700"
                >
                  🌹 Rosa
                </button>
                <button
                  onClick={() => simulateGift("Donut", 30)}
                  className="rounded-lg bg-slate-800 border border-slate-700 py-1.5 font-bold text-amber-300 hover:bg-slate-700"
                >
                  🍩 Donut
                </button>
                <button
                  onClick={() => simulateGift("Galáxia", 1000)}
                  className="rounded-lg bg-purple-900/50 border border-purple-500/50 py-1.5 font-bold text-purple-300 hover:bg-purple-800/80"
                >
                  🌌 Galáxia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-pink-500/40 bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 font-display text-xs font-bold text-white shadow-xl shadow-pink-500/25 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
        <span>{isOpen ? "Fechar Simulador" : "🧪 Testar TikTok Live"}</span>
        {autoPlay && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />}
      </button>
    </div>
  );
}
