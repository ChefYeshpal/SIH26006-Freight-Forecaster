"""
FastAPI Routes for Maritime Freight Early Warning & Alarming System
"""

from fastapi import APIRouter, HTTPException
from api.schemas import (
    AlarmEvaluateRequest,
    AlarmEvaluateResponse,
    AlarmEmailRequest
)
from api.services.alarm_service import AlarmService

router = APIRouter(prefix="/api/v1/alarms", tags=["Alarming System"])


@router.post("/evaluate", response_model=AlarmEvaluateResponse, summary="Evaluate Alarm Rules")
def evaluate_alarms(request: AlarmEvaluateRequest):
    """
    Evaluates a batch of alarm rules against live market conditions and ML model projections.
    Returns any alarms that have been triggered along with severity and trigger rationale.
    """
    try:
        service = AlarmService()
        return service.evaluate(request.rules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate alarms: {str(e)}")


@router.post("/notify-email", summary="Send Alarm Email Notification")
def send_alarm_email(request: AlarmEmailRequest):
    """
    Dispatches a formatted HTML alert email to the specified recipient.
    If SMTP credentials are not configured, safely logs the alert without throwing an error.
    """
    try:
        service = AlarmService()
        result = service.send_email(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email notification: {str(e)}")
