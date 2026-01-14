import { connectRabbit } from "./rabbitmq.js"; // see below
import { Kafka } from "kafkajs";

const QUEUE = "auto-release-queue";
const DLX = "auto-release-dlx";
const ROUTING_KEY = "auto-release";

const kafka = new Kafka({
  clientId: "faas-scheduler",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "faas-scheduler-group" });

async function start() {
  const { channel } = await connectRabbit();

  await consumer.connect();
  await consumer.subscribe({ topic: "parking-events" });

  console.log("FaaS Scheduler listening for parking events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      if (event.type === "ParkingSpotUpdated" && event.status === "OCCUPIED") {
        const payload = { spotId: event.spotId };

        // Send message to queue with TTL
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
          persistent: true,
          expiration: 30_000, // 30 sec TTL (auto-release delay)
        });

        console.log("Scheduled auto-release task:", payload);
      }
    },
  });
}

start().catch(console.error);
