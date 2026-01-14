import amqp from "amqplib";

const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

export async function connectRabbit() {
  while (true) {
    try {
      const conn = await amqp.connect(RABBIT_URL);
      const channel = await conn.createChannel();

      // Dead Letter Exchange + DLQ
      await channel.assertExchange("auto-release-dlx", "direct", { durable: true });
      await channel.assertQueue("auto-release-dlq", { durable: true });
      await channel.bindQueue("auto-release-dlq", "auto-release-dlx", "auto-release");

      // Main queue with TTL and DLX
      await channel.assertQueue("auto-release-queue", {
        durable: true,
        deadLetterExchange: "auto-release-dlx",
        deadLetterRoutingKey: "auto-release",
      });

      console.log("Connected to RabbitMQ (TTL + DLQ)");
      return { channel };
    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 2s...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
