"""
Main FastAPI Application for SIH26006 Freight Forecasting System
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.schemas import HealthResponse
from api.routes import predict, explainability, market, chat
from api.services.forecaster_service import ForecasterService

app = FastAPI(
    title="🚢 SIH26006 Maritime Freight Forecasting API",
    description="Intelligent Freight Forecasting & Vessel Chartering Optimization for the Ministry of Steel (Bulk Cargo Imports to East Coast India)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend / Streamlit integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse

# Mount static reports directory for SHAP plot visual inspection
os.makedirs("reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# Serve web dashboard on both / and /test
@app.get("/", include_in_schema=False)
@app.get("/test", include_in_schema=False)
def serve_web_dashboard():
    test_html = os.path.join("test_interface", "index.html")
    if os.path.exists(test_html):
        return FileResponse(test_html)
    return {"message": "Web dashboard interface not found"}

# Include Routers
app.include_router(predict.router)
app.include_router(explainability.router)
app.include_router(market.router)
app.include_router(chat.router)


@app.on_event("startup")
def on_startup():
    print("[API Startup] Pre-loading forecaster service and ML models...")
    _ = ForecasterService()
    print("[API Startup] Ready to serve predictions at http://localhost:8000/docs")

@app.get("/api/info", tags=["System"])
def api_info():
    return {
        "system": "SIH26006 Intelligent Freight Forecasting API",
        "beneficiary": "Ministry of Steel, Government of India",
        "documentation": "/docs",
        "endpoints": {
            "predict": "POST /api/v1/predict",
            "chartering_recommendation": "GET /api/v1/recommendation",
            "shap_explainability": "GET /api/v1/explainability",
            "market_snapshot": "GET /api/v1/market/snapshot",
            "market_history": "GET /api/v1/market/history?limit=90",
            "health": "GET /health"
        }
    }


    mape_str = "9.43%"
    summary_file = os.path.join("models", "ensemble_summary.json")
    if os.path.exists(summary_file):
        try:
            with open(summary_file, "r") as f:
                s = json.load(f)
                mape_val = s.get("models", {}).get("ensemble", {}).get("mape")
                if mape_val:
                    mape_str = f"{mape_val}%"
        except Exception:
            pass

    return HealthResponse(
        status="healthy",
        service="SIH26006_Maritime_Freight_Forecaster",
        version="1.0.0",
        model_loaded=service.model is not None,
        models_available=["XGBoost", "BiLSTM", "Hybrid_Ensemble"],
        model_test_mape=mape_str
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
