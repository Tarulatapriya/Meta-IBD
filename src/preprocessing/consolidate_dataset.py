import pandas as pd
import glob
import os
import json

def parse_metadata(factors_row, sample_ids):
    """Parses the metadata row into a DataFrame."""
    diagnoses = []
    sexes = []
    
    for f in factors_row:
        parts = str(f).split(' | ')
        diag = parts[0].split(':')[1] if len(parts) > 0 and ':' in parts[0] else 'Unknown'
        sex = parts[1].split(':')[1] if len(parts) > 1 and ':' in parts[1] else 'Unknown'
        diagnoses.append(diag)
        sexes.append(sex)
        
    metadata = pd.DataFrame({
        'Sample_ID': sample_ids,
        'Diagnosis': diagnoses,
        'Sex': sexes
    })
    return metadata

def consolidate_dataset(raw_dir: str, processed_dir: str):
    files = sorted(glob.glob(os.path.join(raw_dir, "MSdata_ST000923_*.txt")))
    
    if not files:
        raise FileNotFoundError(f"No MSdata_ST000923_*.txt files found in {raw_dir}")
        
    if len(files) != 4:
        print(f"Warning: Found {len(files)} files, expected 4.")
        
    dfs = []
    file_metabolite_counts = {}
    
    # Read files
    for f in files:
        df = pd.read_csv(f, sep='\t', header=None, low_memory=False, dtype=str)
        dfs.append((f, df))
        
    # Validation structures
    reference_header = dfs[0][1].iloc[0].values
    reference_factors = dfs[0][1].iloc[1].values
    
    sample_ids = reference_header[2:]
    
    data_rows_list = []
    
    for f, df in dfs:
        header = df.iloc[0].values
        factors = df.iloc[1].values
        
        # Verify Headers
        if not (header == reference_header).all():
            raise ValueError(f"Header mismatch in file: {f}")
            
        # Verify Factors
        if not (factors == reference_factors).all():
            raise ValueError(f"Factors mismatch in file: {f}")
            
        # Extract metabolite rows
        data_rows = df.iloc[2:].copy()
        file_metabolite_counts[os.path.basename(f)] = len(data_rows)
        
        data_rows_list.append(data_rows)
        
    # Concatenate all metabolite rows
    combined_metabolites = pd.concat(data_rows_list, ignore_index=True)
    
    # Rename columns using the reference header
    combined_metabolites.columns = reference_header
    
    # Check for duplicate metabolite names
    metabolite_names = combined_metabolites.iloc[:, 0].values
    duplicate_metabolites = combined_metabolites[combined_metabolites.duplicated(subset=[reference_header[0]], keep=False)]
    
    # Check for duplicate sample IDs
    duplicate_samples = [sid for i, sid in enumerate(sample_ids) if sid in sample_ids[:i]]
    
    # Parse metadata
    metadata_df = parse_metadata(reference_factors[2:], sample_ids)
    
    # Calculate Missing Values
    # Replace empty string or whitespace with NaN
    combined_numeric = combined_metabolites.iloc[:, 2:].replace(r'^\s*$', pd.NA, regex=True)
    total_missing = combined_numeric.isna().sum().sum()
    
    # Prepare validation report
    validation_report = {
        "num_input_files": len(files),
        "metabolites_per_file": file_metabolite_counts,
        "total_metabolites": len(combined_metabolites),
        "num_samples": len(sample_ids),
        "num_cd_samples": int((metadata_df['Diagnosis'] == 'CD').sum()),
        "num_uc_samples": int((metadata_df['Diagnosis'] == 'UC').sum()),
        "num_nonibd_samples": int((metadata_df['Diagnosis'] == 'nonIBD').sum()),
        "num_female_samples": int((metadata_df['Sex'] == 'Female').sum()),
        "num_male_samples": int((metadata_df['Sex'] == 'Male').sum()),
        "duplicate_metabolite_names": len(duplicate_metabolites),
        "duplicate_sample_ids": len(duplicate_samples),
        "total_missing_values": int(total_missing)
    }
    
    print("\n--- Validation Report ---")
    for key, value in validation_report.items():
        print(f"{key}: {value}")
        
    # Save outputs
    os.makedirs(processed_dir, exist_ok=True)
    
    metabolite_out_path = os.path.join(processed_dir, "ST000923_metabolomics.csv")
    metadata_out_path = os.path.join(processed_dir, "ST000923_metadata.csv")
    report_out_path = os.path.join(processed_dir, "consolidation_report.json")
    
    combined_metabolites.to_csv(metabolite_out_path, index=False)
    metadata_df.to_csv(metadata_out_path, index=False)
    
    with open(report_out_path, "w") as f:
        json.dump(validation_report, f, indent=4)
        
    print(f"\nOutputs saved to:\n- {metabolite_out_path}\n- {metadata_out_path}\n- {report_out_path}")

if __name__ == "__main__":
    raw_dir = r"data\raw"
    processed_dir = r"data\processed"
    consolidate_dataset(raw_dir, processed_dir)
