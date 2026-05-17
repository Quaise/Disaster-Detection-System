import cv2
import numpy as np
from preprocessing.analyzer import analyze_image
from preprocessing.filters import apply_clahe, apply_gamma_correction, apply_bilateral_filter, apply_unsharp_mask

def adaptive_preprocess(image):
    """
    Intelligently process an image based on its characteristics.
    Returns: (enhanced_image, report_dict)
    """
    # 1. Analyze initial image
    initial_metrics = analyze_image(image)
    report = {
        'initial_metrics': initial_metrics,
        'applied_filters': [],
        'final_metrics': None,
        'degraded': False
    }
    
    img = image.copy()
    
    # 2. Decision Engine Logic
    
    # Check Brightness
    if initial_metrics['brightness'] < 60:
        # Image is too dark
        img = apply_gamma_correction(img, gamma=1.5)
        report['applied_filters'].append('gamma_correction (brighten)')
    elif initial_metrics['brightness'] > 200:
        # Image is too bright
        img = apply_gamma_correction(img, gamma=0.7)
        report['applied_filters'].append('gamma_correction (darken)')
        
    # Check Contrast
    if initial_metrics['contrast'] < 40:
        # Low contrast, apply CLAHE
        img = apply_clahe(img, clip_limit=2.0)
        report['applied_filters'].append('clahe')
        
    # Check Noise
    if initial_metrics['noise_estimate'] > 50:
        # High noise, apply bilateral filter to preserve edges
        img = apply_bilateral_filter(img, d=9, sigma_color=75, sigma_space=75)
        report['applied_filters'].append('bilateral_filter')
        
    # Check Blur/Sharpness
    if initial_metrics['blur_laplacian'] < 100:
        # Image is blurry, apply unsharp mask
        img = apply_unsharp_mask(img, amount=1.5)
        report['applied_filters'].append('unsharp_mask')
        
    # If no filters were applied, we return the original image
    if not report['applied_filters']:
        report['applied_filters'].append('none (image already optimal)')
        report['final_metrics'] = initial_metrics
        return img, report
        
    # 3. Tradeoff Management System
    final_metrics = analyze_image(img)
    report['final_metrics'] = final_metrics
    
    # Evaluate if the enhancement degraded the image texture too much
    # If the new texture score is significantly lower than original, revert or reduce
    if final_metrics['texture_score'] < initial_metrics['texture_score'] * 0.8:
        report['degraded'] = True
        report['applied_filters'].append('reverted_due_to_degradation')
        
        # Fallback to a very mild enhancement
        mild_img = image.copy()
        if 'clahe' in report['applied_filters']:
            mild_img = apply_clahe(mild_img, clip_limit=1.2)
        if 'gamma_correction (brighten)' in report['applied_filters']:
            mild_img = apply_gamma_correction(mild_img, gamma=1.2)
            
        mild_metrics = analyze_image(mild_img)
        report['final_metrics'] = mild_metrics
        return mild_img, report
        
    return img, report

