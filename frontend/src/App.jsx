import { useState, useEffect } from 'react'
import Forecast from './components/Forecast'
import Explainability from './components/Explainability'

const API_BASE = "http://localhost:8000"

export default function App() {
  const [currentPage, setCurrentPage] = useState('forecast')
  const [backendStatus, setBackendStatus] = useState('Checking backend...')

  useEffect(() => {
    checkHealth()
  }, [])

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`)
      const data = await res.json()
      if (data.status === "healthy") {
        {/* add colours later on, green -> connected, yellow -> not healthy, red -> not reachable */}
        setBackendStatus(`Backend connected (models: ${data.models_available.join(", ")})`)
      } else {
        setBackendStatus("Backend responded but not healthy.")
      }
    } catch (err) {
      setBackendStatus("Backend not reachable. You might need to run_api.py running first (see README).")
    }
  }

  return (
    <div className="app-container">
      <h1>Freight Forecast</h1>
      <p id="status">{backendStatus}</p>
      <hr />

      {/* Navigation */}
      <div className="nav-tabs">
        <button
          className={`nav-button ${currentPage === 'forecast' ? 'active' : ''}`}
          onClick={() => setCurrentPage('forecast')}
        >
          Forecast
        </button>
        <button
          className={`nav-button ${currentPage === 'explainability' ? 'active' : ''}`}
          onClick={() => setCurrentPage('explainability')}
        >
          Explainability
        </button>
      </div>

      <hr />

      {/* Page content */}
      {currentPage === 'forecast' && <Forecast apiBase={API_BASE} />}
      {currentPage === 'explainability' && <Explainability apiBase={API_BASE} />}
    </div>
  )
}