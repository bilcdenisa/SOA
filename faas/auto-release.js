import { Kafka } from "kafkajs";
import axios from "axios";

const kafka = new Kafka({
  clientId: "faas-auto-release",
  brokers: [process.env.KAFKA_BROKER],
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const consumer = kafka.consumer({ groupId: "faas-group" });
const producer = kafka.producer();

const PARKING_SERVICE_URL = process.env.PARKING_SERVICE_URL || "http://parking-service:4000";

async function start() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: "parking-events", fromBeginning: false });

  console.log("FaaS Auto-Release listening...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      
      if (event.type === "ParkingSpotUpdated" && event.status === "OCCUPIED") {
        const spotId = event.spotId;
        console.log(`Spot ${spotId} occupied. Will auto-release in 10 minutes...`);

        setTimeout(async () => {
          try {
            // check current status
            const resp = await axios.get(`${PARKING_SERVICE_URL}/spots`);
            const spot = resp.data.find(s => s.id === spotId);

            if (spot && spot.status === "OCCUPIED") {
              // auto release spot
              await axios.post(`${PARKING_SERVICE_URL}/spots/${spotId}`, { status: "FREE" });

              // emit event
              await producer.send({
                topic: "parking-events",
                messages: [
                  { key: "ParkingSpotFreed", value: JSON.stringify({
                    type: "ParkingSpotFreed",
                    spotId,
                    timestamp: new Date().toISOString()
                  }) }
                ]
              });

              console.log(`Spot ${spotId} auto-released.`);
            }
          } catch (err) {
            console.error("FaaS auto-release error:", err.message);
          }
        }, 1 * 60 * 1000); // 1 min
      }
    }
  });
}

start().catch(err => console.error(err));
