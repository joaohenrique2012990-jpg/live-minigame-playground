import React, { useState, useEffect, useRef } from "react";
import { tikTokManager, playSound, TikTokChatEvent, TikTokGiftEvent, TikTokLikeEvent } from "@/lib/tiktok";
import { Shield, Swords, Trophy, Sparkles, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface Nation {
  id: string;
  name: string;
  flag: string;
  color: string;
  bgGrad: string;
  troops: number;
  territories: number;
  command: string;
}

export function NationsAtWarGame({ isOverlay = false }: { isOverlay?: boolean }) {
  const [nations, setNations] = useState<Nation[]>([
    { id: "br", name: "Brasil", flag: "🇧🇷", color: "#22c55e", bgGrad: "from-emerald-600 to-green-500", troops: 150, territories: 25, command: "#brasil" },
    { id: "us", name: "EUA", flag: "🇺🇸", color: "#3b82f6", bgGrad: "from-blue-600 to-indigo-500", troops: 120, territories: 25, command: "#usa" },
    { id: "ar", name: "Argentina", flag: "🇦🇷", color: "#38bdf8", bgGrad: "from-sky-500 to-cyan-400", troops: 110, territories: 25, command: "#argentina" },
    { id: "jp", name: "Japão", flag: "🇯🇵", color: "#ef4444", bgGrad: "from-rose-600 to-red-500", troops: 130, territories: 25, command: "#japao" },
  ]);

  const [recentAction, setRecentAction] = useState<string>("Batalha iniciada! Envie a hashtag do seu país no chat!");
  const [winner, setWinner] = useState<Nation | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hex / Grid cells state (100 cells)
  const [cells, setCells] = useState<string[]>(() => {
    const initial: string[] = [];
    const keys = ["br", "us", "ar", "jp"];
    for (let i = 0; i < 100; i++) {
      initial.push(keys[i % 4]);
    }
    return initial;
  });

  const addTroops = (nationId: string, amount: number, user: string, actionType: "chat" | "like" | "gift") => {
    if (winner) return;

    if (soundEnabled) {
      if (actionType === "gift") playSound("explosion");
      else if (actionType === "like") playSound("coin");
      else playSound("pop");
    }

    setNations((prev) => {
      const updated = prev.map((n) => {
        if (n.id === nationId) {
          const newTroops = n.troops + amount;
          return { ...n, troops: newTroops };
        }
        return n;
      });

      // Recalcular territórios com base na proporção de tropas
      const totalTroops = updated.reduce((acc, curr) => acc + curr.troops, 0);
      let cellsChanged = 0;

      setCells((currentCells) => {
        const nextCells = [...currentCells];
        // Conquistar aleatoriamente algumas células para a nação atacante
        const conquerCount = actionType === "gift" ? Math.min(12, Math.floor(amount / 5)) : 1;
        for (let i = 0; i < conquerCount; i++) {
          const randIdx = Math.floor(Math.random() * nextCells.length);
          if (nextCells[randIdx] !== nationId) {
            nextCells[randIdx] = nationId;
            cellsChanged++;
          }
        }
        return nextCells;
      });

      // Atualizar contagem de territórios
      const finalNations = updated.map((n) => {
        return {
          ...n,
          territories: Math.round((n.troops / totalTroops) * 100),
        };
      });

      // Checar se algum time atingiu 70% de domínio
      const champion = finalNations.find((n) => n.territories >= 70);
      if (champion && !winner) {
        setWinner(champion);
        if (soundEnabled) playSound("victory");
      }

      return finalNations;
    });

    const nationObj = nations.find((n) => n.id === nationId);
    if (nationObj) {
      if (actionType === "gift") {
        setRecentAction(`🔥 @${user} enviou PRESENTE para ${nationObj.flag} ${nationObj.name}! (+${amount} tropas)`);
      } else if (actionType === "like") {
        setRecentAction(`❤️ @${user} curtiu para ${nationObj.flag} ${nationObj.name}! (+${amount} tropas)`);
      } else {
        setRecentAction(`⚔️ @${user} reforçou ${nationObj.flag} ${nationObj.name} no chat! (+${amount} tropa)`);
      }
    }
  };

  useEffect(() => {
    const unsubChat = tikTokManager.onChat((event: TikTokChatEvent) => {
      const text = event.comment.toLowerCase();
      if (text.includes("brasil") || text.includes("#brasil") || text.includes("br") || text.includes("🇧🇷")) {
        addTroops("br", 2, event.user.uniqueId, "chat");
      } else if (text.includes("usa") || text.includes("#usa") || text.includes("eua") || text.includes("🇺🇸")) {
        addTroops("us", 2, event.user.uniqueId, "chat");
      } else if (text.includes("argentina") || text.includes("#argentina") || text.includes("ar") || text.includes("🇦🇷")) {
        addTroops("ar", 2, event.user.uniqueId, "chat");
      } else if (text.includes("japao") || text.includes("#japao") || text.includes("jp") || text.includes("🇯🇵")) {
        addTroops("jp", 2, event.user.uniqueId, "chat");
      }
    });

    const unsubGift = tikTokManager.onGift((event: TikTokGiftEvent) => {
      // Distribui tropas com base no valor do presente para o país líder ou aleatório se neutro
      const diamonds = event.diamondCount || 1;
      const amount = Math.max(10, diamonds * 5);
      // Pega a nação com menos tropas para balancear ou Brasil como favorito
      const targetNation = nations[Math.floor(Math.random() * nations.length)].id;
      addTroops(targetNation, amount, event.user.uniqueId, "gift");
    });

    const unsubLike = tikTokManager.onLike((event: TikTokLikeEvent) => {
      const targetNation = nations[Math.floor(Math.random() * nations.length)].id;
      addTroops(targetNation, Math.max(1, Math.floor(event.likeCount / 2)), event.user.uniqueId, "like");
    });

    return () => {
      unsubChat();
      unsubGift();
      unsubLike();
    };
  }, [nations, winner, soundEnabled]);

  const restartGame = () => {
    setNations([
      { id: "br", name: "Brasil", flag: "🇧🇷", color: "#22c55e", bgGrad: "from-emerald-600 to-green-500", troops: 150, territories: 25, command: "#brasil" },
      { id: "us", name: "EUA", flag: "🇺🇸", color: "#3b82f6", bgGrad: "from-blue-600 to-indigo-500", troops: 120, territories: 25, command: "#usa" },
      { id: "ar", name: "Argentina", flag: "🇦🇷", color: "#38bdf8", bgGrad: "from-sky-500 to-cyan-400", troops: 110, territories: 25, command: "#argentina" },
      { id: "jp", name: "Japão", flag: "🇯🇵", color: "#ef4444", bgGrad: "from-rose-600 to-red-500", troops: 130, territories: 25, command: "#japao" },
    ]);
    setCells(() => {
      const initial: string[] = [];
      const keys = ["br", "us", "ar", "jp"];
      for (let i = 0; i < 100; i++) initial.push(keys[i % 4]);
      return initial;
    });
    setWinner(null);
    setRecentAction("Nova batalha reiniciada!");
    if (soundEnabled) playSound("pop");
  };

  return (
    <div className={`relative flex flex-col rounded-2xl ${isOverlay ? "h-full w-full bg-slate-950/85 p-4 text-white backdrop-blur-md" : "border border-border/80 bg-slate-950/90 p-5 shadow-2xl"}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-500/20">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              NATIONS AT WAR
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/30 animate-pulse">
                AO VIVO
              </span>
            </h2>
            <p className="text-xs text-slate-400">Digite a hashtag do seu time no chat ou envie presentes para invadir!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            title={soundEnabled ? "Mutar som" : "Ativar som"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={restartGame}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Nations Scoreboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
        {nations.map((nation) => (
          <div
            key={nation.id}
            onClick={() => addTroops(nation.id, 5, "Você", "chat")}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-3 transition-all hover:scale-102 hover:border-slate-600"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl">{nation.flag}</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {nation.command}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display font-semibold text-sm text-slate-200">{nation.name}</span>
              <span className="font-mono text-xs font-bold" style={{ color: nation.color }}>
                {nation.territories}%
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{nation.troops.toLocaleString()} tropas</span>
              <span className="text-[10px] text-emerald-400 group-hover:underline">+ clique</span>
            </div>
            {/* Progress indicator */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${nation.bgGrad}`}
                style={{ width: `${Math.min(100, Math.max(5, nation.territories))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Territory Grid / War Map Visualizer */}
      <div className="relative my-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-amber-400" /> Mapa de Dominação em Tempo Real (100 Regiões)
          </span>
          <span className="text-[11px] text-slate-400 animate-pulse">⚡ Atualizado via TikTok Live</span>
        </div>

        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {cells.map((cellId, idx) => {
            const nation = nations.find((n) => n.id === cellId) || nations[0];
            return (
              <div
                key={idx}
                className="aspect-square rounded-md transition-all duration-500 flex items-center justify-center text-[10px] sm:text-xs shadow-inner"
                style={{
                  backgroundColor: nation.color + "33",
                  borderColor: nation.color + "88",
                  borderWidth: "1px",
                }}
                title={`${nation.name} (#${idx + 1})`}
              >
                <span className="opacity-80 select-none scale-75 sm:scale-100">{nation.flag}</span>
              </div>
            );
          })}
        </div>

        {/* Winner Overlay */}
        {winner && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-9 w-9 animate-bounce" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-1">
              {winner.flag} {winner.name} DOMINOU O MUNDO!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mb-4">
              A torcida de {winner.name} dominou mais de 70% do território com a força dos comentários e presentes!
            </p>
            <button
              onClick={restartGame}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:scale-105 transition-transform"
            >
              Jogar Nova Partida
            </button>
          </div>
        )}
      </div>

      {/* Live Event Ticker */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
          <span className="text-slate-300 truncate">{recentAction}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2 pl-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-[10px] text-slate-400">SYNC LIVE</span>
        </div>
      </div>
    </div>
  );
}
