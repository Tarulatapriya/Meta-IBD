import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Activity } from 'lucide-react';

interface UploadViewProps {
  onUploadSuccess: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        onUploadSuccess();
      } else {
        const errorText = await response.text();
        alert(`Analysis Failed:\n\n${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Network Error:\n\n${err}`);
    }
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title">Upload Dataset</h2>
      <p className="section-subtitle">Provide your untargeted or targeted metabolomics peak intensity table.</p>

      <div 
        className="upload-zone mb-6" 
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={64} className="text-muted mb-4" style={{ margin: '0 auto' }} />
        <h3 className="mb-2">Drag & drop your metabolomics dataset here</h3>
        <p className="text-secondary mb-4">Supported formats: .csv, .txt, .tsv</p>
        <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Browse Files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".csv,.txt,.tsv"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="card mb-6 flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--accent-light)', borderRadius: '8px', color: 'var(--accent-primary)', display: 'flex' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{file.name}</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {uploading && <div className="text-secondary">Analyzing dataset...</div>}
            <button 
              className="btn btn-primary" 
              onClick={startAnalysis}
              disabled={uploading}
            >
              {uploading ? 'Processing...' : 'Start Analysis'}
            </button>
          </div>
        </div>
      )}
      
      {/* Loading States Example */}
      {uploading && (
        <div className="card">
          <h3 className="mb-4">Analysis Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}><CheckCircle size={18} /> Preparing dataset</div>
             <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}><CheckCircle size={18} /> Performing quality control</div>
             <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}><Activity size={18} /> Running statistical analysis...</div>
          </div>
        </div>
      )}
    </div>
  );
};
