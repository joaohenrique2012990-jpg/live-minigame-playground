// tiktok-bridge.mjs
// Ponte WebSocket para conectar o TikTok Live aos Jogos Interativos
// Uso: node tiktok-bridge.mjs seu_usuario_tiktok
import { WebcastPushConnection } from "tiktok-live-connector";
import { WebSocketServer } from "ws";

const username = process.argv[2] || process.env.TIKTOK_USER || "tiktokbrasil";
const PORT = process.env.PORT || 21213;

console.log("==================================================");
console.log("🎮 TIKPLAY LIVE BRIDGE - CONECTOR TIKTOK");
console.log(`📡 Usuário configurado: @${username}`);
console.log(`🔌 Servidor WebSocket iniciando na porta ${PORT}...`);
console.log("==================================================");

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Novo cliente conectado (Total: ${clients.size})`);
  
  // Envia status inicial
  ws.send(JSON.stringify({ event: "bridge_ready", user: username }));

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Cliente desconectado (Total: ${clients.size})`);
  });
});

function broadcast(event, data) {
  const payload = JSON.stringify({ event, data });
  for (const client of clients) {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  }
}

const tiktok = new WebcastPushConnection(username, {
  processInitialData: false,
  enableExtendedGiftInfo: true,
  enableWebsocketUpgrade: true,
  requestPollingIntervalMs: 1000,
});

tiktok.connect()
  .then((state) => {
    console.log(`✅ Conectado com sucesso à live de @${username} (Room ID: ${state.roomId})`);
    broadcast("connected", { username, roomId: state.roomId });
  })
  .catch((err) => {
    console.warn(`⚠️ Não foi possível conectar à live de @${username}:`, err.message);
    console.log("👉 Dica: Certifique-se de que o usuário está transmitindo AO VIVO no momento!");
    console.log("💡 O site continuará funcionando perfeitamente em MODO SIMULADOR!");
  });

tiktok.on("chat", (data) => {
  console.log(`💬 [CHAT] ${data.uniqueId}: ${data.comment}`);
  broadcast("chat", {
    uniqueId: data.uniqueId,
    nickname: data.nickname,
    comment: data.comment,
    profilePictureUrl: data.profilePictureUrl,
  });
});

tiktok.on("gift", (data) => {
  if (data.giftType === 1 && !data.repeatEnd) {
    // Presente de sequência contínua
    return;
  }
  console.log(`🎁 [PRESENTE] ${data.uniqueId} enviou ${data.repeatCount}x ${data.giftName} (${data.diamondCount} diamantes)`);
  broadcast("gift", {
    uniqueId: data.uniqueId,
    nickname: data.nickname,
    giftName: data.giftName,
    giftId: data.giftId,
    diamondCount: data.diamondCount,
    repeatCount: data.repeatCount,
    profilePictureUrl: data.profilePictureUrl,
  });
});

tiktok.on("like", (data) => {
  broadcast("like", {
    uniqueId: data.uniqueId,
    nickname: data.nickname,
    likeCount: data.likeCount,
    totalLikes: data.totalLikes,
  });
});

tiktok.on("member", (data) => {
  broadcast("member", {
    uniqueId: data.uniqueId,
    nickname: data.nickname,
  });
});

tiktok.on("disconnected", () => {
  console.log("❌ Desconectado da Live do TikTok");
  broadcast("disconnected", {});
});

tiktok.on("streamEnd", () => {
  console.log("⏹️ A live foi encerrada pelo criador");
  broadcast("streamEnd", {});
});
