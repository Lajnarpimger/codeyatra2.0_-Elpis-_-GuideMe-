import express from "express";

import { isTeacher, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/create-room", protectRoute, isTeacher, roomCreation);

export default router;
