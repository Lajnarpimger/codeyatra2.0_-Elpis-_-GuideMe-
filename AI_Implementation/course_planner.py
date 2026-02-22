"""
course_planner.py
-----------------
AI Course Planner — generates a structured teaching plan from:
  • Pasted syllabus text
  • A photo / scan of a printed or handwritten syllabus

Outputs saved to ./output/:
  • course_plan_<title>.html   → Beautiful standalone webpage
  • course_plan_<title>.pdf    → Print-ready document

Usage (Interactive):
    python course_planner.py

Models are loaded from ./models/  (run download_models.py first).
Requires Ollama to be running:  ollama serve
"""

import os
import sys
import json
import re
import base64
import argparse
import webbrowser
from datetime import datetime
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
MODELS_DIR  = SCRIPT_DIR / "models"
OUTPUT_DIR  = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# os.environ["OLLAMA_MODELS"] = str(MODELS_DIR)

import ollama  # noqa: E402

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from youtubesearchpython import VideosSearch
    YT_SEARCH_AVAILABLE = True
except ImportError:
    YT_SEARCH_AVAILABLE = False

try:
    from pypdf import PdfReader
    import docx
    DOC_SUPPORT_AVAILABLE = True
except ImportError:
    DOC_SUPPORT_AVAILABLE = False

# ── Model names ────────────────────────────────────────────────────────────────
VISION_MODEL = "llava"
TEXT_MODEL   = "llama3.2"

# ── Prompts ────────────────────────────────────────────────────────────────────
IMAGE_PROMPT = """You are reading an image of a course syllabus or curriculum document.
List every topic, unit, chapter, or subject visible in the image as a plain bullet list.
Be thorough. Do NOT add any explanation — just list the items."""

PLAN_PROMPT = """You are an expert curriculum designer. Analyse the following course syllabus and return a structured JSON teaching plan.

Syllabus:
\"\"\"
{syllabus}
\"\"\"

Audience Level: {level}

Return ONLY valid JSON — no markdown, no explanation. Use this exact structure:
{{
  "course_title": "inferred title",
  "total_hours": <sum of all teaching_hours>,
  "topics": [
    {{
      "topic": "topic name",
      "subtopics": ["subtopic 1", "subtopic 2", "subtopic 3"],
      "depth": "Foundational" | "Intermediate" | "Advanced",
      "teaching_hours": <realistic number 1-20>,
      "rationale": "one sentence on why this topic matters"
    }}
  ]
}}

Rules:
- Depth relative to the audience level: {level}.
- teaching_hours = realistic lecture + hands-on practice time.
- Every topic must have 2-5 concrete subtopics.
- Output ONLY the JSON object."""

# ── Helpers ────────────────────────────────────────────────────────────────────

def img_to_b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


def parse_json(raw: str) -> dict:
    clean = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    start, end = clean.find("{"), clean.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object in model response. Try running again.")
    return json.loads(clean[start:end + 1])


def safe_slug(text: str) -> str:
    return re.sub(r"[^\w]+", "_", text.lower()).strip("_")[:40]


def clean_text(text: str) -> str:
    """Removes non-ASCII characters for general safety."""
    if not text:
        return ""
    return "".join(c for c in text if ord(c) < 128)


def extract_from_document(path: Path) -> str:
    """Extracts text from PDF, DOCX, or TXT."""
    ext = path.suffix.lower()
    
    if ext == ".txt":
        return path.read_text(encoding="utf-8", errors="replace")
    
    if ext == ".pdf":
        if not DOC_SUPPORT_AVAILABLE:
            raise ImportError("pypdf not installed. Run 'pip install pypdf'")
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    
    if ext == ".docx":
        if not DOC_SUPPORT_AVAILABLE:
            raise ImportError("python-docx not installed. Run 'pip install python-docx'")
        doc = docx.Document(path)
        return "\n".join([para.text for para in doc.paragraphs]).strip()
    
    raise ValueError(f"Unsupported document type: {ext}")


# ── AI calls ───────────────────────────────────────────────────────────────────

def extract_from_image(image_path: Path) -> str:
    print(f"  [llava] Reading image: {image_path.name} …")
    b64 = img_to_b64(image_path)
    resp = ollama.chat(
        model=VISION_MODEL,
        messages=[{"role": "user", "content": IMAGE_PROMPT, "images": [b64]}],
    )
    return resp["message"]["content"]


def generate_plan(syllabus: str, level: str) -> dict:
    print(f"  [llama3.2] Generating course plan (level={level}) …")
    prompt = PLAN_PROMPT.format(syllabus=syllabus, level=level)
    resp = ollama.chat(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.25},
    )
    return parse_json(resp["message"]["content"])


def fetch_videos_for_topic(topic: str, level: str, count: int = 3) -> list:
    """Fetch real video data (ID, title, thumbnail) from YouTube."""
    if not YT_SEARCH_AVAILABLE:
        return []
    try:
        q = f"{topic} {level} tutorial lesson"
        search = VideosSearch(q, limit=count)
        results = search.result().get("result", [])
        
        videos = []
        for r in results:
            videos.append({
                "title": r.get("title", "YouTube Video"),
                "url":   r.get("link", ""),
                "thumb": r.get("thumbnails", [{}])[0].get("url", ""),
                "duration": r.get("duration", ""),
                "views": r.get("viewCount", {}).get("short", "")
            })
        return videos
    except Exception:
        return []


# ── Style Config ───────────────────────────────────────────────────────────────
DEPTH_COLORS = {
    "Foundational": ("#1e3a5f", "#60a5fa"),
    "Intermediate": ("#3d2a08", "#fb923c"),
    "Advanced":     ("#3b0f1a", "#f87171"),
}

# ── HTML Template Parts ────────────────────────────────────────────────────────

HTML_STYLE = """
<style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#0b0a1a;--surf:rgba(255,255,255,.04);--bdr:rgba(255,255,255,.09);--txt:#e2e8f0;--mute:#64748b;--vio:#7c3aed}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden}
    body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(124,58,237,.18) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(59,130,246,.14) 0%,transparent 60%);pointer-events:none;z-index:0}
    .wrap{max-width:900px;margin:0 auto;padding:2.5rem 1.5rem 6rem;position:relative;z-index:1}
    header{text-align:center;margin-bottom:2.5rem}
    .gen-pill{display:inline-block;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);color:#a78bfa;border-radius:50px;padding:.3rem .9rem;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:1rem}
    h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;background:linear-gradient(135deg,#c4b5fd 0%,#818cf8 40%,#38bdf8 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;margin-bottom:.5rem}
    .meta{color:var(--mute);font-size:.85rem}
    .stats{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin-top:1.4rem}
    .pill{background:var(--surf);border:1px solid var(--bdr);border-radius:50px;padding:.38rem 1rem;font-size:.84rem;color:var(--txt)}
    .pill b{color:#a78bfa}
    .sec-lbl{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);margin:2rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid var(--bdr)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .card{background:var(--surf);border:1px solid var(--bdr);border-radius:18px;padding:1.4rem 1.6rem;margin-bottom:1rem;animation:fadeUp .5s ease both}
    .card-top{display:flex;align-items:center;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem}
    .idx{width:28px;height:28px;border-radius:8px;background:rgba(124,58,237,.18);border:1px solid rgba(124,58,237,.3);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#a78bfa;flex-shrink:0}
    .topic-name{font-size:1.1rem;font-weight:700;flex:1}
    .badge{padding:.22rem .7rem;border-radius:50px;font-size:.72rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
    .hours-pill{background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.25);color:#a78bfa;padding:.22rem .7rem;border-radius:50px;font-size:.78rem;font-weight:700}
    .rat{color:var(--mute);font-size:.87rem;font-style:italic;margin-bottom:.9rem;line-height:1.5}
    .sub-lbl,.yt-lbl{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:.4rem}
    .tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
    .tag{background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.2);color:#93c5fd;padding:.2rem .65rem;border-radius:6px;font-size:.8rem}
    .bar-wrap{margin-bottom:.9rem}
    .bar-bg{height:5px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}
    .bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#7c3aed,#60a5fa)}
    .bar-lbl{font-size:.72rem;color:var(--mute);margin-top:.3rem}
    .vid-section{margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--bdr)}
    .vid-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.8rem;margin-top:.5rem}
    .vid-card{background:rgba(255,255,255,.03);border:1px solid var(--bdr);border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .2s,border-color .2s}
    .vid-card:hover{transform:translateY(-3px);border-color:rgba(255,68,68,.4);background:rgba(255,255,255,.05)}
    .vid-thumb{aspect-ratio:16/9;background-size:cover;background-position:center;position:relative}
    .vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:white;background:rgba(0,0,0,.3);opacity:0;transition:opacity .2s}
    .vid-card:hover .vid-play{opacity:1}
    .vid-dur{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.8);color:white;font-size:.65rem;padding:2px 5px;border-radius:4px;font-weight:700}
    .vid-meta{padding:.7rem}
    .vid-title{font-size:.82rem;font-weight:600;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:2.3rem;margin-bottom:.4rem;color:#f1f5f9}
    .vid-stats{font-size:.72rem;color:var(--mute);font-weight:500;display:flex;justify-content:space-between;align-items:center}
    .vid-action{color:#fca5a5;font-weight:700;text-transform:uppercase;font-size:.65rem;letter-spacing:.03em}
    .vid-card:hover .vid-action{text-decoration:underline}
    .footer{text-align:center;color:var(--mute);font-size:.8rem;margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--bdr)}
</style>
"""


def build_html(plan: dict, level: str) -> str:
    topics = plan.get("topics", [])
    total  = plan.get("total_hours", sum(t.get("teaching_hours", 0) for t in topics))
    title  = plan.get("course_title", "Course Plan")
    max_h  = max((t.get("teaching_hours", 1) for t in topics), default=1)
    ts     = datetime.now().strftime("%d %b %Y, %I:%M %p")

    depth_stat = {}
    for t in topics:
        d = t.get("depth", "Foundational")
        depth_stat[d] = depth_stat.get(d, 0) + 1

    # ── Stat pills ──
    stats_html = (
        f'<div class="pill">📋 <b>{len(topics)}</b> Topics</div>'
        f'<div class="pill">🕐 <b>{total}</b> Total Hours</div>'
        f'<div class="pill">🎓 Level: <b>{level}</b></div>'
    )
    for d, n in depth_stat.items():
        stats_html += f'<div class="pill">{n}x {d}</div>'

    # ── Topic cards ──
    cards_html = ""
    for i, t in enumerate(topics):
        topic    = t.get("topic", "")
        print(f"      - Fetching videos for: {topic} …")
        vids     = fetch_videos_for_topic(topic, level)
        subs     = t.get("subtopics", [])
        depth    = t.get("depth", "Foundational")
        hours    = t.get("teaching_hours", 0)
        rat      = t.get("rationale", "")
        bg, fg   = DEPTH_COLORS.get(depth, ("#1e3a5f", "#60a5fa"))
        pct      = round(hours / max_h * 100)
        sub_tags = "".join(f'<span class="tag">{s}</span>' for s in subs)

        vid_cards = ""
        if vids:
            for v in vids:
                vid_cards += f"""
                <a class="vid-card" href="{v['url']}" target="_blank" title="Click to watch: {v['title']}">
                  <div class="vid-thumb" style="background-image:url('{v['thumb']}')">
                    <div class="vid-play">▶</div>
                    <div class="vid-dur">{v['duration']}</div>
                  </div>
                  <div class="vid-meta">
                    <div class="vid-title">{v['title']}</div>
                    <div class="vid-stats">
                       <span>📊 {v['views']} views</span>
                       <span class="vid-action">Watch video →</span>
                    </div>
                  </div>
                </a>"""
        else:
            vid_cards = '<p style="color:var(--mute);font-size:.8rem;padding:1rem;">No videos found for this topic.</p>'

        cards_html += f"""
        <div class="card" style="animation-delay:{i*0.06:.2f}s">
          <div class="card-top">
            <div class="idx">{i+1}</div>
            <div class="topic-name">{topic}</div>
            <span class="badge" style="background:{bg};color:{fg}">{depth}</span>
            <span class="hours-pill">🕐 {hours} hrs</span>
          </div>
          {"<div class='rat'>💡 " + rat + "</div>" if rat else ""}
          {"<div class='sub-lbl'>Subtopics</div><div class='tags'>" + sub_tags + "</div>" if subs else ""}
          <div class="bar-wrap">
            <div class="bar-bg"><div class="bar-fill" style="width:{pct}%"></div></div>
            <div class="bar-lbl">{hours} hrs — {pct}% of longest topic</div>
          </div>
          <div class="vid-section">
            <div class="yt-lbl">📺 Recommended Lessons</div>
            <div class="vid-grid">{vid_cards}</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{title} — Course Plan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  {HTML_STYLE}
</head>
<body>
<div class="wrap">
  <header>
    <div class="gen-pill">🎓 AI Course Plan</div>
    <h1>{title}</h1>
    <div class="meta">Generated on {ts} &nbsp;&middot;&nbsp; Audience: {level}</div>
    <div class="stats">{stats_html}</div>
  </header>
  <div class="sec-lbl">📚 Topics &amp; Teaching Plan</div>
  {cards_html}
  <div class="footer">
    Generated by AI Course Planner &nbsp;&middot;&nbsp; Powered by Ollama + Llama 3.2 &nbsp;&middot;&nbsp; {ts}
  </div>
</div>
</body>
</html>"""


# ── PDF generation code removed ────────────────────────────────────────────────


# ── Main flow ──────────────────────────────────────────────────────────────────

def run(syllabus_text: str | None, image_path: Path | None,
        doc_path: Path | None, level: str, open_browser: bool):

    # 1 — get raw syllabus text
    if image_path:
        print("\n[1/3] Extracting topics from image …")
        syllabus_text = extract_from_image(image_path)
    elif doc_path:
        print(f"\n[1/3] Extracting topics from document: {doc_path.name} …")
        syllabus_text = extract_from_document(doc_path)
    else:
        print("\n[1/3] Using provided syllabus text.")

    # 2 — generate plan
    print("\n[2/3] Generating course plan …")
    plan = generate_plan(syllabus_text, level)
    title = plan.get("course_title", "course_plan")
    slug  = safe_slug(title)
    
    # 3 — write outputs
    print("\n[3/3] Saving outputs …")
    html_path = OUTPUT_DIR / f"course_plan_{slug}.html"

    html_content = build_html(plan, level)
    html_path.write_text(html_content, encoding="utf-8")
    print(f"  [html] Saved → {html_path}")

    # 4 — open browser
    if open_browser:
        print(f"\n[browser] Opening {html_path.name} …")
        webbrowser.open(html_path.as_uri())

    print("\n✅ Done!\n")
    print(f"  📄 HTML  →  {html_path}")
    
    # Summary of videos for terminal
    print("\n📺 Recommended Videos:")
    for t in plan.get("topics", []):
        topic = t.get("topic", "Topic")
        vids = fetch_videos_for_topic(topic, level, count=1)
        if vids:
            print(f"  • {topic[:30]:<30} : {vids[0]['url']}")
    print()
    return plan


# ── Entry point ────────────────────────────────────────────────────────────────

def interactive():
    print("\n" + "═" * 55)
    print("  🎓 AI Course Planner")
    print("═" * 55)
    print("  Models dir : ./models/")
    print("  Output dir : ./output/")
    print("═" * 55 + "\n")

    print("Input type:")
    print("  1 — Paste syllabus text")
    print("  2 — Provide image path (OCR)")
    print("  3 — Provide document path (PDF/DOCX/TXT)")
    choice = input("\nChoice [1/2/3]: ").strip()

    level_opts = {"1": "Beginner", "2": "Intermediate", "3": "Advanced"}
    print("\nAudience level:")
    print("  1 — Beginner\n  2 — Intermediate\n  3 — Advanced")
    lvl = input("Choice [1/2/3, default=2]: ").strip() or "2"
    level = level_opts.get(lvl, "Intermediate")

    if choice == "2":
        img_input = input("\nImage path: ").strip().strip('"')
        img_path = Path(img_input)
        if not img_path.exists():
            print(f"[error] File not found: {img_path}")
            sys.exit(1)
        run(None, img_path, None, level, open_browser=True)
    elif choice == "3":
        doc_input = input("\nDocument path: ").strip().strip('"')
        doc_path = Path(doc_input)
        if not doc_path.exists():
            print(f"[error] File not found: {doc_path}")
            sys.exit(1)
        run(None, None, doc_path, level, open_browser=True)
    else:
        print('\nPaste syllabus text (type END on a new line when done):')
        lines = []
        while True:
            line = input()
            if line.strip().upper() == "END":
                break
            lines.append(line)
        text = "\n".join(lines).strip()
        if not text:
            print("[error] No text provided.")
            sys.exit(1)
        run(text, None, None, level, open_browser=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Course Planner")
    parser.add_argument("--text",       help="Raw syllabus text")
    parser.add_argument("--image",      help="Path to syllabus image")
    parser.add_argument("--doc",        help="Path to syllabus document (PDF/DOCX/TXT)")
    parser.add_argument("--level",      default="Intermediate",
                        choices=["Beginner", "Intermediate", "Advanced"])
    parser.add_argument("--no-browser", action="store_true",
                        help="Don't open the HTML output in a browser")
    args = parser.parse_args()

    if args.text or args.image or args.doc:
        img = Path(args.image) if args.image else None
        doc = Path(args.doc) if args.doc else None
        run(args.text, img, doc, args.level, open_browser=not args.no_browser)
    else:
        interactive()
