import Quiz from "../models/Quiz.js";

export const getQuizForStudent = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).select(
      "title questions.question questions.options",
    );

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    return res.json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    console.error("getQuizForStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
