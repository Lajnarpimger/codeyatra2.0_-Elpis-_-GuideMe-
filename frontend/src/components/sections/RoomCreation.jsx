import React, { useState } from "react";

const RoomCreation = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState([]);

  const generateMCQs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate-mcqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
        }),
      });

      const data = await res.json();
      setMcqs(data.mcqs);
    } catch (err) {
      console.error("MCQ generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2>Teacher MCQ Generator</h2>

      {/* Topic Input */}
      <div>
        <label>Topic / Syllabus</label>
        <input
          type="text"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* Difficulty */}
      <div>
        <label>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Question Count */}
      <div>
        <label>Number of Questions</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </div>

      {/* Generate Button */}
      <button onClick={generateMCQs} disabled={loading}>
        {loading ? "Generating..." : "Generate MCQs (AI)"}
      </button>

      {/* MCQ Preview */}
      {mcqs.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated MCQs</h3>
          {mcqs.map((mcq, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <p>
                <strong>Q{index + 1}:</strong> {mcq.question}
              </p>
              <ul>
                {mcq.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomCreation;
