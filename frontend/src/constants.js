// Feature name to human-readable label mapping
// Used in Explainability component to display driver names
export const FEATURE_LABELS = {
  "bci_index": "Baltic Capesize Index (BCI)",
  "bdi_index": "Baltic Dry Index (BDI)",
  "bci_ma_7": "BCI 7-Day Moving Average",
  "bci_ma_14": "BCI 14-Day Moving Average",
  "bci_ma_30": "BCI 30-Day Moving Average",
  "bci_ma_60": "BCI 60-Day Moving Average",
  "bci_std_7": "BCI 7-Day Volatility",
  "bci_lag_1": "BCI Yesterday",
  "bci_lag_7": "BCI 7 Days Ago",
  "bci_lag_14": "BCI 14 Days Ago",
  "bci_lag_30": "BCI 30 Days Ago",
  "bdi_lag_1": "BDI Yesterday",
  "bdi_lag_7": "BDI 7 Days Ago",
  "bdi_lag_30": "BDI 30 Days Ago",
  "c5_lag_1": "Route C5 Yesterday",
  "c5_lag_7": "Route C5 7 Days Ago",
  "c5_ma_7": "Route C5 7-Day Average",
  "bci_roc_7": "BCI 7-Day Rate of Change",
  "bci_roc_14": "BCI 14-Day Rate of Change",
  "c5_roc_7": "Route C5 7-Day Rate of Change",
  "iron_ore_price_usd": "Iron Ore Price ($/t)",
  "coking_coal_price_usd": "Coking Coal Price ($/t)",
  "brent_crude_usd": "Brent Crude Oil ($/bbl)",
  "bunker_fuel_vlsfo_usd": "VLSFO Bunker Fuel ($/t)",
  "china_manufacturing_pmi": "China Manufacturing PMI",
  "sp500_index": "S&P 500 Index",
  "usd_inr": "USD / INR Exchange Rate",
  "usd_cny": "USD / CNY Exchange Rate",
  "port_congestion_east_india_days": "Paradip/Vizag Port Delay (Days)",
  "port_congestion_china_days": "China Port Delay (Days)",
  "capesize_fleet_dwt_m": "Global Capesize Fleet (M DWT)",
  "vessel_orderbook_pct": "Capesize Order Book (%)",
  "cos_day_of_year": "Seasonal Cycle (Cosine)",
  "sin_day_of_year": "Seasonal Cycle (Sine)",
  "fuel_to_c5_ratio": "Fuel-to-Freight Ratio",
  "iron_ore_to_bci_ratio": "Ore-to-Shipping Ratio",
  "bci_to_bdi_ratio": "Capesize Strength Ratio",
  "is_chinese_new_year": "Chinese New Year Period",
  "is_monsoon_season": "Indian Monsoon Season",
}

// ========== Authentication & User Configuration ==========
export const DEMO_CREDENTIALS = {
  email: 'admin@freight.gov.in',
  password: 'SIH26006',
}

export const DEFAULT_USER_PROFILE = {
  name: 'Procurement Officer',
  email: 'admin@freight.gov.in',
  role: 'Senior Analyst',
  department: 'Ministry of Steel',
  avatarInitials: 'PO',
}

// ========== Theme & Animation Configuration ==========
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 400,
  slow: 600,
  countUp: 2000,
}

export const NAV_ITEMS = [
  { id: 'landing', label: 'Dashboard', icon: 'compass' },
  { id: 'forecast', label: 'Forecast Engine', icon: 'ship' },
  { id: 'explainability', label: 'SHAP Analysis', icon: 'cpu' },
  { id: 'market', label: 'Market Intel', icon: 'barchart' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ff_api_url')
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '')
    }
  }
  return (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/+$/, '')
}

export const API_BASE = {
  toString() {
    return getApiBase()
  },
  valueOf() {
    return getApiBase()
  },
  [Symbol.toPrimitive]() {
    return getApiBase()
  },
}

// ========== Alarm System Configurations ==========
export const ALARM_METRICS = [
  { value: 'bci_index', label: 'Baltic Capesize Index (BCI)', unit: 'pts', defaultThresh: 2600 },
  { value: 'route_c5_usd_per_tonne', label: 'Route C5 Rate (Australia → India/China)', unit: '$/t', defaultThresh: 11.5 },
  { value: 'route_c3_usd_per_tonne', label: 'Route C3 Rate (Tubarao → Qingdao)', unit: '$/t', defaultThresh: 27.0 },
  { value: 'iron_ore_price_usd', label: 'Iron Ore 62% Fe (Qingdao CFR)', unit: '$/t', defaultThresh: 118.0 },
  { value: 'port_congestion_east_india_days', label: 'Paradip / Vizag Port Wait Days', unit: 'days', defaultThresh: 5.0 },
  { value: 'bunker_fuel_vlsfo_usd', label: 'VLSFO Bunker Fuel (Singapore/Fujairah)', unit: '$/t', defaultThresh: 660.0 },
  { value: 'charter_signal', label: 'AI Procurement Charter Signal', unit: 'signal', defaultThresh: 0 },
]

export const ALARM_CONDITIONS = [
  { value: 'above', label: 'Rises Above Threshold (>)' },
  { value: 'below', label: 'Drops Below Threshold (<)' },
  { value: 'change_pct_above', label: '7-Day Rise > X% (Surge)' },
  { value: 'change_pct_below', label: '7-Day Drop > X% (Drop)' },
  { value: 'signal_equals', label: 'Signal Matches' },
]

export const ALARM_SEVERITIES = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: '🔴' },
  high: { label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', icon: '🟠' },
  warning: { label: 'Warning', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', icon: '🟡' },
}

export const DEFAULT_ALARMS = [
  {
    id: 'alarm-bci-surge',
    name: 'Capesize Volatility Alert',
    metric: 'bci_index',
    condition: 'above',
    threshold: 2500,
    signal_value: 'CHARTER_NOW',
    enabled: true,
    notify_email: 'admin@freight.gov.in',
    notify_push: true,
  },
  {
    id: 'alarm-charter-action',
    name: 'Immediate Tender Signal',
    metric: 'charter_signal',
    condition: 'signal_equals',
    threshold: 0,
    signal_value: 'CHARTER_NOW',
    enabled: true,
    notify_email: 'admin@freight.gov.in',
    notify_push: true,
  },
  {
    id: 'alarm-port-delay',
    name: 'East Coast Port Congestion',
    metric: 'port_congestion_east_india_days',
    condition: 'above',
    threshold: 4.8,
    signal_value: null,
    enabled: true,
    notify_email: '',
    notify_push: true,
  },
]

// ========== Notification Defaults ==========
export const NOTIFICATIONS = [
  {
    id: 1,
    title: 'BCI Surge Alert',
    message: 'Baltic Capesize Index rose +4.2% in the last 24 hours.',
    time: '2 min ago',
    read: false,
    type: 'warning',
  },
  {
    id: 2,
    title: 'Forecast Complete',
    message: 'Route C5 7-day forecast generated successfully.',
    time: '18 min ago',
    read: false,
    type: 'success',
  },
  {
    id: 3,
    title: 'Port Congestion Update',
    message: 'Paradip wait time increased to 4.5 days.',
    time: '1 hour ago',
    read: true,
    type: 'info',
  },
]

