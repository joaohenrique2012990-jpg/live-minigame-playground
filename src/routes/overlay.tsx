import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [
      { title: "Overlay — Corrida do Chat" },
      { name: "description", content: "Overlay transparente da corrida do chat para usar como Browser Source no OBS." },
      { property: "og:title", content: "Overlay — Corrida do Chat" },
      { property: "og:description", content: "Cada comentário no chat move um competidor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overlay,
});

const NOMES = ["@luana.gg", "@pedrox", "@mari_play", "@joaozin", "@bia.live"];
const CORES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
const MENSAGENS = ["bora!!", "vai vai vai", "kkkkk", "corre!", "🔥🔥", "to chegando", "ninguém me para", "acelera"];
const PASSO = 4;

type Comentario = { id: number; nome: string; texto: string };

function Overlay() {
  const [pos, setPos] = useState<number[]>(NOMES.map(() => 0));
  const [chat, setChat] = useState<Comentario[]>([]);
  const [vencedor, setVencedor] = useState<number | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    document.documentElement.classList.add("overlay-transparent");
    return () => document.documentElement.classList.remove("overlay-transparent");
  }, []);

  // Simula comentários do chat
  useEffect(() => {
    if (vencedor !== null) {
      const t = setTimeout(() => {
        setPos(NOMES.map(() => 0));
        setChat([]);
        setVencedor(null);
      }, 5000);
      return () => clearTimeout(t);
    }
    const t = setInterval(() => {
      const i = Math.floor(Math.random() * NOMES.length);
      const texto = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)]!;
      setChat((c) => [{ id: ++idRef.current, nome: NOMES[i]!, texto }, ...c].slice(0, 5));
      setPos((p) => {
        const n = p.map((v, k) => (k === i ? Math.min(100, v + PASSO) : v));
        if (n[i] === 100) setVencedor(i);
        return n;
      });
    }, 350);
    return () => clearInterval(t);
  }, [vencedor]);

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 p-8 font-sans text-foreground">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-brand drop-shadow">Corrida do Chat</h1>
        <p className="mx-auto mt-2 w-fit rounded-full bg-background/70 px-4 py-1 text-lg font-semibold">Comente para acelerar seu corredor!</p>
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-3 rounded-2xl bg-background/70 p-5">
        {NOMES.map((nome, i) => (
          <div key={nome} className="flex items-center gap-3">
            <span className="w-28 truncate text-sm font-semibold">{nome}</span>
            <div className="relative h-10 flex-1 rounded-full bg-muted/60">
              <div className="absolute inset-y-0 right-3 w-1 rounded bg-foreground/60" />
              <div
                className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full text-lg ${CORES[i]} transition-[left] duration-300`}
                style={{ left: `calc(${pos[i]}% - ${(pos[i]! / 100) * 2}rem)` }}
              >
                🏃
              </div>
            </div>
            <span className="w-12 text-right font-display font-bold">{pos[i]}%</span>
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        {vencedor !== null ? (
          <div className="rounded-2xl bg-brand p-5 text-center font-display text-3xl font-bold text-primary-foreground">
            🏆 {NOMES[vencedor]} venceu!
          </div>
        ) : (
          <ul className="space-y-1.5">
            {chat.map((c) => (
              <li key={c.id} className="w-fit rounded-xl bg-background/70 px-3 py-1.5 text-sm">
                <span className="font-semibold text-accent">{c.nome}</span> {c.texto}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
