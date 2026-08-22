import React from 'react';
import { 
  Home, Upload, Activity, Layers, Droplets, FlaskConical, Network, FileText, ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  hasData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, collapsed, setCollapsed, hasData }) => {
  const menuItems = [
    { id: 'landing', label: 'Home', icon: Home, requiresData: false },
    { id: 'upload', label: 'Upload Dataset', icon: Upload, requiresData: false },
    { id: 'overview', label: 'Analysis Overview', icon: Activity, requiresData: true },
    { id: 'pca', label: 'PCA & Clustering', icon: Layers, requiresData: true },
    { id: 'differential', label: 'Differential Analysis', icon: BarChart2, requiresData: true },
    { id: 'biomarkers', label: 'Biomarkers', icon: Droplets, requiresData: true },
    { id: 'ml', label: 'Machine Learning', icon: FlaskConical, requiresData: true },
    { id: 'explainable', label: 'Explainable AI', icon: Network, requiresData: true },
    { id: 'pathway', label: 'Pathway Analysis', icon: Network, requiresData: true },
    { id: 'report', label: 'Final Report', icon: FileText, requiresData: true },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <button className="theme-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {menuItems.map(item => {
          if (item.requiresData && !hasData) return null;
          
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <div 
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
