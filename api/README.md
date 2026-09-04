# 🚢 SIH26006 Maritime Freight Forecasting API Documentation
### *Ministry of Steel Bulk Cargo Procurement & Vessel Chartering Optimization*

---

## 📌 Overview
The FastAPI backend serves production-ready machine learning forecasts, SHAP explainability insights, and automated vessel chartering recommendations (`CHARTER_NOW` vs `WAIT`).

- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc UI:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Server Port:** `8000`

---

## 🚀 How to Run the API

```powershell
python run_api.py
```
*Or using uvicorn directly:*
```powershell
uvicorn api.main:app --reload --port 8000
```

---

## 📡 Key Endpoints

### 1. Health Check
`GET /health`
```json
{
  "status": "healthy",
  "service": "SIH26006_Maritime_Freight_Forecaster",
  "version": "1.0.0",
  "model_loaded": true,
  "models_available": ["XGBoost", "BiLSTM", "Hybrid_Ensemble"],
  "model_test_mape": "13.76%"
}
```

---

### 2. Predict Freight Rate (Multi-Horizon & What-If Scenarios)
`POST /api/v1/predict`

**Request Body:**
```json
{
  "horizon_days": 7,
  "route": "C5",
  "scenario_overrides": {
    "iron_ore_price_usd": 125.0,
    "port_congestion_east_india_days": 8.0
  }
}
```

**Response:**
```json
{
  "status": "success",
  "date_evaluated": "2024-07-19",
  "target_metric": "Route C5 Freight (USD / Metric Tonne)",
  "current_spot_rate": 13.35,
  "predicted_rate": 12.10,
  "expected_change_pct": -9.36,
  "confidence_interval_95pct": {
    "lower": 10.43,
    "upper": 13.77
  },
  "recommendation": {
    "action": "WAIT",
    "urgency": "MEDIUM",
    "color": "red",
    "rationale": "Freight rates on C5 projected to soften by -9.4% over the next 7 days. Delaying tender offers cost savings.",
    "expected_change_pct": -9.36
  },
  "route_details": {
    "route_c5_usd_tonne": 12.10,
    "route_c3_usd_tonne": 24.85,
    "capesize_bci_points": 1845.2,
    "horizon_days": 7
  }
}
```

---

### 3. Operational Chartering Recommendation
`GET /api/v1/recommendation`

Returns the immediate decision card for Ministry of Steel officers:
```json
{
  "action": "WAIT",
  "urgency": "MEDIUM",
  "color": "red",
  "rationale": "Freight rates projected to soften by -10.1% over the next 7 days. Delaying tender offers cost savings for bulk procurement.",
  "expected_change_pct": -10.12
}
```

---

### 4. SHAP Explainability & Executive Briefing
`GET /api/v1/explainability`

Returns the exact Shapley market drivers and URLs to visual waterfall and summary plots.

---

### 5. Live Market Snapshot & Historical Time Series
- `GET /api/v1/market/snapshot`: Latest spot prices for BCI, BDI, C5, C3, Iron ore, Coking coal, Oil, and Port delays.
- `GET /api/v1/market/history?limit=90`: Daily historical records for charts.
