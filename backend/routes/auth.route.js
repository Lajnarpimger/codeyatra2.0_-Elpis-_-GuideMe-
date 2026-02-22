import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controllers.js";
import { isAdmin, protectRoute } from "../middleware/auth.middleware.js";
import {
  approveUser,
  getPendingUsers,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getMe", protectRoute, getMe);
router.get("/pending-users", protectRoute, isAdmin, getPendingUsers);
router.put("/approve/:id", protectRoute, isAdmin, approveUser);
router.put("/update-profile", protectRoute, updateProfile);
export default router;
