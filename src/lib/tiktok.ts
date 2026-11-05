import { create } from "zustand";

export interface TikTokUser {
  uniqueId: string;
  nickname: string;
  profilePictureUrl?: string;
}

export interface TikTokChatEvent {
  user: TikTokUser;
  comment: string;
  timestamp: number;
}

export interface TikTokGiftEvent {
  user: TikTokUser;
  giftName: string;
  giftId?: number;
  diamondCount: number;
  repeatCount: number;
  timestamp: number;
}

export interface TikTokLikeEvent {
  user: TikTokUser;
  likeCount: number;
  totalLikes: number;
  timestamp: number;
}

export interface TikTokConnectionState {
  username: string;
  isConnected: boolean;
  isConnecting: boolean;
  isSimulated: boolean;
  totalLikes: number;
  viewerCount: number;
  recentEvents: Array<{
    id: string;
    type: "chat" | "gift" | "like" | "member";
    user: TikTokUser;
    text: string;
    highlight?: boolean;
    timestamp: number;
  }>;
}

type EventCallback<T> = (data: T) => void;

class TikTokEventManager {
  private chatListeners: Set<EventCallback<TikTokChatEvent>> = new Set();
  private giftListeners: Set<EventCallback<TikTokGiftEvent>> = new Set();
  private likeListeners: Set<EventCallback<TikTokLikeEvent>> = new Set();
  private socket: WebSocket | null = null;
  private autoSimInterval: any = null;
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel("tiktok_live_events");
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "chat") this.emitChat(payload, false);
        else if (type === "gift") this.emitGift(payload, false);
        else if (type === "like") this.emitLike(payload, false);
      };
    }
  }

  public onChat(cb: EventCallback<TikTokChatEvent>) {
    this.chatListeners.add(cb);
    return () => this.chatListeners.delete(cb);
  }

  public onGift(cb: EventCallback<TikTokGiftEvent>) {
    this.giftListeners.add(cb);
    return () => this.giftListeners.delete(cb);
  }

  public onLike(cb: EventCallback<TikTokLikeEvent>) {
    this.likeListeners.add(cb);
    return () => this.likeListeners.delete(cb);
  }

  public emitChat(data: TikTokChatEvent, broadcast = true) {
    this.chatListeners.forEach((cb) => cb(data));
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "chat", payload: data });
    }
  }

  public emitGift(data: TikTokGiftEvent, broadcast = true) {
    this.giftListeners.forEach((cb) => cb(data));
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "gift", payload: data });
    }
  }

  public emitLike(data: TikTokLikeEvent, broadcast = true) {
    this.likeListeners.forEach((cb) => cb(data));
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "like", payload: data });
    }
  }

  public connectWebSocket(url: string = "ws://localhost:21213", onStatus?: (status: boolean) => void) {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("[TikTokWS] Conectado ao bridge:", url);
        if (onStatus) onStatus(true);
      };

      this.socket.onclose = () => {
        console.log("[TikTokWS] Desconectado do bridge");
        if (onStatus) onStatus(false);
      };

      this.socket.onerror = (err) => {
        console.warn("[TikTokWS] Erro ou bridge offline:", err);
        if (onStatus) onStatus(false);
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === "chat") {
            this.emitChat({
              user: {
                uniqueId: msg.data.uniqueId || "usuario",
                nickname: msg.data.nickname || msg.data.uniqueId || "Espectador",
                profilePictureUrl: msg.data.profilePictureUrl,
              },
              comment: msg.data.comment || "",
              timestamp: Date.now(),
            });
          } else if (msg.event === "gift") {
            this.emitGift({
              user: {
                uniqueId: msg.data.uniqueId || "usuario",
                nickname: msg.data.nickname || msg.data.uniqueId || "Espectador",
                profilePictureUrl: msg.data.profilePictureUrl,
              },
              giftName: msg.data.giftName || "Rosa",
              diamondCount: msg.data.diamondCount || 1,
              repeatCount: msg.data.repeatCount || 1,
              timestamp: Date.now(),
            });
          } else if (msg.event === "like") {
            this.emitLike({
              user: {
                uniqueId: msg.data.uniqueId || "usuario",
                nickname: msg.data.nickname || "Espectador",
              },
              likeCount: msg.data.likeCount || 1,
              totalLikes: msg.data.totalLikes || 100,
              timestamp: Date.now(),
            });
          }
        } catch (e) {
          console.error("[TikTokWS] Falha ao processar mensagem", e);
        }
      };
    } catch (e) {
      console.warn("[TikTokWS] Não foi possível abrir WebSocket", e);
      if (onStatus) onStatus(false);
    }
  }

  public disconnectWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public toggleAutoSimulation(enable: boolean) {
    if (this.autoSimInterval) {
      clearInterval(this.autoSimInterval);
      this.autoSimInterval = null;
    }

    if (enable) {
      const mockUsers = [
        { uniqueId: "lucas_gamer", nickname: "Lucas Gamer" },
        { uniqueId: "mari_stream", nickname: "Mariana" },
        { uniqueId: "pedro_live", nickname: "Pedro Henrique" },
        { uniqueId: "bia_tiktoker", nickname: "Beatriz" },
        { uniqueId: "carlos_br", nickname: "Carlos Eduardo" },
        { uniqueId: "felipe_live", nickname: "Felipe" },
      ];

      const commands = [
        "#brasil",
        "#usa",
        "#argentina",
        "#japao",
        "#rosa",
        "#azul",
        "Vai Brasil!",
        "Tapa nele!",
        "Dobra a aposta",
        "Puxa forte!",
        "1",
        "2",
        "3",
      ];

      const gifts = [
        { name: "Rosa", diamonds: 1 },
        { name: "Rosa", diamonds: 1 },
        { name: "Donut", diamonds: 30 },
        { name: "Corgi", diamonds: 99 },
        { name: "Galáxia", diamonds: 1000 },
      ];

      this.autoSimInterval = setInterval(() => {
        const rand = Math.random();
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];

        if (rand < 0.6) {
          // Comentário
          const comment = commands[Math.floor(Math.random() * commands.length)];
          this.emitChat({
            user,
            comment,
            timestamp: Date.now(),
          });
        } else if (rand < 0.85) {
          // Curtidas
          this.emitLike({
            user,
            likeCount: Math.floor(Math.random() * 15) + 1,
            totalLikes: Math.floor(Math.random() * 5000),
            timestamp: Date.now(),
          });
        } else {
          // Presente
          const gift = gifts[Math.floor(Math.random() * gifts.length)];
          this.emitGift({
            user,
            giftName: gift.name,
            diamondCount: gift.diamonds,
            repeatCount: 1,
            timestamp: Date.now(),
          });
        }
      }, 1800);
    }
  }
}

export const tikTokManager = new TikTokEventManager();

// Efeitos sonoros integrados via Web Audio API (sem precisar de arquivos externos!)
export function playSound(type: "pop" | "victory" | "slap" | "bell" | "explosion" | "coin") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "pop" || type === "coin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "slap") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "explosion") {
      // Noise buffer
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === "victory" || type === "bell") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    }
  } catch (e) {
    // Audio context may be restricted before user interaction
  }
}
