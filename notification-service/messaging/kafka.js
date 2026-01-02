import { Kafka } from "kafkajs";

export function createKafkaConsumer({ clientId, brokers, topic, onMessage }) {
  const kafka = new Kafka({
  clientId: "parking-service",
  brokers: brokers,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }});

  const consumer = kafka.consumer({ groupId: `${clientId}-group` });

  return {
    async init() {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }) => {
          const event = JSON.parse(message.value.toString());
          onMessage(event);
        }
      });
    }
  };
}
