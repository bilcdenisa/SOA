import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    res.sendStatus(403);
  }
}
