import { useState, useEffect } from 'react'
import { API_BASE } from '../constants'
import { TrendingUpIcon, ActivityIcon, AnchorIcon, ShipIcon, GlobeIcon } from './Icons'
import LoadingSkeleton from './LoadingSkeleton'
import AnimatedCounter from './AnimatedCounter'
import useScrollAnimation from '../hooks/useScrollAnimation'

export default function MarketIntelligence() {
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCountdown, setRefreshCountdown] = useState(60)

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 })

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData()
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [snapRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/market/snapshot`),
        fetch(`${API_BASE}/api/v1/market/history?limit=30`),
      ])
      if (snapRes.ok) {
        setSnapshot(await snapRes.json())
      }
      if (histRes.ok) {
        setHistory(await histRes.json())
      }
      setError('')
    } catch (err) {
      setError('Failed to fetch market data. Ensure API is running.')
    }
    setLoading(false)
  }

  function getTrend(current, field) {
    if (!history || history.length < 2) return null
    const prev = history[history.length - 2]
    if (!prev || !prev[field]) return null
    const change = ((current - prev[field]) / prev[field]) * 100
    return change
  }

  function TrendBadge({ value }) {
    if (value === null || value === undefined) return <span className="market-trend neutral">—</span>
    const isUp = value > 0
    return (
      <span className={`market-trend ${isUp ? 'up' : 'down'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
      </span>
    )
  }

  // Mini sparkline using CSS
  function MiniSparkline({ data, field }) {
    if (!data || data.length < 2) return null
    const values = data.slice(-14).map((d) => d[field]).filter(Boolean)
    if (values.length < 2) return null
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    return (
      <div className="market-sparkline">
        {values.map((v, i) => (
          <div
            key={i}
            className="market-sparkline-bar"
            style={{
              height: `${((v - min) / range) * 100}%`,
              opacity: 0.4 + (i / values.length) * 0.6,
            }}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="market-page">
        <LoadingSkeleton variant="stat" count={4} />
        <LoadingSkeleton variant="card" count={3} />
      </div>
    )
  }

  const marketCards = snapshot ? [
    {
      label: 'Baltic Capesize Index',
      value: snapshot.bci_index,
      unit: 'pts',
      field: 'bci_index',
      icon: <ActivityIcon size={20} />,
      color: 'cyan',
    },
    {
      label: 'Route C5 (Aus → India)',
      value: snapshot.route_c5_usd_per_tonne,
      unit: '$/MT',
      field: 'route_c5_usd_per_tonne',
      icon: <ShipIcon size={20} />,
      color: 'emerald',
    },
    {
      label: 'Route C3 (Brazil → India)',
      value: snapshot.route_c3_usd_per_tonne,
      unit: '$/MT',
      field: 'route_c3_usd_per_tonne',
      icon: <GlobeIcon size={20} />,
      color: 'amber',
    },
    {
      label: 'Iron Ore Price',
      value: snapshot.iron_ore_price_usd,
      unit: '$/t',
      field: 'iron_ore_price_usd',
      icon: <AnchorIcon size={20} />,
      color: 'rose',
    },
    {
      label: 'Brent Crude Oil',
      value: snapshot.brent_crude_usd,
      unit: '$/bbl',
      field: 'brent_crude_usd',
      icon: <TrendingUpIcon size={20} />,
      color: 'blue',
    },
    {
      label: 'VLSFO Bunker Fuel',
      value: snapshot.bunker_fuel_vlsfo_usd,
      unit: '$/t',
      field: 'bunker_fuel_vlsfo_usd',
      icon: <ActivityIcon size={20} />,
      color: 'purple',
    },
  ] : []

  const contextCards = snapshot ? [
    { label: 'Coking Coal', value: `$${snapshot.coking_coal_price_usd?.toFixed(2)}`, desc: 'Per tonne' },
    { label: 'Port Wait (East India)', value: `${snapshot.port_congestion_east_india_days?.toFixed(1)} days`, desc: 'Paradip / Vizag avg' },
    { label: 'China Manufacturing PMI', value: snapshot.china_manufacturing_pmi?.toFixed(1), desc: 'Demand indicator' },
    { label: 'USD / INR', value: `₹${snapshot.usd_inr?.toFixed(2)}`, desc: 'Exchange rate' },
    { label: 'Baltic Dry Index', value: snapshot.bdi_index?.toFixed(0), desc: 'Overall dry bulk' },
    { label: 'Latest Date', value: snapshot.latest_date, desc: 'Assessment date' },
  ] : []

  return (
    <div className="market-page">
      <div ref={headerRef} className={`market-header ${headerVisible ? 'visible' : ''}`}>
        <div className="market-header-left">
          <h2>Market Intelligence</h2>
          <p className="market-subtitle">
            Real-time maritime commodity and freight rate monitoring
          </p>
        </div>
        <div className="market-header-right">
          <div className="market-refresh">
            <div className="market-refresh-ring">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="16" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"
                  strokeDasharray="100" strokeDashoffset={100 - (refreshCountdown / 60) * 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="market-refresh-num">{refreshCountdown}s</span>
            </div>
            <button className="market-refresh-btn" onClick={() => { fetchData(); setRefreshCountdown(60) }}>
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {error && <div className="market-error">{error}</div>}

      {/* Primary Rate Cards */}
      <div ref={cardsRef} className={`market-cards-grid ${cardsVisible ? 'visible' : ''}`}>
        {marketCards.map((card, idx) => {
          const trend = getTrend(card.value, card.field)
          return (
            <div
              key={idx}
              className={`market-card market-card-${card.color}`}
              style={{ '--stagger': idx }}
            >
              <div className="market-card-top">
                <div className="market-card-icon">{card.icon}</div>
                <TrendBadge value={trend} />
              </div>
              <div className="market-card-value">
                {card.value?.toFixed(2)} <span className="market-card-unit">{card.unit}</span>
              </div>
              <div className="market-card-label">{card.label}</div>
              <MiniSparkline data={history} field={card.field} />
            </div>
          )
        })}
      </div>

      {/* Context Cards */}
      <div className="market-context-section">
        <h3>Supporting Indicators</h3>
        <div className="market-context-grid">
          {contextCards.map((card, idx) => (
            <div key={idx} className="market-context-card" style={{ '--stagger': idx }}>
              <span className="market-context-value">{card.value}</span>
              <span className="market-context-label">{card.label}</span>
              <span className="market-context-desc">{card.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
