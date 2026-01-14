import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import spotsController from "./api/spots.controller.js";
import { initKafka } from "./messaging/kafka.js";

const app = express();

app.use(express.json());
app.use(helmet());

app.use(spotsController);

await initKafka();

app.listen(config.port, () =>
  console.log(`Parking Service running on ${config.port}`)
);
