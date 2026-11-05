import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Gamepad2,
  Swords,
  Trophy,
  Gift,
  Heart,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Flame,
  Radio,
  Play,
  Settings,
  Layers,
  Crown,
  Share2,
} from "lucide-react";

import { NationsAtWarGame } from "@/components/games/NationsAtWarGame";
import { TugOfWarGame } from "@/components/games/TugOfWarGame";
import { SlapBattleGame } from "@/components/games/SlapBattleGame";
import { PlinkoGame } from "@/components/games/PlinkoGame";
import { TikTokConnectModal } from "@/components/TikTokConnectModal";
import { LiveSimulatorToolbar } from "@/components/LiveSimulatorToolbar";
import { tikTokManager } from "@/lib/tiktok";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TikPlay Live — Jogos Interativos para TikTok LIVE" },
      { name: "description", content: "Plataforma completa de jogos interativos para transmissões ao vivo no TikTok. Nations at War, Cabo de Guerra, Duelo de Tapas e muito mais." },
      { property: "og:title", content: "TikPlay Live — Jogos Interativos TikTok" },
      { property: "og:description", content: "Aumente seu engajamento e presentes na Live com jogos interativos controlados pelo chat." },
    ],
  }),
  component: TikPlayHome,
});

type Category = "todos" | "guerra" | "cabo" | "duelo" | "sorte" | "arcade" | "trivia";

interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  categoryLabel: string;
  badge?: string;
  players: string;
  commands: string[];
  gradient: string;
  icon: string;
  isPlayableNow: boolean;
}

const CATALOG_GAMES: GameItem[] = [
  {
    id: "nations-at-war",
    title: "Nations at War",
    subtitle: "Guerra de Países! Comentários e presentes invadem territórios em tempo real.",
    category: "guerra",
    categoryLabel: "Guerra & Território",
    badge: "🔥 #1 MAIS TRANSMITIDO",
    players: "4.2K streamers",
    commands: ["#brasil", "#usa", "#argentina", "#japao"],
    gradient: "from-amber-500 via-rose-600 to-red-600",
    icon: "⚔️",
    isPlayableNow: true,
  },
  {
    id: "tug-of-war",
    title: "Cabo de Guerra",
    subtitle: "Time Rosa vs Time Azul disputando a força da corda a cada curtida e rosa.",
    category: "cabo",
    categoryLabel: "Cabo de Guerra",
    badge: "⭐ SUPER POPULAR",
    players: "3.8K streamers",
    commands: ["#rosa", "#azul"],
    gradient: "from-pink-500 via-purple-600 to-blue-600",
    icon: "🪢",
    isPlayableNow: true,
  },
  {
    id: "slap-battle",
    title: "Duelo de Tapas",
    subtitle: "Slap Arena 1v1 frenética com nocaute e super tapas disparados por presentes.",
    category: "duelo",
    categoryLabel: "Duelo & Tapas",
    badge: "⚡ NOVO",
    players: "2.1K streamers",
    commands: ["#1", "#2"],
    gradient: "from-rose-600 to-purple-700",
    icon: "🥊",
    isPlayableNow: true,
  },
  {
    id: "plinko-luck",
    title: "Plinko da Sorte",
    subtitle: "Bolas da sorte caem nos pinos em direção aos multiplicadores de até 100x.",
    category: "sorte",
    categoryLabel: "Sorte & Roleta",
    badge: "💎 ALTO GANHO",
    players: "1.9K streamers",
    commands: ["#drop", "presentes"],
    gradient: "from-emerald-500 to-teal-700",
    icon: "🎰",
    isPlayableNow: true,
  },
  {
    id: "tower-blocks",
    title: "Torre de Blocos 3D",
    subtitle: "Construa a torre mais alta enquanto o público tenta salvar ou derrubar.",
    category: "arcade",
    categoryLabel: "Arcade & Blocos",
    players: "1.4K streamers",
    commands: ["presentes sobem/descem"],
    gradient: "from-orange-500 to-amber-600",
    icon: "🧱",
    isPlayableNow: true,
  },
  {
    id: "marble-race",
    title: "Corrida de Bolinhas",
    subtitle: "Bolinhas personalizadas com nomes dos seguidores correm por pistas de obstáculos.",
    category: "arcade",
    categoryLabel: "Corrida & Ação",
    badge: "🏁 VIRAL",
    players: "3.1K streamers",
    commands: ["#entrar", "likes aceleram"],
    gradient: "from-blue-600 to-cyan-500",
    icon: "🔮",
    isPlayableNow: false,
  },
  {
    id: "tower-war",
    title: "Guerra de Torres",
    subtitle: "Exércitos marcham pelas pontes para destruir as torres inimigas.",
    category: "guerra",
    categoryLabel: "Guerra & Território",
    players: "1.7K streamers",
    commands: ["#ataque", "#defesa"],
    gradient: "from-indigo-600 to-purple-800",
    icon: "🏰",
    isPlayableNow: false,
  },
  {
    id: "snake-live",
    title: "Cobrinha da Live",
    subtitle: "Cobrinha gigante que cresce a cada presente e desvia dos comentários do chat.",
    category: "arcade",
    categoryLabel: "Corrida & Ação",
    players: "1.2K streamers",
    commands: ["#cima", "#baixo", "#esq", "#dir"],
    gradient: "from-green-600 to-emerald-800",
    icon: "🐍",
    isPlayableNow: false,
  },
  {
    id: "lucky-wheel",
    title: "Roleta da Fortuna",
    subtitle: "Gire a roleta com prêmios, desafios e castigos para o streamer ao vivo.",
    category: "sorte",
    categoryLabel: "Sorte & Roleta",
    players: "2.4K streamers",
    commands: ["1 rosa = 1 giro"],
    gradient: "from-yellow-500 to-amber-600",
    icon: "🎡",
    isPlayableNow: false,
  },
  {
    id: "quiz-chat",
    title: "Quiz & Trivia",
    subtitle: "Perguntas de conhecimentos gerais; o primeiro a acertar no chat ganha coroa.",
    category: "trivia",
    categoryLabel: "Quiz & Palavras",
    players: "1.1K streamers",
    commands: ["letras / respostas"],
    gradient: "from-violet-600 to-fuchsia-700",
    icon: "💡",
    isPlayableNow: false,
  },
  {
    id: "speed-racing",
    title: "Speed Track Live",
    subtitle: "Corrida de stock cars em pista oval. Presentes ativam turbo e nitros!",
    category: "arcade",
    categoryLabel: "Corrida & Ação",
    players: "980 streamers",
    commands: ["#carro1", "#carro2", "nitro"],
    gradient: "from-red-600 to-orange-600",
    icon: "🏎️",
    isPlayableNow: false,
  },
  {
    id: "dance-floor",
    title: "Pista de Dança TikTok",
    subtitle: "Bonecos 3D dançam ao ritmo da música; quem envia presente vira o DJ da live.",
    category: "arcade",
    categoryLabel: "Música & Festa",
    players: "850 streamers",
    commands: ["#danca", "#ritmo"],
    gradient: "from-fuchsia-600 to-pink-600",
    icon: "🪩",
    isPlayableNow: false,
  },
];

function TikPlayHome() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGameId, setActiveGameId] = useState<string>("nations-at-war");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredGames = CATALOG_GAMES.filter((game) => {
    const matchesCategory = selectedCategory === "todos" || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeGame = CATALOG_GAMES.find((g) => g.id === activeGameId) || CATALOG_GAMES[0];

  const copyOverlayLink = (id: string) => {
    const url = `${window.location.origin}/overlay?game=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Top Gaming Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-2 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  TIKPLAY<span className="text-pink-500">.GAMES</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  TikTok Live Interactive
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              AO VIVO
            </span>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jogos (ex: Nations, Cabo de Guerra, Plinko)..."
              className="w-full rounded-full border border-slate-800 bg-slate-900/80 py-2 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsConnectOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-pink-600/20 hover:opacity-95 transition-all"
            >
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="hidden sm:inline">Conectar TikTok</span>
              <span className="sm:hidden">Conectar</span>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Layers className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Painel</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Mobile Search */}
        <div className="relative mb-6 md:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar jogos interativos..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Featured Hero Banner (Matching the top card in reference screenshot) */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> #1 JOGO MAIS POPULAR DO TIKTOK
                </span>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                  👥 4.200+ Lives Transmitindo
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                NATIONS AT WAR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500">
                  BATTLE FOR GLORY
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                A batalha épica de territórios ao vivo no TikTok! Os espectadores digitam{" "}
                <span className="font-mono font-bold text-emerald-400">#brasil</span>,{" "}
                <span className="font-mono font-bold text-blue-400">#usa</span>,{" "}
                <span className="font-mono font-bold text-sky-400">#argentina</span> ou{" "}
                <span className="font-mono font-bold text-rose-400">#japao</span> no chat, e enviam presentes para
                lançar reforços aéreos e tanques blindados para conquistar o mapa!
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setActiveGameId("nations-at-war");
                    const el = document.getElementById("arena-interativa");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 px-6 py-3 font-display text-sm font-bold text-white shadow-xl shadow-rose-600/30 hover:scale-105 transition-transform"
                >
                  <Play className="h-4 w-4 fill-white" /> Jogar Agora na Tela
                </button>

                <button
                  onClick={() => copyOverlayLink("nations-at-war")}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copiedLink ? "Link Copiado!" : "Copiar Link OBS Studio"}
                </button>

                <Link
                  to="/overlay"
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline px-2 py-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir Overlay Tela Cheia
                </Link>
              </div>
            </div>

            {/* Quick Live Preview Teaser */}
            <div className="lg:w-80 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 mb-2 block flex items-center justify-between">
                <span>COMANDOS NA LIVE</span>
                <span className="text-[10px] text-emerald-400 font-mono">100% AUTOMÁTICO</span>
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <span className="flex items-center gap-2">🇧🇷 Brasil</span>
                  <span className="font-mono text-emerald-400 font-bold">#brasil</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <span className="flex items-center gap-2">🇺🇸 EUA</span>
                  <span className="font-mono text-blue-400 font-bold">#usa</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <span className="flex items-center gap-2">🌹 Rosa</span>
                  <span className="text-rose-400 font-bold">+25 tropas</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <span className="flex items-center gap-2">🌌 Galáxia</span>
                  <span className="text-purple-400 font-bold">Ataque Aéreo 🚀</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Featured 2-Card Row (Directly matching the 2 cards side by side in user screenshot) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Card 1: Cabo de Guerra */}
          <div
            onClick={() => {
              setActiveGameId("tug-of-war");
              const el = document.getElementById("arena-interativa");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-pink-950/20 via-slate-900 to-slate-950 p-6 transition-all hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-400 border border-pink-500/30">
                ⭐ DESTAQUE #2
              </span>
              <span className="text-2xl">🪢</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
              Cabo de Guerra TikTok
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Disputa de força entre Time Rosa e Time Azul. Curtidas no vídeo e comentários puxam a corda ao vivo!
            </p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">3.8K streamers jogando</span>
              <span className="font-semibold text-pink-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Jogar agora →
              </span>
            </div>
          </div>

          {/* Card 2: Duelo de Tapas */}
          <div
            onClick={() => {
              setActiveGameId("slap-battle");
              const el = document.getElementById("arena-interativa");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-950/20 via-slate-900 to-slate-950 p-6 transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-400 border border-purple-500/30">
                ⚡ NOVO SUCESSO
              </span>
              <span className="text-2xl">🥊</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
              Duelo de Tapas (Slap Arena)
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Lutador 1 (#1) vs Lutador 2 (#2). Presentes desferem super tapas devastadores com som e efeito de nocaute!
            </p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">2.1K streamers jogando</span>
              <span className="font-semibold text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Jogar agora →
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Playable Arena (The selected game runs here!) */}
        <section id="arena-interativa" className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                🎮 ARENA INTERATIVA AO VIVO
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  JOGÁVEL AGORA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Você pode jogar diretamente aqui na tela ou copiar o link para o OBS Studio.
              </p>
            </div>

            {/* Quick Switcher Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setActiveGameId("nations-at-war")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeGameId === "nations-at-war" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ⚔️ Nations at War
              </button>
              <button
                onClick={() => setActiveGameId("tug-of-war")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeGameId === "tug-of-war" ? "bg-pink-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                🪢 Cabo de Guerra
              </button>
              <button
                onClick={() => setActiveGameId("slap-battle")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeGameId === "slap-battle" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                🥊 Duelo de Tapas
              </button>
              <button
                onClick={() => setActiveGameId("plinko-luck")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeGameId === "plinko-luck" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                🎰 Plinko
              </button>
            </div>
          </div>

          {/* Active Rendered Game */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-2 sm:p-4 shadow-2xl">
            {activeGameId === "nations-at-war" && <NationsAtWarGame />}
            {activeGameId === "tug-of-war" && <TugOfWarGame />}
            {activeGameId === "slap-battle" && <SlapBattleGame />}
            {activeGameId === "plinko-luck" && <PlinkoGame />}
            {activeGameId === "tower-blocks" && (
              <div className="p-8 text-center">
                <h3 className="font-display text-2xl font-bold text-white mb-2">🧱 Torre de Blocos 3D</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
                  O jogo completo da Torre de Blocos 3D está disponível com rota exclusiva de overlay no OBS.
                </p>
                <Link
                  to="/overlay/torre"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 font-bold text-white"
                >
                  Abrir Torre de Blocos 3D
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Category Filter Pills (Matching the pill bar in reference image) */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "todos"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              🔥 Todos os Jogos ({CATALOG_GAMES.length})
            </button>
            <button
              onClick={() => setSelectedCategory("guerra")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "guerra"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              ⚔️ Guerra & Território
            </button>
            <button
              onClick={() => setSelectedCategory("cabo")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "cabo"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              🪢 Cabo de Guerra
            </button>
            <button
              onClick={() => setSelectedCategory("duelo")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "duelo"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              🥊 Duelo & Tapas
            </button>
            <button
              onClick={() => setSelectedCategory("sorte")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "sorte"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              🎰 Sorte & Roleta
            </button>
            <button
              onClick={() => setSelectedCategory("arcade")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "arcade"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              🏁 Corrida & Ação
            </button>
            <button
              onClick={() => setSelectedCategory("trivia")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "trivia"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              💡 Quiz & Palavras
            </button>
          </div>
        </section>

        {/* Full Grid of Game Cards (Matching the 16+ cards grid in screenshot) */}
        <section className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl"
              >
                <div>
                  {/* Card Art Banner */}
                  <div
                    className={`relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-tr ${game.gradient} p-4 flex flex-col justify-between shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{game.icon}</span>
                      {game.badge && (
                        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm border border-white/20">
                          {game.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-white/90 drop-shadow">
                      {game.players}
                    </span>
                  </div>

                  {/* Title and Category */}
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                      {game.categoryLabel}
                    </span>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-pink-400 transition-colors">
                      {game.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {game.subtitle}
                    </p>
                  </div>

                  {/* Commands Preview */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {game.commands.map((cmd) => (
                      <span
                        key={cmd}
                        className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60"
                      >
                        {cmd}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setActiveGameId(game.id);
                      const el = document.getElementById("arena-interativa");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex-1 rounded-lg bg-slate-800 py-2 text-center text-xs font-bold text-slate-200 hover:bg-pink-600 hover:text-white transition-colors"
                  >
                    {game.isPlayableNow ? "🎮 Jogar" : "👁️ Detalhes"}
                  </button>

                  <button
                    onClick={() => copyOverlayLink(game.id)}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white hover:border-slate-700"
                    title="Copiar link para OBS"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Streamer Setup & Integration Guide Section */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Como transmitir os jogos na sua live do TikTok:
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-6 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 font-bold mb-2">
                  1
                </span>
                <h4 className="font-bold text-white mb-1">Copie o Link do Jogo</h4>
                <p className="text-slate-400">
                  Clique no botão "Copiar Link OBS" do jogo desejado.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-bold mb-2">
                  2
                </span>
                <h4 className="font-bold text-white mb-1">Adicione no OBS Studio</h4>
                <p className="text-slate-400">
                  Crie uma fonte de Navegador (Browser Source) com resolução 1080x1920 (Vertical) ou 1920x1080.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold mb-2">
                  3
                </span>
                <h4 className="font-bold text-white mb-1">Inicie a Live</h4>
                <p className="text-slate-400">
                  Conecte seu @ e ligue a ponte Node.js (`npm run bridge`) para processar comentários e presentes!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Live Simulator Toolbar */}
      <LiveSimulatorToolbar />

      {/* TikTok Connect Modal */}
      <TikTokConnectModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
    </div>
  );
}
