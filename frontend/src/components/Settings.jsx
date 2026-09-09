import { useState } from 'react'
import { DEFAULT_USER_PROFILE, API_BASE } from '../constants'
import { UserIcon, DatabaseIcon, ShipIcon, ActivityIcon } from './Icons'

export default function Settings() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('ff_user') || JSON.stringify(DEFAULT_USER_PROFILE))
  })
  const [apiUrl, setApiUrl] = useState(API_BASE)
  const [apiTestStatus, setApiTestStatus] = useState(null)
  const [apiTesting, setApiTesting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  function saveProfile() {
    localStorage.setItem('ff_user', JSON.stringify(user))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function testApiConnection() {
    setApiTesting(true)
    setApiTestStatus(null)
    try {
      const res = await fetch(`${apiUrl}/health`)
      const data = await res.json()
      if (data.status === 'healthy') {
        setApiTestStatus({ ok: true, message: `Connected — Models: ${data.models_available?.join(', ')}` })
      } else {
        setApiTestStatus({ ok: false, message: 'API responded with degraded status' })
      }
    } catch {
      setApiTestStatus({ ok: false, message: 'Connection failed. Is the server running?' })
    }
    setApiTesting(false)
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
    { id: 'api', label: 'API Config', icon: <DatabaseIcon size={18} /> },
    { id: 'about', label: 'About', icon: <ShipIcon size={18} /> },
  ]

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">Manage your profile, API connection, and application preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`settings-tab ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="settings-section settings-fade-in">
              <h3>User Profile</h3>
              <p className="settings-section-desc">
                Your identity within the FreightForecaster platform.
              </p>

              <div className="settings-avatar-edit">
                <div className="settings-avatar-circle">
                  <span>{user.avatarInitials}</span>
                </div>
                <div className="settings-avatar-info">
                  <span className="settings-avatar-name">{user.name}</span>
                  <span className="settings-avatar-dept">{user.department}</span>
                </div>
              </div>

              <div className="settings-form">
                <div className="settings-field">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>Department</label>
                  <input
                    type="text"
                    value={user.department}
                    onChange={(e) => setUser({ ...user, department: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>Avatar Initials</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={user.avatarInitials}
                    onChange={(e) => setUser({ ...user, avatarInitials: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="settings-actions">
                  <button className="settings-save-btn" onClick={saveProfile}>
                    {saved ? '✓ Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="settings-section settings-fade-in">
              <h3>API Configuration</h3>
              <p className="settings-section-desc">
                Configure the FastAPI backend connection for forecasting and market data.
              </p>

              <div className="settings-form">
                <div className="settings-field">
                  <label>API Endpoint URL</label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                  />
                </div>

                <div className="settings-actions" style={{ gap: '12px' }}>
                  <button
                    className="settings-test-btn"
                    onClick={testApiConnection}
                    disabled={apiTesting}
                  >
                    {apiTesting ? (
                      <><span className="settings-spinner" /> Testing...</>
                    ) : (
                      <><ActivityIcon size={16} /> Test Connection</>
                    )}
                  </button>
                </div>

                {apiTestStatus && (
                  <div className={`settings-test-result ${apiTestStatus.ok ? 'success' : 'error'}`}>
                    <span>{apiTestStatus.ok ? '✓' : '✗'}</span>
                    <span>{apiTestStatus.message}</span>
                  </div>
                )}
              </div>

              <div className="settings-endpoints">
                <h4>Available Endpoints</h4>
                <div className="settings-endpoint-list">
                  <div className="settings-endpoint">
                    <span className="settings-method post">POST</span>
                    <code>/api/v1/predict</code>
                    <span className="settings-endpoint-desc">Multi-horizon freight forecast</span>
                  </div>
                  <div className="settings-endpoint">
                    <span className="settings-method get">GET</span>
                    <code>/api/v1/explainability</code>
                    <span className="settings-endpoint-desc">SHAP analysis & drivers</span>
                  </div>
                  <div className="settings-endpoint">
                    <span className="settings-method get">GET</span>
                    <code>/api/v1/market/snapshot</code>
                    <span className="settings-endpoint-desc">Live market data</span>
                  </div>
                  <div className="settings-endpoint">
                    <span className="settings-method post">POST</span>
                    <code>/api/v1/chat</code>
                    <span className="settings-endpoint-desc">AI maritime copilot</span>
                  </div>
                  <div className="settings-endpoint">
                    <span className="settings-method get">GET</span>
                    <code>/health</code>
                    <span className="settings-endpoint-desc">System health check</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="settings-section settings-fade-in">
              <h3>About FreightForecaster</h3>
              <p className="settings-section-desc">
                System information and model metadata.
              </p>

              <div className="settings-about-grid">
                <div className="settings-about-card">
                  <span className="settings-about-label">System</span>
                  <span className="settings-about-value">SIH26006 Freight Forecaster</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Version</span>
                  <span className="settings-about-value">1.0.0</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Beneficiary</span>
                  <span className="settings-about-value">Ministry of Steel, Govt. of India</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">ML Models</span>
                  <span className="settings-about-value">XGBoost • BiLSTM • Hybrid Ensemble</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Best MAPE</span>
                  <span className="settings-about-value">13.76% (XGBoost)</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Directional Accuracy</span>
                  <span className="settings-about-value">64.75%</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Forecast Horizon</span>
                  <span className="settings-about-value">7 / 14 / 30 Days</span>
                </div>
                <div className="settings-about-card">
                  <span className="settings-about-label">Backend</span>
                  <span className="settings-about-value">FastAPI + Uvicorn</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
