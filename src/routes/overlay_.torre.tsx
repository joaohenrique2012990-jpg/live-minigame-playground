import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { aplicar, ALTURA_MAX, VITORIAS_MAX, type Acao, type EstadoTorre } from "@/lib/torre";

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
  component: Torre,
});

type Item = { nome: string; emoji: string; acao: Acao };

const NEGATIVOS: Item[] = [
  { nome: "Small Chip", emoji: "🪨", acao: { tipo: "altura", valor: -5 } },
  { nome: "Dedo Gigante", emoji: "👉", acao: { tipo: "altura", valor: -15 } },
  { nome: "Machado", emoji: "🪓", acao: { tipo: "altura", valor: -40 } },
  { nome: "Bomba", emoji: "💣", acao: { tipo: "altura", valor: -80 } },
  { nome: "Hulk", emoji: "💪", acao: { tipo: "altura", valor: -150 } },
  { nome: "Roubar Vitória", emoji: "🦹", acao: { tipo: "vitoria", valor: -1 } },
];

const POSITIVOS: Item[] = [
  { nome: "Small Boost", emoji: "✨", acao: { tipo: "altura", valor: 5 } },
  { nome: "Balões", emoji: "🎈", acao: { tipo: "altura", valor: 15 } },
  { nome: "Foguete", emoji: "🚀", acao: { tipo: "altura", valor: 40 } },
  { nome: "Dragão", emoji: "🐉", acao: { tipo: "altura", valor: 80 } },
  { nome: "Super-Homem", emoji: "🦸", acao: { tipo: "altura", valor: 150 } },
  { nome: "Dar Vitória", emoji: "🏆", acao: { tipo: "vitoria", valor: 1 } },
];

// Cores alternadas dos blocos: laranja, verde, azul, amarelo, rosa
const PALETAS = [
  { top: "#fb923c", left: "#ea580c", right: "#c2410c", stroke: "#fed7aa" }, // Laranja
  { top: "#4ade80", left: "#16a34a", right: "#15803d", stroke: "#bbf7d0" }, // Verde
  { top: "#60a5fa", left: "#2563eb", right: "#1d4ed8", stroke: "#bfdbfe" }, // Azul
  { top: "#facc15", left: "#ca8a04", right: "#a16207", stroke: "#fef08a" }, // Amarelo
  { top: "#f472b6", left: "#db2777", right: "#be185d", stroke: "#fbcfe8" }, // Rosa
];

const MAX_BLOCOS_VISIVEIS = 15;

/** Torre de Blocos em 3D Isométrico SVG */
function TorreIsometrica({ altura }: { altura: number }) {
  // Converte a altura (0 a 300) em número de blocos visíveis (0 a 15)
  const numBlocos = altura <= 0 ? 0 : Math.min(MAX_BLOCOS_VISIVEIS, Math.max(1, Math.ceil((altura / ALTURA_MAX) * MAX_BLOCOS_VISIVEIS)));

  const cx = 120;
  const rw = 54; // raio horizontal do bloco
  const rh = 16; // raio vertical do topo
  const hExtrusao = 14; // espessura vertical do bloco
  const baseY = 260; // ponto base no topo da plataforma

  return (
    <svg viewBox="0 0 240 330" className="h-full w-full max-h-[360px] drop-shadow-xl" aria-label="Torre Isométrica">
      {/* Sombra de chão */}
      <ellipse cx={cx} cy={baseY + 38} rx="78" ry="20" fill="rgba(0,0,0,0.45)" />

      {/* Plataforma / Pedestal Isométrico de terra/pedra */}
      <g>
        {/* Topo do pedestal */}
        <polygon
          points={`${cx},${baseY} ${cx + 72},${baseY + 22} ${cx},${baseY + 44} ${cx - 72},${baseY + 22}`}
          fill="#3d2315"
          stroke="#5c3621"
          strokeWidth="1"
        />
        {/* Lado esquerdo do pedestal */}
        <polygon
          points={`${cx - 72},${baseY + 22} ${cx},${baseY + 44} ${cx},${baseY + 58} ${cx - 72},${baseY + 36}`}
          fill="#2a170d"
          stroke="#422415"
          strokeWidth="1"
        />
        {/* Lado direito do pedestal */}
        <polygon
          points={`${cx + 72},${baseY + 22} ${cx},${baseY + 44} ${cx},${baseY + 58} ${cx + 72},${baseY + 36}`}
          fill="#1c0f08"
          stroke="#422415"
          strokeWidth="1"
        />
      </g>

      {/* Blocos empilhados da base até o topo */}
      {Array.from({ length: numBlocos }, (_, i) => {
        const paleta = PALETAS[i % PALETAS.length]!;
        const by = baseY - 8 - i * hExtrusao;
        const isUltimo = i === numBlocos - 1;

        return (
          <g key={i} className={isUltimo ? "animate-bloco" : undefined}>
            {/* Lado Esquerdo */}
            <polygon
              points={`${cx - rw},${by + rh} ${cx},${by + rh * 2} ${cx},${by + rh * 2 + hExtrusao} ${cx - rw},${by + rh + hExtrusao}`}
              fill={paleta.left}
              stroke={paleta.stroke}
              strokeWidth="0.6"
            />
            {/* Lado Direito */}
            <polygon
              points={`${cx + rw},${by + rh} ${cx},${by + rh * 2} ${cx},${by + rh * 2 + hExtrusao} ${cx + rw},${by + rh + hExtrusao}`}
              fill={paleta.right}
              stroke={paleta.stroke}
              strokeWidth="0.6"
            />
            {/* Topo Isométrico */}
            <polygon
              points={`${cx},${by} ${cx + rw},${by + rh} ${cx},${by + rh * 2} ${cx - rw},${by + rh}`}
              fill={paleta.top}
              stroke={paleta.stroke}
              strokeWidth="0.8"
            />
          </g>
        );
      })}

      {/* Indicador sutil quando a torre está vazia */}
      {numBlocos === 0 && (
        <text
          x={cx}
          y={baseY - 10}
          textAnchor="middle"
          fill="#a8826b"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="0.5"
          opacity="0.85"
        >
          TORRE VAZIA
        </text>
      )}
    </svg>
  );
}

function Lateral({
  itens,
  lado,
  onClick,
}: {
  itens: Item[];
  lado: "neg" | "pos";
  onClick: (i: Item) => void;
}) {
  const isNeg = lado === "neg";

  return (
    <div className="flex w-[26%] flex-col justify-between gap-1 sm:gap-1.5 h-full min-h-0">
      {itens.map((it) => {
        const valorFormatado = it.acao.valor > 0 ? `+${it.acao.valor}` : `${it.acao.valor}`;
        return (
          <button
            key={it.nome}
            onClick={() => onClick(it)}
            className={`group relative flex flex-1 min-h-0 flex-col items-center justify-center rounded-xl border px-1 py-1 text-center transition-all cursor-pointer active:scale-95 select-none ${
              isNeg
                ? "border-red-500/40 bg-red-950/40 text-red-100 hover:border-red-400 hover:bg-red-900/40 shadow-sm shadow-red-950/40"
                : "border-emerald-500/40 bg-emerald-950/40 text-emerald-100 hover:border-emerald-400 hover:bg-emerald-900/40 shadow-sm shadow-emerald-950/40"
            }`}
            title={`${it.nome} (${valorFormatado})`}
          >
            <span className="text-xl sm:text-2xl leading-none transition-transform group-hover:scale-110">
              {it.emoji}
            </span>
            <span className="mt-0.5 max-w-full truncate text-[9px] sm:text-[10px] font-medium leading-tight">
              {it.nome}
            </span>
            <span className={`font-mono text-xs sm:text-sm font-bold ${isNeg ? "text-red-400" : "text-emerald-400"}`}>
              {valorFormatado}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Torre() {
  const [estado, setEstado] = useState<EstadoTorre>({ altura: 0, vitorias: 0 });
  const [vitoria, setVitoria] = useState(false);
  const [deltaFeedback, setDeltaFeedback] = useState<{ id: number; texto: string; cor: "pos" | "neg" } | null>(null);

  useEffect(() => {
    if (!vitoria) return;
    const t = setTimeout(() => setVitoria(false), 2000);
    return () => clearTimeout(t);
  }, [vitoria]);

  const fim = estado.vitorias >= VITORIAS_MAX;

  const agir = (a: Acao) => {
    if (fim) return;

    // Dispara feedback flutuante da alteração
    const texto =
      a.tipo === "vitoria"
        ? a.valor > 0
          ? "+1 Vitória!"
          : "-1 Vitória!"
        : a.valor > 0
          ? `+${a.valor}`
          : `${a.valor}`;

    setDeltaFeedback({
      id: Date.now(),
      texto,
      cor: a.valor > 0 ? "pos" : "neg",
    });

    const r = aplicar(estado, a);
    setEstado({ altura: r.altura, vitorias: r.vitorias });
    if (r.venceu) {
      setVitoria(true);
    }
  };

  const reiniciar = () => {
    setEstado({ altura: 0, vitorias: 0 });
    setVitoria(false);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-stone-950 font-sans text-stone-100 select-none">
      {/* Container Mobile Vertical 9:16 */}
      <div className="relative flex aspect-[9/16] h-full max-h-[100dvh] w-auto max-w-full flex-col justify-between overflow-hidden bg-terra p-2.5 sm:p-4 shadow-2xl border border-stone-800/50">
        
        {/* Topo: Contador de Vitórias */}
        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-5 py-1.5 font-display text-base sm:text-lg font-bold text-amber-300 shadow-md shadow-amber-950/40">
            <span>🏆</span>
            <span>Vitórias {estado.vitorias} / {VITORIAS_MAX}</span>
          </div>
        </div>

        {/* Centro e Laterais */}
        <div className="flex h-full min-h-0 flex-1 gap-2 sm:gap-3 py-2">
          {/* Lateral Esquerda: Negativos */}
          <Lateral itens={NEGATIVOS} lado="neg" onClick={(i) => agir(i.acao)} />

          {/* Coluna Central: Altura da torre e visualização 3D */}
          <div className="relative flex min-w-0 flex-1 flex-col items-center justify-between">
            {/* Altura da torre grande */}
            <div className="w-full text-center">
              <div className="flex items-baseline justify-center gap-1 font-display">
                <span className="text-4xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.35)]">
                  {estado.altura}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-stone-400">
                  / {ALTURA_MAX}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="mx-auto mt-1.5 h-2 w-full max-w-[190px] overflow-hidden rounded-full bg-stone-900/90 border border-stone-700/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(estado.altura / ALTURA_MAX) * 100}%` }}
                />
              </div>
            </div>

            {/* Torre 3D isométrica */}
            <div className="relative flex w-full flex-1 min-h-0 items-center justify-center">
              <TorreIsometrica altura={estado.altura} />

              {/* Feedback flutuante ao clicar */}
              {deltaFeedback && (
                <div
                  key={deltaFeedback.id}
                  className={`pointer-events-none absolute top-4 z-20 animate-delta rounded-full px-3 py-1 font-display text-base font-black shadow-lg backdrop-blur-sm ${
                    deltaFeedback.cor === "pos"
                      ? "border border-emerald-400/60 bg-emerald-950/90 text-emerald-300"
                      : "border border-red-400/60 bg-red-950/90 text-red-300"
                  }`}
                >
                  {deltaFeedback.texto}
                </div>
              )}
            </div>
          </div>

          {/* Lateral Direita: Positivos */}
          <Lateral itens={POSITIVOS} lado="pos" onClick={(i) => agir(i.acao)} />
        </div>

        {/* Rodapé: Botão de soltar bloco */}
        <button
          onClick={() => agir({ tipo: "altura", valor: 1 })}
          disabled={fim}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 sm:py-4 font-display text-base sm:text-lg font-bold text-stone-950 shadow-lg shadow-orange-950/50 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          🧱 Clique para soltar um bloco (+1)
        </button>

        {/* Overlay de Vitória (exibido por 2 segundos ao atingir 300) */}
        {vitoria && !fim && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
            <div className="animate-vitoria flex flex-col items-center gap-2 text-center p-6">
              <span className="text-6xl sm:text-7xl">🎉</span>
              <h2 className="font-display text-5xl sm:text-6xl font-black text-amber-400 drop-shadow-[0_4px_24px_rgba(251,191,36,0.6)]">
                VITÓRIA!
              </h2>
              <p className="font-sans text-base sm:text-lg font-semibold text-amber-200">
                +1 Vitória conquistada!
              </p>
            </div>
          </div>
        )}

        {/* Overlay de Fim de Jogo (ao atingir 20 vitórias) */}
        {fim && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/92 backdrop-blur-md p-6 text-center">
            <div className="animate-vitoria flex flex-col items-center gap-4 max-w-xs">
              <span className="text-7xl">🏆</span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.4)]">
                Fim de jogo
              </h2>
              <p className="text-sm sm:text-base text-stone-300">
                Parabéns! Todas as {VITORIAS_MAX} vitórias foram conquistadas!
              </p>
              <button
                onClick={reiniciar}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-3.5 font-display text-lg font-bold text-stone-950 shadow-lg shadow-orange-950/60 transition-transform active:scale-95 cursor-pointer hover:brightness-110"
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
