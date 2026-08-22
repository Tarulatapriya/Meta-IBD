import { useEffect, useState } from 'react'
import { Topbar } from './components/layout/Topbar'
import { Sidebar } from './components/layout/Sidebar'
import { LandingPage } from './components/views/LandingPage'
import { UploadView } from './components/views/UploadView'
import { 
  OverviewView, PCAView, DifferentialView, BiomarkerView, 
  MLView, ExplainableView, PathwayView, ReportView 
} from './components/views/AnalysisViews'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [theme, setTheme] = useState('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [datasetName, setDatasetName] = useState('None')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const checkStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/status')
      if (res.ok) {
        const data = await res.json()
        if (data.dataset && data.dataset !== "None") {
          setHasData(true)
          setDatasetName(data.dataset)
          fetchDashboardData()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/dashboard')
      if (res.ok) {
        setDashboardData(await res.json())
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    checkStatus()
    const int = setInterval(checkStatus, 5000)
    return () => clearInterval(int)
  }, [])

  const handleUploadSuccess = () => {
    checkStatus()
    setCurrentView('overview')
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing': return <LandingPage setCurrentView={setCurrentView} />
      case 'upload': return <UploadView onUploadSuccess={handleUploadSuccess} />
      case 'overview': return <OverviewView data={dashboardData} />
      case 'pca': return <PCAView data={dashboardData} />
      case 'differential': return <DifferentialView data={dashboardData} />
      case 'biomarkers': return <BiomarkerView data={dashboardData} />
      case 'ml': return <MLView data={dashboardData} />
      case 'explainable': return <ExplainableView data={dashboardData} />
      case 'pathway': return <PathwayView data={dashboardData} />
      case 'report': return <ReportView />
      default: return <LandingPage setCurrentView={setCurrentView} />
    }
  }

  if (currentView === 'landing') {
    return (
      <div className="app-container">
        <Topbar theme={theme} toggleTheme={toggleTheme} toggleSidebar={() => {}} datasetName={""} />
        <div className="main-layout" style={{ overflowY: 'auto' }}>
          <div className="content-area">
            {renderView()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Topbar theme={theme} toggleTheme={toggleTheme} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} datasetName={datasetName} />
      <div className="main-layout">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          hasData={hasData}
        />
        <div className="content-area">
          {renderView()}
        </div>
      </div>
    </div>
  )
}

export default App
