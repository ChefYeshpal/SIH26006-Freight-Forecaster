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
