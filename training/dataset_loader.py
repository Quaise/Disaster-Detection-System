import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import glob

class DisasterDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        """
        Args:
            root_dir (string): Directory with all the main category folders.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = root_dir
        self.transform = transform
        
        # Define the mapping from main categories to integer labels
        # 0: Non_Damage, 1: Water_Disaster, 2: Land_Disaster, 3: Fire_Disaster, 4: Damaged_Infrastructure
        self.category_to_label = {
            "Non_Damage": 0,
            "Water_Disaster": 1,
            "Land_Disaster": 2,
            "Fire_Disaster": 3,
            "Damaged_Infrastructure": 4
        }
        
        self.image_paths = []
        self.labels = []
        
        self._load_dataset()

    def _load_dataset(self):
        if not os.path.exists(self.root_dir):
            return
            
        for main_cat, label in self.category_to_label.items():
            cat_dir = os.path.join(self.root_dir, main_cat)
            if not os.path.exists(cat_dir):
                continue
                
            # Recursively find all images in this main category (including subdirectories)
            for ext in ('*.png', '*.jpg', '*.jpeg'):
                # glob search
                pattern = os.path.join(cat_dir, '**', ext)
                found_images = glob.glob(pattern, recursive=True)
                for img_path in found_images:
                    self.image_paths.append(img_path)
                    self.labels.append(label)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        img_name = self.image_paths[idx]
        try:
            # Convert to RGB to ensure 3 channels
            image = Image.open(img_name).convert('RGB')
        except Exception as e:
            # If image reading fails, return a dummy white image and label
            # This is a fallback to avoid crash during training
            image = Image.new('RGB', (224, 224), (255, 255, 255))
            
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

    @property
    def classes(self):
        return list(self.category_to_label.keys())
