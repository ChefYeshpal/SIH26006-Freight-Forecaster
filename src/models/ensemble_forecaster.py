"""
Weighted Hybrid Ensemble & Chartering Decision Engine for SIH26006
Combines XGBoost, BiLSTM, and Ridge with uncertainty estimation and automated chartering recommendations.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error

class HybridEnsembleForecaster:
    def __init__(self, weights=None):
        # Default balanced weights: 55% XGBoost, 35% BiLSTM, 10% Ridge
        self.weights = weights or {"xgboost": 0.55, "lstm": 0.35, "ridge": 0.10}
        self.metrics = {}

    def blend_predictions(self, preds_dict):
        """
        Blends predictions using normalized ensemble weights.
        """
        total_w = sum(self.weights[k] for k in preds_dict if k in self.weights)
        combined = np.zeros(len(next(iter(preds_dict.values()))))
        for model_name, preds in preds_dict.items():
            w = self.weights.get(model_name, 0.0) / total_w
            combined += w * np.array(preds)
        return combined

    def compute_confidence_intervals(self, ensemble_preds, historical_residuals_std, confidence_level=0.95):
        """
        Computes lower and upper forecast confidence intervals for risk mitigation.
        """
        z_score = 1.96 if confidence_level == 0.95 else 1.645
        margin = z_score * historical_residuals_std
        lower_bound = np.maximum(0, ensemble_preds - margin)
        upper_bound = ensemble_preds + margin
        return lower_bound, upper_bound

    def generate_procurement_decision(self, current_rate, forecast_rate, threshold_pct=0.04):
        """
        Ministry of Steel decision matrix:
        - Expected rate jump >= +4%: CHARTER_NOW (lock in ships before market jumps)
        - Expected rate drop <= -4%: WAIT (rates softening, postpone chartering)
        - Otherwise: HOLD_NEUTRAL
        """
        expected_change = (forecast_rate - current_rate) / (current_rate + 1e-5)
        pct_display = expected_change * 100

        if expected_change >= threshold_pct:
            return {
                "action": "CHARTER_NOW",
                "urgency": "HIGH",
                "color": "green",
                "rationale": f"Freight rates projected to surge by +{pct_display:.1f}% over the next 7 days. Early chartering locks in lower freight and avoids demurrage.",
                "expected_change_pct": round(float(pct_display), 2)
            }
        elif expected_change <= -threshold_pct:
            return {
                "action": "WAIT",
                "urgency": "MEDIUM",
                "color": "red",
                "rationale": f"Freight rates projected to soften by {pct_display:.1f}% over the next 7 days. Delaying tender offers cost savings for bulk procurement.",
                "expected_change_pct": round(float(pct_display), 2)
            }
        else:
            return {
                "action": "HOLD_NEUTRAL",
                "urgency": "LOW",
                "color": "gray",
                "rationale": f"Freight rates expected to remain range-bound ({pct_display:+.1f}% change). Standard procurement cadence recommended.",
                "expected_change_pct": round(float(pct_display), 2)
            }

    def evaluate_ensemble(self, preds_dict, y_true, current_bci):
        ensemble_preds = self.blend_predictions(preds_dict)
        mae = mean_absolute_error(y_true, ensemble_preds)
        rmse = root_mean_squared_error(y_true, ensemble_preds)
        mape = mean_absolute_percentage_error(y_true, ensemble_preds) * 100

        actual_dir = np.sign(y_true - current_bci)
        pred_dir = np.sign(ensemble_preds - current_bci)
        dir_acc = np.mean(actual_dir == pred_dir) * 100

        residuals_std = np.std(y_true - ensemble_preds)
        lower, upper = self.compute_confidence_intervals(ensemble_preds, residuals_std)

        self.metrics = {
            "model_type": "Hybrid_Ensemble",
            "weights": self.weights,
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape": round(float(mape), 2),
            "directional_accuracy": round(float(dir_acc), 2),
            "residuals_std": round(float(residuals_std), 2)
        }

        print(f"\n============================================================")
        print(f"🏆 HYBRID ENSEMBLE TEST PERFORMANCE")
        print(f"============================================================")
        print(f"Ensemble Test MAE:             {mae:.2f} BCI points")
        print(f"Ensemble Test RMSE:            {rmse:.2f} BCI points")
        print(f"Ensemble Test MAPE:            {mape:.2f}% (Target < 12%)")
        print(f"Ensemble Directional Accuracy: {dir_acc:.2f}% (Target > 65%)")
        print(f"Residuals Volatility (Std):    {residuals_std:.2f} points")
        print(f"============================================================\n")

        return ensemble_preds, lower, upper, self.metrics
