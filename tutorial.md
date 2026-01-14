# Scalable Server-Side Notifications with WebSockets, Redis and Kafka

## 1. Introduction

Modern web applications increasingly require real-time updates such as notifications, live dashboards, or monitoring systems. Implementing these features in a microservices architecture introduces several challenges:

- Maintaining persistent WebSocket connections
- Broadcasting messages to many clients
- Scaling horizontally without message loss
- Decoupling services to avoid tight coupling

This tutorial presents a working implementation of scalable server-side notifications using:

- WebSockets for real-time client communication
- Redis Pub/Sub for scaling WebSocket servers
- Kafka for event streaming between microservices
- Docker for containerized deployment

The example system is a **Parking Spot Monitoring Platform**, where users receive real-time notifications when parking spots are added, occupied, or released.

## 2. System Overview

### Architecture Summary

The system is built using a microservices architecture consisting of:

- Frontend – Web application consuming REST APIs and WebSocket notifications
- API Gateway – Exposes secured REST endpoints and routes requests
- Parking Service – Manages parking spot state and business logic
- Notification Service – Delivers real-time notifications to clients
- Kafka – Event streaming platform
- Redis – Distributed in-memory cache used for Pub/Sub
- NGINX – Reverse proxy and load balancer
- Docker – Container orchestration


### Event Flow

```text
Parking Service
      │
      │ emits domain events
      ▼
Kafka (parking-events topic)
      │
      │ consumes events
      ▼
Notification Service
      │
      │ Redis Pub/Sub
      ▼
Connected Clients
```

This design ensures loose coupling scalability, and fault tolerance.

## 3. Event Streaming with Kafka

Kafka is used to:
- Decouple the Parking Service from other services
- Persist events reliably
- Enable future consumers (analytics, audit, monitoring)
- Handle high-throughput event streams

### Publishing Events

When a parking spot is modified, the Parking Service emits an event:

```js
await producer.send({
  topic: "parking-events",
  messages: [
    {
      value: JSON.stringify({
        type: "ParkingSpotUpdated",
        spotId,
        status,
        timestamp: new Date().toISOString()
      })
    }
  ]
});
```
This ensures asynchronous and reliable communication between services.

### Consuming Events

The Notification Service subscribes to the Kafka topic:

```js
consumer.subscribe({ topic: "parking-events" });

consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    redisPub.publish("notifications", JSON.stringify(event))
  }
});
```

## 4. Scaling Notifications with Redis
### The WebSocket Scaling Problem

WebSocket servers maintain stateful connections. When multiple instances are running:
- Each instance only knows about its own connected clients
- Broadcasting from one instance does not reach all users

### Redis Pub/Sub Solution

Redis Pub/Sub is used to synchronize all WebSocket servers.

Each Notification Service instance subscribes to a Redis channel, publishes incoming Kafka events to Redis
and broadcasts Redis messages to its connected clients.

### Correct Redis Client Configuration

Redis requires two separate connections, one for subscribing and one for publishing:

```js
import Redis from "ioredis";

const publisher = new Redis("redis://redis:6379");
const subscriber = new Redis("redis://redis:6379");
```
Subscribing to events:
```js
subscriber.subscribe("notifications");

subscriber.on("message", (channel, message) => {
  const event = JSON.parse(message);
  broadcastToClients(event);
});
```
Publishing events:
```js
publisher.publish("notifications", JSON.stringify(event));
```

## 5. WebSocket Server Implementation
### WebSocket Setup
```js
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("close", () => clients.delete(ws));
});
```

### Broadcasting to Clients
```js
function broadcastToClients(event) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
}
```
Each server instance broadcasts only to its own clients, while Redis ensures that all instances receive the same events.

### 6. Frontend Integration

```js
const ws = new WebSocket("ws://localhost:5000/notifications");

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  setNotifications(prev => [notification, ...prev]);
};
```