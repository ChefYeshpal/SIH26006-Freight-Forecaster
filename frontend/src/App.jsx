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
import CommandPalette from './components/CommandPalette'
import AlarmModal from './components/AlarmModal'
import AlarmToast from './components/AlarmToast'
import { useAlarms } from './hooks/useAlarms'
import { API_BASE } from './constants'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('ff_auth') === 'true')
  const [currentPage, setCurrentPage] = useState('landing')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [alarmModalOpen, setAlarmModalOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState('Checking backend microservice...')

  // Alarm System Hook
  const alarmState = useAlarms(isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn) return

    let isMounted = true
    let retryTimer = null

    async function verifyHealth(isInitial = false) {
      const currentTarget = String(API_BASE).replace(/\/+$/, '')
      try {
        const res = await fetch(`${currentTarget}/health`)
        if (!isMounted) return

        if (!res.ok) {
          setBackendStatus(`API returned HTTP ${res.status} at ${currentTarget}/health`)
          return
        }

        const data = await res.json()
        if (data.status === 'healthy') {
          setBackendStatus(`API Online (Models: ${data.models_available?.join(', ') || 'Ready'})`)
        } else {
          setBackendStatus(`API Degraded: ${data.status} at ${currentTarget}`)
        }
      } catch (err) {
        if (!isMounted) return
        const isMixed = typeof window !== 'undefined' && window.location.protocol === 'https:' && currentTarget.startsWith('http:')
        if (isMixed) {
          setBackendStatus(`Blocked: HTTPS site cannot call HTTP (${currentTarget})`)
        } else {
          setBackendStatus(`Offline: ${err.message || 'Network error'} (${currentTarget})`)
        }

        // If initial check failed (server might be cold-starting on Render), retry in 3s
        if (isInitial) {
          retryTimer = setTimeout(() => verifyHealth(false), 3000)
        }
      }
    }

    verifyHealth(true)
    const interval = setInterval(() => verifyHealth(false), 8000)

    return () => {
      isMounted = false
      clearInterval(interval)
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [isLoggedIn])

  async function checkHealth() {
    const currentTarget = String(API_BASE).replace(/\/+$/, '')
    setBackendStatus(`Pinging ${currentTarget}...`)
    try {
      const res = await fetch(`${currentTarget}/health`)
      if (!res.ok) {
        setBackendStatus(`HTTP ${res.status} from ${currentTarget}/health`)
        return
      }
      const data = await res.json()
      if (data.status === 'healthy') {
        setBackendStatus(`API Online (Models: ${data.models_available?.join(', ') || 'Ready'})`)
      } else {
        setBackendStatus(`API Degraded: ${data.status}`)
      }
    } catch (err) {
      const isMixed = typeof window !== 'undefined' && window.location.protocol === 'https:' && currentTarget.startsWith('http:')
      if (isMixed) {
        setBackendStatus(`Blocked: HTTPS site cannot call HTTP (${currentTarget})`)
      } else {
        setBackendStatus(`Offline: ${err.message || 'Failed to fetch'} (${currentTarget})`)
      }
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
        onCheckHealth={checkHealth}
      />

      <div className="main-area">
        <Topbar
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
          onNavigate={setCurrentPage}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          alarmCount={alarmState.triggered.length}
          onOpenAlarms={() => setAlarmModalOpen(true)}
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

      {/* Alarm System Modal & Live Toasts */}
      <AlarmModal
        isOpen={alarmModalOpen}
        onClose={() => setAlarmModalOpen(false)}
        alarmState={alarmState}
      />
      <AlarmToast
        triggered={alarmState.triggered}
        onOpenModal={() => setAlarmModalOpen(true)}
        onDismiss={alarmState.dismissTrigger}
      />

      {/* Floating Chat Widget */}
      <ChatWidget />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
      />
    </div>
  )
}