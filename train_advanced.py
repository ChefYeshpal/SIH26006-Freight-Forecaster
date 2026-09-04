"""
SIH26006: Master Advanced AI/ML Pipeline
Trains XGBoost + BiLSTM + Ensemble + Generates SHAP Explainability Reports.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

# Add src to pythonpath
sys.path.append(os.path.abspath("."))

from src.models.xgboost_forecaster import XGBoostFreightForecaster
from src.models.lstm_forecaster import LSTMFreightForecaster
from src.models.ensemble_forecaster import HybridEnsembleForecaster
from src.models.explainability_shap import FreightExplainabilityEngine

def run_pipeline():
    print("=" * 75)
    print("🚢 SIH26006: INTELLIGENT FREIGHT FORECASTING AI PIPELINE")
    print("   Bulk Cargo Procurement & Vessel Chartering (East Coast of India)")
    print("=" * 75)

    data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {data_path}. Run generate_dataset.py first.")

    df = pd.read_csv(data_path)
    print(f"\n[1/5] Loaded cleaned dataset: {df.shape[0]} rows, {df.shape[1]} columns.\n")

    # 1. Train XGBoost Model
    print("[2/5] Training Gradient Boosted Trees (XGBoost)...")
    xgb_forecaster = XGBoostFreightForecaster(target_col="target_bci_next_7d", n_estimators=250, max_depth=6)
    xgb_metrics, xgb_preds, y_test, test_df = xgb_forecaster.train(df)
    xgb_forecaster.save()

    # 2. Train Deep Learning BiLSTM Model
    print("\n[3/5] Training Recurrent Neural Network (BiLSTM Deep Learning)...")
    lstm_forecaster = LSTMFreightForecaster(target_col="target_bci_next_7d", lookback=30, hidden_dim=64, epochs=35)
    lstm_metrics, lstm_preds, lstm_y_true, eval_df = lstm_forecaster.train(df)
    lstm_forecaster.save()

    # Align predictions (LSTM uses lookback=30, so evaluate on common sequence overlap)
    n_common = len(lstm_preds)
    xgb_aligned_preds = xgb_preds[-n_common:]
    actual_aligned_y = lstm_y_true
    common_eval_df = eval_df.tail(n_common).reset_index(drop=True)
    current_bci = common_eval_df["bci_index"].values

    # 3. Ridge Linear Baseline
    (X_train, y_train), _, (X_test, _), _ = xgb_forecaster.prepare_data(df)
    ridge = Ridge(alpha=100.0)
    ridge.fit(X_train, y_train)
    ridge_preds = ridge.predict(X_test)[-n_common:]

    # 4. Hybrid Ensemble Blending
    print("\n[4/5] Blending Models into Weighted Hybrid Ensemble...")
    ensemble = HybridEnsembleForecaster(weights={"xgboost": 0.55, "lstm": 0.35, "ridge": 0.10})
    preds_dict = {
        "xgboost": xgb_aligned_preds,
        "lstm": lstm_preds,
        "ridge": ridge_preds
    }
    ensemble_preds, lower_bounds, upper_bounds, ensemble_metrics = ensemble.evaluate_ensemble(
        preds_dict, actual_aligned_y, current_bci
    )

    # 5. SHAP Model Explainability Engine
    print("[5/5] Computing SHAP Shapley Feature Attributions & Executive Briefing...")
    X_test_xgb = test_df[xgb_forecaster.feature_names]
    explainability_engine = FreightExplainabilityEngine(xgb_forecaster.model, xgb_forecaster.feature_names)
    explainability_engine.compute_shap_values(X_test_xgb.iloc[-80:])
    summary_path, waterfall_path = explainability_engine.generate_visual_reports(X_test_xgb.iloc[-80:], output_dir="reports")

    # Generate Plain-English Briefing for Ministry of Steel
    executive_briefing = explainability_engine.generate_ministry_briefing(sample_idx=-1)

    # Get latest operational chartering recommendation
    latest_current_bci = float(current_bci[-1])
    latest_forecast_bci = float(ensemble_preds[-1])
    decision = ensemble.generate_procurement_decision(latest_current_bci, latest_forecast_bci)

    executive_briefing["procurement_decision"] = decision
    executive_briefing["latest_date"] = str(common_eval_df["date"].iloc[-1])
    executive_briefing["current_spot_bci"] = latest_current_bci
    executive_briefing["forecast_7d_bci"] = latest_forecast_bci
    executive_briefing["forecast_range_95pct"] = {
        "lower": round(float(lower_bounds[-1]), 1),
        "upper": round(float(upper_bounds[-1]), 1)
    }

    # Save summary artifacts
    os.makedirs("models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    summary_results = {
        "models": {
            "xgboost": xgb_metrics,
            "bilstm": lstm_metrics,
            "ensemble": ensemble_metrics
        },
        "latest_decision": decision,
        "reports": {
            "shap_summary_plot": summary_path,
            "shap_waterfall_plot": waterfall_path
        }
    }

    with open("models/ensemble_summary.json", "w") as f:
        json.dump(summary_results, f, indent=2)

    with open("reports/executive_briefing.json", "w") as f:
        json.dump(executive_briefing, f, indent=2)

    # Print Final Scorecard
    print("\n" + "=" * 75)
    print("📊 SIH26006 MODEL EVALUATION SCORECARD (Test Set Comparison)")
    print("=" * 75)
    print(f"{'Model Architecture':25s} | {'MAE':8s} | {'RMSE':8s} | {'MAPE (%)':10s} | {'Dir Acc (%)':12s}")
    print("-" * 75)
    print(f"{'XGBoost Regressor':25s} | {xgb_metrics['mae']:8.2f} | {xgb_metrics['rmse']:8.2f} | {xgb_metrics['mape']:9.2f}% | {xgb_metrics['directional_accuracy']:10.2f}%")
    print(f"{'BiLSTM Deep Learning':25s} | {lstm_metrics['mae']:8.2f} | {lstm_metrics['rmse']:8.2f} | {lstm_metrics['mape']:9.2f}% | {lstm_metrics['directional_accuracy']:10.2f}%")
    print(f"{'Hybrid Ensemble (Best)':25s} | {ensemble_metrics['mae']:8.2f} | {ensemble_metrics['rmse']:8.2f} | {ensemble_metrics['mape']:9.2f}% | {ensemble_metrics['directional_accuracy']:10.2f}%")
    print("=" * 75)

    print("\n🎯 LATEST MINISTRY PROCUREMENT RECOMMENDATION:")
    print(f"Action:       [{decision['action']}] (Urgency: {decision['urgency']})")
    print(f"Spot BCI:     {latest_current_bci:.1f} -> 7-Day Forecast: {latest_forecast_bci:.1f} ({decision['expected_change_pct']:+.1f}%)")
    print(f"Confidence:   [{lower_bounds[-1]:.1f} to {upper_bounds[-1]:.1f}] (95% CI)")
    print(f"Rationale:    {decision['rationale']}")
    print("=" * 75)

if __name__ == "__main__":
    run_pipeline()
