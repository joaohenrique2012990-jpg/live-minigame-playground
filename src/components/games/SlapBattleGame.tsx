import React, { useState, useEffect } from "react";
import { tikTokManager, playSound, TikTokChatEvent, TikTokGiftEvent, TikTokLikeEvent } from "@/lib/tiktok";
import { Swords, Trophy, Volume2, VolumeX, RotateCcw, Zap, Flame } from "lucide-react";

export function SlapBattleGame({ isOverlay = false }: { isOverlay?: boolean }) {
  const [fighter1Hp, setFighter1Hp] = useState<number>(100);
  const [fighter2Hp, setFighter2Hp] = useState<number>(100);
  const [fighter1Slaps, setFighter1Slaps] = useState<number>(0);
  const [fighter2Slaps, setFighter2Slaps] = useState<number>(0);
  const [slapEffect, setSlapEffect] = useState<{ target: 1 | 2; text: string; id: number } | null>(null);
  const [winner, setWinner] = useState<"f1" | "f2" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [actionLog, setActionLog] = useState<string>("Batalha de Tapas pronta! Comente #1 para Lutador Vermelho ou #2 para Lutador Roxo!");

  const strike = (attacker: 1 | 2, damage: number, user: string, actionType: string) => {
    if (winner) return;

    if (soundEnabled) {
      playSound("slap");
    }

    const target = attacker === 1 ? 2 : 1;
    const effectWords = ["💥 POW!", "👋 TAPAÇO!", "⚡ CRÍTICO!", "🔥 NOCAUTE!", "💀 IMPACTO!"];
    const word = damage > 15 ? effectWords[Math.floor(Math.random() * effectWords.length)] : "👋 SLAP!";

    setSlapEffect({ target, text: word, id: Date.now() });
    setTimeout(() => setSlapEffect(null), 600);

    if (attacker === 1) {
      setFighter1Slaps((s) => s + 1);
      setFighter2Hp((hp) => {
        const next = Math.max(0, hp - damage);
        if (next === 0 && !winner) {
          setWinner("f1");
          if (soundEnabled) playSound("victory");
        }
        return next;
      });
      setActionLog(`🔴 Lutador 1 desferiu ${word} em Lutador 2 por @${user} (-${damage} HP)`);
    } else {
      setFighter2Slaps((s) => s + 1);
      setFighter1Hp((hp) => {
        const next = Math.max(0, hp - damage);
        if (next === 0 && !winner) {
          setWinner("f2");
          if (soundEnabled) playSound("victory");
        }
        return next;
      });
      setActionLog(`🟣 Lutador 2 desferiu ${word} em Lutador 1 por @${user} (-${damage} HP)`);
    }
  };

  useEffect(() => {
    const unsubChat = tikTokManager.onChat((event: TikTokChatEvent) => {
      const text = event.comment.toLowerCase();
      if (text.includes("1") || text.includes("#1") || text.includes("vermelho") || text.includes("red")) {
        strike(1, 4, event.user.uniqueId, "comentário");
      } else if (text.includes("2") || text.includes("#2") || text.includes("roxo") || text.includes("purple")) {
        strike(2, 4, event.user.uniqueId, "comentário");
      }
    });

    const unsubGift = tikTokManager.onGift((event: TikTokGiftEvent) => {
      const damage = Math.max(15, (event.diamondCount || 1) * 3);
      const attacker = Math.random() > 0.5 ? 1 : 2;
      strike(attacker, damage, event.user.uniqueId, event.giftName || "presente");
    });

    const unsubLike = tikTokManager.onLike((event: TikTokLikeEvent) => {
      const attacker = Math.random() > 0.5 ? 1 : 2;
      strike(attacker, Math.max(1, Math.floor(event.likeCount / 3)), event.user.uniqueId, "curtidas");
    });

    return () => {
      unsubChat();
      unsubGift();
      unsubLike();
    };
  }, [winner, soundEnabled]);

  const restart = () => {
    setFighter1Hp(100);
    setFighter2Hp(100);
    setFighter1Slaps(0);
    setFighter2Slaps(0);
    setWinner(null);
    setSlapEffect(null);
    setActionLog("Novo round de Tapas iniciado! Comente #1 ou #2!");
    if (soundEnabled) playSound("pop");
  };

  return (
    <div className={`relative flex flex-col rounded-2xl ${isOverlay ? "h-full w-full bg-slate-950/85 p-4 text-white backdrop-blur-md" : "border border-border/80 bg-slate-950/90 p-5 shadow-2xl"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🥊 DUELO DE TAPAS AO VIVO
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
              SLAP ARENA
            </span>
          </h2>
          <p className="text-xs text-slate-400">Comente #1 ou #2 • Presentes acionam super tapas que derrubam o oponente!</p>
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

      {/* Fighters Health Bars */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Fighter 1 */}
        <div
          onClick={() => strike(1, 10, "Você", "clique")}
          className="cursor-pointer rounded-xl border border-rose-500/40 bg-gradient-to-br from-rose-950/30 to-slate-900 p-4 transition-all hover:border-rose-500"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display font-bold text-rose-400 text-base flex items-center gap-1.5">
              🔴 LUTADOR 1 (#1)
            </span>
            <span className="font-mono text-xs font-bold text-rose-300">{fighter1Hp}/100 HP</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
              style={{ width: `${fighter1Hp}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{fighter1Slaps} tapas desferidos</span>
            <span className="text-rose-400 hover:underline">+ atacar</span>
          </div>
        </div>

        {/* Fighter 2 */}
        <div
          onClick={() => strike(2, 10, "Você", "clique")}
          className="cursor-pointer rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-950/30 to-slate-900 p-4 transition-all hover:border-purple-500"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display font-bold text-purple-400 text-base flex items-center gap-1.5">
              🟣 LUTADOR 2 (#2)
            </span>
            <span className="font-mono text-xs font-bold text-purple-300">{fighter2Hp}/100 HP</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-300"
              style={{ width: `${fighter2Hp}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{fighter2Slaps} tapas desferidos</span>
            <span className="text-purple-400 hover:underline">+ atacar</span>
          </div>
        </div>
      </div>

      {/* Boxing Ring Stage */}
      <div className="relative my-2 rounded-xl border border-slate-800 bg-slate-950 p-8 min-h-[260px] flex items-center justify-around overflow-hidden">
        {/* Ring background ropes */}
        <div className="absolute inset-x-0 top-10 h-0.5 bg-red-500/30" />
        <div className="absolute inset-x-0 top-20 h-0.5 bg-amber-500/30" />
        <div className="absolute inset-x-0 top-30 h-0.5 bg-blue-500/30" />

        {/* Fighter 1 Character */}
        <div className="relative flex flex-col items-center">
          <div
            className={`text-6xl transition-transform duration-200 select-none ${
              slapEffect?.target === 1 ? "animate-wiggle scale-90 -rotate-12 filter brightness-150" : "hover:scale-105"
            }`}
          >
            🥊👺
          </div>
          <span className="mt-2 text-xs font-bold text-rose-400 font-display">Bruto Vermelho</span>
          <span className="text-[10px] text-slate-500">HP {fighter1Hp}</span>
        </div>

        {/* Slap Impact Float */}
        {slapEffect && (
          <div className="absolute z-30 font-black text-2xl sm:text-3xl text-amber-300 animate-bounce tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
            {slapEffect.text}
          </div>
        )}

        {/* Versus Badge */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-display font-black text-sm text-white shadow-xl shadow-rose-500/20 border-2 border-white/20">
            VS
          </div>
        </div>

        {/* Fighter 2 Character */}
        <div className="relative flex flex-col items-center">
          <div
            className={`text-6xl transition-transform duration-200 select-none scale-x-[-1] ${
              slapEffect?.target === 2 ? "animate-wiggle scale-90 rotate-12 filter brightness-150" : "hover:scale-105"
            }`}
          >
            🥊🦹
          </div>
          <span className="mt-2 text-xs font-bold text-purple-400 font-display">Mestre Roxo</span>
          <span className="text-[10px] text-slate-500">HP {fighter2Hp}</span>
        </div>

        {/* Winner Overlay */}
        {winner && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-9 w-9 animate-bounce" />
            </div>
            <h3 className="font-display text-3xl font-extrabold text-white mb-1">
              {winner === "f1" ? "🔴 LUTADOR VERMELHO VENCEU POR NOCAUTE!" : "🟣 LUTADOR ROXO VENCEU POR NOCAUTE!"}
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mb-4">
              Com o apoio massivo do público na live, o oponente foi ao chão com uma sequência destruidora de tapas!
            </p>
            <button
              onClick={restart}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:scale-105 transition-transform"
            >
              Iniciar Nova Luta
            </button>
          </div>
        )}
      </div>

      {/* Action Ticker */}
      <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs">
        <span className="text-slate-300 truncate">{actionLog}</span>
        <span className="font-mono text-[10px] text-rose-400">ARENA 1v1</span>
      </div>
    </div>
  );
}
