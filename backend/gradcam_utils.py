import torch
import cv2
import numpy as np
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

def generate_gradcam(model, input_tensor, original_img_rgb):
    """
    Generate a GradCAM visualization for the given model and input image.
    
    Args:
        model: PyTorch model
        input_tensor: Preprocessed image tensor (1, C, H, W)
        original_img_rgb: Original image as numpy array in RGB format (0-1 float)
    """
    # EfficientNet target layer for GradCAM
    # Typically the last convolutional layer before the classifier
    try:
        target_layers = [model.features[-1]]
        
        cam = GradCAM(model=model, target_layers=target_layers)
        
        # We don't specify target, so it will use the highest scoring category
        targets = None
        
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        
        # In this example grayscale_cam has only one image in the batch
        grayscale_cam = grayscale_cam[0, :]
        
        # Ensure original image is float32 and normalized 0-1
        if original_img_rgb.dtype == np.uint8:
            original_img_rgb = np.float32(original_img_rgb) / 255.0
            
        # Resize original img to match cam size if needed, or vice versa
        # Usually both are 224x224 based on EfficientNet requirements
        if original_img_rgb.shape[:2] != grayscale_cam.shape:
            original_img_rgb = cv2.resize(original_img_rgb, (grayscale_cam.shape[1], grayscale_cam.shape[0]))
            
        cam_image = show_cam_on_image(original_img_rgb, grayscale_cam, use_rgb=True)
        return cam_image
    except Exception as e:
        print(f"GradCAM error: {e}")
        # Fallback if gradcam fails
        return (original_img_rgb * 255).astype(np.uint8)
