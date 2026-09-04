from fastapi import APIRouter
from api.schemas import ExecutiveBriefingResponse, ProcurementDecision
from api.services.forecaster_service import ForecasterService

router = APIRouter(prefix="/api/v1", tags=["Decision Support & Explainability"])

@router.get("/recommendation", response_model=ProcurementDecision, summary="Chartering Recommendation")
def get_recommendation():
    """
    Returns the automated operational chartering decision (CHARTER_NOW, WAIT, HOLD_NEUTRAL) for Ministry of Steel procurement officers.
    """
    service = ForecasterService()
    briefing = service.get_executive_briefing()
    return briefing.procurement_decision

@router.get("/explainability", response_model=ExecutiveBriefingResponse, summary="SHAP Explainability & Executive Briefing")
def get_explainability():
    """
    Returns the comprehensive SHAP feature contribution breakdown and executive briefing.
    """
    service = ForecasterService()
    return service.get_executive_briefing()
