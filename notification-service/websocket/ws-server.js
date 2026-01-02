import WebSocket, { WebSocketServer } from "ws";
import Redis from "ioredis";

const redisPub = new Redis({ host: process.env.REDIS_HOST || "redis" });
const redisSub = new Redis({ host: process.env.REDIS_HOST || "redis" });

export function startWSServer(server) {
  const wss = new WebSocketServer({ server });

  // track clients
  const clients = new Set();

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("close", () => clients.delete(ws));
  });

  // subscribe to redis channel
  redisSub.subscribe("notifications", (err) => {
    if (err) console.error("Redis subscription failed", err);
  });

  redisSub.on("message", (channel, message) => {
    const data = JSON.parse(message);
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  });

  return wss;
}

export function broadcast(event) {
  redisPub.publish("notifications", JSON.stringify(event));
}
