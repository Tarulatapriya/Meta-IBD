import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import shap
from xgboost import XGBClassifier

def ensure_dirs(dirs):
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def run_shap_analysis():
    processed_dir = r"data\processed"
    fig_dir = r"results\figures"
    tab_dir = r"results\tables"
    
    ensure_dirs([fig_dir, tab_dir])
    
    # 1. Load Data
    metabolites_path = os.path.join(processed_dir, "ST000923_transformed.csv")
    metadata_path = os.path.join(processed_dir, "ST000923_metadata.csv")
    
    df = pd.read_csv(metabolites_path)
    metadata = pd.read_csv(metadata_path)
    
    feature_names = df['Metabolite_name'].values
    X = df.iloc[:, 2:].T.to_numpy()
    
    sample_ids = df.columns[2:]
    metadata_indexed = metadata.set_index('Sample_ID').loc[sample_ids]
    y = np.where(metadata_indexed['Diagnosis'].isin(['CD', 'UC']), 1, 0)
    
    # 2. Train XGBoost Model on Full Dataset
    print("Training XGBoost model for SHAP analysis...")
    model = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    model.fit(X, y)
    
    # 3. Calculate SHAP Values
    print("Calculating SHAP values...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    
    # 4. Generate SHAP Summary Plot
    print("Generating SHAP plots...")
    # Summary Plot (Beeswarm)
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X, feature_names=feature_names, show=False)
    plt.savefig(os.path.join(fig_dir, "shap_summary_beeswarm.png"), dpi=300, bbox_inches='tight')
    plt.close()
    
    # 5. Extract and Save Top Biomarkers
    print("Extracting top candidate biomarkers...")
    mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
    
    biomarkers_df = pd.DataFrame({
        'Metabolite_name': feature_names,
        'Mean_Absolute_SHAP': mean_abs_shap
    })
    
    biomarkers_df = biomarkers_df.sort_values(by='Mean_Absolute_SHAP', ascending=False)
    
    out_csv = os.path.join(tab_dir, "top_candidate_biomarkers.csv")
    biomarkers_df.to_csv(out_csv, index=False)
    print(f"Saved top candidate biomarkers to {out_csv}")
    
    print("\nTop 10 Biomarkers:")
    print(biomarkers_df.head(10).to_string(index=False))
    
    print("\nStage 4 complete.")

if __name__ == "__main__":
    run_shap_analysis()
