// controllers/student.controllers.js
import Quiz from "../models/Quiz.js";
import StudentQuizAttempt from "../models/StudentQuizAttempt.js";

export const listAvailableQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select("title teacher createdAt"); // safe fields only

    return res.json({ success: true, data: { quizzes } });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load quizzes" });
  }
};

export const getQuizForAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).select(
      "title questions.question questions.options createdAt",
    ); // IMPORTANT: no correctIndex

    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    return res.json({ success: true, data: { quiz } });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load quiz" });
  }
};

// controllers/student.controllers.js

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId).select("title questions");
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid answers payload" });
    }

    let score = 0;
    const correctness = [];
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      correctness.push(isCorrect);
      if (isCorrect) score += 1;

      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: answers[i],
        isCorrect,
      };
    });

    const total = quiz.questions.length;

    // ✅ SAVE MARKS immediately (1 mark per correct question)
    const attemptPayload = {
      student: req.user._id, // assuming protectRoute sets req.user
      quiz: quiz._id,
      answers,
      correctness,
      score,
      total,
      status: "submitted",
    };

    // If you want only 1 attempt ever:
    // - this will create once, and block retakes due to unique index
    // If you want overwrite retake, set upsert:true and remove unique index.
    const attempt = await StudentQuizAttempt.create(attemptPayload);

    return res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        quizId,
        title: quiz.title,
        total,
        score,
        results,
      },
    });
  } catch (e) {
    // If retake blocked by unique index
    if (e?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this quiz.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit quiz" });
  }
};

export const myAttempts = async (req, res) => {
  try {
    const attempts = await StudentQuizAttempt.find({ student: req.user._id })
      .populate("quiz", "title createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: { attempts } });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load attempts" });
  }
};
// controllers/student.controllers.js
// import StudentQuizAttempt from "../models/StudentQuizAttempt.js";

export const getMyMcqAttempts = async (req, res) => {
  try {
    const attempts = await StudentQuizAttempt.find({ student: req.user._id })
      .populate("quiz", "title createdAt") // title = chapter name
      .sort({ createdAt: -1 });

    const rows = attempts.map((a) => ({
      attemptId: a._id,
      quizId: a.quiz?._id,
      chapter: a.quiz?.title || "Untitled",
      score: a.score,
      total: a.total,
      submittedAt: a.createdAt,
    }));

    return res.json({ success: true, data: { attempts: rows } });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load attempts" });
  }
};
