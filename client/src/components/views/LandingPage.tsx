import { Activity, Beaker, Network, FileText, ArrowRight } from 'lucide-react';

export const LandingPage = ({ setCurrentView }: { setCurrentView: (view: string) => void }) => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          AI-Powered IBD Metabolomics Analysis
        </h1>
        <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
          Upload your metabolomics datasets and let our advanced machine learning models identify powerful biomarker candidates, predict diagnosis, and generate interpretable biological insights.
        </p>
        
        <div className="flex justify-center gap-4">
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentView('upload')}>
            Upload Dataset <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-8 text-center" style={{ marginTop: '3rem' }}>
        <h3 className="section-title" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>How it works</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div className="badge badge-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '8px' }}>Upload</div>
          <ArrowRight className="text-muted" />
          <div className="badge badge-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '8px' }}>Analyze</div>
          <ArrowRight className="text-muted" />
          <div className="badge badge-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '8px' }}>Interpret</div>
          <ArrowRight className="text-muted" />
          <div className="badge badge-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '8px' }}>Report</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2" style={{ marginTop: '5rem' }}>
        <div className="card">
          <Activity className="text-success mb-4" size={32} />
          <h3 className="mb-2">Automated Analysis</h3>
          <p className="text-secondary">Robust statistical testing, missing value imputation, and log2-transformation executed instantly.</p>
        </div>
        <div className="card">
          <Beaker className="text-primary mb-4" size={32} style={{ color: 'var(--accent-primary)' }} />
          <h3 className="mb-2">Biomarker Discovery</h3>
          <p className="text-secondary">Identify highly significant candidate metabolites using False Discovery Rate and robust fold changes.</p>
        </div>
        <div className="card">
          <Network className="text-warning mb-4" size={32} />
          <h3 className="mb-2">Machine Learning</h3>
          <p className="text-secondary">Simultaneously train Random Forest, XGBoost, and SVM models to predict disease state.</p>
        </div>
        <div className="card">
          <FileText className="text-danger mb-4" size={32} />
          <h3 className="mb-2">Research Reports</h3>
          <p className="text-secondary">Export dynamically generated, scientifically robust, fully formatted PDF reports.</p>
        </div>
      </div>
    </div>
  );
};
