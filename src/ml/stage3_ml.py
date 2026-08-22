import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import roc_curve, auc, f1_score, confusion_matrix

def ensure_dirs(dirs):
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def train_and_evaluate(models, X, y, cv_folds=5):
    print(f"Running {cv_folds}-Fold Stratified CV...")
    
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    
    results = {name: {'fprs': [], 'tprs': [], 'aucs': [], 'f1s': [], 'cm': np.zeros((2, 2)), 'feature_importances': np.zeros(X.shape[1])} for name in models.keys()}
    
    for fold, (train_idx, test_idx) in enumerate(skf.split(X, y)):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        for name, model in models.items():
            # Train
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
            
            # Metrics
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            roc_auc = auc(fpr, tpr)
            f1 = f1_score(y_test, y_pred)
            cm = confusion_matrix(y_test, y_pred)
            
            # Store
            results[name]['fprs'].append(fpr)
            results[name]['tprs'].append(tpr)
            results[name]['aucs'].append(roc_auc)
            results[name]['f1s'].append(f1)
            results[name]['cm'] += cm
            
            # Feature importances (average over folds)
            if hasattr(model, 'feature_importances_'):
                results[name]['feature_importances'] += model.feature_importances_ / cv_folds
            elif hasattr(model, 'coef_'):
                # For Logistic Regression, use absolute coefficients
                results[name]['feature_importances'] += np.abs(model.coef_[0]) / cv_folds
                
    return results

def plot_roc_curves(results, out_path):
    plt.figure(figsize=(8, 6))
    
    for name, res in results.items():
        mean_auc = np.mean(res['aucs'])
        std_auc = np.std(res['aucs'])
        
        # We need a common set of FPRs to average TPRs
        mean_fpr = np.linspace(0, 1, 100)
        tprs = []
        for fpr, tpr in zip(res['fprs'], res['tprs']):
            interp_tpr = np.interp(mean_fpr, fpr, tpr)
            interp_tpr[0] = 0.0
            tprs.append(interp_tpr)
            
        mean_tpr = np.mean(tprs, axis=0)
        mean_tpr[-1] = 1.0
        
        plt.plot(mean_fpr, mean_tpr, label=f"{name} (AUC = {mean_auc:.2f} ± {std_auc:.2f})")
        
    plt.plot([0, 1], [0, 1], 'k--', lw=2, label="Random Guessing")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curves (5-Fold CV Average)')
    plt.legend(loc="lower right")
    plt.grid(True, alpha=0.3)
    
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_confusion_matrices(results, out_path):
    fig, axes = plt.subplots(1, len(results), figsize=(15, 4))
    
    for i, (name, res) in enumerate(results.items()):
        cm = res['cm']
        sns.heatmap(cm, annot=True, fmt='g', ax=axes[i], cmap='Blues', cbar=False,
                    xticklabels=['nonIBD', 'IBD'], yticklabels=['nonIBD', 'IBD'])
        axes[i].set_title(f"{name}\nAggregate CM")
        axes[i].set_xlabel('Predicted')
        if i == 0:
            axes[i].set_ylabel('True')
            
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_feature_importances(results, feature_names, out_path, top_n=20):
    fig, axes = plt.subplots(1, len(results), figsize=(15, 6))
    
    for i, (name, res) in enumerate(results.items()):
        importances = res['feature_importances']
        
        # Sort
        indices = np.argsort(importances)[::-1][:top_n]
        top_importances = importances[indices]
        top_features = feature_names[indices]
        
        sns.barplot(x=top_importances, y=top_features, ax=axes[i], color='steelblue')
        axes[i].set_title(f"{name} - Top {top_n} Features")
        axes[i].set_xlabel('Importance (or |Coefficient|)')
        if i > 0:
            axes[i].set_ylabel('')
            
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()

def run_stage3():
    processed_dir = r"data\processed"
    fig_dir = r"results\figures"
    tab_dir = r"results\tables"
    
    ensure_dirs([fig_dir, tab_dir])
    
    # Load data
    metabolites_path = os.path.join(processed_dir, "ST000923_transformed.csv")
    metadata_path = os.path.join(processed_dir, "ST000923_metadata.csv")
    
    df = pd.read_csv(metabolites_path)
    metadata = pd.read_csv(metadata_path)
    
    # Feature matrix X (samples x features)
    # The dataframe has features as rows, samples as columns (starting from col 2)
    feature_names = df['Metabolite_name'].values
    X = df.iloc[:, 2:].T.to_numpy()
    
    # Target vector y
    # IBD (CD+UC) = 1, nonIBD = 0
    # Make sure sample order in metadata matches X
    sample_ids = df.columns[2:]
    metadata_indexed = metadata.set_index('Sample_ID').loc[sample_ids]
    
    y = np.where(metadata_indexed['Diagnosis'].isin(['CD', 'UC']), 1, 0)
    
    print(f"Dataset shape: {X.shape}")
    print(f"Class distribution: {np.bincount(y)} (0: nonIBD, 1: IBD)")
    
    # Define models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    }
    
    # Run evaluation
    results = train_and_evaluate(models, X, y)
    
    # Save Metrics Table
    metrics_summary = []
    for name, res in results.items():
        metrics_summary.append({
            'Model': name,
            'Mean_ROC_AUC': np.mean(res['aucs']),
            'Std_ROC_AUC': np.std(res['aucs']),
            'Mean_F1': np.mean(res['f1s']),
            'Std_F1': np.std(res['f1s'])
        })
        
    metrics_df = pd.DataFrame(metrics_summary)
    metrics_path = os.path.join(tab_dir, "ml_performance.csv")
    metrics_df.to_csv(metrics_path, index=False)
    print(f"Saved metrics to {metrics_path}")
    print(metrics_df)
    
    # Generate Plots
    plot_roc_curves(results, os.path.join(fig_dir, "roc_curves.png"))
    plot_confusion_matrices(results, os.path.join(fig_dir, "confusion_matrices.png"))
    plot_feature_importances(results, feature_names, os.path.join(fig_dir, "feature_importances.png"))
    
    print("Stage 3 complete.")

if __name__ == "__main__":
    run_stage3()
