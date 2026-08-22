import pandas as pd
import numpy as np
import os
import json
from sklearn.preprocessing import StandardScaler

def transform_dataset(processed_dir: str, missing_threshold: float = 0.3):
    metabolomics_path = os.path.join(processed_dir, "ST000923_metabolomics.csv")
    
    if not os.path.exists(metabolomics_path):
        raise FileNotFoundError(f"Input file not found: {metabolomics_path}. Please run consolidate_dataset.py first.")
        
    df = pd.read_csv(metabolomics_path)
    
    # Strip whitespace from column names just in case
    df.columns = df.columns.str.strip()
    
    # 1. Deduplicate by averaging duplicate rows
    # The first two columns are Metabolite_name and RefMet_name
    # Group by both and calculate mean for numeric columns
    
    # Convert data columns to numeric, replacing any whitespace with NaN
    data_cols = df.columns[2:]
    for col in data_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    initial_rows = len(df)
    
    # Group by the first two columns (names) and calculate the mean
    df_dedup = df.groupby(['Metabolite_name', 'RefMet_name'], as_index=False).mean()
    dedup_rows = len(df_dedup)
    
    # 2. Missing Value Analysis & Filtering
    # Calculate missing percentage per row
    missing_pct = df_dedup[data_cols].isna().mean(axis=1)
    
    # Filter out rows exceeding the threshold
    keep_mask = missing_pct <= missing_threshold
    df_filtered = df_dedup[keep_mask].copy()
    filtered_rows = len(df_filtered)
    
    # 3. Imputation (Half-minimum imputation)
    # Calculate the minimum value for each metabolite (row), excluding NaNs
    min_vals = df_filtered[data_cols].min(axis=1)
    
    # Replace NaNs with half the minimum value
    # We transpose to apply the row-wise array to fillna, then transpose back
    imputed_data = df_filtered[data_cols].T.fillna(min_vals / 2.0).T
    
    # Update the dataframe with imputed data
    df_filtered[data_cols] = imputed_data
    
    # 4. Log2 Transformation
    # Add a small epsilon if there are any exact zeros, though half-min should prevent this
    # unless the min itself was zero.
    epsilon = 1e-9
    transformed_data = np.log2(df_filtered[data_cols] + epsilon)
    
    # 5. Scaling (Standardization)
    scaler = StandardScaler()
    # StandardScaler scales along columns (samples). We want to standardize features (metabolites) across samples.
    # Therefore, we transpose, scale, and transpose back.
    scaled_data = scaler.fit_transform(transformed_data.T).T
    
    # Update the dataframe
    df_filtered[data_cols] = scaled_data
    
    # Save output
    out_path = os.path.join(processed_dir, "ST000923_transformed.csv")
    df_filtered.to_csv(out_path, index=False)
    
    # Prepare Report
    report = {
        "initial_metabolites": initial_rows,
        "deduplicated_metabolites": dedup_rows,
        "metabolites_removed_missing_threshold": int(dedup_rows - filtered_rows),
        "final_metabolites": filtered_rows,
        "missing_threshold_used": missing_threshold,
        "imputation_method": "half-minimum",
        "transformation": "log2",
        "scaling": "standard_scaler (Z-score)"
    }
    
    report_path = os.path.join(processed_dir, "transformation_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=4)
        
    print(f"Data transformation complete.\n- Input rows: {initial_rows}\n- Deduplicated rows: {dedup_rows}")
    print(f"- Filtered rows (>{missing_threshold*100}% missing): {dedup_rows - filtered_rows}")
    print(f"- Final rows: {filtered_rows}")
    print(f"\nOutputs saved to:\n- {out_path}\n- {report_path}")

if __name__ == "__main__":
    processed_dir = r"data\processed"
    transform_dataset(processed_dir)
