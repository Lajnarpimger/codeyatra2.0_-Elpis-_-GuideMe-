# 🎓 AI Course Planner

An AI-powered course planning tool for teachers. Upload a syllabus image or paste course text and get a structured teaching plan with:
- 📚 Topics & subtopics
- 🎯 Depth ratings (Foundational / Intermediate / Advanced)
- 🕐 Estimated teaching hours
- 📺 YouTube reference links per topic
- ⬇️ JSON export

---

## Tech Stack

| Component | Tool |
|-----------|------|
| UI | Streamlit |
| LLM (text) | Ollama + `llama3.2` |
| Vision (image) | Ollama + `llava` |
| YouTube search | `youtubesearchpython` |

No API keys required. Everything runs locally via Ollama.

---

## Setup

### 1. Install Ollama
Download from [https://ollama.com](https://ollama.com) and install.

### 2. Pull the required models
```bash
ollama pull llava        # multimodal vision model (~4 GB)
ollama pull llama3.2     # text LLM (~2 GB)
```

### 3. Start Ollama server
```bash
ollama serve
```

### 4. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the app
```bash
streamlit run course_planner.py
```

Open your browser at **http://localhost:8501**

---

## Usage

### 📷 Image Mode
1. Go to the **"Upload Image"** tab
2. Upload a photo or screenshot of your printed/handwritten syllabus
3. Click **"Extract & Generate Plan"**
4. LLaVA reads the image → Llama 3.2 creates the structured plan

### 📝 Text Mode
1. Go to the **"Paste Text"** tab
2. Paste your raw syllabus or course outline
3. Click **"Generate Course Plan"**

### Settings (sidebar)
- **Audience Level** — Beginner / Intermediate / Advanced
  - Affects depth rating labels and YouTube search queries

---

## File Structure

```
codeyatra2/
├── course_planner.py    # Main Streamlit app
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` error | Run `ollama serve` first |
| Model not found | Run `ollama pull llava` and `ollama pull llama3.2` |
| JSON parse error | Retry — LLM occasionally breaks format; temperature is set low (0.3) to minimize this |
| YouTube links missing | Install `youtubesearchpython` (`pip install youtubesearchpython`) |
