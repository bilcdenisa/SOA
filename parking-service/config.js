export const config = {
  port: 4000,

  kafka: {
    clientId: "parking-service",
    brokers: [process.env.KAFKA_BROKER],
    topic: "parking-events"
  }
};
