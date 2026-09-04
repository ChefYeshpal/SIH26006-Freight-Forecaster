"""
SHAP Explainability Module for SIH26006 Freight Forecasting
Translates machine learning black-box predictions into actionable Ministry of Steel intelligence.
"""

import os
import json
import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

class FreightExplainabilityEngine:
    def __init__(self, model, feature_names):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self.shap_values = None

    def fit_explainer(self, X_background):
        print("[SHAP] Fitting TreeExplainer on background feature data...")
        self.explainer = shap.TreeExplainer(self.model)
        return self.explainer

    def compute_shap_values(self, X_sample):
        if self.explainer is None:
            self.fit_explainer(X_sample)
        print(f"[SHAP] Computing Shapley values for {len(X_sample)} instances...")
        self.shap_values = self.explainer(X_sample)
        return self.shap_values

    def generate_visual_reports(self, X_test, output_dir="reports"):
        os.makedirs(output_dir, exist_ok=True)
        if self.shap_values is None:
            self.compute_shap_values(X_test)

        # 1. Global Summary Bar Plot
        fig, ax = plt.subplots(figsize=(10, 6))
        shap.summary_plot(self.shap_values, X_test, show=False, max_display=12)
        plt.title("SHAP Global Feature Impact on 7-Day Freight Rate (BCI)", fontsize=13, pad=15)
        plt.tight_layout()
        summary_path = os.path.join(output_dir, "shap_summary.png")
        plt.savefig(summary_path, dpi=200)
        plt.close()
        print(f"[SHAP] Saved summary plot to {summary_path}")

        # 2. Local Waterfall Plot for the Most Recent Forecast Day
        fig, ax = plt.subplots(figsize=(9, 6))
        shap.plots.waterfall(self.shap_values[-1], max_display=10, show=False)
        plt.title("Why Did the Model Make This Forecast? (Latest Day Breakdown)", fontsize=12, pad=15)
        plt.tight_layout()
        waterfall_path = os.path.join(output_dir, "shap_latest_waterfall.png")
        plt.savefig(waterfall_path, dpi=200)
        plt.close()
        print(f"[SHAP] Saved latest instance waterfall plot to {waterfall_path}")

        return summary_path, waterfall_path

    def generate_ministry_briefing(self, sample_idx=-1, feature_row=None):
        """
        Translates SHAP values into plain-English briefing for Ministry of Steel officers.
        """
        if self.shap_values is None:
            raise ValueError("Run compute_shap_values first.")

        instance_shap = self.shap_values[sample_idx]
        base_val = float(instance_shap.base_values)
        predicted_val = float(instance_shap.values.sum() + base_val)

        # Pair feature names with their values and shap impact
        impacts = []
        for feat, val, s in zip(self.feature_names, instance_shap.data, instance_shap.values):
            impacts.append({
                "feature": feat,
                "current_value": round(float(val), 2),
                "shap_impact": round(float(s), 2)
            })

        # Sort by absolute impact
        impacts.sort(key=lambda x: abs(x["shap_impact"]), reverse=True)
        top_positive = [item for item in impacts if item["shap_impact"] > 0][:3]
        top_negative = [item for item in impacts if item["shap_impact"] < 0][:3]

        briefing = {
            "baseline_market_level": round(base_val, 1),
            "predicted_rate_bci": round(predicted_val, 1),
            "net_rate_change": round(predicted_val - base_val, 1),
            "bullish_drivers_raising_freight": top_positive,
            "bearish_drivers_lowering_freight": top_negative,
            "top_overall_factors": impacts[:6]
        }
        return briefing

if __name__ == "__main__":
    from xgboost_forecaster import XGBoostFreightForecaster

    data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    df = pd.read_csv(data_path)

    forecaster = XGBoostFreightForecaster()
    metrics, test_preds, y_test, test_df = forecaster.train(df)

    X_test = test_df[forecaster.feature_names]
    engine = FreightExplainabilityEngine(forecaster.model, forecaster.feature_names)
    engine.compute_shap_values(X_test.iloc[-100:])
    engine.generate_visual_reports(X_test.iloc[-100:])

    briefing = engine.generate_ministry_briefing(sample_idx=-1)
    print("\n--- Sample Ministry of Steel Executive Briefing ---")
    print(json.dumps(briefing, indent=2))
