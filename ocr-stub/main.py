from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="OCR Stub Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ocr/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Simulate processing delay
    time.sleep(1)
    
    # Return mock compliant token list
    return {
        "tokens": [
            {"text": "Manufactured by", "bbox": [10,20,200,35], "confidence": 0.95, "panel": "principal"},
            {"text": "ABC Foods Pvt Ltd", "bbox": [10,40,250,55], "confidence": 0.92, "panel": "principal"},
            {"text": "123, Industrial Area, New Delhi - 110001", "bbox": [10,60,300,75], "confidence": 0.88, "panel": "principal"},
            {"text": "Biscuits", "bbox": [150,100,250,130], "confidence": 0.97, "panel": "principal"},
            {"text": "Net Wt.", "bbox": [10,150,80,165], "confidence": 0.94, "panel": "principal"},
            {"text": "200g", "bbox": [85,150,130,165], "confidence": 0.96, "panel": "principal"},
            {"text": "MRP Rs 40 incl. of all taxes", "bbox": [10,180,280,195], "confidence": 0.93, "panel": "principal"}
        ],
        "languages": ["en"],
        "processingTime": 1050
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ocr-stub",
        "version": "1.0.0"
    }
