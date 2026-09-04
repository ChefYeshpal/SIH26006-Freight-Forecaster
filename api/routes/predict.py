from fastapi import APIRouter, HTTPException
from api.schemas import ForecastRequest, ForecastResponse
from api.services.forecaster_service import ForecasterService

router = APIRouter(prefix="/api/v1", tags=["Forecasting"])

@router.post("/predict", response_model=ForecastResponse, summary="Predict Freight Rates")
def predict_freight(request: ForecastRequest):
    """
    Generates AI freight forecasts for bulk cargo routes (C5: Australia->India, C3: Brazil->India, or BCI Index).
    Supports customizable horizons (1, 7, 14, 30 days) and What-If scenario overrides.
    """
    try:
        service = ForecasterService()
        response = service.predict_freight(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
