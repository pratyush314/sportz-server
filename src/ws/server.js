import { WebSocket, WebSocketServer } from "ws";
import { WSRateLimiter } from "../rate-limiter/websocket-limiter.js";

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wsLimiter = new WSRateLimiter();

  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket, req) => {
    const clientIp = req.socket.remoteAddress;
    socket.ip = clientIp;
    console.log(`New WS connection from ${clientIp}`);
    if (!wsLimiter.canConnect(clientIp)) {
      console.log(`WS connection rejected from ${clientIp} - rate limited`);
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.send(
          JSON.stringify({
            type: "error",
            error: "Too many connections. Try again later.",
            retryAfter: 60,
          }),
        );
      }
      socket.terminate();
      return;
    }

    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
    socket.on("close", () => {
      wsLimiter.onDisconnect(clientIp);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
    wsLimiter.cleanup();
  });

  setInterval(() => wsLimiter.cleanup(), wsLimiter.windowMs);

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return { broadcastMatchCreated };
}
