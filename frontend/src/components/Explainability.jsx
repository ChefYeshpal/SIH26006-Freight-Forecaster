import { useState, useEffect } from 'react'
import { FEATURE_LABELS } from '../constants'

export default function Explainability({ apiBase }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchExplainability()
  }, [])

  async function fetchExplainability() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/v1/explainability`)
      if (!res.ok) throw new Error(`API returned status ${res.status}`)
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Get badge color based on recommendation color
  const getActionBadgeColor = (color) => {
    if (color === 'green') return '#07a529'
    if (color === 'red') return '#e03030'
    return '#95a5a6' // gray
  }

  // Get human-readable feature label
  const getFeatureLabel = (feature) => {
    return FEATURE_LABELS[feature] || feature
  }

  if (loading) {
    return (
      <div>
        <h2>Explainability & SHAP Analysis</h2>
        <p className="placeholder-text">Loading SHAP analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2>Explainability & SHAP Analysis</h2>
        <p className="forecast-error">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <h2>Explainability & SHAP Analysis</h2>
        <p className="placeholder-text">No data available</p>
      </div>
    )
  }

  const decision = data.procurement_decision || {}
  const bullish = data.bullish_drivers_raising_freight || []
  const bearish = data.bearish_drivers_lowering_freight || []

  return (
    <div>
      <h2>Explainability & SHAP Analysis</h2>

      {/* Procurement Decision Banner */}
      <div className="output-selection" style={{ marginTop: '16px', marginBottom: '20px' }}>
        <p style={{ marginBottom: '12px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: getActionBadgeColor(decision.color),
              color: '#fff',
              borderRadius: '4px',
              fontWeight: 'bold',
              marginRight: '8px',
            }}
          >
            {decision.action || '--'}
          </span>
          <span style={{ color: '#666', fontSize: '14px' }}>
            ({decision.urgency || '--'} urgency)
          </span>
        </p>
        <p>
          <strong>Rationale:</strong> {decision.rationale || 'N/A'}
        </p>
      </div>

      {/* SHAP Charts */}
      {(data.summary_chart_url || data.waterfall_chart_url) && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', color: '#222' }}>
            SHAP Feature Importance Charts
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.summary_chart_url && (
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  <strong>Summary Chart (Top Features)</strong>
                </p>
                <img
                  src={`${apiBase}${data.summary_chart_url}`}
                  alt="SHAP Summary Plot"
                  style={{
                    maxWidth: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}
            {data.waterfall_chart_url && (
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  <strong>Waterfall Chart (Feature Breakdown)</strong>
                </p>
                <img
                  src={`${apiBase}${data.waterfall_chart_url}`}
                  alt="SHAP Waterfall Plot"
                  style={{
                    maxWidth: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bullish Drivers */}
      {bullish.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', color: '#27ae60' }}>
            📈 Bullish Drivers (Raising Freight Rates)
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bullish.map((driver, idx) => (
              <li
                key={idx}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #d1fae5',
                  borderRadius: '4px',
                }}
              >
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#1f2937' }}>
                  {getFeatureLabel(driver.feature)}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  Current Value: <strong>{driver.current_value?.toFixed(2) ?? 'N/A'}</strong>
                </p>
                <p style={{ margin: '0', fontSize: '13px', color: '#27ae60' }}>
                  SHAP Impact: +{driver.shap_impact?.toFixed(2) ?? 'N/A'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bearish Drivers */}
      {bearish.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', color: '#c0392b' }}>
            📉 Bearish Drivers (Lowering Freight Rates)
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bearish.map((driver, idx) => (
              <li
                key={idx}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '4px',
                }}
              >
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#1f2937' }}>
                  {getFeatureLabel(driver.feature)}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  Current Value: <strong>{driver.current_value?.toFixed(2) ?? 'N/A'}</strong>
                </p>
                <p style={{ margin: '0', fontSize: '13px', color: '#c0392b' }}>
                  SHAP Impact: {driver.shap_impact?.toFixed(2) ?? 'N/A'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}