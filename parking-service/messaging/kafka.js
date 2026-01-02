import { Kafka } from "kafkajs";
import { config } from "../config.js";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const producer = kafka.producer();

export async function initKafka() {
  await producer.connect();
}

export async function publishEvent(event) {
  await producer.send({
    topic: config.kafka.topic,
    messages: [
      { key: event.type, value: JSON.stringify(event) }
    ]
  });
}
