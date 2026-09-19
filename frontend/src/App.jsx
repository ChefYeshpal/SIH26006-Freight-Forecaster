import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import LandingPage from './components/LandingPage'
import Forecast from './components/Forecast'
import Explainability from './components/Explainability'
import MarketIntelligence from './components/MarketIntelligence'
import Settings from './components/Settings'
import ChatWidget from './components/ChatWidget'
import { API_BASE } from './constants'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('ff_auth') === 'true')
  const [currentPage, setCurrentPage] = useState('landing')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [backendStatus, setBackendStatus] = useState('Checking backend microservice...')

  useEffect(() => {
    if (isLoggedIn) {
      checkHealth()
    }
  }, [isLoggedIn])

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`)
      const data = await res.json()
      if (data.status === 'healthy') {
        setBackendStatus(`API Online (Models: ${data.models_available.join(', ')})`)
      } else {
        setBackendStatus('API responded with degraded health status.')
      }
    } catch {
      setBackendStatus('Backend offline. Run python run_api.py (see README).')
    }
  }

  function handleLogin() {
    setIsLoggedIn(true)
  }

  function handleLogout() {
    localStorage.removeItem('ff_auth')
    setIsLoggedIn(false)
    setCurrentPage('landing')
  }

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Main dashboard shell
  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        backendStatus={backendStatus}
      />

      <div className="main-area">
        <Topbar
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
          onNavigate={setCurrentPage}
        />

        <main className={`content-container content-${currentPage}`}>
          {currentPage === 'landing' && (
            <LandingPage onNavigate={setCurrentPage} backendStatus={backendStatus} />
          )}
          {currentPage === 'forecast' && (
            <div className="page-surface page-surface-forecast">
              <Forecast />
            </div>
          )}
          {currentPage === 'explainability' && (
            <div className="page-surface page-surface-explainability">
              <Explainability />
            </div>
          )}
          {currentPage === 'market' && (
            <div className="page-surface page-surface-market">
              <MarketIntelligence />
            </div>
          )}
          {currentPage === 'settings' && (
            <div className="page-surface page-surface-settings">
              <Settings />
            </div>
          )}
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  )
}