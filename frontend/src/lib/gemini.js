import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in frontend .env");

const ai = new GoogleGenAI({ apiKey });

export async function summarizeWithGemini({ title, notes, pdfText }) {
  const prompt = `
You are an assistant for teachers.
Summarize clearly in bullet points.
Include: key topics, main points, and conclusions.
If the content is short, still give a structured summary.

Title: ${title}

Notes:
${notes || "(none)"}

PDF text (if any):
${pdfText || "(none)"}
`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return resp.text ?? "";
}
