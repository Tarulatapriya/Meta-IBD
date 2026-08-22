import os
import json
import pandas as pd
import pytest
from src.preprocessing.consolidate_dataset import consolidate_dataset

def test_consolidation():
    # Execute consolidation
    raw_dir = r"data\raw"
    processed_dir = r"data\processed"
    
    # Check if raw files exist before running
    import glob
    raw_files = glob.glob(os.path.join(raw_dir, "MSdata_ST000923_*.txt"))
    assert len(raw_files) == 4, f"Expected 4 raw files, found {len(raw_files)}"
    
    # Run the consolidation (this will raise exceptions if sample IDs mismatch)
    consolidate_dataset(raw_dir, processed_dir)
    
    # Verify outputs exist
    metabolites_path = os.path.join(processed_dir, "ST000923_metabolomics.csv")
    metadata_path = os.path.join(processed_dir, "ST000923_metadata.csv")
    report_path = os.path.join(processed_dir, "consolidation_report.json")
    
    assert os.path.exists(metabolites_path), "Metabolomics CSV output not found"
    assert os.path.exists(metadata_path), "Metadata CSV output not found"
    assert os.path.exists(report_path), "Validation report JSON not found"
    
    # Read the report to verify counts
    with open(report_path, "r") as f:
        report = json.load(f)
        
    assert report["num_input_files"] == 4
    assert report["duplicate_sample_ids"] == 0, "Duplicate sample IDs found"
    
    # Verify the combined metabolite count equals the sum of metabolite rows across the four files
    sum_metabolites = sum(report["metabolites_per_file"].values())
    assert report["total_metabolites"] == sum_metabolites, "Total metabolites do not match the sum of individual files"
    
    # Verify metadata was parsed properly
    metadata_df = pd.read_csv(metadata_path)
    assert 'Sample_ID' in metadata_df.columns
    assert 'Diagnosis' in metadata_df.columns
    assert 'Sex' in metadata_df.columns
    
    assert len(metadata_df) == report["num_samples"], "Metadata row count mismatch"
    
    print("All tests passed.")

if __name__ == "__main__":
    test_consolidation()
