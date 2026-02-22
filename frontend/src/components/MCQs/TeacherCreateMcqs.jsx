import React, { useMemo, useState } from "react";

const makeEmptyMcq = () => ({
  question: "",
  options: ["", "", "", ""], // 4 options
  correctIndex: 0,
});

const TeacherCreateMcqs = () => {
  const [title, setTitle] = useState("");
  const [mcqs, setMcqs] = useState([makeEmptyMcq()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isValid = useMemo(() => {
    if (!title.trim()) return false;
    if (mcqs.length === 0) return false;

    for (const q of mcqs) {
      if (!q.question.trim()) return false;
      if (q.options.some((o) => !o.trim())) return false;
      if (q.correctIndex < 0 || q.correctIndex > 3) return false;
    }
    return true;
  }, [title, mcqs]);

  const updateMcq = (idx, patch) => {
    setMcqs((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setMcqs((prev) =>
      prev.map((m, i) => {
        if (i !== qIdx) return m;
        const nextOptions = [...m.options];
        nextOptions[optIdx] = value;
        return { ...m, options: nextOptions };
      }),
    );
  };

  const addMcq = () => setMcqs((prev) => [...prev, makeEmptyMcq()]);

  const removeMcq = (idx) => {
    setMcqs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError(
        "Please fill title, all questions, all options, and correct answers.",
      );
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("http://localhost:3000/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, mcqs }), // <-- mcqs array
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      alert(`Saved! QuizId: ${data.data.quizId}`);
      setTitle("");
      setMcqs([makeEmptyMcq()]);
    } catch (err) {
      setError(err.message || "Failed to save MCQs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{
        backgroundColor: "#04091b",
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
      }}
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl p-8 md:p-10"
        style={{
          background: "rgba(8,15,40,0.88)",
          border: "1px solid rgba(59,130,246,0.15)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.08)",
        }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">
          Create <span className="text-blue-400">MCQs</span>
        </h1>

        {error && (
          <div className="mb-6 p-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-2">
              Quiz Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Computer Networks - Chapter 1"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* MCQ List */}
          <div className="space-y-6">
            {mcqs.map((q, qIdx) => (
              <div
                key={qIdx}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(59,130,246,0.12)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-white font-semibold">
                    Question {qIdx + 1}
                  </h2>

                  {mcqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMcq(qIdx)}
                      className="text-xs text-red-300 hover:text-red-200 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question text */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-2">
                    Question
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) =>
                      updateMcq(qIdx, { question: e.target.value })
                    }
                    rows={3}
                    placeholder="Type the question..."
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-y"
                    style={{
                      background: "rgba(0,0,0,0.15)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      lineHeight: "1.6",
                    }}
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest">
                    Options (choose correct)
                  </label>

                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() =>
                          updateMcq(qIdx, { correctIndex: optIdx })
                        }
                      />
                      <input
                        value={opt}
                        onChange={(e) =>
                          updateOption(qIdx, optIdx, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                        style={{
                          background: "rgba(0,0,0,0.15)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <span className="text-xs text-white/50 w-10 text-right">
                        {q.correctIndex === optIdx ? "✅" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={addMcq}
              className="py-3 px-4 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 0 22px rgba(59,130,246,0.25)",
              }}
            >
              + Add Question
            </button>

            <button
              type="submit"
              disabled={!isValid || saving}
              className={`flex-1 py-3 px-4 rounded-xl text-white text-sm font-semibold transition-all duration-200
                ${!isValid || saving ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}
              `}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
                boxShadow: "0 0 22px rgba(34,197,94,0.25)",
              }}
            >
              {saving ? "Saving..." : "Save MCQs"}
            </button>
          </div>

          <p className="text-xs text-white/50">
            Tip: Select the correct answer using the radio button next to each
            option.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreateMcqs;
