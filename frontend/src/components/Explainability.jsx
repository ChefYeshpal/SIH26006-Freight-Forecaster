import { useState, useEffect } from 'react'
import { FEATURE_LABELS, API_BASE } from '../constants'
import { CpuIcon, TrendingUpIcon, SearchCheckIcon } from './Icons'
import LoadingSkeleton from './LoadingSkeleton'
import useScrollAnimation from '../hooks/useScrollAnimation'

export default function Explainability() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const { ref: driversRef, isVisible: driversVisible } = useScrollAnimation({ threshold: 0.1 })

  useEffect(() => {
    fetchExplainability()
  }, [])

  async function fetchExplainability() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/v1/explainability`)
      if (!res.ok) throw new Error(`API returned status ${res.status}`)
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFeatureLabel = (feature) => FEATURE_LABELS[feature] || feature

  if (loading) {
    return (
      <div className="explain-page">
        <div className="explain-header">
          <h2><CpuIcon size={24} /> Explainable AI & SHAP Market Attribution</h2>
        </div>
        <LoadingSkeleton variant="card" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="explain-page">
        <div className="explain-header">
          <h2><CpuIcon size={24} /> Explainable AI & SHAP Market Attribution</h2>
        </div>
        <div className="explain-error">{error}</div>
      </div>
    )
  }

  if (!data) return null

  const decision = data.procurement_decision || {}
  const bullish = data.bullish_drivers_raising_freight || []
  const bearish = data.bearish_drivers_lowering_freight || []
  const topFactors = data.top_overall_factors || []

  // Find max absolute SHAP for bar scaling
  const allDrivers = [...bullish, ...bearish]
  const maxShap = Math.max(...allDrivers.map((d) => Math.abs(d.shap_impact || 0)), 1)

  return (
    <div className="explain-page">
      <div className="explain-header">
        <h2>
          <CpuIcon size={24} />
          Explainable AI & SHAP Market Attribution
        </h2>
        <p className="explain-subtitle">
          Inspect how commodity prices, fuel costs, and port wait hours mathematically drive freight predictions.
        </p>
      </div>

      <div className="explain-overview">
      {/* Decision Banner */}
      <div className="explain-decision-card">
        <div className="explain-decision-top">
          <span className="explain-decision-label">Procurement Decision</span>
          <span className={`explain-urgency urgency-${decision.urgency?.toLowerCase()}`}>
            {decision.urgency} Urgency
          </span>
        </div>
        <div className={`explain-action-badge ${decision.color === 'green' ? 'green' : decision.color === 'red' ? 'red' : 'gray'}`}>
          {decision.action || '--'}
        </div>
        <p className="explain-rationale">{decision.rationale}</p>
      </div>

      {/* SHAP Charts */}
      {(data.summary_chart_url || data.waterfall_chart_url) && (
        <div className="explain-charts">
          <h3><SearchCheckIcon size={18} /> SHAP Feature Importance Charts</h3>
          <div className="explain-charts-grid">
            {data.summary_chart_url && (
              <div className="explain-chart-card">
                <span className="explain-chart-title">Summary Chart (Top Features)</span>
                <img
                  src={`${API_BASE}${data.summary_chart_url}`}
                  alt="SHAP Summary Plot"
                  className="explain-chart-img"
                />
              </div>
            )}
            {data.waterfall_chart_url && (
              <div className="explain-chart-card">
                <span className="explain-chart-title">Waterfall Chart (Feature Breakdown)</span>
                <img
                  src={`${API_BASE}${data.waterfall_chart_url}`}
                  alt="SHAP Waterfall Plot"
                  className="explain-chart-img"
                />
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Animated SHAP Bar Chart */}
      <div ref={driversRef} className={`explain-drivers ${driversVisible ? 'visible' : ''}`}>
        {/* Bullish Drivers */}
        {bullish.length > 0 && (
          <div className="explain-driver-section">
            <h3 className="explain-driver-heading bullish">
              <TrendingUpIcon size={18} />
              Bullish Drivers (Raising Freight Rates)
            </h3>
            <div className="explain-bars">
              {bullish.map((driver, idx) => (
                <div key={idx} className="explain-bar-row" style={{ '--stagger': idx }}>
                  <div className="explain-bar-label">
                    <span className="explain-bar-feature">{getFeatureLabel(driver.feature)}</span>
                    <span className="explain-bar-value">
                      Val: {driver.current_value?.toFixed(2)} • SHAP: +{driver.shap_impact?.toFixed(2)}
                    </span>
                  </div>
                  <div className="explain-bar-track">
                    <div
                      className={`explain-bar-fill bullish ${driversVisible ? 'animate' : ''}`}
                      style={{
                        '--width': `${(Math.abs(driver.shap_impact) / maxShap) * 100}%`,
                        '--delay': `${idx * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bearish Drivers */}
        {bearish.length > 0 && (
          <div className="explain-driver-section">
            <h3 className="explain-driver-heading bearish">
              <TrendingUpIcon size={18} className="flip-icon" />
              Bearish Drivers (Lowering Freight Rates)
            </h3>
            <div className="explain-bars">
              {bearish.map((driver, idx) => (
                <div key={idx} className="explain-bar-row" style={{ '--stagger': idx }}>
                  <div className="explain-bar-label">
                    <span className="explain-bar-feature">{getFeatureLabel(driver.feature)}</span>
                    <span className="explain-bar-value">
                      Val: {driver.current_value?.toFixed(2)} • SHAP: {driver.shap_impact?.toFixed(2)}
                    </span>
                  </div>
                  <div className="explain-bar-track">
                    <div
                      className={`explain-bar-fill bearish ${driversVisible ? 'animate' : ''}`}
                      style={{
                        '--width': `${(Math.abs(driver.shap_impact) / maxShap) * 100}%`,
                        '--delay': `${idx * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}