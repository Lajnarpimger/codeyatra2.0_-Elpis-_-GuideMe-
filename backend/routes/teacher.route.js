import express from "express";
import { roomCreation, saveSummary } from "../controllers/room.controllers.js";
import { isTeacher, protectRoute } from "../middleware/auth.middleware.js";
import {
  createQuiz,
  getTeacherMcqReports,
} from "../controllers/quiz.controllers.js";
// import multer from "multer";
// // import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // folder to save uploaded PDFs
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage });

const router = express.Router();
router.post("/create-room", protectRoute, isTeacher, roomCreation);
router.post("/save-summary", protectRoute, isTeacher, saveSummary);
router.post("/quizzes", protectRoute, isTeacher, createQuiz);
router.get("/mcq-reports", protectRoute, isTeacher, getTeacherMcqReports);

// router.post("/generate-mcqs", protectRoute, isTeacher, generateMCQs);
export default router;
