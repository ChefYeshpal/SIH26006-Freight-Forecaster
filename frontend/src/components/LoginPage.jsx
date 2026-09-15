import { useState } from 'react'
import { ShipIcon } from './Icons'
import { DEMO_CREDENTIALS } from '../constants'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200))

    if (
      email === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      localStorage.setItem('ff_auth', 'true')
      if (rememberMe) {
        localStorage.setItem('ff_remember', email)
      }
      onLogin()
    } else {
      setError('Invalid credentials. Use the demo account below.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }

    setLoading(false)
  }

  return (
    <div className="login-screen">
      {/* Animated ocean background layers */}
      <div className="login-bg-layer">
        <div className="login-wave login-wave-1" />
        <div className="login-wave login-wave-2" />
        <div className="login-wave login-wave-3" />
        <div className="login-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="login-particle"
              style={{
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
                '--duration': `${3 + Math.random() * 4}s`,
                '--delay': `${Math.random() * 3}s`,
                '--size': `${2 + Math.random() * 4}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className={`login-card ${shake ? 'login-shake' : ''}`}>
        <section className="login-visual-panel" aria-label="Freight intelligence platform">
          <div className="login-brand">
            <div className="login-logo">
              <ShipIcon size={32} />
            </div>
            <p className="login-kicker">MINISTRY OF STEEL</p>
            <h1 className="login-title">
              FREIGHT<span className="login-title-accent">FORECASTER</span>
            </h1>
            <p className="login-subtitle">
              Maritime intelligence for confident cargo decisions.
            </p>
          </div>

          <div className="login-route-map" aria-hidden="true">
            <span className="login-route-label login-route-origin">MUMBAI</span>
            <span className="login-route-label login-route-destination">ROTTERDAM</span>
            <span className="login-route-node login-route-node-origin" />
            <span className="login-route-node login-route-node-destination" />
            <span className="login-route-line login-route-line-one" />
            <span className="login-route-line login-route-line-two" />
            <span className="login-route-vessel"><ShipIcon size={18} /></span>
          </div>

          <div className="login-metrics" aria-hidden="true">
            <div><strong>24 / 7</strong><span>Market watch</span></div>
            <div><strong>36 mo</strong><span>Forecast horizon</span></div>
            <div><strong>Global</strong><span>Route coverage</span></div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-heading">
            <p className="login-panel-kicker">SECURE WORKSPACE</p>
            <h2>Sign in to continue</h2>
            <p>Access forecasts, market signals, and route intelligence.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
          <div className={`login-field ${email ? 'has-value' : ''}`}>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label htmlFor="login-email">Email Address</label>
            <div className="login-field-line" />
          </div>

          <div className={`login-field ${password ? 'has-value' : ''}`}>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label htmlFor="login-password">Password</label>
            <div className="login-field-line" />
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-mark" aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-options">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-check-mark" />
              <span>Remember me</span>
            </label>
            <button type="button" className="login-forgot">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className={`login-submit ${loading ? 'is-loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="login-spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
          </form>

          <div className="login-demo-hint">
            <span className="login-demo-tag">DEMO ACCESS</span>
            <div className="login-demo-creds">
              <span><strong>Email:</strong> {DEMO_CREDENTIALS.email}</span>
              <span><strong>Pass:</strong> {DEMO_CREDENTIALS.password}</span>
            </div>
          </div>

          <div className="login-footer">
            <span>SIH26006</span>
            <span>Intelligent Freight Forecasting</span>
          </div>
        </section>
      </div>
    </div>
  )
}
