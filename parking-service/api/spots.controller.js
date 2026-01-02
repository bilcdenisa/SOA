import express from "express";
import { spotUpdateSchema } from "../validation/spot.schema.js";
import { getAllSpots, updateSpot, addSpot } from "../domain/parking.store.js";
import { publishEvent } from "../messaging/kafka.js";

const router = express.Router();

// get all parking spots
router.get("/spots", (req, res) => {
  res.json(getAllSpots());
});

// update parking spot
router.post("/spots/:id", async (req, res) => {
  const { error } = spotUpdateSchema.validate(req.body);
  if (error) return res.status(400).json(error.details);

  const result = updateSpot(req.params.id, req.body.status);

  if (!result) {
    return res.status(200).json({ message: "No state change" });
  }

  await publishEvent({
    type: "ParkingSpotUpdated",
    spotId: req.params.id,
    status: req.body.status,
    timestamp: new Date().toISOString()
  });

  res.status(200).json(result);
});

// add a parking spot
router.post("/spots", async (req, res) => {
  const { number, status } = req.body;
  if (!number) return res.status(400).json({ error: "Spot number is required" });

  const newSpot = addSpot({ number, status: status || "FREE" });

  await publishEvent({
    type: "ParkingSpotAdded",
    spotId: newSpot.id,
    number: newSpot.number,
    status: newSpot.status,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newSpot);
});

export default router;
