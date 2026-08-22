import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';

interface TopbarProps {
  theme: string;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  datasetName: string;
}

export const Topbar: React.FC<TopbarProps> = ({ theme, toggleTheme, toggleSidebar, datasetName }) => {
  return (
    <div className="topbar">
      <div className="flex items-center gap-4">
        <button className="theme-toggle" onClick={toggleSidebar} style={{ display: 'none' /* handled by media query later if needed, or always show on mobile */ }}>
          <Menu size={20} />
        </button>
        <div className="topbar-logo">
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>MI</div>
          MetaIBD
        </div>
        {datasetName && datasetName !== "None" && (
          <div className="badge badge-primary" style={{ marginLeft: '1rem' }}>
            {datasetName}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};
