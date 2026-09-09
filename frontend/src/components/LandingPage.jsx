import React from 'react'
import useScrollAnimation from '../hooks/useScrollAnimation'
import AnimatedCounter from './AnimatedCounter'
import {
  ShipIcon,
  AnchorIcon,
  TrendingUpIcon,
  CpuIcon,
  SearchCheckIcon,
  ShieldAlertIcon,
  SlidersIcon,
  DatabaseIcon,
  ArrowRightIcon,
  ActivityIcon,
  PackageIcon,
  FactoryIcon,
  TruckIcon,
  CraneIcon,
  WavesIcon,
  GlobeIcon,
} from './Icons'

export default function LandingPage({ onNavigate, backendStatus }) {
  const isHealthy = backendStatus && backendStatus.includes('Online')

  // Scroll animation refs
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation({ threshold: 0.15 })
  const { ref: voyageRef, isVisible: voyageVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: portsRef, isVisible: portsVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: capsRef, isVisible: capsVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: bannerRef, isVisible: bannerVisible } = useScrollAnimation({ threshold: 0.2 })

  const capabilities = [
    {
      icon: <TrendingUpIcon size={22} />,
      title: 'Multi-Horizon Rate Forecasting',
      desc: 'Predict BCI, C5, and C3 spot prices across 7, 14, and 30-day horizons with calibrated confidence intervals.',
      tag: 'Predictive AI',
    },
    {
      icon: <CpuIcon size={22} />,
      title: 'Hybrid Ensemble Architecture',
      desc: 'Blends Gradient Boosted Trees (XGBoost) and Deep Recurrent Networks (BiLSTM) for optimal non-linear time series capture.',
      tag: 'Ensemble Engine',
    },
    {
      icon: <SearchCheckIcon size={22} />,
      title: 'SHAP Explainability Engine',
      desc: 'Decomposes complex model weights into transparent drivers: iron ore demand shifts, fuel/bunker spikes, and congestion days.',
      tag: 'Explainable AI',
    },
    {
      icon: <ShieldAlertIcon size={22} />,
      title: 'Actionable Charter Signals',
      desc: 'Generates automated CHARTER_NOW vs WAIT signals with plain-English rationales for strategic procurement officers.',
      tag: 'Decision Support',
    },
    {
      icon: <SlidersIcon size={22} />,
      title: 'What-If Scenario Simulator',
      desc: 'Stress-test charter rates against unexpected port wait surges, iron ore rallies, and bunker fuel shocks in real-time.',
      tag: 'Sensitivity Lab',
    },
    {
      icon: <DatabaseIcon size={22} />,
      title: 'REST Microservice Integration',
      desc: 'Production-ready FastAPI backend with structured JSON schemas, automated validation, and interactive Swagger docs.',
      tag: 'Enterprise API',
    },
  ]

  const ports = [
    {
      name: 'Paradip Port',
      state: 'Odisha',
      role: 'Coking Coal & Bulk Raw Material Gateway',
      draft: '17.1m Draft',
      capacity: 85,
      cargo: 'Coking Coal, Thermal Coal, Pellets',
      direction: 'left',
    },
    {
      name: 'Visakhapatnam Port',
      state: 'Andhra Pradesh',
      role: 'Deep-Water Ore & Coastal Discharge Hub',
      draft: '18.5m Outer Harbor',
      capacity: 92,
      cargo: 'Iron Ore, Met Coke, Limestone',
      direction: 'right',
    },
    {
      name: 'Kamarajar (Ennore)',
      state: 'Tamil Nadu',
      role: 'Dedicated Clean Bulk Energy Corridor',
      draft: '16.0m Draft',
      capacity: 70,
      cargo: 'Imported Coal & Heavy Industrials',
      direction: 'left',
    },
    {
      name: 'Haldia Port',
      state: 'West Bengal',
      role: 'Inland Riverine Steel Feeder Hub',
      draft: '8.5m Tidal Draft',
      capacity: 60,
      cargo: 'Coking Coal, Flux & Scrap Cargo',
      direction: 'right',
    },
  ]

  const timelineSteps = [
    {
      icon: <PackageIcon size={24} />,
      title: 'Raw Material Sourcing',
      subtitle: 'Origin Ports',
      desc: 'Iron ore from Western Australia (Dampier/Port Hedland) and coking coal from Tubarao, Brazil loaded onto Capesize bulk carriers.',
      color: 'cyan',
    },
    {
      icon: <CraneIcon size={24} />,
      title: 'Vessel Charter & Loading',
      subtitle: 'Spot Market',
      desc: 'AI-optimized charter timing based on BCI/C5/C3 forecasts. Loading 170,000–200,000 DWT Capesize vessels at origin berths.',
      color: 'blue',
    },
    {
      icon: <ShipIcon size={24} />,
      title: 'Ocean Transit',
      subtitle: '12–36 Days',
      desc: 'Route C5 (Australia → India) takes 12–14 days. Route C3 (Brazil → India) takes 32–36 days steaming across the Indian Ocean.',
      color: 'emerald',
    },
    {
      icon: <AnchorIcon size={24} />,
      title: 'East Coast Discharge',
      subtitle: 'Indian Ports',
      desc: 'Discharge at Paradip, Visakhapatnam, Ennore, or Haldia. Port congestion monitoring minimizes demurrage costs.',
      color: 'amber',
    },
    {
      icon: <FactoryIcon size={24} />,
      title: 'Steel Plant Delivery',
      subtitle: 'End Destination',
      desc: 'Rail and road logistics deliver raw materials to SAIL, Tata Steel, JSW, and RINL steel manufacturing plants.',
      color: 'rose',
    },
  ]

  return (
    <div className="landing-container">
      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className={`executive-hero ${heroVisible ? 'visible' : ''}`}>
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="gov-badge">
              <span className="live-dot pulse" /> Ministry of Steel • East Coast Initiative
            </span>
            <span className="sih-badge">SIH26006 Problem Statement</span>
          </div>

          <h1 className="hero-headline">
            Intelligent Maritime Freight Forecasting & Spot Chartering Intelligence
          </h1>

          <p className="hero-description">
            A state-of-the-art AI/ML decision-support system designed for bulk cargo procurement.
            Predict Baltic Capesize and regional shipping rates up to 30 days ahead, understand economic
            drivers through SHAP explainability, and minimize demurrage for India's steel manufacturing corridor.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary" onClick={() => onNavigate('forecast')}>
              <span>Launch Forecast Engine</span>
              <ArrowRightIcon size={16} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('explainability')}>
              <SearchCheckIcon size={16} />
              <span>Explore SHAP Attribution</span>
            </button>
          </div>

          <div className="hero-footer-status">
            <div className={`status-pill ${isHealthy ? 'healthy' : 'pending'}`}>
              <span className="indicator-dot" />
              <span className="status-text">{backendStatus || 'Checking backend microservice...'}</span>
            </div>
          </div>
        </div>

        {/* Live Market Snapshot Card */}
        <div className="hero-terminal-card">
          <div className="terminal-header">
            <div className="terminal-title">
              <ActivityIcon size={16} className="terminal-icon" />
              <span>Live Market & Signal Radar</span>
            </div>
            <span className="live-tag">REALTIME</span>
          </div>

          <div className="terminal-body">
            <div className="terminal-ticker-row">
              <div className="ticker-item">
                <span className="ticker-label">Baltic Capesize Index</span>
                <div className="ticker-val-wrap">
                  <span className="ticker-value">2,840 pts</span>
                  <span className="ticker-delta up">+4.2%</span>
                </div>
              </div>
              <div className="ticker-item">
                <span className="ticker-label">Route C5 (W.Aus → China/India)</span>
                <div className="ticker-val-wrap">
                  <span className="ticker-value">$11.45 / MT</span>
                  <span className="ticker-delta up">+3.2%</span>
                </div>
              </div>
            </div>

            <div className="terminal-decision-box">
              <div className="decision-header">
                <span className="decision-title">Recommended Charter Action</span>
                <span className="confidence-pill">89% Confidence</span>
              </div>
              <div className="decision-signal">
                <span className="signal-badge green">CHARTER_NOW</span>
                <span className="signal-target">Target Horizon: 7–14 Days</span>
              </div>
              <p className="decision-summary">
                Rising Australian ore export momentum and rising Paradip wait times (4.5 days) project an upward freight price surge within 10 days.
              </p>
            </div>

            <div className="terminal-stats-row">
              <div className="mini-stat">
                <span className="mini-stat-label">East Coast Avg Congestion</span>
                <span className="mini-stat-val">3.8 Days</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">Model Architecture</span>
                <span className="mini-stat-val">Hybrid XGBoost + BiLSTM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ANIMATED METRICS COUNTER ========== */}
      <section ref={metricsRef} className={`section-block metrics-section ${metricsVisible ? 'visible' : ''}`}>
        <div className="section-title-wrap">
          <span className="section-kicker">ECONOMIC & PERFORMANCE BENCHMARK</span>
          <h2 className="section-heading">Strategic Logistics Value Matrix</h2>
        </div>

        <div className="metrics-cards-grid">
          <div className="metric-box" style={{ '--stagger': 0 }}>
            <div className="metric-box-top"><span className="metric-badge">Annual Scale</span></div>
            <div className="metric-number">
              <AnimatedCounter end={130} suffix="M+" duration={2000} />
            </div>
            <div className="metric-name">East Coast Bulk Volume (MT)</div>
            <div className="metric-divider" />
            <p className="metric-detail">Imported coking coal & iron ore across Paradip, Vizag, Ennore, and Haldia.</p>
          </div>

          <div className="metric-box" style={{ '--stagger': 1 }}>
            <div className="metric-box-top"><span className="metric-badge">Est. Value</span></div>
            <div className="metric-number">
              <AnimatedCounter end={325} prefix="$" suffix="M" duration={2200} />
            </div>
            <div className="metric-name">Target Logistics Savings</div>
            <div className="metric-divider" />
            <p className="metric-detail">Based on a data-driven $1.00–$2.50/tonne spot chartering optimization.</p>
          </div>

          <div className="metric-box" style={{ '--stagger': 2 }}>
            <div className="metric-box-top"><span className="metric-badge">Benchmark</span></div>
            <div className="metric-number">
              <AnimatedCounter end={64.7} suffix="%" decimals={1} duration={1800} />
            </div>
            <div className="metric-name">Directional Accuracy</div>
            <div className="metric-divider" />
            <p className="metric-detail">Hybrid Ensemble (XGBoost + BiLSTM) outperforming individual baselines.</p>
          </div>

          <div className="metric-box" style={{ '--stagger': 3 }}>
            <div className="metric-box-top"><span className="metric-badge">Horizon</span></div>
            <div className="metric-number">
              <AnimatedCounter end={30} suffix=" Days" duration={1600} />
            </div>
            <div className="metric-name">Predictive Lead Time</div>
            <div className="metric-divider" />
            <p className="metric-detail">Multi-horizon forecasts enabling proactive vessel fixture scheduling.</p>
          </div>
        </div>
      </section>

      {/* ========== ANIMATED VOYAGE MAP ========== */}
      <section ref={voyageRef} className={`section-block voyage-section ${voyageVisible ? 'visible' : ''}`}>
        <div className="section-title-wrap">
          <span className="section-kicker">MARITIME TRADE CORRIDORS</span>
          <h2 className="section-heading">Cargo Voyage Route Visualization</h2>
          <p className="section-desc">
            Track the journey of bulk cargo from origin to Indian East Coast discharge terminals.
          </p>
        </div>

        <div className="voyage-map">
          {/* Ocean background with waves */}
          <div className="voyage-ocean">
            <div className="voyage-wave voyage-wave-1" />
            <div className="voyage-wave voyage-wave-2" />
            <div className="voyage-wave voyage-wave-3" />
          </div>

          {/* Route SVG path */}
          <svg className="voyage-route-svg" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path
              className="voyage-route-path"
              d="M 50 100 C 200 40, 400 160, 550 100 C 700 40, 850 120, 950 80"
              fill="none"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            <path
              className={`voyage-route-path-animated ${voyageVisible ? 'draw' : ''}`}
              d="M 50 100 C 200 40, 400 160, 550 100 C 700 40, 850 120, 950 80"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="3"
              strokeDasharray="1200"
              strokeDashoffset="1200"
              strokeLinecap="round"
            />
          </svg>

          {/* Ship animation */}
          <div className={`voyage-ship ${voyageVisible ? 'sailing' : ''}`}>
            <ShipIcon size={36} />
            <div className="voyage-ship-wake" />
          </div>

          {/* Port markers */}
          <div className="voyage-ports">
            <div className={`voyage-port voyage-port-origin ${voyageVisible ? 'visible' : ''}`}>
              <div className="voyage-port-dot" />
              <div className="voyage-port-label">
                <strong>W. Australia</strong>
                <span>Dampier / Port Hedland</span>
              </div>
            </div>

            <div className={`voyage-port voyage-port-mid ${voyageVisible ? 'visible' : ''}`}>
              <div className="voyage-port-dot" />
              <div className="voyage-port-label">
                <strong>Brazil</strong>
                <span>Tubarao</span>
              </div>
            </div>

            <div className={`voyage-port voyage-port-dest ${voyageVisible ? 'visible' : ''}`}>
              <div className="voyage-port-dot destination" />
              <div className="voyage-port-label">
                <strong>East Coast India</strong>
                <span>Paradip / Vizag / Ennore</span>
              </div>
            </div>
          </div>

          {/* Route cards */}
          <div className="voyage-route-cards">
            <div className={`voyage-route-card ${voyageVisible ? 'visible' : ''}`} style={{ '--delay': '0.6s' }}>
              <span className="voyage-route-tag">Route C5</span>
              <span className="voyage-route-detail">Australia → India • 12–14 Days</span>
              <span className="voyage-route-rate">$11.45/MT</span>
            </div>
            <div className={`voyage-route-card ${voyageVisible ? 'visible' : ''}`} style={{ '--delay': '1s' }}>
              <span className="voyage-route-tag">Route C3</span>
              <span className="voyage-route-detail">Brazil → India • 32–36 Days</span>
              <span className="voyage-route-rate">$27.80/MT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PORT TERMINAL REVEAL ========== */}
      <section ref={portsRef} className={`section-block ports-section ${portsVisible ? 'visible' : ''}`}>
        <div className="section-title-wrap">
          <span className="section-kicker">INFRASTRUCTURE & GEOGRAPHY</span>
          <h2 className="section-heading">East Coast Discharging Terminals</h2>
          <p className="section-desc">
            India's critical bulk cargo reception infrastructure servicing public & private steel plants.
          </p>
        </div>

        <div className="ports-reveal-grid">
          {ports.map((port, idx) => (
            <div
              key={idx}
              className={`port-reveal-card port-from-${port.direction} ${portsVisible ? 'visible' : ''}`}
              style={{ '--stagger': idx }}
            >
              <div className="port-reveal-header">
                <div className="port-reveal-icon">
                  <AnchorIcon size={22} />
                </div>
                <div className="port-reveal-titles">
                  <span className="port-reveal-name">{port.name}</span>
                  <span className="port-reveal-state">{port.state}</span>
                </div>
              </div>

              <p className="port-reveal-role">{port.role}</p>

              <div className="port-capacity-bar">
                <div className="port-capacity-label">
                  <span>Utilization</span>
                  <span>{port.capacity}%</span>
                </div>
                <div className="port-capacity-track">
                  <div
                    className={`port-capacity-fill ${portsVisible ? 'animate' : ''}`}
                    style={{ '--capacity': `${port.capacity}%`, '--stagger': idx }}
                  />
                </div>
              </div>

              <div className="port-reveal-meta">
                <span className="port-meta-chip">{port.draft}</span>
                <span className="port-meta-chip">{port.cargo}</span>
              </div>

              {/* Animated container stacking */}
              <div className="port-containers">
                {[0, 1, 2, 3, 4].map((c) => (
                  <div
                    key={c}
                    className={`port-container-box ${portsVisible ? 'stack' : ''}`}
                    style={{
                      '--box-delay': `${idx * 0.2 + c * 0.15}s`,
                      '--box-color': ['#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'][c],
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CARGO FLOW TIMELINE ========== */}
      <section ref={timelineRef} className={`section-block timeline-section ${timelineVisible ? 'visible' : ''}`}>
        <div className="section-title-wrap">
          <span className="section-kicker">SYSTEM PIPELINE</span>
          <h2 className="section-heading">End-to-End Cargo Flow</h2>
          <p className="section-desc">
            From raw material sourcing to steel plant delivery — the complete procurement lifecycle.
          </p>
        </div>

        <div className="cargo-timeline">
          <div className={`cargo-timeline-line ${timelineVisible ? 'draw' : ''}`} />

          {timelineSteps.map((step, idx) => (
            <div
              key={idx}
              className={`cargo-timeline-step ${timelineVisible ? 'visible' : ''}`}
              style={{ '--stagger': idx }}
            >
              <div className={`cargo-timeline-node node-${step.color}`}>
                <div className="cargo-timeline-icon">{step.icon}</div>
                <div className="cargo-timeline-connector" />
              </div>

              <div className="cargo-timeline-content">
                <span className="cargo-timeline-subtitle">{step.subtitle}</span>
                <h4 className="cargo-timeline-title">{step.title}</h4>
                <p className="cargo-timeline-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CAPABILITIES ========== */}
      <section ref={capsRef} className={`section-block caps-section ${capsVisible ? 'visible' : ''}`}>
        <div className="section-title-wrap">
          <span className="section-kicker">ENTERPRISE CAPABILITIES</span>
          <h2 className="section-heading">Engineered for Maritime Precision</h2>
          <p className="section-desc">
            Bridging complex macro-economic indicators, ocean freight volatility, and machine learning into practical charter decisions.
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((c, idx) => (
            <div key={idx} className="capability-card" style={{ '--stagger': idx }}>
              <div className="cap-top">
                <div className="cap-icon-box">{c.icon}</div>
                <span className="cap-tag">{c.tag}</span>
              </div>
              <h3 className="cap-title">{c.title}</h3>
              <p className="cap-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== BOTTOM CTA BANNER ========== */}
      <section ref={bannerRef} className={`executive-banner ${bannerVisible ? 'visible' : ''}`}>
        <div className="banner-inner">
          <div className="banner-left">
            <span className="banner-kicker">READY TO TEST SCENARIOS</span>
            <h2 className="banner-title">Execute Real-Time Freight Inference</h2>
            <p className="banner-sub">
              Access the interactive simulation workbench to test commodity shocks, port congestion shifts, and forecast horizons.
            </p>
          </div>
          <div className="banner-right">
            <button className="btn-primary light" onClick={() => onNavigate('forecast')}>
              <span>Open Forecast Workbench</span>
              <ArrowRightIcon size={16} />
            </button>
            <button className="btn-ghost" onClick={() => onNavigate('explainability')}>
              <span>View SHAP Attribution</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
