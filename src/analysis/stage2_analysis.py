import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from scipy.stats import ttest_ind
from statsmodels.stats.multitest import multipletests

def ensure_dirs(dirs):
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def perform_pca(df_metabolites, metadata, out_dir):
    print("Performing PCA...")
    # Extract data, transpose so samples are rows
    data = df_metabolites.iloc[:, 2:].T.to_numpy()
    
    pca = PCA(n_components=2)
    pcs = pca.fit_transform(data)
    
    # Create DataFrame for plotting
    pca_df = pd.DataFrame({
        'PC1': pcs[:, 0],
        'PC2': pcs[:, 1],
        'Diagnosis': metadata['Diagnosis'].values
    })
    
    var_exp = pca.explained_variance_ratio_ * 100
    
    plt.figure(figsize=(10, 8))
    sns.scatterplot(
        data=pca_df, x='PC1', y='PC2', hue='Diagnosis', 
        palette={'CD': 'red', 'UC': 'blue', 'nonIBD': 'green'}, 
        alpha=0.7, s=50
    )
    plt.title('PCA of Metabolomics Data (Stage 2)')
    plt.xlabel(f'PC1 ({var_exp[0]:.1f}%)')
    plt.ylabel(f'PC2 ({var_exp[1]:.1f}%)')
    plt.grid(True, alpha=0.3)
    
    out_path = os.path.join(out_dir, "pca_diagnosis.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved PCA plot to {out_path}")

def run_differential_analysis(df_metabolites, metadata, group1_name, group2_name, group1_samples, group2_samples, out_dir):
    print(f"Running Differential Analysis: {group1_name} vs {group2_name}...")
    
    results = []
    
    # We want group1 / group2, but data is already log2 transformed!
    # So Log2 Fold Change = Mean(group1) - Mean(group2)
    
    for _, row in df_metabolites.iterrows():
        metabolite = row['Metabolite_name']
        refmet = row['RefMet_name']
        
        g1_data = pd.to_numeric(row[group1_samples]).values
        g2_data = pd.to_numeric(row[group2_samples]).values
        
        # T-test
        t_stat, p_val = ttest_ind(g1_data, g2_data, equal_var=False)
        
        # Mean difference (Log2 Fold Change since data is already log2 and scaled)
        # Wait, the data was scaled using StandardScaler, which destroys fold change!
        # Ah... this is an important point. If the data is standardized, the difference
        # is Cohen's d (effect size), not log2 fold change.
        # Let's use the difference of means (effect size)
        eff_size = np.mean(g1_data) - np.mean(g2_data)
        
        results.append({
            'Metabolite_name': metabolite,
            'RefMet_name': refmet,
            'Effect_Size': eff_size,
            'p_value': p_val
        })
        
    res_df = pd.DataFrame(results)
    
    # FDR Correction
    res_df['p_value'] = res_df['p_value'].fillna(1.0)
    _, q_vals, _, _ = multipletests(res_df['p_value'], method='fdr_bh')
    res_df['q_value'] = q_vals
    
    res_df = res_df.sort_values('q_value')
    
    out_path = os.path.join(out_dir, f"diff_expr_{group1_name}_vs_{group2_name}.csv")
    res_df.to_csv(out_path, index=False)
    print(f"Saved differential analysis results to {out_path}")
    return res_df

def plot_volcano(res_df, title, out_path):
    print(f"Generating Volcano plot for {title}...")
    
    plt.figure(figsize=(10, 8))
    
    # Add -log10 q-value
    res_df['minus_log10_q'] = -np.log10(res_df['q_value'] + 1e-300) # prevent log(0)
    
    # Significance criteria
    sig = (res_df['q_value'] < 0.05) & (np.abs(res_df['Effect_Size']) > 0.5)
    
    sns.scatterplot(
        x=res_df.loc[~sig, 'Effect_Size'], 
        y=res_df.loc[~sig, 'minus_log10_q'], 
        color='grey', alpha=0.5, label='Not Significant'
    )
    
    sns.scatterplot(
        x=res_df.loc[sig, 'Effect_Size'], 
        y=res_df.loc[sig, 'minus_log10_q'], 
        color='red', alpha=0.8, label='Significant (FDR < 0.05, |ES| > 0.5)'
    )
    
    plt.axhline(y=-np.log10(0.05), color='black', linestyle='--', alpha=0.5)
    plt.axvline(x=0.5, color='black', linestyle='--', alpha=0.5)
    plt.axvline(x=-0.5, color='black', linestyle='--', alpha=0.5)
    
    plt.title(f'Volcano Plot: {title}')
    plt.xlabel('Effect Size (Mean Difference in Standardized Units)')
    plt.ylabel('-log10(q-value)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved volcano plot to {out_path}")

def run_stage2():
    processed_dir = r"data\processed"
    fig_dir = r"results\figures"
    tab_dir = r"results\tables"
    
    ensure_dirs([fig_dir, tab_dir])
    
    metabolites_path = os.path.join(processed_dir, "ST000923_transformed.csv")
    metadata_path = os.path.join(processed_dir, "ST000923_metadata.csv")
    
    df = pd.read_csv(metabolites_path)
    metadata = pd.read_csv(metadata_path)
    
    # PCA
    perform_pca(df, metadata, fig_dir)
    
    # Differential Analysis Setup
    # Group samples by diagnosis
    ibd_samples = metadata[metadata['Diagnosis'].isin(['CD', 'UC'])]['Sample_ID'].tolist()
    nonibd_samples = metadata[metadata['Diagnosis'] == 'nonIBD']['Sample_ID'].tolist()
    
    cd_samples = metadata[metadata['Diagnosis'] == 'CD']['Sample_ID'].tolist()
    uc_samples = metadata[metadata['Diagnosis'] == 'UC']['Sample_ID'].tolist()
    
    # 1. IBD vs non-IBD
    res_ibd_nonibd = run_differential_analysis(
        df, metadata, "IBD", "nonIBD", ibd_samples, nonibd_samples, tab_dir
    )
    plot_volcano(res_ibd_nonibd, "IBD vs non-IBD", os.path.join(fig_dir, "volcano_IBD_vs_nonIBD.png"))
    
    # 2. CD vs UC
    res_cd_uc = run_differential_analysis(
        df, metadata, "CD", "UC", cd_samples, uc_samples, tab_dir
    )
    plot_volcano(res_cd_uc, "CD vs UC", os.path.join(fig_dir, "volcano_CD_vs_UC.png"))

if __name__ == "__main__":
    run_stage2()
