import { connectRabbit } from "./rabbitmq.js";
import axios from "axios";

const { PARKING_SERVICE_URL = "http://parking-service:4000" } = process.env;
const DLQ = "auto-release-dlq";

async function start() {
  const { channel } = await connectRabbit();

  console.log("FaaS Worker waiting for tasks from DLQ...");

  channel.consume(DLQ, async (msg) => {
    if (!msg) return;
    const { spotId } = JSON.parse(msg.content.toString());

    try {
      const resp = await axios.get(`${PARKING_SERVICE_URL}/spots`);
      const spot = resp.data.find((s) => s.id === spotId);

      if (spot && spot.status === "OCCUPIED") {
        await axios.post(`${PARKING_SERVICE_URL}/spots/${spotId}`, {
          status: "FREE",
        });
        console.log(`Spot ${spotId} auto-released`);
      }

      channel.ack(msg);
    } catch (err) {
      console.error("Auto-release failed:", err.message);
      channel.nack(msg, false, true); // retry
    }
  });
}

start().catch(console.error);
