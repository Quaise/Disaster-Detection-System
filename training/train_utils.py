import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import models, transforms
from training.dataset_loader import DisasterDataset
from tqdm import tqdm
import matplotlib.pyplot as plt

def train_model(data_dir, model_save_path, model_name, num_epochs=10, batch_size=32):
    print(f"--- Starting Training for {model_name} ---")
    print(f"Data Source: {data_dir}")
    
    # Check GPU
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # 1. Prepare Data
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    dataset = DisasterDataset(data_dir, transform=transform)
    
    if len(dataset) == 0:
        print(f"Warning: No data found in {data_dir}. Skipping training for {model_name}.")
        return

    # Split 80/20
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2)
    
    # 2. Prepare Model (EfficientNet-B0)
    # Using Transfer Learning
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
    
    # Replace classifier
    num_ftrs = model.classifier[1].in_features
    # 5 classes (Non_Damage, Water_Disaster, Land_Disaster, Fire_Disaster, Damaged_Infrastructure)
    num_classes = len(dataset.category_to_label)
    model.classifier[1] = nn.Linear(num_ftrs, num_classes)
    
    model = model.to(device)
    
    # 3. Loss and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.1, patience=3)
    
    # Enable mixed precision training for RTX 3050 speedup
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None
    
    best_acc = 0.0
    
    train_losses = []
    val_accuracies = []
    
    # 4. Training Loop
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        
        progress_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}")
        for inputs, labels in progress_bar:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            
            if scaler:
                with torch.amp.autocast('cuda'):
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
            running_loss += loss.item() * inputs.size(0)
            progress_bar.set_postfix({'loss': loss.item()})
            
        epoch_loss = running_loss / train_size
        train_losses.append(epoch_loss)
        
        # Validation
        model.eval()
        running_corrects = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                
                running_corrects += torch.sum(preds == labels.data)
                
        epoch_acc = running_corrects.double() / val_size
        val_accuracies.append(epoch_acc.item())
        
        print(f"Validation Acc: {epoch_acc:.4f}")
        
        scheduler.step(epoch_acc)
        
        if epoch_acc > best_acc:
            best_acc = epoch_acc
            torch.save(model.state_dict(), os.path.join(model_save_path, f'{model_name}_best.pth'))
            
    print(f"Best val Acc: {best_acc:4f}")
    
    # Save final model
    torch.save(model.state_dict(), os.path.join(model_save_path, f'{model_name}_final.pth'))
    
    # Plot and save metrics
    plt.figure()
    plt.plot(train_losses, label='Train Loss')
    plt.plot(val_accuracies, label='Val Accuracy')
    plt.legend()
    plt.title(f"{model_name} Training Metrics")
    plt.savefig(f"metrics/{model_name}_metrics.png")
    
    return best_acc
