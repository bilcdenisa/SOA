import express from "express";
import helmet from "helmet";
import http from "http";
import { createKafkaConsumer } from "./messaging/kafka.js";
import { startWSServer, broadcast } from "./websocket/ws-server.js";

const app = express();
app.use(helmet());

const server = http.createServer(app);
const wss = startWSServer(server);

const kafkaConsumer = createKafkaConsumer({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER],
  topic: "parking-events",
  onMessage: (event) => {
    broadcast(event); // push to WebSocket clients
    console.log("Event broadcasted:", event);
  }
});

await kafkaConsumer.init();

server.listen(5000, () =>
  console.log("Notification Service running on port 5000")
);
