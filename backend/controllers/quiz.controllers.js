import Quiz from "../models/Quiz.js";
import StudentQuizAttempt from "../models/StudentQuizAttempt.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, mcqs, roomId } = req.body;

    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    }
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ success: false, message: "MCQs required" });
    }
    for (const q of mcqs) {
      if (!q.question?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Each question is required" });
      }
      if (
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        q.options.some((o) => !o?.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Each question must have 4 non-empty options",
        });
      }
      if (
        typeof q.correctIndex !== "number" ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        return res
          .status(400)
          .json({ success: false, message: "correctIndex must be 0-3" });
      }
    }

    const quiz = await Quiz.create({
      teacher: req.user._id,
      title,
      questions: mcqs,
      room: roomId || undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz saved",
      data: {
        quizId: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
      },
    });
  } catch (err) {
    console.error("createQuiz error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// controllers/teacher.controllers.js

export const getTeacherMcqReports = async (req, res) => {
  try {
    // If you want teacher to only see their own quizzes:
    // You need quiz.createdBy = teacherId in Quiz model
    // For now I'll assume Quiz has "createdBy"
    const reports = await StudentQuizAttempt.find()
      .populate("student", "fullName email")
      .populate("quiz", "title createdBy")
      .sort({ createdAt: -1 });

    // filter to current teacher quizzes only (recommended)
    const filtered = reports.filter(
      (r) => String(r.quiz?.createdBy) === String(req.user._id),
    );

    const rows = filtered.map((r) => ({
      attemptId: r._id,
      chapter: r.quiz?.title,
      studentName: r.student?.fullName,
      studentEmail: r.student?.email,
      score: r.score,
      total: r.total,
      submittedAt: r.createdAt,
    }));

    return res.json({ success: true, data: { reports: rows } });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load reports" });
  }
};
