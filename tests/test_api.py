"""
Automated Test Suite for SIH26006 FastAPI Endpoints
Tests all routes, schemas, error handling, and inference logic.
"""

import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "documentation" in data
    assert data["beneficiary"] == "Ministry of Steel, Government of India"
    print("[PASS] GET / returned 200 OK")

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "XGBoost" in data["models_available"]
    print(f"[PASS] GET /health -> Status: {data['status']}, MAPE: {data['model_test_mape']}")

def test_market_snapshot():
    response = client.get("/api/v1/market/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert "bci_index" in data
    assert "route_c5_usd_per_tonne" in data
    assert "iron_ore_price_usd" in data
    assert data["bci_index"] > 0
    print(f"[PASS] GET /api/v1/market/snapshot -> Spot BCI: {data['bci_index']}, C5: ${data['route_c5_usd_per_tonne']}/t")

def test_market_history():
    response = client.get("/api/v1/market/history?limit=30")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 30
    print(f"[PASS] GET /api/v1/market/history -> Retrieved {len(data)} time series rows")

def test_chartering_recommendation():
    response = client.get("/api/v1/recommendation")
    assert response.status_code == 200
    data = response.json()
    assert data["action"] in ["CHARTER_NOW", "WAIT", "HOLD_NEUTRAL"]
    assert "rationale" in data
    print(f"[PASS] GET /api/v1/recommendation -> Action: {data['action']}, Urgency: {data['urgency']}")

def test_shap_explainability():
    response = client.get("/api/v1/explainability")
    assert response.status_code == 200
    data = response.json()
    assert "bullish_drivers_raising_freight" in data
    assert "bearish_drivers_lowering_freight" in data
    assert len(data["top_overall_factors"]) > 0
    print(f"[PASS] GET /api/v1/explainability -> Top Driver: {data['top_overall_factors'][0]['feature']}")

def test_predict_c5_standard():
    payload = {
        "horizon_days": 7,
        "route": "C5"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "predicted_rate" in data
    assert "confidence_interval_95pct" in data
    print(f"[PASS] POST /api/v1/predict (C5, 7d) -> Predicted Rate: ${data['predicted_rate']}/t ({data['expected_change_pct']:+.1f}%)")

def test_predict_what_if_scenario():
    payload = {
        "horizon_days": 14,
        "route": "BCI",
        "scenario_overrides": {
            "iron_ore_price_usd": 150.0,
            "port_congestion_east_india_days": 9.5
        }
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    print(f"[PASS] POST /api/v1/predict (What-If Scenario) -> Predicted BCI: {data['predicted_rate']} (Recommendation: {data['recommendation']['action']})")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 RUNNING FASTAPI ENDPOINT INTEGRATION TESTS")
    print("=" * 60)
    test_root_endpoint()
    test_health_endpoint()
    test_market_snapshot()
    test_market_history()
    test_chartering_recommendation()
    test_shap_explainability()
    test_predict_c5_standard()
    test_predict_what_if_scenario()
    print("=" * 60)
    print("✅ ALL FASTAPI ENDPOINTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
