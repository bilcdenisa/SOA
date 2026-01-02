import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import parkingRoutes from "./routes/parking.routes.js";
import { login } from "./auth/auth.controller.js";
import cors from "cors";
import { config } from "./config.js";

const app = express();

app.use(cors({
  origin: `${config.frontend.url}`, // allow frontend
  credentials: true,
}));
app.use(express.json());
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100
  })
);

app.post("/auth/login", login);
app.use("/api", parkingRoutes);

app.listen(4000, () =>
  console.log("Secure API Gateway running on port 4000")
);
