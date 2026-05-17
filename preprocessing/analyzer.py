import cv2
import numpy as np

def calculate_brightness(image):
    """Calculate the average brightness of the image."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    return np.mean(hsv[:, :, 2])

def calculate_contrast(image):
    """Calculate the contrast of the image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray.std()

def calculate_blur(image):
    """Calculate the blurriness of the image using Laplacian variance."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def estimate_noise(image):
    """Estimate noise in the image. Higher value means more noise."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Using a fast noise estimation technique: standard deviation of Laplacian
    noise_sigma = cv2.Laplacian(gray, cv2.CV_64F).std()
    return noise_sigma

def analyze_image(image):
    """
    Analyze the image and return a dictionary of metrics.
    image: numpy array (BGR format as loaded by cv2)
    """
    if image is None:
        raise ValueError("Image is None")

    metrics = {
        'brightness': calculate_brightness(image),
        'contrast': calculate_contrast(image),
        'blur_laplacian': calculate_blur(image),
        'noise_estimate': estimate_noise(image)
    }
    
    # Calculate an overall texture quality score based on blur and contrast
    # High contrast and high laplacian variance usually means good texture
    metrics['texture_score'] = metrics['contrast'] * 0.5 + metrics['blur_laplacian'] * 0.5
    
    return metrics
