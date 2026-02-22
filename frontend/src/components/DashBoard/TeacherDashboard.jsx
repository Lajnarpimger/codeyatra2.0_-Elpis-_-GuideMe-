import React, { useState } from "react";

const TeacherDashboard = () => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Mcqs, setMcqs] = useState([]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);
  //   setMcqs([]);

  //   try {
  //     const res = await fetch("http://localhost:3000/api/room/generate-mcqs", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ title, notes }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.message || "MCQ generation failed");
  //     }

  //     setMcqs(data.data.mcqs);
  //     setTitle("");
  //     setNotes("");
  //     setFile(null);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("notes", notes);
      if (file) formData.append("file", file);

      const res = await fetch(
        "http://localhost:3000/api/teacher/generate-mcqs",
        {
          method: "POST",
          credentials: "include",
          body: formData, // <- send FormData instead of JSON
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed");

      // display summary immediately
      alert(data.data.summaryTxt);

      setTitle("");
      setNotes("");
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        className="max-w-2xl mx-auto rounded-2xl p-8 md:p-10"
        style={{
          background: "rgba(8,15,40,0.88)",
          border: "1px solid rgba(59,130,246,0.15)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.08)",
        }}
      >
        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-8">
          Teacher <span className="text-blue-400">Dashboard</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title"
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(59,130,246,0.55)";
                e.target.style.background = "rgba(59,130,246,0.05)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.03)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="5"
              placeholder="Write notes here..."
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 resize-y"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                lineHeight: "1.6",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(59,130,246,0.55)";
                e.target.style.background = "rgba(59,130,246,0.05)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.03)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-xs font-semibold text-blue-300/60 uppercase tracking-widest mb-2">
              Upload PDF
            </label>
            <div
              className="w-full rounded-xl px-4 py-5 text-center transition-all duration-200 cursor-pointer"
              style={{
                border: "1.5px dashed rgba(59,130,246,0.3)",
                background: "rgba(59,130,246,0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.55)";
                e.currentTarget.style.background = "rgba(59,130,246,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                e.currentTarget.style.background = "rgba(59,130,246,0.03)";
              }}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-white/40 cursor-pointer
                  file:mr-3 file:py-1.5 file:px-4
                  file:rounded-lg file:border
                  file:text-xs file:font-semibold file:cursor-pointer
                  file:transition-all file:duration-200"
                style={{
                  "--tw-ring-color": "transparent",
                }}
              />
              {file && (
                <p className="mt-2 text-xs text-blue-400 font-medium">
                  📄 {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full"
            style={{ height: "1px", background: "rgba(59,130,246,0.1)" }}
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              boxShadow: "0 0 28px rgba(59,130,246,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 44px rgba(59,130,246,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 28px rgba(59,130,246,0.35)";
            }}
          >
            Upload Notes
          </button>
        </form>
        {/* show responses  */}
        <div className="w-20 h-20 rounded-full mt-10">
          {" "}
          here i want generated summary immediately
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
