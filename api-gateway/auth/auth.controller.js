import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUser } from "../users/users.store.js";
import { config } from "../config.js";

export async function login(req, res) {
  const { username, password } = req.body;

  const user = findUser(username);
  if (!user) return res.sendStatus(401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.sendStatus(401);

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  const role = user.role;

  res.json({ token, role });
}
