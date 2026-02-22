"""
download_models.py
------------------
Downloads LLaVA (vision) and Llama 3.2 (text) model checkpoints
into the ./models/ folder inside the project directory.

Usage:
    python download_models.py

Requires Ollama to be running:
    $env:OLLAMA_MODELS = "E:\\Coding\\Python\\codeyatra2\\models"   # PowerShell
    set OLLAMA_MODELS=E:\\Coding\\Python\\codeyatra2\\models         # CMD
    ollama serve
"""

import os
import sys
import subprocess
from pathlib import Path

# ── Project-local models directory ────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
MODELS_DIR  = SCRIPT_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

MODELS = {
    "llama3.2": "Text LLM  — used to structure the course plan (~2 GB)",
    "llava":    "Vision LLM — used to read syllabus images          (~4 GB)",
}


def set_ollama_models_env():
    """Tell Ollama to store/read models from ./models/"""
    os.environ["OLLAMA_MODELS"] = str(MODELS_DIR)
    print(f"[setup] OLLAMA_MODELS → {MODELS_DIR}")


def check_ollama():
    """Ensure the ollama CLI is available."""
    try:
        result = subprocess.run(["ollama", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[setup] Ollama found: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    print("[ERROR] Ollama not found on PATH. Download from https://ollama.com and install it.")
    return False


def pull_model(name: str, desc: str):
    print(f"\n[download] Pulling '{name}' …  ({desc})")
    env = os.environ.copy()
    env["OLLAMA_MODELS"] = str(MODELS_DIR)
    result = subprocess.run(["ollama", "pull", name], env=env)
    if result.returncode == 0:
        print(f"[download] ✓ '{name}' ready in {MODELS_DIR}")
    else:
        print(f"[download] ✗ Failed to pull '{name}'. Is `ollama serve` running?")


def list_downloaded():
    print("\n[setup] Models currently in ./models/:")
    env = os.environ.copy()
    env["OLLAMA_MODELS"] = str(MODELS_DIR)
    result = subprocess.run(["ollama", "list"], capture_output=True, text=True, env=env)
    if result.stdout.strip():
        print(result.stdout)
    else:
        print("  (none yet)")


if __name__ == "__main__":
    print("=" * 60)
    print("  AI Course Planner — Model Setup")
    print("=" * 60)

    set_ollama_models_env()

    if not check_ollama():
        sys.exit(1)

    for model_name, model_desc in MODELS.items():
        pull_model(model_name, model_desc)

    list_downloaded()

    print("\n[setup] Done! Run the planner with:")
    print("  python course_planner.py")
    print("  … or open course_planner.html in your browser.\n")
