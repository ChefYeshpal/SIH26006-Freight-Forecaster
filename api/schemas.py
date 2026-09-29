"""
FastAPI Request & Response Schemas for SIH26006 Freight Forecasting System
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MarketOverride(BaseModel):
    iron_ore_price_usd: Optional[float] = Field(None, description="Custom Iron Ore price ($/tonne)")
    brent_crude_usd: Optional[float] = Field(None, description="Custom Brent Crude price ($/bbl)")
    port_congestion_east_india_days: Optional[float] = Field(None, description="Custom Paradip/Vizag port wait days")
    bunker_fuel_vlsfo_usd: Optional[float] = Field(None, description="Custom VLSFO Bunker Fuel price ($/tonne)")
    china_manufacturing_pmi: Optional[float] = Field(None, description="Custom China PMI")

class ForecastRequest(BaseModel):
    horizon_days: int = Field(7, description="Forecast horizon in days (1, 7, 14, or 30)", ge=1, le=30)
    route: str = Field("C5", description="Route to predict ('BCI', 'C5', or 'C3')")
    scenario_overrides: Optional[MarketOverride] = Field(None, description="What-if scenario parameters")

    class Config:
        json_schema_extra = {
            "example": {
                "horizon_days": 7,
                "route": "C5",
                "scenario_overrides": {
                    "iron_ore_price_usd": 115.0,
                    "port_congestion_east_india_days": 6.5
                }
            }
        }

class ProcurementDecision(BaseModel):
    action: str = Field(..., description="Action: 'CHARTER_NOW', 'WAIT', or 'HOLD_NEUTRAL'")
    urgency: str = Field(..., description="'HIGH', 'MEDIUM', or 'LOW'")
    color: str = Field(..., description="Badge color (green, red, gray)")
    rationale: str = Field(..., description="Plain-English explanation for procurement officers")
    expected_change_pct: float = Field(..., description="Expected percentage freight rate change over horizon")

class ForecastResponse(BaseModel):
    status: str = "success"
    date_evaluated: str
    target_metric: str
    current_spot_rate: float
    predicted_rate: float
    expected_change_pct: float
    confidence_interval_95pct: Dict[str, float]
    recommendation: ProcurementDecision
    route_details: Dict[str, Any]

class ShapDriver(BaseModel):
    feature: str
    current_value: float
    shap_impact: float

class ExecutiveBriefingResponse(BaseModel):
    latest_date: str
    current_spot_bci: float
    forecast_7d_bci: float
    net_rate_change: float
    procurement_decision: ProcurementDecision
    bullish_drivers_raising_freight: List[ShapDriver]
    bearish_drivers_lowering_freight: List[ShapDriver]
    top_overall_factors: List[ShapDriver]
    summary_chart_url: str
    waterfall_chart_url: str

class MarketSnapshotResponse(BaseModel):
    latest_date: str
    bci_index: float
    bdi_index: float
    route_c5_usd_per_tonne: float
    route_c3_usd_per_tonne: float
    iron_ore_price_usd: float
    coking_coal_price_usd: float
    brent_crude_usd: float
    bunker_fuel_vlsfo_usd: float
    port_congestion_east_india_days: float
    china_manufacturing_pmi: float
    usd_inr: float

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    models_available: List[str]
    model_test_mape: str

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or query")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Optional previous chat turns")
    cargo_tonnes: Optional[float] = Field(170000.0, description="Optional cargo size in metric tonnes (default standard Capesize 170k DWT)")
    route: Optional[str] = Field("C5", description="Route context ('C5', 'C3', or 'BCI')")

class ChatResponse(BaseModel):
    reply: str
    category: str = Field(..., description="'glossary', 'decision_support', 'market_insight', or 'general'")
    action_signal: Optional[str] = Field(None, description="Optional chartering signal if applicable ('CHARTER_NOW', 'WAIT', 'HOLD_NEUTRAL')")
    estimated_savings_usd: Optional[float] = Field(None, description="Estimated total voyage savings in USD if applicable")
    estimated_savings_inr_cr: Optional[float] = Field(None, description="Estimated savings in Indian Crores INR if applicable")
    follow_up_suggestions: List[str] = Field(default_factory=list, description="Suggested follow-up questions for the user")


# ========== Alarm System Schemas ==========

class AlarmRule(BaseModel):
    id: str = Field(..., description="Unique identifier for the alarm rule")
    name: str = Field(..., description="Human-readable alarm name")
    metric: str = Field(
        ...,
        description="Metric key: 'bci_index' | 'route_c5_usd_per_tonne' | 'route_c3_usd_per_tonne' | 'iron_ore_price_usd' | 'port_congestion_east_india_days' | 'bunker_fuel_vlsfo_usd' | 'charter_signal'"
    )
    condition: str = Field(
        ...,
        description="Condition: 'above' | 'below' | 'change_pct_above' | 'change_pct_below' | 'signal_equals'"
    )
    threshold: float = Field(0.0, description="Numeric threshold value (use 0 for signal-based rules)")
    signal_value: Optional[str] = Field(None, description="Signal to match: 'CHARTER_NOW' | 'WAIT' | 'HOLD_NEUTRAL'")
    enabled: bool = Field(True, description="Whether the rule is currently active")
    notify_email: Optional[str] = Field(None, description="Email address to notify when alarm fires")
    email: Optional[str] = Field(None, description="Email address to notify when alarm fires (alias for notify_email)")
    notify_push: bool = Field(True, description="Whether to trigger browser push notification")


class AlarmTrigger(BaseModel):
    rule_id: str
    rule_name: str
    metric: str
    metric_label: str
    current_value: float
    threshold: float
    condition: str
    severity: str = Field(..., description="'critical' | 'high' | 'warning'")
    message: str
    triggered_at: str


class AlarmEvaluateRequest(BaseModel):
    rules: List[AlarmRule]

    class Config:
        json_schema_extra = {
            "example": {
                "rules": [
                    {
                        "id": "alarm-1",
                        "name": "BCI Spike Alert",
                        "metric": "bci_index",
                        "condition": "above",
                        "threshold": 3000,
                        "enabled": True,
                        "notify_email": "officer@freight.gov.in",
                        "notify_push": True
                    }
                ]
            }
        }


class AlarmEvaluateResponse(BaseModel):
    triggered: List[AlarmTrigger]
    evaluated_at: str
    total_rules: int
    total_triggered: int


class AlarmEmailRequest(BaseModel):
    to_email: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject line")
    triggers: List[AlarmTrigger]

