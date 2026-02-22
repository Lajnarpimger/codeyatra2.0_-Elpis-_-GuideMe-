import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env");

export const ai = new GoogleGenAI({ apiKey });

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
