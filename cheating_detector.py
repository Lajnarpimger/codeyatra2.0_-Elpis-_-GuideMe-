import numpy as np
import mediapipe as mp
import cv2
import time

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)

# --- TRACKING INITIALIZATION ---
session_start = time.time()
look_away_start = None
total_away_time = 0 

print("System Active: Monitoring whole-screen gaze persistence.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: 
        break

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    current_time = time.time()
    is_on_screen = True 

    if results.multi_face_landmarks:
        landmarks = results.multi_face_landmarks[0].landmark

        # Get Eye Corner References (Horizontal & Vertical)
        # 362, 263: Horizontal corners | 386, 374: Vertical eyelids
        r_outer = np.array([landmarks[362].x * w, landmarks[362].y * h])
        r_inner = np.array([landmarks[263].x * w, landmarks[263].y * h])
        r_top = np.array([landmarks[386].x * w, landmarks[386].y * h])
        r_bottom = np.array([landmarks[374].x * w, landmarks[374].y * h])

        # Iris Center
        iris = np.mean([np.array([landmarks[i].x * w, landmarks[i].y * h]) 
                        for i in [468, 469, 470, 471, 472]], axis=0)

        # Normalize the gaze within the eye frame
        # Horizontal width and Vertical height of the eye opening
        eye_w = np.linalg.norm(r_outer - r_inner)
        eye_h = np.linalg.norm(r_top - r_bottom)
        
        # Calculate how far the iris is from the edges
        h_ratio = (iris[0] - r_outer[0]) / eye_w
        v_ratio = (iris[1] - r_top[1]) / eye_h

        # --- WHOLE FRAME LOGIC ---
        # Allowable range for looking at ANY part of the screen.
        # 0.15 to 0.85 covers the extreme corners of a typical monitor.
        h_safe = 0.15 < h_ratio < 0.85
        v_safe = 0.10 < v_ratio < 0.90

        if not (h_safe and v_safe):
            is_on_screen = False
    else:
        # If face leaves the frame, it's considered looking away from the screen
        is_on_screen = False

    # --- SILENT COUNTER ---
    if not is_on_screen:
        if look_away_start is None:
            look_away_start = current_time
    else:
        if look_away_start is not None:
            total_away_time += (current_time - look_away_start)
            look_away_start = None

    # Standard clean display (No colors, No text)
    cv2.imshow("Secure Proctor Session", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'): 
        break

# --- FINAL ANALYSIS ---
session_end = time.time()
total_duration = session_end - session_start
if look_away_start:
    total_away_time += (session_end - look_away_start)

# Calculating Probability
# If away > 10% of the session, suspicion grows exponentially.
cheating_prob = min((total_away_time / total_duration) * 800, 100) if total_duration > 0 else 0

print("\n" + "-"*30)
print("PROCTORING SUMMARY")
print("-"*30)
print(f"Total Session Time: {total_duration:.2f}s")
print(f"Time Spent Off-Screen: {total_away_time:.2f}s")
print(f"Cheating Probability: {cheating_prob:.2f}%")
print("-"*30)

cap.release()
cv2.destroyAllWindows()