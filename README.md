# Neural Response: Disaster Damage Detection AI

An end-to-end AI system designed to detect and analyze disaster scenes from images. The system utilizes deep learning (EfficientNet-B0) to classify natural and infrastructure disasters, coupled with an Adaptive Preprocessing Pipeline to enhance low-quality images in real-time, and GradCAM visualization to provide explainability for the AI's decisions.

## Features
- **Intelligent Classification**: Detects 5 categories: Water Disaster, Fire Disaster, Land Disaster, Damaged Infrastructure, and Non-Damage.
- **Adaptive Preprocessing**: Automatically analyzes incoming images for brightness, contrast, noise, and blur, applying corrective algorithms (CLAHE, Bilateral Filtering, Unsharp Masking) only when necessary.
- **Explainable AI (GradCAM)**: Generates heatmaps showing exactly which parts of the image influenced the neural network's prediction.
- **Premium User Interface**: A responsive, futuristic React frontend featuring dynamic theming and actionable Protection Protocols based on the detected disaster type.

## Tech Stack
- **Backend**: FastAPI, PyTorch, Torchvision, OpenCV
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide React
- **Modeling**: EfficientNet-B0 (Transfer Learning)

## How to Run Locally

### Prerequisites
- Python 3.8+
- Node.js and npm

### Quick Start
To launch both the FastAPI backend and the React frontend simultaneously:
```bash
python launch_project.py
```
This script will automatically start the backend on port `8099` and the frontend on port `5173`. Open `http://localhost:5173` in your browser.

### Manual Setup
If you need to install dependencies manually:
1. Run `setup.bat` to create a virtual environment and install Python dependencies.
2. Navigate to `/frontend` and run `npm install`.
