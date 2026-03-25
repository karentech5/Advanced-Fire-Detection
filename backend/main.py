import cv2
import winsound
from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from twilio.rest import Client
import threading
import time
import os 
from urllib.parse import unquote
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for React frontend (localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Configuration
MODEL_PATH = "fire.pt"  # Ensure this file is in the same folder
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN =os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE =os.getenv("TWILIO_PHONE")
USER_PHONE = os.getenv("USER_PHONE") # Your number

model = YOLO(MODEL_PATH)
twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

# 2. Alert Logic (Non-blocking)
last_alert_time = 0

def send_sms_alert(message_body: str):
    """Reusable helper to send an SMS via Twilio"""
    try:
        message = twilio_client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE,
            to=USER_PHONE
        )
        return True, message.sid
    except Exception as e:
        print(f"Twilio Error: {e}")
        return False, str(e)


def trigger_security_protocol(label):
    # A. Send SMS
    success, result = send_sms_alert(f"🚨 ADVANCED ALERT: {label.upper()} DETECTED! Check live feed immediately.")
    if success:
        print(f"SMS Sent: {result}")

# Global status tracker for UI sync (Stores timestamp of last detection)
camera_fire_timestamps = {
    "Laptop Camera": 0.0,
    "Desktop Camera": 0.0,
    "Other Camera": 0.0,
}

# Continuous Backend Siren Thread
def siren_worker():
    while True:
        is_any_fire = any(time.time() - ts < 2.0 for ts in camera_fire_timestamps.values())
        if is_any_fire:
            winsound.Beep(2500, 1000)
        else:
            time.sleep(0.5)

# Start siren daemon
threading.Thread(target=siren_worker, daemon=True).start()

latest_frames = {}
active_cameras = {}

def capture_worker(cam_type, src):
    cap = cv2.VideoCapture(src)
    # Give the camera hardware 1 second to warm up
    time.sleep(1)
    
    while True:
        success, frame = cap.read()
        if not success:
            time.sleep(0.5)
            continue
            
        # Run YOLO Inference
        results = model(frame, conf=0.5)
        
        fire_found_in_frame = False
        detected_label = "FIRE"
        
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                label = model.names[cls]
                if label in ["Gun", "Fire", "fire"]:
                    fire_found_in_frame = True
                    detected_label = label
                    
        if fire_found_in_frame:
            camera_fire_timestamps[cam_type] = time.time()
            
            global last_alert_time
            if time.time() - last_alert_time > 30:
                last_alert_time = time.time()
                threading.Thread(target=trigger_security_protocol, args=(detected_label,)).start()

        # Annotate and Encode
        annotated_frame = results[0].plot()
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if ret:
            latest_frames[cam_type] = buffer.tobytes()

# 3. Live Detection Generator
def gen_frames(cam_type="Laptop Camera"):
    # Start the hardware background thread dynamically if not already active
    if cam_type not in active_cameras:
        active_cameras[cam_type] = True
        src = 0
        if cam_type == "Desktop Camera": src = 1
        elif cam_type == "Other Camera": src = 2
        threading.Thread(target=capture_worker, args=(cam_type, src), daemon=True).start()

    while True:
        frame_bytes = latest_frames.get(cam_type)
        if frame_bytes is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        # Limit the broadcast to ~30 FPS to reduce CPU spinning
        time.sleep(0.03)

# 4. API Endpoints
@app.get("/video_feed")
def video_feed(cam: str = "Laptop Camera"):
    """Live webcam feed with detection"""
    cam_decoded = unquote(cam)
    return StreamingResponse(gen_frames(cam_decoded), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def get_status(cam: str = "Laptop Camera"):
    """Frontend React Hook polls this to trigger the Red CSS borders / Audio sirens"""
    cam_decoded = unquote(cam)
    last_fire = camera_fire_timestamps.get(cam_decoded, 0)
    # Consider "fire active" if seen within the last 2.0 seconds smoothly
    is_active = (time.time() - last_fire) < 2.0
    return {"fire_detected": is_active}

@app.post("/reset")
def reset_alarm(cam: str = "Laptop Camera"):
    """Reset the Twilio cooldown and UI states"""
    cam_decoded = unquote(cam)
    if cam_decoded in camera_fire_timestamps:
        camera_fire_timestamps[cam_decoded] = 0.0
    global last_alert_time
    last_alert_time = 0 
    return {"status": "reset_ok"}

@app.post("/test_sms")
def test_sms():
    """Trigger a dummy SMS to test Twilio configuration"""
    success, result = send_sms_alert("🚨 TEST ALERT: Twilio SMS configuration is working!")
    if success:
        return {"status": "sms_sent", "sid": result}
    else:
        return {"status": "error", "details": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




"""cv2 (OpenCV) → capture webcam + process images
winsound → play siren sound (Windows only)
FastAPI → build backend APIs
StreamingResponse → stream live video
CORS → allow frontend (React) to connect
YOLO (ultralytics) → AI detection model
Twilio Client → send SMS alerts
threading → run tasks in parallel
time → manage timestamps
os + dotenv → load secret keys"""    