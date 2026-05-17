import os
import cv2
from tqdm import tqdm
import shutil
from preprocessing.filters import apply_standard_preprocessing
from preprocessing.adaptive_pipeline import adaptive_preprocess

def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

def main():
    source_dir = "Dataset"
    standard_dest = "processed_dataset"
    adaptive_dest = "adaptive_processed_dataset"
    
    if not os.path.exists(source_dir):
        print(f"Source directory {source_dir} does not exist.")
        return

    create_dir_if_not_exists(standard_dest)
    create_dir_if_not_exists(adaptive_dest)

    # Walk through the dataset directory
    for root, dirs, files in os.walk(source_dir):
        for file in tqdm(files, desc=f"Processing {os.path.basename(root)}"):
            if not file.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
                
            file_path = os.path.join(root, file)
            
            # Recreate directory structure in destinations
            rel_path = os.path.relpath(root, source_dir)
            std_dir = os.path.join(standard_dest, rel_path)
            adapt_dir = os.path.join(adaptive_dest, rel_path)
            
            create_dir_if_not_exists(std_dir)
            create_dir_if_not_exists(adapt_dir)
            
            # Read image
            img = cv2.imread(file_path)
            if img is None:
                continue
                
            # Standard preprocessing
            std_img = apply_standard_preprocessing(img)
            cv2.imwrite(os.path.join(std_dir, file), std_img)
            
            # Adaptive preprocessing
            adapt_img, report = adaptive_preprocess(img)
            cv2.imwrite(os.path.join(adapt_dir, file), adapt_img)

if __name__ == "__main__":
    main()
