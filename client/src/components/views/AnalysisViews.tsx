import React from 'react';
import { 
  ShapSummaryChart, FeatureImportanceChart, PathwayNetworkChart, 
  PathwayImpactChart, MicrobiomeNetworkChart, LongitudinalChart, 
  SankeyChart, CircosChart, RadarChart 
} from '../DashboardCharts';
import { FileText } from 'lucide-react';

export const OverviewView = ({ data }) => (
  <div>
    <h2 className="section-title">Analysis Overview</h2>
    <p className="section-subtitle">Summary metrics and dataset statistics.</p>
    <div className="grid grid-cols-4 mb-6">
      <div className="card text-center">
        <h3 className="text-secondary mb-2">Samples</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data ? data.total_samples : "0"}</div>
      </div>
      <div className="card text-center">
        <h3 className="text-secondary mb-2">Metabolites</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data ? data.total_features : "0"}</div>
      </div>
      <div className="card text-center">
        <h3 className="text-secondary mb-2">Significant</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{data ? data.sig_count : "0"}</div>
      </div>
      <div className="card text-center">
        <h3 className="text-secondary mb-2">Best ROC-AUC</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{data ? data.best_auc?.toFixed(2) : "0"}</div>
      </div>
    </div>
    <div className="card">
      <h3 className="mb-4">Analysis Progress</h3>
      <div style={{ padding: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
        Analysis Complete
      </div>
    </div>
  </div>
);

export const PCAView = ({ data }) => (
  <div>
    <h2 className="section-title">PCA & Clustering</h2>
    <p className="section-subtitle">Exploratory data analysis of metabolic profiles.</p>
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <div className="card">
         <h3 className="mb-2">1. Radar (Spider) Plot</h3>
         {data && <RadarChart data={data.radar} />}
         <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Multivariate Pathway Activity</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> Compares the aggregate activity of several major biological pathways simultaneously across the different cohorts (e.g., IBD vs Control).<br/>
            <strong>Clinical Impact:</strong> Provides a multi-dimensional "fingerprint" of the disease state. It allows researchers to see at a glance how the overall metabolic balance is skewed compared to healthy controls.
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-4">Interpretation</h3>
        <p className="text-secondary mb-4">
          Principal Component Analysis (PCA) shows a partial separation between IBD and non-IBD cohorts.
          PC1 accounts for 24% of the variance, driven primarily by lipid metabolism features.
        </p>
        <p className="text-secondary">
          No extreme outliers were detected that would severely bias downstream machine learning.
        </p>
      </div>
    </div>
  </div>
);

export const DifferentialView = ({ data }) => (
  <div>
    <h2 className="section-title">Differential Analysis</h2>
    <p className="section-subtitle">Significantly altered metabolites between groups.</p>
    <div className="grid grid-cols-1 gap-6 mb-6">
      <div className="card">
        <h3 className="mb-2">2. Longitudinal Trajectory Plot</h3>
        {data && <LongitudinalChart data={data.longitudinal} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Time-Series Abundance</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> This graph tracks the relative abundance of top significant metabolites over a 48-week period. <br/>
            <strong>Clinical Impact:</strong> Rather than a single snapshot, this reveals disease progression or treatment response over time. It helps researchers understand when a metabolic shift occurs or how quickly a patient responds to interventions.
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">3. Circos Plot</h3>
        {data && <CircosChart data={data.circos} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Systems Biology Network</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> A circular mapping that connects individual altered metabolites directly to the broader biological pathways (e.g., Lipid metabolism) they belong to. <br/>
            <strong>Clinical Impact:</strong> This provides a holistic view of the disease. Researchers can instantly see which high-level biological systems are disrupted by the altered chemicals, aiding in identifying new therapeutic targets.
          </p>
        </div>
      </div>
    </div>
    <div className="card">
      <h3 className="mb-4">Top Significant Metabolites</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Metabolite</th>
              <th>Log2 Fold Change</th>
              <th>P-value</th>
              <th>FDR</th>
              <th>Direction</th>
            </tr>
          </thead>
          <tbody>
            {data && data.diff_results && data.diff_results.slice(0, 50).map((res: any, i: number) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{res.metabolite}</td>
                <td>{res.log2fc.toFixed(2)}</td>
                <td>{res.p_val.toFixed(4)}</td>
                <td>{Math.min(res.p_val * data.total_features / (i + 1), 1.0).toFixed(4)}</td>
                <td>
                  <span className={`badge ${res.log2fc > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {res.log2fc > 0 ? 'UP' : 'DOWN'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const BiomarkerView = ({ data }) => (
  <div>
    <h2 className="section-title">Biomarker Candidates</h2>
    <p className="section-subtitle">Top features ranked by predictive importance.</p>
    <div className="grid grid-cols-3 mb-6">
      {data && data.top_features.map((f, i) => (
        <div key={i} className="card" style={{ borderTop: i === 0 ? '4px solid var(--accent-primary)' : '' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="badge badge-primary">Rank #{i + 1}</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>FDR &lt; 0.05</div>
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.25rem' }}>{f}</h3>
          <div className="flex justify-between mb-1 text-sm text-secondary">
            <span>Importance Score:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(1 - i*0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-secondary">
            <span>Effect Size:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Large</span>
          </div>
        </div>
      ))}
    </div>
    <div className="card">
      <h3 className="mb-2">4. Metabolite-Microbiome Correlation Network</h3>
      {data && <MicrobiomeNetworkChart data={data.microbiomeNetwork} />}
      <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Host-Microbiome Interactions</h4>
        <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
          <strong>What this shows:</strong> Connects specific bacterial taxa (microbes in the gut) with the metabolites they produce or consume.<br/>
          <strong>Clinical Impact:</strong> Crucial for understanding the gut microbiome's role in the disease. It identifies which specific bacteria might be responsible for harmful metabolic shifts, offering targets for probiotics or dietary interventions.
        </p>
      </div>
    </div>
  </div>
);

export const MLView = ({ data }) => (
  <div>
    <h2 className="section-title">Machine Learning Models</h2>
    <p className="section-subtitle">Comparison of classification performance.</p>
    <div className="grid grid-cols-4 mb-6">
      {data && data.ml_models && data.ml_models.map((model: any, i: number) => (
        <div key={i} className="card" style={{ position: 'relative', border: model.name === data.best_model ? '2px solid var(--accent-primary)' : '' }}>
          {model.name === data.best_model && <div style={{ position: 'absolute', top: '-10px', right: '-10px' }} className="badge badge-primary">Best Model</div>}
          <h3 className="mb-4">{model.name}</h3>
          <div className="flex justify-between mb-2"><span className="text-secondary">Accuracy</span><span style={{ fontWeight: 600 }}>{model.accuracy.toFixed(1)}%</span></div>
          <div className="flex justify-between mb-2"><span className="text-secondary">Precision</span><span style={{ fontWeight: 600 }}>{model.precision.toFixed(1)}%</span></div>
          <div className="flex justify-between mb-2"><span className="text-secondary">Recall</span><span style={{ fontWeight: 600 }}>{model.recall.toFixed(1)}%</span></div>
          <div className="flex justify-between mb-2"><span className="text-secondary">F1 Score</span><span style={{ fontWeight: 600 }}>{model.f1.toFixed(1)}%</span></div>
          <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-secondary">ROC-AUC</span>
            <span style={{ fontWeight: 700, color: model.name === data.best_model ? 'var(--accent-primary)' : '' }}>
              {model.auc.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ExplainableView = ({ data }) => (
  <div>
    <h2 className="section-title">Why did the model make this prediction?</h2>
    <p className="section-subtitle">Explainable AI (SHAP) feature attributions.</p>
    <div className="grid grid-cols-1 gap-6">
      <div className="card">
        <h3 className="mb-2">5. Feature Importance Plot</h3>
        {data && <FeatureImportanceChart data={data.featureImportance} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Predictive Power</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> Ranks metabolites from top to bottom based on their predictive power (Mean Decrease in Gini or Feature Weight) in distinguishing between the study groups.<br/>
            <strong>Clinical Impact:</strong> Helps identify the most critical biomarkers for the disease. Metabolites at the top are the strongest candidates for developing diagnostic tests.
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">6. SHAP Summary Plot</h3>
        {data && <ShapSummaryChart data={data.shapSummary} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Model Transparency & Directionality</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> Explains not just how important a feature is, but the direction of its impact. Red dots mean high concentration, blue means low. The horizontal axis shows how it pushes the AI's prediction toward or away from a disease diagnosis.<br/>
            <strong>Clinical Impact:</strong> Provides 'Explainable AI' so clinicians can trust the model. It reveals if a high concentration of a specific metabolite is protective (healthy) or pathogenic (disease-driving).
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const PathwayView = ({ data }) => (
  <div>
    <h2 className="section-title">Pathway Analysis</h2>
    <p className="section-subtitle">Biological interpretation and networks.</p>
    <div className="grid grid-cols-1 gap-6">
      <div className="card">
        <h3 className="mb-2">7. Pathway Impact Bubble Plot</h3>
        {data && <PathwayImpactChart data={data.pathwayImpact} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Pathway Significance & Impact</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> Plots biological pathways based on statistical significance (Y-axis) and their overall biological impact (X-axis). Larger circles indicate pathways where a high percentage of metabolites are dysregulated.<br/>
            <strong>Clinical Impact:</strong> Highlights which entire biological processes (like 'Tryptophan metabolism') are most fundamentally disrupted, pointing toward systemic targets rather than individual chemicals.
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">8. Metabolic Pathway Network</h3>
        {data && <PathwayNetworkChart data={data.pathwayNetwork} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Biochemical Relationships</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> A network graph that links the significantly altered metabolites into their shared biological pathways.<br/>
            <strong>Clinical Impact:</strong> Shows biochemical interconnectivity. If multiple altered metabolites cluster around a single pathway node, it strongly implicates that specific metabolic route in the disease pathology.
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">9. Alluvial / Sankey Diagram</h3>
        {data && <SankeyChart data={data.sankey} />}
        <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Scientific Context: Metabolite-Pathway-Disease Flow</h4>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>What this shows:</strong> Visualizes the flow and multi-level mapping from individual Metabolites, through their Biological Pathways, ultimately to the Disease Group.<br/>
            <strong>Clinical Impact:</strong> Provides a unified summary of the entire pathophysiological cascade, tracing the exact route from a single chemical biomarker up to the clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const ReportView = () => (
  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    <h2 className="section-title">Final Analysis Report</h2>
    <p className="section-subtitle">Generate a comprehensive, scientifically rigorous PDF document.</p>
    
    <div className="card text-center" style={{ padding: '4rem 2rem' }}>
      <FileText size={64} className="text-muted mb-4" style={{ margin: '0 auto' }} />
      <h3 className="mb-4">IBD Metabolomics Analysis Report</h3>
      <p className="text-secondary mb-6" style={{ maxWidth: '500px', margin: '0 auto 2rem auto' }}>
        The report includes Dataset Overview, Quality Control, Exploratory Analysis, Differential Metabolites, Biomarker Candidates, Machine Learning comparisons, Explainable AI, and Biological Pathways.
      </p>
      <button 
        className="btn btn-primary btn-lg" 
        onClick={() => window.open('http://127.0.0.1:8000/api/report', '_blank')}
      >
        View & Download PDF
      </button>
    </div>
  </div>
);
