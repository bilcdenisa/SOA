import bcrypt from "bcryptjs";

const users = [
  {
    id: 1,
    username: "admin",
    passwordHash: await bcrypt.hash("admin", 10),
    role: "ADMIN"
  },
  {
    id: 2,
    username: "user",
    passwordHash: await bcrypt.hash("user", 10),
    role: "USER"
  }
];

export function findUser(username) {
  return users.find(u => u.username === username);
}
