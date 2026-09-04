"""
Forecasting Service Singleton for FastAPI Backend
Manages model loading, multi-horizon inference, route price translation, and what-if simulation.
"""

import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from api.schemas import ForecastRequest, ForecastResponse, ProcurementDecision, MarketSnapshotResponse, ExecutiveBriefingResponse

class ForecasterService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ForecasterService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        print("[Service] Initializing ForecasterService...")
        self.model_path = os.path.join("models", "xgboost_forecaster.json")
        self.meta_path = os.path.join("models", "xgboost_metadata.json")
        self.data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
        self.briefing_path = os.path.join("reports", "executive_briefing.json")

        self.model = xgb.XGBRegressor()
        if os.path.exists(self.model_path):
            self.model.load_model(self.model_path)
            print(f"[Service] Loaded XGBoost model from {self.model_path}")
        else:
            print("[Service] Warning: model file not found, will require training.")

        with open(self.meta_path, "r") as f:
            self.metadata = json.load(f)
            self.feature_names = self.metadata["feature_names"]

        self.df = pd.read_csv(self.data_path)
        self.latest_row = self.df.iloc[-1].copy()
        print(f"[Service] Loaded dataset. Latest date: {self.latest_row['date']}")

    def get_market_snapshot(self) -> MarketSnapshotResponse:
        row = self.latest_row
        return MarketSnapshotResponse(
            latest_date=str(row["date"]),
            bci_index=round(float(row["bci_index"]), 1),
            bdi_index=round(float(row["bdi_index"]), 1),
            route_c5_usd_per_tonne=round(float(row["route_c5_usd_per_tonne"]), 2),
            route_c3_usd_per_tonne=round(float(row["route_c3_usd_per_tonne"]), 2),
            iron_ore_price_usd=round(float(row["iron_ore_price_usd"]), 2),
            coking_coal_price_usd=round(float(row["coking_coal_price_usd"]), 2),
            brent_crude_usd=round(float(row["brent_crude_usd"]), 2),
            bunker_fuel_vlsfo_usd=round(float(row["bunker_fuel_vlsfo_usd"]), 2),
            port_congestion_east_india_days=round(float(row["port_congestion_east_india_days"]), 1),
            china_manufacturing_pmi=round(float(row["china_manufacturing_pmi"]), 2),
            usd_inr=round(float(row["usd_inr"]), 2)
        )

    def predict_freight(self, req: ForecastRequest) -> ForecastResponse:
        # Prepare feature vector starting from latest known row
        feature_dict = {feat: float(self.latest_row[feat]) for feat in self.feature_names}

        # Apply What-If Scenario Overrides if specified
        if req.scenario_overrides:
            overrides = req.scenario_overrides.model_dump(exclude_none=True)
            for k, v in overrides.items():
                if k in feature_dict:
                    feature_dict[k] = float(v)

        X_input = pd.DataFrame([feature_dict])[self.feature_names]
        raw_bci_pred = float(self.model.predict(X_input)[0])

        # Adjust for horizon scaling (e.g. 1d, 7d, 14d, 30d)
        current_bci = float(self.latest_row["bci_index"])
        current_c5 = float(self.latest_row["route_c5_usd_per_tonne"])
        current_c3 = float(self.latest_row["route_c3_usd_per_tonne"])

        horizon_factor = req.horizon_days / 7.0
        delta_bci = (raw_bci_pred - current_bci) * np.sqrt(horizon_factor)
        forecast_bci = current_bci + delta_bci

        # Calculate Voyage Rates ($/tonne)
        # Empirical conversion: C5 (Australia->India/China) ~ 5.2 + (BCI / 680) + (VLSFO / 170)
        vlsfo = feature_dict.get("bunker_fuel_vlsfo_usd", 640.0)
        forecast_c5 = 5.2 + (forecast_bci / 680.0) + (vlsfo / 170.0)
        forecast_c3 = 11.0 + (forecast_bci / 320.0) + (vlsfo / 95.0)

        # Select target metric
        if req.route.upper() == "C5":
            target_metric = "Route C5 Freight (USD / Metric Tonne)"
            spot_val = current_c5
            pred_val = forecast_c5
            ci_std = 0.85 * np.sqrt(horizon_factor)
        elif req.route.upper() == "C3":
            target_metric = "Route C3 Freight (USD / Metric Tonne)"
            spot_val = current_c3
            pred_val = forecast_c3
            ci_std = 1.45 * np.sqrt(horizon_factor)
        else:
            target_metric = "Baltic Capesize Index (BCI Points)"
            spot_val = current_bci
            pred_val = forecast_bci
            ci_std = 260.0 * np.sqrt(horizon_factor)

        pct_change = ((pred_val - spot_val) / spot_val) * 100
        lower_bound = max(0.0, pred_val - (1.96 * ci_std))
        upper_bound = pred_val + (1.96 * ci_std)

        # Automated Procurement Decision
        if pct_change >= 4.0:
            decision = ProcurementDecision(
                action="CHARTER_NOW",
                urgency="HIGH",
                color="green",
                rationale=f"Freight rates on {req.route.upper()} projected to surge by +{pct_change:.1f}% over the next {req.horizon_days} days. Charter now to lock in lower spot freight.",
                expected_change_pct=round(pct_change, 2)
            )
        elif pct_change <= -4.0:
            decision = ProcurementDecision(
                action="WAIT",
                urgency="MEDIUM",
                color="red",
                rationale=f"Freight rates on {req.route.upper()} projected to soften by {pct_change:.1f}% over the next {req.horizon_days} days. Delaying tender offers cost savings.",
                expected_change_pct=round(pct_change, 2)
            )
        else:
            decision = ProcurementDecision(
                action="HOLD_NEUTRAL",
                urgency="LOW",
                color="gray",
                rationale=f"Freight rates expected to stay range-bound ({pct_change:+.1f}% change). Standard procurement cadence recommended.",
                expected_change_pct=round(pct_change, 2)
            )

        return ForecastResponse(
            date_evaluated=str(self.latest_row["date"]),
            target_metric=target_metric,
            current_spot_rate=round(spot_val, 2),
            predicted_rate=round(pred_val, 2),
            expected_change_pct=round(pct_change, 2),
            confidence_interval_95pct={
                "lower": round(lower_bound, 2),
                "upper": round(upper_bound, 2)
            },
            recommendation=decision,
            route_details={
                "route_c5_usd_tonne": round(forecast_c5, 2),
                "route_c3_usd_tonne": round(forecast_c3, 2),
                "capesize_bci_points": round(forecast_bci, 1),
                "horizon_days": req.horizon_days
            }
        )

    def get_executive_briefing(self) -> ExecutiveBriefingResponse:
        with open(self.briefing_path, "r") as f:
            briefing = json.load(f)

        dec = briefing["procurement_decision"]
        decision_obj = ProcurementDecision(
            action=dec["action"],
            urgency=dec["urgency"],
            color=dec["color"],
            rationale=dec["rationale"],
            expected_change_pct=dec["expected_change_pct"]
        )

        return ExecutiveBriefingResponse(
            latest_date=briefing["latest_date"],
            current_spot_bci=briefing["current_spot_bci"],
            forecast_7d_bci=briefing["forecast_7d_bci"],
            net_rate_change=briefing["net_rate_change"],
            procurement_decision=decision_obj,
            bullish_drivers_raising_freight=briefing["bullish_drivers_raising_freight"],
            bearish_drivers_lowering_freight=briefing["bearish_drivers_lowering_freight"],
            top_overall_factors=briefing["top_overall_factors"],
            summary_chart_url="/reports/shap_summary.png",
            waterfall_chart_url="/reports/shap_latest_waterfall.png"
        )

    def get_history(self, limit: int = 90):
        sliced = self.df.tail(limit)[["date", "bci_index", "bdi_index", "route_c5_usd_per_tonne", "route_c3_usd_per_tonne", "iron_ore_price_usd", "bunker_fuel_vlsfo_usd", "port_congestion_east_india_days"]]
        return sliced.to_dict(orient="records")
