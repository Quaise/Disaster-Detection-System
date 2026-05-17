import os
from training.train_utils import train_model

def main():
    print("==============================================")
    print("STARTING DISASTER DETECTION MODEL TRAINING")
    print("==============================================")
    
    # Configuration
    epochs = 10
    batch_size = 16 # Adjust based on GPU memory
    
    # Ensure metric directory exists
    if not os.path.exists('metrics'):
        os.makedirs('metrics')
        
    results = {}

    # 1. Train Raw Model
    print("\n\n--- PHASE 1: Training Raw Model ---")
    raw_acc = train_model(
        data_dir="Dataset", 
        model_save_path="models/raw_model", 
        model_name="raw_model",
        num_epochs=epochs,
        batch_size=batch_size
    )
    results['Raw Model'] = raw_acc

    # 2. Train Standard Model
    print("\n\n--- PHASE 2: Training Standard Model ---")
    standard_acc = train_model(
        data_dir="processed_dataset", 
        model_save_path="models/standard_model", 
        model_name="standard_model",
        num_epochs=epochs,
        batch_size=batch_size
    )
    results['Standard Model'] = standard_acc

    # 3. Train Adaptive Model
    print("\n\n--- PHASE 3: Training Adaptive Intelligent Model ---")
    adaptive_acc = train_model(
        data_dir="adaptive_processed_dataset", 
        model_save_path="models/adaptive_model", 
        model_name="adaptive_model",
        num_epochs=epochs,
        batch_size=batch_size
    )
    results['Adaptive Model'] = adaptive_acc
    
    print("\n\n==============================================")
    print("TRAINING COMPLETE. SUMMARY:")
    print("==============================================")
    for model_name, acc in results.items():
        acc_str = f"{acc*100:.2f}%" if acc is not None else "N/A"
        print(f"{model_name} Best Validation Accuracy: {acc_str}")

if __name__ == '__main__':
    main()
