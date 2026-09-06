import { useState } from 'react'

// dev vals for initial setup
const DEFAULT_IRON_ORE = 104
const DEFAULT_PORT_WAIT = 4.5

export default function Forecast({ apiBase }) {
  const [route, setRoute] = useState('C5')
  const [horizon, setHorizon] = useState('7')
  const [ironOre, setIronOre] = useState(String(DEFAULT_IRON_ORE))
  const [portWait, setPortWait] = useState(String(DEFAULT_PORT_WAIT))
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runForecast() {
    setError('')
    setLoading(true)

    // Build scenario_overrides: only include fields that have changed from defaults
    // Per the API documentation "Frontend Tip": only include fields user explicitly changed
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
      const res = await fetch(`${apiBase}/api/v1/predict`, {
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

  // Get badge color based on recommendation color
  const getActionBadgeColor = (color) => {
    if (color === 'green') return '#2ccc71'
    if (color === 'red') return '#e74c3c'
    return '#95a5a6' // gray
  }

  // Get text color for action badge
  const getActionTextColor = (color) => {
    return '#fff'
  }

  return (
    <div>
      <h2>Forecast Request</h2>

      <label>Route</label>
      <select value={route} onChange={(e) => setRoute(e.target.value)}>
        <option value="C5">Route C5 (W. Australia → India)</option>
        <option value="C3">Route C3 (Brazil → India)</option>
        <option value="BCI">Route BCI (Overall Capesize Index)</option>
      </select>

      <label>Forecast Horizon</label>
      <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
        <option value="7">7 days</option>
        <option value="14">14 days</option>
        <option value="30">30 days</option>
      </select>

      <label>Iron Ore Price (${ironOre}/tonne)</label>
      <input
        type="range"
        min="50"
        max="200"
        value={ironOre}
        onChange={(e) => setIronOre(e.target.value)}
      />

      <label>Port Wait Days ({portWait} days)</label>
      <input
        type="range"
        min="0"
        max="15"
        step="0.5"
        value={portWait}
        onChange={(e) => setPortWait(e.target.value)}
      />

      <button onClick={runForecast} disabled={loading}>
        {loading ? 'Running Forecast...' : 'Run Forecast'}
      </button>
      {error && <p className="forecast-error">{error}</p>}

      <hr />

      {/* Results section */}
      {result && (
        <div className="output-selection">
          <h2>Recommendation</h2>

          {/* Action badge with color */}
          <p style={{ marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: getActionBadgeColor(result.recommendation?.color),
                color: getActionTextColor(result.recommendation?.color),
                borderRadius: '4px',
                fontWeight: 'bold',
                marginRight: '8px',
              }}
            >
              {result.recommendation?.action || '--'}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              ({result.recommendation?.urgency || '--'} urgency)
            </span>
          </p>

          <p>
            <strong>Rationale:</strong> {result.recommendation?.rationale || 'N/A'}
          </p>

          {/* Predicted rate as headline */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px 0' }}>
              AI Forecast
            </p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              ${result.predicted_rate?.toFixed(2) || '--'}
            </p>

            {/* Change percentage badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: result.expected_change_pct > 0 ? '#d5f4e6' : '#fadbd8',
                color: result.expected_change_pct > 0 ? '#27ae60' : '#c0392b',
                borderRadius: '3px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              {result.expected_change_pct > 0 ? '+' : ''}
              {result.expected_change_pct?.toFixed(2) || '0'}%
            </span>
          </div>

          <p>
            <strong>Current Spot Rate:</strong> ${result.current_spot_rate?.toFixed(2) || '--'}
          </p>

          <p>
            <strong>95% Confidence Range:</strong> [
            ${result.confidence_interval_95pct?.lower?.toFixed(2) || '--'} –{' '}
            ${result.confidence_interval_95pct?.upper?.toFixed(2) || '--'}]
          </p>

          <details>
            <summary>Raw JSON Response</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}