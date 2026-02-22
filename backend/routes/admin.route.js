import express from "express";
import { isAdmin, protectRoute } from "../middleware/auth.middleware.js";
import {
  approveUser,
  getPendingUsers,
  getTotalStdTech,
  rejectUser,
} from "../controllers/admin.controllers.js";

const router = express.Router();
router.get("/pending-users", protectRoute, isAdmin, getPendingUsers);
router.put("/approve/:id", protectRoute, isAdmin, approveUser);
router.put("/reject/:id", protectRoute, isAdmin, rejectUser);
router.get("/check", protectRoute, (req, res) => {
  res.status(200).json({ success: true, role: req.user.role });
});
router.get("/total-counts", protectRoute, isAdmin, getTotalStdTech);

// router.put("/update-profile", updateProfile);
export default router;
