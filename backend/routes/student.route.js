// routes/student.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  listAvailableQuizzes,
  getQuizForAttempt,
  submitQuiz,
  myAttempts,
  getMyMcqAttempts,
} from "../controllers/student.controllers.js";

const router = express.Router();

router.get("/quizzes", protectRoute, listAvailableQuizzes);
router.get("/quizzes/:quizId", protectRoute, getQuizForAttempt);
router.post("/quizzes/:quizId/submit", protectRoute, submitQuiz);
router.get("/attempts", protectRoute, myAttempts);
router.get("/mcq-attempts", protectRoute, getMyMcqAttempts);

export default router;
