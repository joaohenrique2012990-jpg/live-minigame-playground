import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Gamepad2, MonitorPlay, Eye, Trophy, Gift, Clock, Copy, Check, Settings2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel da Live — Jogos Interativos TikTok" },
      { name: "description", content: "Painel pessoal para controlar jogos interativos e overlay da live no TikTok." },
      { property: "og:title", content: "Painel da Live — Jogos Interativos TikTok" },
      { property: "og:description", content: "Controle jogos, métricas e overlay da sua live no TikTok." },
    ],
  }),
  component: Painel,
});

type Aba = "inicio" | "jogos" | "overlay";

const abas: { id: Aba; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "jogos", label: "Jogos", icon: Gamepad2 },
  { id: "overlay", label: "Overlay", icon: MonitorPlay },
];

function Painel() {
  const [aba, setAba] = useState<Aba>("inicio");
  return (
    <div className="min-h-screen bg-background font-sans text-foreground md:flex">
      <aside className="border-b border-sidebar-border bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="mb-6 hidden font-display text-xl font-bold md:block">
          <span className="text-brand">LiveGames</span>
        </div>
        <nav className="flex gap-2 md:flex-col">
          {abas.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:flex-none md:justify-start ${
                aba === id ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 p-5 md:p-10">
        {aba === "inicio" && <Inicio />}
        {aba === "jogos" && <Jogos />}
        {aba === "overlay" && <Overlay />}
      </main>
    </div>
  );
}

function Titulo({ t, s }: { t: string; s: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold">{t}</h1>
      <p className="mt-1 text-muted-foreground">{s}</p>
    </div>
  );
}

const card = "rounded-2xl border border-border bg-card p-5";
const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

function Inicio() {
  const [user, setUser] = useState("");
  const [conectado, setConectado] = useState(false);
  const metricas = [
    { label: "Espectadores", valor: "1.284", icon: Eye },
    { label: "Partidas", valor: "37", icon: Trophy },
    { label: "Presentes", valor: "912", icon: Gift },
    { label: "Tempo médio", valor: "6m 42s", icon: Clock },
  ];
  return (
    <>
      <Titulo t="Início" s="Conecte sua conta e acompanhe a live." />
      <div className={`${card} mb-6`}>
        <label className="mb-2 block text-sm font-medium">Usuário do TikTok</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <input className={`${input} pl-8`} placeholder="seuusuario" value={user} onChange={(e) => { setUser(e.target.value); setConectado(false); }} />
          </div>
          <button
            onClick={() => setConectado(!conectado && user.trim() !== "")}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {conectado ? "Desconectar" : "Conectar"}
          </button>
          <span className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium ${conectado ? "text-success" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${conectado ? "bg-success" : "bg-muted-foreground"}`} />
            {conectado ? "Conectado" : "Offline"}
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map(({ label, valor, icon: Icon }) => (
          <div key={label} className={card}>
            <div className="mb-4 inline-flex rounded-xl bg-brand p-2.5 text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-bold">{valor}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const jogosIniciais = [
  { nome: "Corrida de Curtidas", desc: "Cada curtida empurra o time do espectador rumo à linha de chegada." },
  { nome: "Quiz do Chat", desc: "Perguntas rápidas; o primeiro a acertar no chat pontua." },
  { nome: "Batalha de Presentes", desc: "Dois times disputam com presentes por 60 segundos." },
  { nome: "Roleta da Sorte", desc: "Presentes giram a roleta com desafios e prêmios." },
  { nome: "Adivinhe a Palavra", desc: "Letras são reveladas; o chat tenta adivinhar a palavra." },
  { nome: "Torre de Blocos", desc: "Comentários empilham blocos — quem derrubar perde." },
];

function Jogos() {
  const [ativos, setAtivos] = useState<boolean[]>([true, false, true, false, false, false]);
  return (
    <>
      <Titulo t="Jogos" s="Ative os minijogos que o público pode jogar." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jogosIniciais.map((j, i) => (
          <div key={j.nome} className={`${ativos[i] ? "border-brand" : "border border-border"} flex flex-col rounded-2xl bg-card p-5`}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">{j.nome}</h3>
              <button
                role="switch"
                aria-checked={ativos[i]}
                aria-label={`Ativar ${j.nome}`}
                onClick={() => setAtivos(ativos.map((a, k) => (k === i ? !a : a)))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ativos[i] ? "bg-brand" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all ${ativos[i] ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <p className="mb-5 flex-1 text-sm text-muted-foreground">{j.desc}</p>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium hover:border-primary">
              <Settings2 className="h-4 w-4" /> Configurar
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function Overlay() {
  const link = "https://livegames.app/overlay/a8f3k2x9";
  const [copiado, setCopiado] = useState(false);
  const [cores, setCores] = useState({ primaria: "#a855f7", secundaria: "#ec4899", destaque: "#22d3ee", fundo: "#0b0b12" });
  const copiar = async () => {
    await navigator.clipboard?.writeText(link).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };
  const campos: { k: keyof typeof cores; label: string }[] = [
    { k: "primaria", label: "Cor primária" },
    { k: "secundaria", label: "Cor secundária" },
    { k: "destaque", label: "Destaque" },
    { k: "fundo", label: "Fundo" },
  ];
  return (
    <>
      <Titulo t="Overlay" s="Adicione como Browser Source no OBS e personalize as cores." />
      <div className={`${card} mb-6`}>
        <label className="mb-2 block text-sm font-medium">Link do Browser Source</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input readOnly value={link} className={`${input} font-mono`} />
          <button onClick={copiar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${card} space-y-4`}>
          {campos.map(({ k, label }) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase text-muted-foreground">{cores[k]}</span>
                <input type="color" value={cores[k]} onChange={(e) => setCores({ ...cores, [k]: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent" />
              </div>
            </div>
          ))}
        </div>
        <div className={card}>
          <p className="mb-3 text-sm text-muted-foreground">Pré-visualização</p>
          {/* Cores dinâmicas escolhidas pelo usuário: precisam de style inline */}
          <div className="aspect-video rounded-xl p-5" style={{ background: cores.fundo }}>
            <div className="rounded-xl p-4" style={{ background: `linear-gradient(120deg, ${cores.primaria}, ${cores.secundaria})` }}>
              <p className="font-display text-lg font-bold" style={{ color: "#fff" }}>Corrida de Curtidas</p>
              <p className="text-sm" style={{ color: "#ffffffcc" }}>Time Rosa está na frente!</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: "#ffffff1a" }}>
              <div className="h-full w-2/3 rounded-full" style={{ background: cores.destaque }} />
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: cores.destaque }}>🎁 @fulano enviou uma Rosa</p>
          </div>
        </div>
      </div>
    </>
  );
}
