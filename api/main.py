"""
Main FastAPI Application for SIH26006 Freight Forecasting System
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.schemas import HealthResponse
from api.routes import predict, explainability, market
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

# Serve disposable test interface
@app.get("/test", include_in_schema=False)
def serve_test_interface():
    test_html = os.path.join("test_interface", "index.html")
    if os.path.exists(test_html):
        return FileResponse(test_html)
    return {"message": "Test interface not found"}

# Include Routers
app.include_router(predict.router)
app.include_router(explainability.router)
app.include_router(market.router)

@app.on_event("startup")
def on_startup():
    print("[API Startup] Pre-loading forecaster service and ML models...")
    _ = ForecasterService()
    print("[API Startup] Ready to serve predictions at http://localhost:8000/docs")

@app.get("/", tags=["System"])
def root():
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

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    service = ForecasterService()
    return HealthResponse(
        status="healthy",
        service="SIH26006_Maritime_Freight_Forecaster",
        version="1.0.0",
        model_loaded=service.model is not None,
        models_available=["XGBoost", "BiLSTM", "Hybrid_Ensemble"],
        model_test_mape="13.76%"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
