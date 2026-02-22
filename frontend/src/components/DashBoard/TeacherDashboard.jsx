import React, { useState, useRef } from "react";
import { summarizeWithGemini } from "../../lib/gemini";
import { extractPdfText } from "../../lib/extractPdfText";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TeacherDashboard = () => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]); // Array<File>
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Mcqs, setMcqs] = useState([]);
  const [summaryTxt, setSummaryTxt] = useState("");
  const fileInputRef = useRef(null);
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

  const handleRemoveFileAt = (idx) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // keep input selectable again (optional)
      if (next.length === 0 && fileInputRef.current)
        fileInputRef.current.value = "";
      return next;
    });
  };
  const handleClearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setError(null);
    try {
      let pdfText = "";
      if (files.length > 0) {
        // Extract each PDF text and concatenate
        const texts = await Promise.all(
          files.map(async (f) => {
            const t = await extractPdfText(f);
            return `\n\n===== PDF: ${f.name} =====\n${t}`;
          }),
        );

        pdfText = texts.join("\n");
        pdfText = pdfText.slice(0, 15000); // cap total
      }
      setLoading(true);
      const summary = await summarizeWithGemini({ title, notes, pdfText });
      setLoading(false);
      setSummaryTxt(summary);
      console.log(summary);
      const res = await fetch(
        "http://localhost:3000/api/teacher/save-summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, notes, summaryTxt: summary }),
        },
      );
      const data = await res.json();
      console.log("data of summary", data);
      if (!res.ok) throw new Error(data.message || "Save failed");
      setTitle("");
      setNotes("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Something went wrong");
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
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-white/40 cursor-pointer
    file:mr-3 file:py-1.5 file:px-4
    file:rounded-lg file:border
    file:text-xs file:font-semibold file:cursor-pointer
    file:transition-all file:duration-200"
                style={{ "--tw-ring-color": "transparent" }}
              />
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, idx) => (
                    <div
                      key={f.name + idx}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="text-xs text-blue-400 font-medium truncate">
                        📄 {f.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveFileAt(idx)}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleClearFiles}
                    className="text-xs text-white/60 hover:text-white transition underline underline-offset-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full"
            style={{ height: "1px", background: "rgba(59,130,246,0.1)" }}
          />

          {/* Submit */}
          {/* <button
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
          </button> */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all duration-200
    ${loading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}
  `}
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              boxShadow: loading
                ? "0 0 0 rgba(0,0,0,0)"
                : "0 0 28px rgba(59,130,246,0.35)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "0 0 44px rgba(59,130,246,0.55)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(59,130,246,0.35)";
              }
            }}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                Generating...
              </span>
            ) : (
              "Upload Notes"
            )}
          </button>
        </form>
        {/* show responses  */}
        {summaryTxt && (
          <div className="mt-8 p-4 rounded-2xl bg-blue-900/80 border border-blue-400 shadow-lg">
            <h2 className="text-white text-lg font-semibold mb-2">
              Generated Summary:
            </h2>
            <div className="text-white/90 text-sm leading-relaxed prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summaryTxt}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
