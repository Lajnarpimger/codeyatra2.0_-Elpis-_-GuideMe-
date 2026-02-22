import jwt from "jsonwebtoken";
import { ENV } from "./env.js";
export const generateToken = async (userId, res) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("No jwt secret key");
  }
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  return token;
};
