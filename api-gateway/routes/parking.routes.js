import express from "express";
import axios from "axios";
import Joi from "joi";
import { authenticate } from "../auth/auth.middleware.js";
import { config } from "../config.js";

const router = express.Router();

const spotSchema = Joi.object({
  status: Joi.string().valid("OCCUPIED", "FREE").required()
});

// update parking spot
router.post("/spots/:id", authenticate, async (req, res) => {
  const { error } = spotSchema.validate(req.body);
  if (error) return res.status(400).json(error.details);

  const response = await axios.post(
    `${config.parkingService.url}/spots/${req.params.id}`,
    req.body
  );
  res.json(response.data);
});

// get all parking spots
router.get("/spots", async (req, res) => {
  try {
    const response = await axios.get(`${config.parkingService.url}/spots`);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parking spots" });
  }
});

// add a parking spot
router.post("/spots", async (req, res) => {
  try {
    const { number, occupied } = req.body;
    if (!number) return res.status(400).json({ error: "Spot number is required" });

    const response = await axios.post(`${config.parkingService.url}/spots`, { number, occupied });
    res.status(201).json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add parking spot" });
  }
});

export default router;
