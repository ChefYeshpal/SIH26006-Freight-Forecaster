import { useState } from 'react'
import { ShipIcon, TrendingUpIcon, SlidersIcon, ArrowRightIcon, ActivityIcon } from './Icons'
import LoadingSkeleton from './LoadingSkeleton'
import { API_BASE } from '../constants'

const DEFAULT_IRON_ORE = 104
const DEFAULT_PORT_WAIT = 4.5

export default function Forecast() {
  const [route, setRoute] = useState('C5')
  const [horizon, setHorizon] = useState('7')
  const [ironOre, setIronOre] = useState(String(DEFAULT_IRON_ORE))
  const [portWait, setPortWait] = useState(String(DEFAULT_PORT_WAIT))
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const routes = [
    { id: 'C5', label: 'Route C5', desc: 'W. Australia → India', icon: '🇦🇺' },
    { id: 'C3', label: 'Route C3', desc: 'Brazil → India', icon: '🇧🇷' },
    { id: 'BCI', label: 'BCI Index', desc: 'Overall Capesize', icon: '🌐' },
  ]

  const horizons = [
    { value: '7', label: '7 Days', desc: 'Short-term' },
    { value: '14', label: '14 Days', desc: 'Medium-term' },
    { value: '30', label: '30 Days', desc: 'Long-term' },
  ]

  async function runForecast() {
    setError('')
    setLoading(true)

    const scenario_overrides = {}
    const ironOreVal = parseFloat(ironOre)
    const portWaitVal = parseFloat(portWait)

    if (ironOreVal !== DEFAULT_IRON_ORE) {
      scenario_overrides.iron_ore_price_usd = ironOreVal
    }
    if (portWaitVal !== DEFAULT_PORT_WAIT) {
      scenario_overrides.port_congestion_east_india_days = portWaitVal
    }

    const body = {
      horizon_days: parseInt(horizon, 10),
      route: route,
      scenario_overrides: Object.keys(scenario_overrides).length > 0 ? scenario_overrides : null,
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`API returned status ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(`Error: ${err.message}`)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getSignalColor = (action) => {
    if (action === 'CHARTER_NOW') return 'signal-green'
    if (action === 'WAIT') return 'signal-red'
    return 'signal-gray'
  }

  return (
    <div className="forecast-page">
      <div className="forecast-header">
        <h2>
          <ShipIcon size={24} />
          Interactive Rate Forecast & Simulation Engine
        </h2>
        <p className="forecast-subtitle">
          Configure forecasting horizon, shipping route, and simulate market shock overrides.
        </p>
      </div>

      <div className="forecast-layout">
        {/* Config Panel */}
        <div className="forecast-config">
          {/* Route Selector */}
          <div className="forecast-section">
            <label className="forecast-label">Shipping Route</label>
            <div className="forecast-route-pills">
              {routes.map((r) => (
                <button
                  key={r.id}
                  className={`forecast-pill ${route === r.id ? 'active' : ''}`}
                  onClick={() => setRoute(r.id)}
                >
                  <span className="forecast-pill-icon">{r.icon}</span>
                  <div className="forecast-pill-text">
                    <span className="forecast-pill-label">{r.label}</span>
                    <span className="forecast-pill-desc">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Horizon Selector */}
          <div className="forecast-section">
            <label className="forecast-label">Forecast Horizon</label>
            <div className="forecast-horizon-pills">
              {horizons.map((h) => (
                <button
                  key={h.value}
                  className={`forecast-horizon-pill ${horizon === h.value ? 'active' : ''}`}
                  onClick={() => setHorizon(h.value)}
                >
                  <span>{h.label}</span>
                  <span className="forecast-horizon-desc">{h.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Overrides */}
          <div className="forecast-section">
            <label className="forecast-label">
              <SlidersIcon size={16} />
              What-If Scenario Overrides
            </label>

            <div className="forecast-slider-group">
              <div className="forecast-slider">
                <div className="forecast-slider-header">
                  <span>Iron Ore Price</span>
                  <span className="forecast-slider-value">${ironOre}/tonne</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={ironOre}
                  onChange={(e) => setIronOre(e.target.value)}
                  className="forecast-range"
                  style={{ '--progress': `${((ironOre - 50) / 150) * 100}%` }}
                />
                <div className="forecast-slider-labels">
                  <span>$50</span>
                  <span>$200</span>
                </div>
              </div>

              <div className="forecast-slider">
                <div className="forecast-slider-header">
                  <span>Port Wait Days</span>
                  <span className="forecast-slider-value">{portWait} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={portWait}
                  onChange={(e) => setPortWait(e.target.value)}
                  className="forecast-range"
                  style={{ '--progress': `${(portWait / 15) * 100}%` }}
                />
                <div className="forecast-slider-labels">
                  <span>0 days</span>
                  <span>15 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            className={`forecast-run-btn ${loading ? 'loading' : ''}`}
            onClick={runForecast}
            disabled={loading}
          >
            {loading ? (
              <span className="forecast-run-spinner" />
            ) : (
              <>
                <ActivityIcon size={18} />
                <span>Run Forecast</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>

          {error && <div className="forecast-error-box">{error}</div>}
        </div>

        {/* Results Panel */}
        <div className="forecast-results">
          {!result && !loading && (
            <div className="forecast-empty">
              <ShipIcon size={48} />
              <h3>Configure & Run</h3>
              <p>Select a route and horizon, then click "Run Forecast" to generate AI predictions.</p>
            </div>
          )}

          {loading && <LoadingSkeleton variant="card" count={2} />}

          {result && !loading && (
            <div className="forecast-result-cards">
              {/* Action Signal */}
              <div className="forecast-signal-card">
                <div className="forecast-signal-top">
                  <span className="forecast-signal-label">Recommended Charter Action</span>
                  <span className={`forecast-signal-urgency urgency-${result.recommendation?.urgency?.toLowerCase()}`}>
                    {result.recommendation?.urgency} Urgency
                  </span>
                </div>
                <div className={`forecast-signal-badge ${getSignalColor(result.recommendation?.action)}`}>
                  {result.recommendation?.action || '--'}
                </div>
                <p className="forecast-signal-rationale">
                  {result.recommendation?.rationale}
                </p>
              </div>

              {/* Prediction Card */}
              <div className="forecast-prediction-card">
                <div className="forecast-pred-header">
                  <span>AI Forecast — {result.target_metric}</span>
                  <span className="forecast-pred-date">{result.date_evaluated}</span>
                </div>

                <div className="forecast-pred-main">
                  <div className="forecast-pred-value">
                    ${result.predicted_rate?.toFixed(2)}
                  </div>
                  <div className={`forecast-pred-change ${result.expected_change_pct > 0 ? 'up' : 'down'}`}>
                    {result.expected_change_pct > 0 ? '▲' : '▼'} {Math.abs(result.expected_change_pct)?.toFixed(2)}%
                  </div>
                </div>

                {/* Confidence gauge */}
                <div className="forecast-gauge">
                  <div className="forecast-gauge-track">
                    <div className="forecast-gauge-lower"
                      style={{ left: '0%', width: '100%' }}
                    />
                    <div className="forecast-gauge-marker forecast-gauge-current"
                      style={{ left: '30%' }}
                      title={`Current: $${result.current_spot_rate?.toFixed(2)}`}
                    >
                      <span>Current</span>
                    </div>
                    <div className="forecast-gauge-marker forecast-gauge-predicted"
                      style={{ left: '65%' }}
                      title={`Predicted: $${result.predicted_rate?.toFixed(2)}`}
                    >
                      <span>Predicted</span>
                    </div>
                  </div>
                  <div className="forecast-gauge-labels">
                    <span>${result.confidence_interval_95pct?.lower?.toFixed(2)}</span>
                    <span className="forecast-gauge-ci">95% Confidence Interval</span>
                    <span>${result.confidence_interval_95pct?.upper?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="forecast-pred-stats">
                  <div className="forecast-pred-stat">
                    <span className="forecast-pred-stat-label">Current Spot</span>
                    <span className="forecast-pred-stat-value">${result.current_spot_rate?.toFixed(2)}</span>
                  </div>
                  <div className="forecast-pred-stat">
                    <span className="forecast-pred-stat-label">Predicted</span>
                    <span className="forecast-pred-stat-value">${result.predicted_rate?.toFixed(2)}</span>
                  </div>
                  <div className="forecast-pred-stat">
                    <span className="forecast-pred-stat-label">CI Lower</span>
                    <span className="forecast-pred-stat-value">${result.confidence_interval_95pct?.lower?.toFixed(2)}</span>
                  </div>
                  <div className="forecast-pred-stat">
                    <span className="forecast-pred-stat-label">CI Upper</span>
                    <span className="forecast-pred-stat-value">${result.confidence_interval_95pct?.upper?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Raw JSON Toggle */}
              <button className="forecast-raw-toggle" onClick={() => setShowRaw(!showRaw)}>
                {showRaw ? 'Hide' : 'Show'} Raw JSON Response
              </button>
              {showRaw && (
                <pre className="forecast-raw-json">{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}