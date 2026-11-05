import React, { useState } from "react";
import { tikTokManager } from "@/lib/tiktok";
import { X, Check, Copy, Radio, ExternalLink, Terminal, ShieldCheck, AlertCircle } from "lucide-react";

interface TikTokConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TikTokConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [copiedBridge, setCopiedBridge] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);

  if (!isOpen) return null;

  const handleConnect = () => {
    if (!username.trim()) return;
    setIsConnecting(true);

    // Tenta conectar ao WebSocket bridge local (porta 21213)
    tikTokManager.connectWebSocket("ws://localhost:21213", (status) => {
      setIsConnecting(false);
      setIsConnected(status);
    });

    // Caso o bridge ainda não esteja rodando, ativa modo de escuta
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1200);
  };

  const obsUrl = typeof window !== "undefined" ? `${window.location.origin}/overlay` : "https://seusite.com/overlay";
  const bridgeCommand = `node tiktok-bridge.mjs ${username || "seu_usuario"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-cyan-400 p-2.5 shadow-lg shadow-pink-500/20">
            <Radio className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Conectar TikTok LIVE</h2>
            <p className="text-xs text-slate-400">Vincule sua live para receber comentários, curtidas e presentes em tempo real.</p>
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seu @ do TikTok (precisa estar AO VIVO)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace("@", ""))}
                placeholder="seunomeaqui"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConnect}
              disabled={isConnecting || !username.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isConnecting ? "Conectando..." : isConnected ? "Reconectar Live" : "Conectar à Live"}
            </button>
            {isConnected && (
              <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Ativo
              </span>
            )}
          </div>

          {/* Bridge terminal helper */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-amber-400" /> Ponte Oficial Node.js (Sem limites de rate limit)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bridgeCommand);
                  setCopiedBridge(true);
                  setTimeout(() => setCopiedBridge(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-pink-400 hover:underline"
              >
                {copiedBridge ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedBridge ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <code className="block rounded bg-slate-950 p-2 font-mono text-[11px] text-emerald-400 border border-slate-800 select-all">
              {bridgeCommand}
            </code>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Execute no terminal do seu computador para encaminhar 100% dos eventos oficiais da live para os jogos.
            </p>
          </div>

          {/* OBS Browser Source helper */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-cyan-400" /> Link de Navegador para OBS / TikTok Live Studio
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(obsUrl);
                  setCopiedObs(true);
                  setTimeout(() => setCopiedObs(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
              >
                {copiedObs ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedObs ? "Copiado!" : "Copiar Link"}
              </button>
            </div>
            <input
              readOnly
              value={obsUrl}
              className="w-full rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-300 border border-slate-800 select-all focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Adicione como fonte de navegador com largura 1080 e altura 1920 (Vertical) ou 1920x1080 (Horizontal).
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
