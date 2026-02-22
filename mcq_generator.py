import os
import sys
import re
import random
import traceback
import requests
import time
from bs4 import BeautifulSoup
from pypdf import PdfReader
from pptx import Presentation
from docx import Document
from google import genai
from dotenv import load_dotenv
import nltk
from nltk.corpus import wordnet

# Load API Key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── NLTK setup ───────────────────────────────────────────────────────────────
def setup_nltk():
    packages = [
        ('corpora/wordnet',                         'wordnet'),
        ('tokenizers/punkt',                        'punkt'),
        ('tokenizers/punkt_tab',                    'punkt_tab'),
        ('taggers/averaged_perceptron_tagger',      'averaged_perceptron_tagger'),
        ('taggers/averaged_perceptron_tagger_eng',  'averaged_perceptron_tagger_eng'),
    ]
    for path, pkg in packages:
        try:
            nltk.data.find(path)
        except LookupError:
            print(f"Downloading NLTK package: {pkg}")
            nltk.download(pkg)

setup_nltk()


# ─── MCQ Generator ────────────────────────────────────────────────────────────
class MCQGenerator:
    """
    Generates multiple-choice questions using Gemini AI.
    """

    def __init__(self, models_to_try=["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]):
        if not API_KEY:
            print("Error: GEMINI_API_KEY not found in .env file.")
            sys.exit(1)

        self.client = genai.Client(api_key=API_KEY)
        self.model_id = None
        
        for model in models_to_try:
            try:
                # Test connectivity and model availability
                self.client.models.generate_content(model=model, contents="test")
                self.model_id = model
                print(f"✓ Using model: {model}")
                break
            except Exception as e:
                # Catch rate limits during init if they happen
                if "429" in str(e) or "ResourceExhausted" in str(e):
                    print(f"Rate limit hit during startup. Waiting 5s before trying next model...")
                    time.sleep(5)
                continue
        
        if not self.model_id:
            print("Error: Could not initialize any Gemini model. Check your API key and Quota.")
            sys.exit(1)
            
        self.term_pool = set()  # Pool of all key terms found in the document

    # ── Text extraction ────────────────────────────────────────────────────────
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        text = ""
        try:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    def extract_text_from_pptx(self, pptx_path: str) -> str:
        text = ""
        try:
            prs = Presentation(pptx_path)
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
        except Exception as e:
            print(f"Error reading PPTX: {e}")
        return text

    def extract_text_from_url(self, url: str) -> str:
        print(f"Scraping content from: {url}")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            # 1. Target main content if possible (Wikipedia, general articles)
            content_area = soup.find(id="mw-content-text") or soup.find("article") or soup.find("main") or soup.body
            if not content_area:
                return ""

            # 2. Remove known junk tags/classes
            junk_selectors = [
                "script", "style", "nav", "footer", "header", "aside",
                ".reflist", ".navbox", ".infobox", ".reference", ".mw-editsection",
                ".catlinks", ".printfooter", ".portal", ".ambox", "#toc", ".toc"
            ]
            for sel in junk_selectors:
                for el in content_area.select(sel):
                    el.decompose()

            # 3. Extract text from meaningful tags
            content = []
            for tag in content_area.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']):
                # Filter out specific Wikipedia sections or common nav headers
                header_text = tag.get_text().strip().lower()
                if any(x in header_text for x in ["see also", "references", "external links", "further reading", "notes"]):
                    # If we hit the references section, we might want to stop or at least skip this tag
                    if tag.name.startswith('h'):
                        continue

                text = tag.get_text().strip()
                
                # 4. Clean text: remove citation brackets like [1], [12], [a]
                text = re.sub(r'\[\d+\]', '', text)
                text = re.sub(r'\[[a-zA-Z]\]', '', text)
                
                # 5. Filter out very short snippets (likely garbage or nav links)
                if len(text) > 30 or (tag.name.startswith('h') and len(text) > 3):
                    content.append(text)
            
            return "\n".join(content)
        except Exception as e:
            print(f"Error scraping URL: {e}")
            return ""

    def extract_text(self, file_path: str) -> str:
        if file_path.startswith(("http://", "https://")):
            return self.extract_text_from_url(file_path)

        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif ext == ".pptx":
            return self.extract_text_from_pptx(file_path)
        elif ext in (".txt", ".md"):
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    # ── Text normalization ─────────────────────────────────────────────────────
    def normalize_text(self, text: str) -> str:
        # Fix hyphenated line breaks
        text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)
        text = re.sub(r"\n\s*\n", "\n\n", text)

        lines = text.split("\n")
        normalized, current = [], ""
        for line in lines:
            line = line.strip()
            if not line:
                if current:
                    normalized.append(current)
                    current = ""
                continue
            if current:
                if current[-1] in ".!?":
                    normalized.append(current)
                    current = line
                else:
                    current += " " + line
            else:
                current = line
        if current:
            normalized.append(current)
        return "\n".join(normalized)

    # ── Key-term extraction ────────────────────────────────────────────────────
    def identify_key_terms(self, text: str):
        words = nltk.word_tokenize(text)
        tagged = nltk.pos_tag(words)

        # Pool all potential nouns for distractors
        stopwords = {"this", "that", "with", "from", "they", "their", "them", "these"}
        nouns = [
            w for w, pos in tagged
            if pos.startswith("NN") and len(w) > 3 and w.lower() not in stopwords
        ]
        
        # Add all found nouns to the global term pool for distractors
        for n in nouns:
            self.term_pool.add(n.capitalize())
            
        proper_nouns = [w for w, pos in tagged if pos == "NNP" and len(w) > 2]
        if proper_nouns:
            for pn in proper_nouns:
                self.term_pool.add(pn.capitalize())
            return proper_nouns

        return nouns

    # ── Mistral question generation ────────────────────────────────────────────
    def generate_question(self, context: str, answer: str) -> str:
        """
        Uses Gemini to generate a question based on context and answer.
        Refined to produce natural, professional questions without robotic meta-phrases.
        """
        prompt = f"""
        Generate a professional multiple-choice question where the answer is '{answer}'.
        Base the question on this context:
        ---
        {context}
        ---
        STRICT RULES:
        1. Do NOT use phrases like "Based on the context", "According to the text", or "From the provided terms".
        2. Do NOT mention the context at all in the question.
        3. Make it look like a real exam question.
        4. Return ONLY the question text.
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            question = response.text.strip()

            # Post-processing: remove robotic prefixes if Gemini ignored the rules
            junk_prefixes = [
                r"Based on the (?:provided )?(?:context|text), ?",
                r"According to the (?:provided )?(?:context|text), ?",
                r"Based on the (?:given )?(?:information|notes), ?",
                r"From the (?:provided )?(?:terms|context), ?",
                r"In the (?:context of the )?heart, ?"
            ]
            for pattern in junk_prefixes:
                question = re.sub(pattern, "", question, flags=re.IGNORECASE).strip()

            # Sanitize: strip any extra lines, keep first sentence only
            question = question.split("\n")[0].strip()
            
            # Simple leak check
            if re.search(re.escape(answer), question, re.IGNORECASE):
                # If model leaked answer, use a fill-in-the-blank fallback
                question = context.replace(answer, "____")
                if len(question) > 150:
                    question = question[:150] + "..."
            
            # Ensure ends with ? and capitalized
            if not question.endswith("?"):
                question = question.rstrip(".") + "?"
            
            question = question[0].upper() + question[1:]
            return question
        except Exception as e:
            if "429" in str(e) or "ResourceExhausted" in str(e):
                print(f"  !! Rate limit hit. Using fallback question for '{answer}'.")
                return f"Which of the following refers to '{answer}'?"
            print(f"Error generating question: {e}")
            return f"Which of the following refers to '{answer}'?"

    # ── Distractor generation ──────────────────────────────────────────────────
    def get_distractors(self, answer: str, count: int = 3) -> list:
        distractors: set = set()
        try:
            clean = answer.strip().lower()
            for syn in wordnet.synsets(clean)[:1]:
                for hyper in syn.hypernyms()[:1]:
                    for sibling in hyper.hyponyms():
                        name = sibling.lemmas()[0].name().replace("_", " ").strip()
                        if name and name.lower() != clean:
                            distractors.add(name.capitalize())
                        if len(distractors) >= count:
                            break
        except Exception as e:
            print(f"Distractor lookup warning: {e}")

        # Use the global term pool for high-quality, topic-relevant distractors
        pool_candidates = list(self.term_pool - {answer} - distractors)
        random.shuffle(pool_candidates)
        
        for cand in pool_candidates:
            if len(distractors) < count:
                distractors.add(cand.capitalize())
            else:
                break
                
        # Final fallback if pool is too small (rare)
        counter = 1
        while len(distractors) < count:
            distractors.add(f"Category {answer} {counter}")
            counter += 1
            
        return list(distractors)[:count]

    # ── Output: DOCX ──────────────────────────────────────────────────────────
    def create_mcq_document(self, mcqs: list, output_path: str):
        doc = Document()
        doc.add_heading("Generated MCQ Question Paper", 0)
        for i, mcq in enumerate(mcqs):
            doc.add_paragraph(f"Q{i+1}: {mcq['question']}", style="List Number")
            for j, opt in enumerate(mcq["options"]):
                doc.add_paragraph(f"{chr(65+j)}) {opt}", style="List Bullet")
            doc.add_paragraph("")
        doc.save(output_path)
        print(f"✓ DOCX saved → {output_path}")

    # ── Output: HTML ──────────────────────────────────────────────────────────
    def create_html_report(self, mcqs: list, output_path: str):
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCQ Questions</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #2563eb; --primary-dark: #1e40af;
            --bg: #f8fafc; --card-bg: #ffffff;
            --text: #1e293b; --text-light: #64748b;
            --accent: #10b981;
        }}
        body {{ font-family:'Inter',sans-serif; background:var(--bg); color:var(--text);
                line-height:1.6; margin:0; padding:40px 20px; }}
        .container {{ max-width:800px; margin:0 auto; }}
        header {{ text-align:center; margin-bottom:50px; }}
        h1 {{ color:var(--primary-dark); font-weight:700; margin-bottom:10px; }}
        .meta {{ color:var(--text-light); font-size:.9rem; }}
        .mcq-card {{ background:var(--card-bg); padding:30px; border-radius:16px;
                     box-shadow:0 4px 6px -1px rgba(0,0,0,.1); margin-bottom:25px;
                     transition:transform .2s; }}
        .mcq-card:hover {{ transform:translateY(-2px); }}
        .question {{ font-size:1.1rem; font-weight:600; margin-bottom:20px; color:var(--primary-dark); }}
        .options-list {{ list-style:none; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:12px; }}
        .option {{ background:#f1f5f9; padding:12px 20px; border-radius:10px; font-size:.95rem;
                   cursor:pointer; transition:all .2s; border:2px solid transparent; }}
        .option:hover {{ background:#e2e8f0; border-color:var(--primary); }}
        .answer-reveal {{ margin-top:20px; font-weight:600; color:var(--accent); display:none;
                          background:#ecfdf5; padding:10px; border-radius:8px; text-align:center; }}
        .show-answer-btn {{ margin-top:15px; background:none; border:1px solid var(--primary);
                            color:var(--primary); padding:8px 16px; border-radius:8px; cursor:pointer;
                            font-size:.85rem; font-weight:600; transition:all .2s; }}
        .show-answer-btn:hover {{ background:var(--primary); color:white; }}
        @media (max-width:640px) {{ .options-list {{ grid-template-columns:1fr; }} }}
        .actions {{ display:flex; justify-content:center; gap:20px; margin-top:50px; }}
        .btn-print {{ background:var(--primary); color:white; border:none; padding:12px 24px;
                      border-radius:12px; font-weight:600; cursor:pointer;
                      box-shadow:0 10px 15px -3px rgba(37,99,235,.3); }}
        .btn-print:hover {{ background:var(--primary-dark); }}
    </style>
</head>
<body>
<div class="container">
    <header>
        <h1>MCQ Questions</h1>
        <p class="meta">{len(mcqs)} Questions Generated</p>
    </header>
    <div id="questions">
"""
        for i, mcq in enumerate(mcqs):
            opts_html = "".join(f'<li class="option">{o}</li>' for o in mcq["options"])
            html += f"""
        <div class="mcq-card">
            <div class="question">Q{i+1}: {mcq['question']}</div>
            <ul class="options-list">{opts_html}</ul>
            <button class="show-answer-btn" onclick="toggleAnswer(this)">Show Answer</button>
            <div class="answer-reveal">Correct Answer: {mcq['answer']}</div>
        </div>
"""
        html += """
    </div>
    <div class="actions">
        <button class="btn-print" onclick="window.print()">Print Question Paper</button>
    </div>
</div>
<script>
function toggleAnswer(btn) {
    const reveal = btn.nextElementSibling;
    reveal.style.display = reveal.style.display === 'block' ? 'none' : 'block';
    btn.textContent = reveal.style.display === 'block' ? 'Hide Answer' : 'Show Answer';
}
</script>
</body>
</html>"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✓ HTML saved → {output_path}")


# ─── Entry point ──────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 3:
        print("Usage: python mcq_generator.py <num_questions> <file1> [file2 ...]")
        return

    try:
        num_qs = int(sys.argv[1])
        file_paths = sys.argv[2:]
    except ValueError:
        print("Error: first argument must be an integer (number of questions).")
        return

    try:
        gen = MCQGenerator()
        combined_text = ""

        for fp in file_paths:
            is_url = fp.startswith(("http://", "https://"))
            if is_url or os.path.exists(fp):
                print(f"Processing: {fp}")
                extracted = gen.extract_text(fp)
                if extracted:
                    combined_text += extracted + "\n"
                else:
                    print(f"Warning: No text could be extracted from {fp}")
            else:
                print(f"Warning: target not found (not a file or valid URL) — {fp}")

        if not combined_text.strip():
            print("Error: No text could be extracted from the provided files.")
            return

        print("Normalizing text…")
        cleaned = gen.normalize_text(combined_text)

        intermediary = os.path.join(BASE_DIR, "consolidated_notes.txt")
        with open(intermediary, "w", encoding="utf-8") as f:
            f.write(cleaned)
        print(f"Intermediary text saved → {intermediary}\n")

        sentences = nltk.sent_tokenize(cleaned)
        
        # Filter for sentences with decent information (e.g. at least 10 words)
        # and shuffle them to ensure true randomness from across the topic.
        candidates = [s for s in sentences if len(s.split()) >= 10]
        random.shuffle(candidates)

        if not candidates:
            print("Error: No suitable sentences found for question generation.")
            return

        # Pre-populate the term pool from all candidate sentences
        print("Analyzing topic concepts for distractors...")
        for s in candidates:
            gen.identify_key_terms(s)

        mcqs, seen_answers, count = [], set(), 0
        num_to_generate = num_qs

        for sent in candidates:
            if count >= num_to_generate:
                break
                
            key_terms = gen.identify_key_terms(sent)
            if not key_terms:
                continue

            # Pick an answer not already used
            available = [t for t in key_terms if t.lower() not in seen_answers]
            if not available:
                available = key_terms
            answer = random.choice(available)
            seen_answers.add(answer.lower())

            print(f"  [{count+1}/{num_to_generate}] Generating question for: '{answer}'")
            question = gen.generate_question(sent, answer)

            distractors = gen.get_distractors(answer)
            options = distractors + [answer]
            random.shuffle(options)

            mcqs.append({"question": question, "options": options, "answer": answer})
            count += 1

        out_docx = os.path.join(BASE_DIR, "Exam_Paper.docx")
        out_html = os.path.join(BASE_DIR, "Exam_Paper.html")
        gen.create_mcq_document(mcqs, out_docx)
        gen.create_html_report(mcqs, out_html)

        print(f"\n✓ Done! Generated {len(mcqs)} questions.")

    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    main()
