import React, { useState, useEffect, useRef } from "react";
import { tikTokManager, playSound, TikTokChatEvent, TikTokGiftEvent, TikTokLikeEvent } from "@/lib/tiktok";
import { Sparkles, Trophy, Volume2, VolumeX, RotateCcw, Coins } from "lucide-react";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  user: string;
}

export function PlinkoGame({ isOverlay = false }: { isOverlay?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [ballsDropped, setBallsDropped] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastWin, setLastWin] = useState<string>("Envie presentes ou comente para soltar bolas premiadas!");

  const ballsRef = useRef<Ball[]>([]);
  const buckets = [
    { label: "100x", multiplier: 100, color: "#ef4444" },
    { label: "20x", multiplier: 20, color: "#f97316" },
    { label: "5x", multiplier: 5, color: "#eab308" },
    { label: "2x", multiplier: 2, color: "#22c55e" },
    { label: "5x", multiplier: 5, color: "#eab308" },
    { label: "20x", multiplier: 20, color: "#f97316" },
    { label: "100x", multiplier: 100, color: "#ef4444" },
  ];

  const spawnBall = (user: string, count = 1, isGold = false) => {
    if (soundEnabled) playSound("pop");

    setBallsDropped((b) => b + count);
    for (let i = 0; i < count; i++) {
      const offset = (Math.random() - 0.5) * 60;
      ballsRef.current.push({
        id: Math.random(),
        x: 200 + offset,
        y: 20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        color: isGold ? "#fbbf24" : Math.random() > 0.5 ? "#a855f7" : "#06b6d4",
        user,
      });
    }
  };

  useEffect(() => {
    const unsubChat = tikTokManager.onChat((event: TikTokChatEvent) => {
      spawnBall(event.user.uniqueId, 1, false);
    });

    const unsubGift = tikTokManager.onGift((event: TikTokGiftEvent) => {
      const count = Math.min(10, Math.max(2, (event.diamondCount || 1) * 2));
      spawnBall(event.user.uniqueId, count, true);
    });

    const unsubLike = tikTokManager.onLike((event: TikTokLikeEvent) => {
      if (Math.random() > 0.7) {
        spawnBall(event.user.uniqueId, 1, false);
      }
    });

    return () => {
      unsubChat();
      unsubGift();
      unsubLike();
    };
  }, [soundEnabled]);

  // Canvas Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pegs coordinates (pyramid / grid)
    const pegs: { x: number; y: number }[] = [];
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const cols = r + 3;
      const startX = 200 - (cols * 24) / 2;
      for (let c = 0; c < cols; c++) {
        pegs.push({
          x: startX + c * 24 + 12,
          y: 70 + r * 28,
        });
      }
    }

    const updatePhysics = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Pegs
      for (const peg of pegs) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#64748b";
        ctx.fill();
        ctx.shadowColor = "#94a3b8";
        ctx.shadowBlur = 4;
      }
      ctx.shadowBlur = 0;

      // Update & Draw Balls
      const remainingBalls: Ball[] = [];
      const bucketWidth = canvas.width / buckets.length;

      for (const ball of ballsRef.current) {
        ball.vy += 0.18; // gravidade
        ball.vx *= 0.99; // atrito
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Limites de borda
        if (ball.x < 15) {
          ball.x = 15;
          ball.vx = Math.abs(ball.vx) * 0.7;
        } else if (ball.x > canvas.width - 15) {
          ball.x = canvas.width - 15;
          ball.vx = -Math.abs(ball.vx) * 0.7;
        }

        // Colisão com os pinos
        for (const peg of pegs) {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10) {
            const angle = Math.atan2(dy, dx);
            ball.vx = Math.cos(angle) * 2.8 + (Math.random() - 0.5) * 0.8;
            ball.vy = Math.sin(angle) * 2.8;
          }
        }

        // Checar se caiu no balde (fundo)
        if (ball.y >= canvas.height - 25) {
          const bucketIndex = Math.min(
            buckets.length - 1,
            Math.max(0, Math.floor(ball.x / bucketWidth))
          );
          const prize = buckets[bucketIndex];
          setTotalScore((s) => s + prize.multiplier * 10);
          setLastWin(`🎯 @${ball.user} acertou o multiplicador ${prize.label}! (+${prize.multiplier * 10} pts)`);
          if (soundEnabled) {
            playSound(prize.multiplier >= 20 ? "victory" : "coin");
          }
        } else {
          remainingBalls.push(ball);

          // Render ball
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = ball.color;
          ctx.shadowColor = ball.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ballsRef.current = remainingBalls;
      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled]);

  return (
    <div className={`relative flex flex-col rounded-2xl ${isOverlay ? "h-full w-full bg-slate-950/85 p-4 text-white backdrop-blur-md" : "border border-border/80 bg-slate-950/90 p-5 shadow-2xl"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🎰 PLINKO DA SORTE AO VIVO
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              JACKPOT 100X
            </span>
          </h2>
          <p className="text-xs text-slate-400">Cada comentário solta 1 bola • Presentes soltam bolas de ouro multiplicadoras!</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setTotalScore(0);
              setBallsDropped(0);
              ballsRef.current = [];
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Zerar
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 my-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-xs text-slate-400">Pontuação Total</span>
          <p className="text-2xl font-black font-display text-amber-400">{totalScore.toLocaleString()} pts</p>
        </div>
        <div
          onClick={() => spawnBall("Você", 3, true)}
          className="cursor-pointer rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 hover:border-amber-500 transition-all"
        >
          <span className="text-xs text-amber-300">Bolas Lançadas</span>
          <p className="text-2xl font-black font-display text-white flex items-center justify-between">
            {ballsDropped} <span className="text-xs text-amber-400 font-normal hover:underline">+ soltar</span>
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative mx-auto my-2 rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden flex flex-col items-center">
        <canvas ref={canvasRef} width={400} height={340} className="w-full max-w-[400px] h-[320px]" />

        {/* Buckets Bottom Row */}
        <div className="grid grid-cols-7 w-full max-w-[400px] gap-1 pt-1 border-t border-slate-800">
          {buckets.map((b, i) => (
            <div
              key={i}
              className="rounded py-1.5 text-center font-display font-black text-xs text-white shadow"
              style={{ backgroundColor: b.color }}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs">
        <span className="text-slate-300 truncate">{lastWin}</span>
        <span className="font-mono text-[10px] text-amber-400">PLINKO LIVE</span>
      </div>
    </div>
  );
}
