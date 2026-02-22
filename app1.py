# app.py
# Run:
#   pip install fastapi uvicorn python-multipart opencv-python numpy ultralytics mediapipe
#   uvicorn app:app --host 0.0.0.0 --port 8000
#
# Open index.html in browser and set API_BASE to http://127.0.0.1:8000

import math
import time
import uuid
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Optional, Tuple, Dict, Any

import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO


# =========================
# Config
# =========================
YAW_BAD_MAX   = -3.6
PITCH_BAD_MIN = 1.6
PITCH_BAD_MAX = 16.0

HEAD_BAD_HOLD = 5.0  # seconds continuous "bad pose" before counting

CAM_COVER_HOLD = 1.0   # seconds continuous before flag
HIST_THR = 0.35        # higher => less sensitive; lower => more sensitive
MEAN_THR = 35.0        # BGR mean distance threshold
LOW_TEXTURE_THR = 18.0 # Laplacian variance; lower => flatter/occluded

FAIL_THRESHOLD = 60.0

# Client will send frames at ~10fps in index.html
ASSUMED_FRAME_DT = 0.1  # seconds (10 fps)


# =========================
# Helpers
# =========================
def download_if_missing(url: str, path: Path):
    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, str(path))


def frame_signature(frame_bgr, hist_bins=32):
    hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    hist_h = cv2.calcHist([h], [0], None, [hist_bins], [0, 180])
    hist_s = cv2.calcHist([s], [0], None, [hist_bins], [0, 256])
    hist_v = cv2.calcHist([v], [0], None, [hist_bins], [0, 256])

    hist = np.concatenate([hist_h, hist_s, hist_v]).astype(np.float32)
    hist /= (hist.sum() + 1e-6)

    mean_bgr = np.mean(frame_bgr.reshape(-1, 3), axis=0).astype(np.float32)
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    return hist, mean_bgr, lap_var


def hist_distance(h1, h2):
    return float(cv2.compareHist(h1, h2, cv2.HISTCMP_BHATTACHARYYA))


def mean_color_distance(m1, m2):
    return float(np.linalg.norm(m1 - m2))


def safe_decode_image(upload_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(upload_bytes, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    return frame


def compute_score(state: "SessionState") -> float:
    # Same style as your notebook: cap contributions
    score = 0.0
    score += min(30.0, state.phone_time * 10.0)
    score += min(30.0, state.second_person_time * 10.0)
    score += min(25.0, state.head_bad_time * 5.0)
    score += min(40.0, state.camera_cover_time * 20.0)
    return float(min(100.0, score))


def build_report(state: "SessionState") -> Dict[str, Any]:
    score = compute_score(state)
    failed = bool(score > FAIL_THRESHOLD)
    result = "Found Cheating" if failed else "Fair exam"
    return {
        "total_duration_sec": round(state.total_time, 2),
        "violations": {
            "phone_time_sec": round(state.phone_time, 2),
            "second_person_time_sec": round(state.second_person_time, 2),
            "head_bad_time_sec": round(state.head_bad_time, 2),
            "camera_cover_time_sec": round(state.camera_cover_time, 2),
            "left_frame_time_sec": round(state.left_frame_time, 2),
        },
        "risk_score": round(score, 1),
        "fail_threshold": float(FAIL_THRESHOLD),
        "failed": failed,
        "result": result,
    }


# =========================
# Session state
# =========================
@dataclass
class SessionState:
    started_at: float
    last_ts_ms: int = 0

    total_time: float = 0.0
    head_bad_time: float = 0.0
    camera_cover_time: float = 0.0
    phone_time: float = 0.0
    second_person_time: float = 0.0
    left_frame_time: float = 0.0

    bg_ref_sig: Optional[Tuple[np.ndarray, np.ndarray, float]] = None
    bg_ready: bool = False

    head_bad_streak: float = 0.0
    cover_streak: float = 0.0


SESSIONS: Dict[str, SessionState] = {}
SESS_LOCK = Lock()

# Model lock: YOLO + MediaPipe may not be thread-safe in all setups.
MODEL_LOCK = Lock()


# =========================
# App
# =========================
app = FastAPI(title="Cheating Detector API", version="1.0")

# Allow index.html to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Globals
yolo = None
face_landmarker = None


@app.on_event("startup")
def load_models():
    global yolo, face_landmarker

    # ---- Download MP FaceLandmarker task model ----
    MODELS_DIR = Path("mp_models")
    FACE_TASK = MODELS_DIR / "face_landmarker.task"
    FACE_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
    download_if_missing(FACE_URL, FACE_TASK)

    # ---- YOLO (COCO) ----
    yolo = YOLO("yolov8n.pt")

    # ---- MediaPipe Tasks ----
    if not hasattr(mp, "tasks"):
        raise RuntimeError("mediapipe build missing mp.tasks. Install mediapipe>=0.10.x")

    BaseOptions = mp.tasks.BaseOptions
    VisionRunningMode = mp.tasks.vision.RunningMode
    FaceLandmarker = mp.tasks.vision.FaceLandmarker
    FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions

    face_options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(FACE_TASK)),
        running_mode=VisionRunningMode.VIDEO,
        num_faces=2,
        output_face_blendshapes=False,
        output_facial_transformation_matrixes=True,
    )

    face_landmarker = FaceLandmarker.create_from_options(face_options)
    print("[startup] Models loaded: YOLO + FaceLandmarker")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/session/start")
def session_start():
    session_id = str(uuid.uuid4())
    now = time.time()
    with SESS_LOCK:
        SESSIONS[session_id] = SessionState(started_at=now, last_ts_ms=0)
    return {"session_id": session_id}


@app.post("/session/frame")
async def session_frame(session_id: str, file: UploadFile = File(...)):
    global yolo, face_landmarker
    if yolo is None or face_landmarker is None:
        raise HTTPException(status_code=500, detail="Models not loaded")

    with SESS_LOCK:
        state = SESSIONS.get(session_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    img_bytes = await file.read()
    if not img_bytes:
        raise HTTPException(status_code=400, detail="Empty frame")

    frame = safe_decode_image(img_bytes)
    dt = ASSUMED_FRAME_DT
    state.total_time += dt

    # ========== YOLO ==========
    with MODEL_LOCK:
        y = yolo.predict(frame, conf=0.35, imgsz=640, verbose=False)[0]

    persons = 0
    phones = 0
    for b in y.boxes:
        cls = int(b.cls.item())
        name = yolo.model.names.get(cls, str(cls))
        if name == "person":
            persons += 1
        elif name == "cell phone":
            phones += 1

    if persons >= 2:
        state.second_person_time += dt
    if phones >= 1:
        state.phone_time += dt

    # ========== MediaPipe Face ==========
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    # Monotonic timestamp required by detect_for_video()
    state.last_ts_ms += int(round(dt * 1000))
    ts_ms = state.last_ts_ms

    with MODEL_LOCK:
        face_res = face_landmarker.detect_for_video(mp_image, ts_ms)

    face_detected = bool(face_res.face_landmarks)
    if not face_detected:
        state.left_frame_time += dt

    # ========== Camera Cover (background similarity) ==========
    if face_detected:
        state.bg_ref_sig = frame_signature(frame)
        state.bg_ready = True
        state.cover_streak = 0.0
    else:
        if state.bg_ready and state.bg_ref_sig is not None:
            hist1, mean1, lap1 = frame_signature(frame)
            hist0, mean0, lap0 = state.bg_ref_sig
            dh = hist_distance(hist0, hist1)
            dm = mean_color_distance(mean0, mean1)

            covered = (dh > HIST_THR) or (dm > MEAN_THR) or (lap1 < LOW_TEXTURE_THR)
            if covered:
                state.cover_streak += dt
                if state.cover_streak >= CAM_COVER_HOLD:
                    state.camera_cover_time += dt
            else:
                state.cover_streak = 0.0

    # ========== Head Pose ==========
    # We only accumulate head_bad_time after continuous >= HEAD_BAD_HOLD seconds
    if face_detected and face_res.facial_transformation_matrixes:
        M = np.array(face_res.facial_transformation_matrixes[0].data).reshape(4, 4)
        R = M[:3, :3]
        yaw = math.degrees(math.atan2(R[1, 0], R[0, 0]))
        pitch = math.degrees(math.atan2(-R[2, 0], math.sqrt(R[2, 1] ** 2 + R[2, 2] ** 2)))

        head_bad = (yaw < YAW_BAD_MAX) or (pitch < PITCH_BAD_MIN) or (pitch > PITCH_BAD_MAX)

        if head_bad:
            state.head_bad_streak += dt
            if state.head_bad_streak >= HEAD_BAD_HOLD:
                state.head_bad_time += dt
        else:
            state.head_bad_streak = 0.0
    else:
        state.head_bad_streak = 0.0

    # persist updated session
    with SESS_LOCK:
        SESSIONS[session_id] = state

    # Return a live snapshot (index.html shows this)
    report = build_report(state)
    report["session_id"] = session_id
    report["live"] = True
    report["signals"] = {
        "persons": persons,
        "phones": phones,
        "face_detected": face_detected,
        "head_bad_streak_sec": round(state.head_bad_streak, 2),
        "cover_streak_sec": round(state.cover_streak, 2),
    }
    return report


@app.post("/session/end")
def session_end(session_id: str):
    with SESS_LOCK:
        state = SESSIONS.get(session_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    report = build_report(state)
    report["session_id"] = session_id
    report["live"] = False
    return report