export const config = {
  port: 4000,

  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    queue: "parking.commands"
  },

  kafka: {
    clientId: "parking-service",
    brokers: [process.env.KAFKA_BROKER],
    topic: "parking-events"
  }
};
