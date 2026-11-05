import React, { useState, useEffect } from "react";
import { tikTokManager, playSound, TikTokChatEvent, TikTokGiftEvent, TikTokLikeEvent } from "@/lib/tiktok";
import { Trophy, RotateCcw, Volume2, VolumeX, Crown } from "lucide-react";

export interface ItemTorre {
  id: string;
  nome: string;
  subtitulo: string;
  emoji: string;
  valor: number;
  tipo: "altura" | "vitoria";
}

const ITENS_NEGATIVOS: ItemTorre[] = [
  { id: "chip", nome: "SMALL CHIP", subtitulo: '"down"', emoji: "🟦", valor: -5, tipo: "altura" },
  { id: "dedo", nome: "DEDO GIGANTE", subtitulo: "GG", emoji: "🫵", valor: -15, tipo: "altura" },
  { id: "machado", nome: "MACHADO", subtitulo: "Fogo", emoji: "🪓", valor: -40, tipo: "altura" },
  { id: "bomba", nome: "BOMBA", subtitulo: "Ice Bomb", emoji: "💣", valor: -80, tipo: "altura" },
  { id: "hulk", nome: "HULK", subtitulo: "Smash", emoji: "💪", valor: -150, tipo: "altura" },
  { id: "roubar", nome: "ROUBAR VITÓRIA", subtitulo: "Troll", emoji: "🎉", valor: -1, tipo: "vitoria" },
];

const ITENS_POSITIVOS: ItemTorre[] = [
  { id: "boost", nome: "SMALL BOOST", subtitulo: "x30", emoji: "❤️", valor: 5, tipo: "altura" },
  { id: "baloes", nome: "BALÕES", subtitulo: "Rosas", emoji: "🎈", valor: 15, tipo: "altura" },
  { id: "foguete", nome: "FOGUETE", subtitulo: "TikTok", emoji: "🚀", valor: 40, tipo: "altura" },
  { id: "dragao", nome: "DRAGÃO", subtitulo: "Fire", emoji: "🐉", valor: 80, tipo: "altura" },
  { id: "superman", nome: "SUPER-HOMEM", subtitulo: "Gift", emoji: "🦸", valor: 150, tipo: "altura" },
  { id: "dar_vitoria", nome: "DAR VITÓRIA", subtitulo: "Jackpot", emoji: "💖", valor: 1, tipo: "vitoria" },
];

const PALETAS = [
  { top: "#e06316", left: "#c2410c", right: "#9a3412", stroke: "#fb923c" }, // Laranja
  { top: "#16a34a", left: "#15803d", right: "#166534", stroke: "#4ade80" }, // Verde
  { top: "#0284c7", left: "#0369a1", right: "#075985", stroke: "#38bdf8" }, // Azul Claro
  { top: "#ca8a04", left: "#a16207", right: "#854d0e", stroke: "#facc15" }, // Amarelo
  { top: "#be185d", left: "#9d174d", right: "#831843", stroke: "#f472b6" }, // Magenta
];

const ALTURA_MAX = 300;
const VITORIAS_MAX = 20;
const MAX_BLOCOS_VISIVEIS = 12;

export function TorreDeBlocosGame({ isOverlay = false }: { isOverlay?: boolean }) {
  const [altura, setAltura] = useState(0);
  const [vitorias, setVitorias] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [floatingEffect, setFloatingEffect] = useState<{ id: number; text: string; isPositive: boolean } | null>(null);
  const [isVictoryCelebration, setIsVictoryCelebration] = useState(false);

  // Executa uma ação de somar ou diminuir
  const aplicarAcao = (tipo: "altura" | "vitoria", valor: number, origin = "clique") => {
    if (vitorias >= VITORIAS_MAX) return;

    const isPositive = valor > 0;
    const sign = isPositive ? "+" : "";
    const effectText = tipo === "vitoria" ? `${sign}${valor} VITÓRIA!` : `${sign}${valor}`;

    setFloatingEffect({ id: Date.now(), text: effectText, isPositive });
    setTimeout(() => setFloatingEffect(null), 800);

    if (soundEnabled) {
      if (Math.abs(valor) >= 80) playSound("explosion");
      else if (isPositive) playSound("pop");
      else playSound("slap");
    }

    if (tipo === "vitoria") {
      setVitorias((curr) => Math.max(0, Math.min(VITORIAS_MAX, curr + valor)));
      return;
    }

    // Ação na altura
    setAltura((curr) => {
      const next = curr + valor;
      if (next >= ALTURA_MAX) {
        // Conquistou 1 vitória!
        setVitorias((v) => {
          const nextV = Math.min(VITORIAS_MAX, v + 1);
          return nextV;
        });
        setIsVictoryCelebration(true);
        if (soundEnabled) playSound("victory");
        setTimeout(() => setIsVictoryCelebration(false), 2500);
        return 0; // reseta torre para a próxima vitória
      }
      return Math.max(0, next);
    });
  };

  // Escuta os eventos em tempo real do TikTok
  useEffect(() => {
    const unsubChat = tikTokManager.onChat((event: TikTokChatEvent) => {
      const text = event.comment.toLowerCase();
      if (text.includes("down") || text.includes("#down") || text.includes("desce")) {
        aplicarAcao("altura", -5, `@${event.user.uniqueId}`);
      } else if (text.includes("up") || text.includes("#up") || text.includes("sobe") || text.includes("bloco")) {
        aplicarAcao("altura", 5, `@${event.user.uniqueId}`);
      }
    });

    const unsubGift = tikTokManager.onGift((event: TikTokGiftEvent) => {
      const diamonds = event.diamondCount || 1;
      if (diamonds >= 1000) {
        aplicarAcao("altura", 150, `@${event.user.uniqueId}`);
      } else if (diamonds >= 100) {
        aplicarAcao("altura", 80, `@${event.user.uniqueId}`);
      } else if (diamonds >= 30) {
        aplicarAcao("altura", 40, `@${event.user.uniqueId}`);
      } else {
        aplicarAcao("altura", 15, `@${event.user.uniqueId}`);
      }
    });

    const unsubLike = tikTokManager.onLike((event: TikTokLikeEvent) => {
      aplicarAcao("altura", 1, `@${event.user.uniqueId}`);
    });

    return () => {
      unsubChat();
      unsubGift();
      unsubLike();
    };
  }, [soundEnabled, vitorias]);

  const numBlocos = altura <= 0 ? 0 : Math.min(MAX_BLOCOS_VISIVEIS, Math.max(1, Math.ceil((altura / ALTURA_MAX) * MAX_BLOCOS_VISIVEIS)));
  const cx = 130;
  const rw = 58;
  const rh = 18;
  const hExtrusao = 16;
  const baseY = 240;

  return (
    <div className={`relative flex flex-col items-center justify-between select-none ${isOverlay ? "h-screen w-screen bg-[#1c120c]" : "w-full max-w-md mx-auto aspect-[9/16] rounded-3xl shadow-2xl border border-stone-800"}`}>
      {/* Dirt Cave Background Texture with Roots */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#2b180d] via-[#1a0f08] to-[#120a05] pointer-events-none">
        {/* Cave radial spotlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-600/15 blur-3xl" />
        
        {/* Tree Roots SVG at the top */}
        <svg viewBox="0 0 400 120" className="absolute top-0 inset-x-0 w-full opacity-60 pointer-events-none" preserveAspectRatio="none">
          <path d="M 0,0 Q 80,45 130,20 T 210,50 T 290,15 T 400,30" stroke="#5c3822" strokeWidth="6" fill="none" />
          <path d="M 60,0 Q 90,70 120,40 T 170,80 T 230,35" stroke="#4a2d1b" strokeWidth="4" fill="none" />
          <path d="M 280,0 Q 310,60 340,30 T 380,70" stroke="#4a2d1b" strokeWidth="4" fill="none" />
          <path d="M 170,0 Q 190,40 210,20 T 250,55" stroke="#3b2214" strokeWidth="3" fill="none" />
        </svg>

        {/* Dirt speckles */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Top Bar: PRO GAME & Upgrade + Controls */}
      <div className="relative z-10 w-full px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-stone-900/90 border border-amber-600/50 px-3 py-1 shadow-lg">
          <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="font-display font-black text-[11px] text-amber-400 tracking-wider">PRO GAME</span>
          <span className="ml-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white">
            Upgrade
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => {
              setAltura(0);
              setVitorias(0);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white"
            title="Reiniciar"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Vitórias Badge (Matching exact image) */}
      <div className="relative z-10 mt-1">
        <div className="flex items-center gap-3 rounded-full bg-black/75 border border-stone-700/60 px-5 py-1.5 shadow-xl backdrop-blur-sm">
          <span className="font-display font-extrabold text-xs text-amber-400 tracking-wide">
            Vitórias
          </span>
          <span className="font-mono font-black text-sm text-white">
            {vitorias} / {VITORIAS_MAX}
          </span>
        </div>
      </div>

      {/* Main Large Height Counter (0 / 300) */}
      <div className="relative z-10 mt-1 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-black text-[#f97316] tracking-tight drop-shadow-[0_2px_12px_rgba(249,115,22,0.4)]">
          {altura} <span className="text-2xl sm:text-3xl font-extrabold text-[#fdba74]">/ {ALTURA_MAX}</span>
        </h1>
      </div>

      {/* Main Game Stage: Left Items | 3D Tower | Right Items */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-between px-2 sm:px-3">
        {/* Left Negative Column */}
        <div className="flex flex-col gap-2 w-20 sm:w-24 shrink-0">
          {ITENS_NEGATIVOS.map((item) => (
            <button
              key={item.id}
              onClick={() => aplicarAcao(item.tipo, item.valor, "botão")}
              className="flex flex-col items-center justify-center rounded-xl bg-black/40 border border-stone-700/40 p-1 hover:border-red-500/60 hover:bg-red-950/20 active:scale-95 transition-all cursor-pointer group"
            >
              <span className="text-xl leading-none group-hover:scale-110 transition-transform">
                {item.emoji}
              </span>
              <span className="text-[8px] font-bold text-stone-400 truncate max-w-full">
                {item.subtitulo}
              </span>
              <span className="text-[9px] font-black text-stone-200 uppercase leading-none truncate max-w-full">
                {item.nome}
              </span>
              <span className="font-mono text-xs font-black text-red-500 mt-0.5">
                {item.valor}
              </span>
            </button>
          ))}
        </div>

        {/* Center: 3D Isometric Tower */}
        <div
          onClick={() => aplicarAcao("altura", 1, "clique")}
          className="relative flex-1 h-full max-h-[360px] flex items-center justify-center cursor-pointer group"
          title="Clique na torre para soltar um bloco!"
        >
          <svg viewBox="0 0 260 310" className="w-full h-full max-h-[340px] drop-shadow-2xl">
            {/* Ground shadow */}
            <ellipse cx={cx} cy={baseY + 36} rx="84" ry="24" fill="rgba(0,0,0,0.6)" />

            {/* Earth platform */}
            <polygon
              points={`${cx},${baseY} ${cx + 78},${baseY + 24} ${cx},${baseY + 48} ${cx - 78},${baseY + 24}`}
              fill="#3a1e12"
              stroke="#542e1d"
              strokeWidth="1.5"
            />
            <polygon
              points={`${cx - 78},${baseY + 24} ${cx},${baseY + 48} ${cx},${baseY + 62} ${cx - 78},${baseY + 38}`}
              fill="#26120a"
              stroke="#401f11"
              strokeWidth="1"
            />
            <polygon
              points={`${cx + 78},${baseY + 24} ${cx},${baseY + 48} ${cx},${baseY + 62} ${cx + 78},${baseY + 38}`}
              fill="#190a05"
              stroke="#401f11"
              strokeWidth="1"
            />

            {/* Stacked 3D Blocks */}
            {Array.from({ length: numBlocos }, (_, i) => {
              const paleta = PALETAS[i % PALETAS.length];
              const by = baseY - 8 - i * hExtrusao;
              const isTopo = i === numBlocos - 1;

              return (
                <g key={i} className={isTopo ? "animate-pulse" : ""}>
                  {/* Left Face */}
                  <polygon
                    points={`${cx - rw},${by + rh} ${cx},${by + rh * 2} ${cx},${by + rh * 2 + hExtrusao} ${cx - rw},${by + rh + hExtrusao}`}
                    fill={paleta.left}
                    stroke={paleta.stroke}
                    strokeWidth="0.8"
                  />
                  {/* Right Face */}
                  <polygon
                    points={`${cx + rw},${by + rh} ${cx},${by + rh * 2} ${cx},${by + rh * 2 + hExtrusao} ${cx + rw},${by + rh + hExtrusao}`}
                    fill={paleta.right}
                    stroke={paleta.stroke}
                    strokeWidth="0.8"
                  />
                  {/* Top Face */}
                  <polygon
                    points={`${cx},${by} ${cx + rw},${by + rh} ${cx},${by + rh * 2} ${cx - rw},${by + rh}`}
                    fill={paleta.top}
                    stroke={paleta.stroke}
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Empty Tower Indicator */}
            {numBlocos === 0 && (
              <text
                x={cx}
                y={baseY - 10}
                textAnchor="middle"
                fill="#fb923c"
                fontSize="12"
                fontWeight="900"
                className="animate-pulse select-none"
              >
                TOQUE PARA SOLTAR BLOCO
              </text>
            )}
          </svg>

          {/* Floating Impact Text (+15 / -40) */}
          {floatingEffect && (
            <div
              key={floatingEffect.id}
              className={`pointer-events-none absolute top-10 font-display text-2xl font-black animate-bounce drop-shadow-[0_0_12px_rgba(0,0,0,0.8)] ${
                floatingEffect.isPositive ? "text-emerald-400" : "text-red-500"
              }`}
            >
              {floatingEffect.text}
            </div>
          )}
        </div>

        {/* Right Positive Column */}
        <div className="flex flex-col gap-2 w-20 sm:w-24 shrink-0">
          {ITENS_POSITIVOS.map((item) => (
            <button
              key={item.id}
              onClick={() => aplicarAcao(item.tipo, item.valor, "botão")}
              className="flex flex-col items-center justify-center rounded-xl bg-black/40 border border-stone-700/40 p-1 hover:border-emerald-500/60 hover:bg-emerald-950/20 active:scale-95 transition-all cursor-pointer group"
            >
              <span className="text-xl leading-none group-hover:scale-110 transition-transform">
                {item.emoji}
              </span>
              <span className="text-[8px] font-bold text-stone-400 truncate max-w-full">
                {item.subtitulo}
              </span>
              <span className="text-[9px] font-black text-stone-200 uppercase leading-none truncate max-w-full">
                {item.nome}
              </span>
              <span className="font-mono text-xs font-black text-emerald-400 mt-0.5">
                +{item.valor}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar: "Click to drop a block" + Livecade Brand */}
      <div className="relative z-10 w-full px-4 pb-3 pt-1 flex flex-col items-center">
        <button
          onClick={() => aplicarAcao("altura", 1, "barra")}
          className="w-full max-w-xs rounded-xl bg-gradient-to-r from-stone-900/90 via-stone-800/90 to-stone-900/90 border border-stone-700/60 py-2.5 px-4 font-display text-sm font-bold text-stone-200 shadow-xl hover:text-white hover:border-orange-500 active:scale-98 transition-all cursor-pointer text-center"
        >
          Click to drop a block
        </button>

        <div className="w-full flex justify-end mt-1.5 pr-2">
          <span className="font-sans font-bold text-[10px] text-stone-500 flex items-center gap-1">
            ▶ <span className="tracking-wider">Livecade</span>
          </span>
        </div>
      </div>

      {/* Victory Flash Overlay */}
      {isVictoryCelebration && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center animate-in fade-in duration-200">
          <span className="text-6xl animate-bounce">🏆</span>
          <h2 className="font-display text-3xl font-black text-amber-400 mt-2">
            VITÓRIA CONQUISTADA!
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            A torre atingiu a marca máxima de 300 blocos!
          </p>
        </div>
      )}
    </div>
  );
}
