import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("Server token access", token);
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized not token provided" });
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    console.log("Decoded info", decoded);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protect route middleware", error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const isAdmin = async (req, res, next) => {
  console.log("This is user", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const isTeacher = async (req, res, next) => {
  console.log("Teacher details", req.user);
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access only" });
  }
  next();
};
