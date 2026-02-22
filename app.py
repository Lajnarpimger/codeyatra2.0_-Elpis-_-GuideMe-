import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import google.genai as genai

# ---- CONFIG ----
API_KEY = os.getenv("GEMINI_API_KEY")  
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY env var")

client = genai.Client(api_key=API_KEY)

app = FastAPI()

# If frontend is on another domain/port (e.g. React localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_pdf_text_from_path(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    parts = []
    for page in reader.pages:
        txt = page.extract_text() or ""
        if txt.strip():
            parts.append(txt)
    return "\n\n".join(parts).strip()

def summarize_text(text: str) -> str:
    # keep prompt stable and short
    prompt = (
        "Summarize this PDF clearly in bullet points.\n"
        "Include: key topics, main findings, and any conclusions.\n\n"
        f"{text}"
    )
    resp = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return resp.text or ""

@app.post("/api/summarize-pdf")
async def summarize_pdf(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    # Save upload to a temp file (pypdf works best with a path)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
            tmp.write(await file.read())

        text = extract_pdf_text_from_path(tmp_path)
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text from this PDF.")

        # avoid sending insanely large text; chunk if needed
        text_for_model = text[:15000]  # quick cap (you can do chunking later)
        summary = summarize_text(text_for_model)

        return {"summary": summary}

    finally:
        try:
            if "tmp_path" in locals() and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass