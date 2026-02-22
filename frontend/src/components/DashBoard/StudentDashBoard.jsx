import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
// ... your existing imports

const StudentDashBoard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setQuizError(null);
        const res = await fetch("http://localhost:3000/api/student/quizzes", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load quizzes");
        setQuizzes(data.data.quizzes || []);
      } catch (e) {
        setQuizError(e.message);
      }
    })();
  }, []);

  const latestQuiz = quizzes?.[0];

  return (
    <div style={{ minHeight: "100vh", padding: "90px 2rem 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* ✅ Notification card */}
        {latestQuiz && (
          <div
            onClick={() => navigate(`/mcqs/test/${latestQuiz._id}`)}
            style={{
              cursor: "pointer",
              padding: 18,
              borderRadius: 14,
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.22)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={18} color="#60a5fa" />
              </div>

              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                  New MCQ Test Available
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                  {latestQuiz.title} • Click to start
                </div>
              </div>
            </div>

            <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 13 }}>
              Start →
            </div>
          </div>
        )}

        {quizError && (
          <div
            style={{
              marginBottom: 20,
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
            }}
          >
            {quizError}
          </div>
        )}

        {/* ... your existing dashboard UI below */}
        {/* Keep everything else as-is */}
      </div>
    </div>
  );
};

export default StudentDashBoard;
