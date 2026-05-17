import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import base64
import sys

# Add parent dir to path to import preprocessing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.adaptive_pipeline import adaptive_preprocess
from preprocessing.filters import apply_standard_preprocessing
from backend.gradcam_utils import generate_gradcam

app = FastAPI(title="Disaster Damage Detection API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

LABELS = ["Non_Damage", "Water_Disaster", "Land_Disaster", "Fire_Disaster", "Damaged_Infrastructure"]

def get_model(path):
    model = models.efficientnet_b0(weights=None)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(LABELS))
    
    if os.path.exists(path):
        try:
            model.load_state_dict(torch.load(path, map_location=device))
            print(f"Successfully loaded model from: {path}")
        except Exception as e:
            print(f"Error loading model {path}: {e}")
    
    model = model.to(device)
    model.eval()
    return model

print("Loading models...")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_model = get_model(os.path.join(BASE_DIR, "models", "raw_model", "raw_model_best.pth"))
std_model = get_model(os.path.join(BASE_DIR, "models", "standard_model", "standard_model_best.pth"))
adapt_model = get_model(os.path.join(BASE_DIR, "models", "adaptive_model", "adaptive_model_best.pth"))


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def image_to_base64(img_array):
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode('utf-8')

def predict_with_model(model, image_rgb):
    # Prepare tensor
    pil_img = Image.fromarray(image_rgb)
    input_tensor = transform(pil_img).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
    confidence, predicted_class_idx = torch.max(probabilities, 0)
    predicted_class = LABELS[predicted_class_idx.item()]
    
    # GradCAM
    # requires grad so we have to run forward pass again with grad enabled
    model.zero_grad()
    input_tensor.requires_grad_(True)
    cam_img = generate_gradcam(model, input_tensor, cv2.resize(image_rgb, (224, 224)))
    
    return {
        "class": predicted_class,
        "is_disaster": predicted_class != "Non_Damage",
        "confidence": float(confidence.item()),
        "probabilities": {LABELS[i]: float(probabilities[i].item()) for i in range(len(LABELS))},
        "gradcam_base64": image_to_base64(cam_img)
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...), model_type: str = Form("adaptive")):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})
        
    # Process image based on model type
    report = None
    processed_bgr = img_bgr.copy()
    
    if model_type == "standard":
        processed_bgr = apply_standard_preprocessing(img_bgr)
        model = std_model
    elif model_type == "adaptive":
        processed_bgr, report = adaptive_preprocess(img_bgr)
        model = adapt_model
    else: # raw
        model = raw_model
        
    processed_rgb = cv2.cvtColor(processed_bgr, cv2.COLOR_BGR2RGB)
    
    # Run prediction
    result = predict_with_model(model, processed_rgb)
    
    # Add enhancement data if applicable
    if report:
        result["enhancement_report"] = report
        # Also return the enhanced image for the UI to display
        result["enhanced_image_base64"] = image_to_base64(processed_rgb)
        
    return result

@app.post("/enhance")
async def enhance_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})
        
    processed_bgr, report = adaptive_preprocess(img_bgr)
    processed_rgb = cv2.cvtColor(processed_bgr, cv2.COLOR_BGR2RGB)
    
    return {
        "enhanced_image_base64": image_to_base64(processed_rgb),
        "report": report
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8099)
