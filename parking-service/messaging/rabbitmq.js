import amqp from "amqplib";
import { config } from "../config.js";

let channel;

export async function initRabbitMQ() {
  const connection = await amqp.connect(config.rabbitmq.url);
  channel = await connection.createChannel();
  await channel.assertQueue(config.rabbitmq.queue, { durable: true });
}

export function publishCommand(command) {
  channel.sendToQueue(
    config.rabbitmq.queue,
    Buffer.from(JSON.stringify(command)),
    { persistent: true }
  );
}
