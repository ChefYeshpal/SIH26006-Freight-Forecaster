from fastapi import APIRouter, Query
from typing import List, Dict, Any
from api.schemas import MarketSnapshotResponse
from api.services.forecaster_service import ForecasterService

router = APIRouter(prefix="/api/v1/market", tags=["Market Intelligence"])

@router.get("/snapshot", response_model=MarketSnapshotResponse, summary="Latest Market Snapshot")
def get_market_snapshot():
    """
    Returns current spot prices for Baltic indices, Route C5/C3 freight, iron ore, coking coal, fuel, and port wait times.
    """
    service = ForecasterService()
    return service.get_market_snapshot()

@router.get("/history", summary="Historical Market Time-Series")
def get_market_history(limit: int = Query(90, ge=7, le=365, description="Number of historical trading days")):
    """
    Returns recent daily time-series records for charting and trend visualization.
    """
    service = ForecasterService()
    return service.get_history(limit=limit)
