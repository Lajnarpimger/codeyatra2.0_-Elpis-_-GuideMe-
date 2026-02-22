// pages/McqTest.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const McqTest = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // selectedIndex per question
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // backend result with correct answers
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // webcam
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/api/student/quizzes/${quizId}`,
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load quiz");
        setQuiz(data.data.quiz);

        const n = data.data.quiz.questions.length;
        setAnswers(Array(n).fill(null));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  // start webcam (preview only)
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        // not fatal
        console.warn("Camera blocked/unavailable:", e);
      }
    };
    startCam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!quiz) return false;
    if (result) return false;
    return answers.every((a) => a !== null);
  }, [quiz, answers, result]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(
        `http://localhost:3000/api/student/quizzes/${quizId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submit failed");

      stopCamera();

      setResult(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div style={{ color: "white", padding: 40 }}>Loading test...</div>;
  if (error)
    return <div style={{ color: "white", padding: 40 }}>Error: {error}</div>;
  if (!quiz)
    return <div style={{ color: "white", padding: 40 }}>Quiz not found</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "90px 2rem 60px",
        color: "white",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }}>
        {quiz.title}
      </h1>

      {/* webcam preview */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 240,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          Camera preview is ON (later you’ll connect fraud detection).
        </div>
      </div>

      {/* score */}
      {result && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 12,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            Score: {result.score} / {result.total}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Each question = 1 mark
          </div>
        </div>
      )}

      {/* questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(result?.results || quiz.questions).map((q, idx) => {
          const isReviewed = !!result;
          const selected = isReviewed ? q.selectedIndex : answers[idx];
          const correctIndex = isReviewed ? q.correctIndex : null;

          return (
            <div
              key={idx}
              style={{
                padding: 16,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                {idx + 1}. {q.question}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {q.options.map((opt, optIdx) => {
                  const chosen = selected === optIdx;
                  const correct = isReviewed && correctIndex === optIdx;
                  const wrongChosen = isReviewed && chosen && !correct;

                  return (
                    <label
                      key={optIdx}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: 12,
                        cursor: isReviewed ? "default" : "pointer",
                        border: correct
                          ? "1px solid rgba(34,197,94,0.55)"
                          : wrongChosen
                            ? "1px solid rgba(239,68,68,0.55)"
                            : "1px solid rgba(255,255,255,0.12)",
                        background: correct
                          ? "rgba(34,197,94,0.12)"
                          : wrongChosen
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(0,0,0,0.15)",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        disabled={isReviewed}
                        checked={chosen}
                        onChange={() => {
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[idx] = optIdx;
                            return next;
                          });
                        }}
                      />
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isReviewed && correct && <span>✅</span>}
                      {isReviewed && wrongChosen && <span>❌</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* submit */}
      {!result && (
        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          style={{
            marginTop: 22,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            fontWeight: 800,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            opacity: !canSubmit || submitting ? 0.65 : 1,
            cursor: !canSubmit || submitting ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      )}
      {result && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default McqTest;
