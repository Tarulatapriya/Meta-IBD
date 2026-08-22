import os
import json
import pandas as pd
import numpy as np
import pytest
from src.preprocessing.transform_dataset import transform_dataset

def test_transformation():
    processed_dir = r"data\processed"
    
    # Ensure inputs exist
    metabolomics_path = os.path.join(processed_dir, "ST000923_metabolomics.csv")
    assert os.path.exists(metabolomics_path), "Input file ST000923_metabolomics.csv not found. Run consolidation first."
    
    # Run the transformation
    transform_dataset(processed_dir, missing_threshold=0.3)
    
    # Verify output exists
    transformed_path = os.path.join(processed_dir, "ST000923_transformed.csv")
    report_path = os.path.join(processed_dir, "transformation_report.json")
    
    assert os.path.exists(transformed_path), "Transformed CSV not found"
    assert os.path.exists(report_path), "Transformation report JSON not found"
    
    # Read the output data
    df = pd.read_csv(transformed_path)
    data_cols = df.columns[2:]
    numeric_data = df[data_cols].to_numpy()
    
    # 1. Test no missing values remain
    assert not np.isnan(numeric_data).any(), "Missing values found after imputation"
    
    # 2. Test standardization properties (mean ~ 0, variance ~ 1 for each row/metabolite)
    means = np.mean(numeric_data, axis=1)
    variances = np.var(numeric_data, axis=1)
    
    # Tolerance for floating point precision
    assert np.allclose(means, 0, atol=1e-7), "Not all row means are close to 0"
    assert np.allclose(variances, 1, atol=1e-7), "Not all row variances are close to 1"
    
    # Read the report
    with open(report_path, "r") as f:
        report = json.load(f)
        
    assert report["initial_metabolites"] > 0
    assert report["final_metabolites"] <= report["deduplicated_metabolites"]
    
    print("All transformation tests passed.")

if __name__ == "__main__":
    test_transformation()
