import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { aplicar, ALTURA_MAX, VITORIAS_MAX, type Acao } from "@/lib/torre";

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

const CORES = ["--bloco-laranja", "--bloco-verde", "--bloco-azul", "--bloco-amarelo", "--bloco-rosa"];
const POR_BLOCO = 10; // cada bloco desenhado = 10 de altura
const MAX_VISIVEIS = 18;

function Bloco({ cor }: { cor: string }) {
  const c = `var(${cor})`;
  return (
    <svg viewBox="0 0 100 58" className="-mb-[14%] block w-full animate-bloco" aria-hidden>
      <polygon points="50,0 100,14 50,28 0,14" fill={c} />
      <polygon points="0,14 50,28 50,58 0,44" fill={c} style={{ filter: "brightness(0.75)" }} />
      <polygon points="100,14 50,28 50,58 100,44" fill={c} style={{ filter: "brightness(0.55)" }} />
    </svg>
  );
}

function Lateral({ itens, lado, onClick }: { itens: Item[]; lado: "neg" | "pos"; onClick: (i: Item) => void }) {
  const cor = lado === "neg" ? "text-negativo border-negativo/50" : "text-positivo border-positivo/50";
  return (
    <div className="flex w-[22%] flex-col gap-2">
      {itens.map((it) => (
        <button
          key={it.nome}
          onClick={() => onClick(it)}
          className={`flex flex-col items-center rounded-xl border bg-background/50 px-1 py-1.5 transition-transform active:scale-95 ${cor}`}
        >
          <span className="text-2xl leading-none">{it.emoji}</span>
          <span className="mt-1 text-center text-[10px] font-medium leading-tight text-foreground">{it.nome}</span>
          <span className="font-display text-sm font-bold">
            {it.acao.valor > 0 ? "+" : ""}
            {it.acao.valor}
          </span>
        </button>
      ))}
    </div>
  );
}

function Torre() {
  const [estado, setEstado] = useState({ altura: 0, vitorias: 0 });
  const [vitoria, setVitoria] = useState(false);

  useEffect(() => {
    if (!vitoria) return;
    const t = setTimeout(() => setVitoria(false), 2000);
    return () => clearTimeout(t);
  }, [vitoria]);

  const fim = estado.vitorias >= VITORIAS_MAX;
  const agir = (a: Acao) => {
    if (fim) return;
    const r = aplicar(estado, a);
    setEstado({ altura: r.altura, vitorias: r.vitorias });
    if (r.venceu) setVitoria(true);
  };

  const blocos = Math.min(MAX_VISIVEIS, Math.ceil(estado.altura / POR_BLOCO));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans text-foreground">
      <div className="relative flex aspect-[9/16] h-screen max-w-full flex-col overflow-hidden bg-terra p-3">
        <div className="mx-auto rounded-full bg-background/60 px-5 py-1.5 font-display text-lg font-bold">
          🏆 Vitórias {estado.vitorias} / {VITORIAS_MAX}
        </div>

        <div className="mt-3 flex min-h-0 flex-1 gap-2">
          <Lateral itens={NEGATIVOS} lado="neg" onClick={(i) => agir(i.acao)} />

          <div className="flex min-w-0 flex-1 flex-col items-center">
            <p className="font-display text-5xl font-bold drop-shadow">
              {estado.altura}
              <span className="text-2xl text-muted-foreground"> / {ALTURA_MAX}</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/50">
              <div className="h-full bg-brand transition-all duration-300" style={{ width: `${(estado.altura / ALTURA_MAX) * 100}%` }} />
            </div>
            <div className="flex w-3/4 flex-1 flex-col-reverse items-center justify-start pb-4 pt-4">
              <div className="h-3 w-full rounded-full bg-background/60" />
              {Array.from({ length: blocos }, (_, i) => (
                <div key={i} className="relative w-full" style={{ zIndex: blocos - i }}>
                  <Bloco cor={CORES[i % CORES.length]!} />
                </div>
              ))}
            </div>
          </div>

          <Lateral itens={POSITIVOS} lado="pos" onClick={(i) => agir(i.acao)} />
        </div>

        <button
          onClick={() => agir({ tipo: "altura", valor: 1 })}
          className="mt-3 rounded-2xl bg-brand py-4 font-display text-lg font-bold text-primary-foreground active:scale-[0.98]"
        >
          🧱 Clique para soltar um bloco
        </button>

        {vitoria && !fim && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40">
            <p className="animate-vitoria font-display text-6xl font-bold text-brand drop-shadow">VITÓRIA!</p>
          </div>
        )}

        {fim && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/85 p-6 text-center">
            <p className="text-6xl">🏆</p>
            <h2 className="font-display text-4xl font-bold text-brand">Fim de jogo</h2>
            <p className="text-muted-foreground">{VITORIAS_MAX} vitórias conquistadas!</p>
            <button
              onClick={() => setEstado({ altura: 0, vitorias: 0 })}
              className="rounded-2xl bg-brand px-8 py-3 font-display text-lg font-bold text-primary-foreground"
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
