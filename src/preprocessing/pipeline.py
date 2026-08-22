import os
from src.preprocessing.consolidate_dataset import consolidate_dataset
from src.preprocessing.transform_dataset import transform_dataset

def run_pipeline():
    raw_dir = r"data\raw"
    processed_dir = r"data\processed"
    
    print("=== Stage 1A: Consolidation ===")
    consolidate_dataset(raw_dir, processed_dir)
    
    print("\n=== Stage 1B: Transformation ===")
    transform_dataset(processed_dir, missing_threshold=0.3)
    
    print("\nPipeline execution complete.")

if __name__ == "__main__":
    run_pipeline()
