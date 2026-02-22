import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TeacherViewReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("http://localhost:3000/api/teacher/mcq-reports", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");

      setReports(data?.data?.reports || []);
    } catch (e) {
      setErr(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
        className="max-w-5xl mx-auto rounded-2xl p-8 md:p-10"
        style={{
          background: "rgba(8,15,40,0.88)",
          border: "1px solid rgba(59,130,246,0.15)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.08)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-white">
            Performance <span className="text-blue-400">Reports</span>
          </h1>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchReports}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "rgba(59,130,246,0.18)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/teacher/dashboard")}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              Back
            </button>
          </div>
        </div>

        {loading && <p className="text-white/60 text-sm">Loading…</p>}

        {err && (
          <div className="mb-6 p-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm">
            {err}
          </div>
        )}

        {!loading && !err && reports.length === 0 && (
          <p className="text-white/50 text-sm">No submissions yet.</p>
        )}

        {!loading && reports.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 bg-white/5">
                  <th className="text-left py-3 px-3 font-semibold">Chapter</th>
                  <th className="text-left py-3 px-3 font-semibold">
                    Student Name
                  </th>
                  <th className="text-left py-3 px-3 font-semibold">Email</th>
                  <th className="text-left py-3 px-3 font-semibold">Marks</th>
                  <th className="text-left py-3 px-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.attemptId}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-3 text-white">{r.chapter}</td>
                    <td className="py-3 px-3 text-white">{r.studentName}</td>
                    <td className="py-3 px-3 text-white/70">
                      {r.studentEmail || "-"}
                    </td>
                    <td className="py-3 px-3 text-white">
                      <span className="text-emerald-300 font-semibold">
                        {r.score}
                      </span>
                      <span className="text-white/60">/{r.total}</span>
                    </td>
                    <td className="py-3 px-3 text-white/60">
                      {new Date(r.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherViewReports;
