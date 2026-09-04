"""
Baseline Machine Learning Training Pipeline for SIH26006 Freight Forecasting
Demonstrating direct usability of the cleaned mock dataset.
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error

def main():
    data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    print(f"Loading cleaned dataset from: {data_path}")
    df = pd.read_csv(data_path)
    
    # 1. Feature selection
    target_col = "target_bci_next_7d"  # 7-day forward Capesize freight rate
    exclude_cols = [
        "date",
        "target_bci_next_1d", "target_bci_next_7d", "target_bci_next_14d", "target_bci_next_30d",
        "target_c5_next_7d", "target_c3_next_7d",
        "chartering_signal", "chartering_recommendation"
    ]
    features = [col for col in df.columns if col not in exclude_cols]
    
    print(f"Dataset Size: {df.shape[0]} rows, {len(features)} predictive features")
    print(f"Forecasting Target: '{target_col}' (7 business days ahead)\n")

    # 2. Chronological Split (80% Train, 20% Test)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    X_train, y_train = train_df[features], train_df[target_col]
    X_test, y_test = test_df[features], test_df[target_col]

    print(f"Training Range:   {train_df['date'].min()} to {train_df['date'].max()} ({len(X_train)} samples)")
    print(f"Test/Eval Range:  {test_df['date'].min()} to {test_df['date'].max()} ({len(X_test)} samples)\n")

    # 3. Train Models
    models = {
        "Ridge Regression": Ridge(alpha=100.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=150, learning_rate=0.05, max_depth=5, random_state=42)
    }

    results = []
    trained_models = {}

    print("-" * 75)
    print(f"{'Model Name':22s} | {'MAE':8s} | {'RMSE':8s} | {'MAPE (%)':10s} | {'Dir Acc (%)':12s}")
    print("-" * 75)

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        trained_models[name] = model

        mae = mean_absolute_error(y_test, preds)
        rmse = root_mean_squared_error(y_test, preds)
        mape = mean_absolute_percentage_error(y_test, preds) * 100

        # Directional accuracy: did the rate move up or down over 7 days as predicted?
        actual_movement = np.sign(y_test.values - test_df["bci_index"].values)
        predicted_movement = np.sign(preds - test_df["bci_index"].values)
        dir_acc = np.mean(actual_movement == predicted_movement) * 100

        results.append({
            "model": name,
            "mae": mae,
            "rmse": rmse,
            "mape": mape,
            "dir_acc": dir_acc
        })
        print(f"{name:22s} | {mae:8.2f} | {rmse:8.2f} | {mape:9.2f}% | {dir_acc:10.2f}%")

    print("-" * 75)

    # 4. Show top 5 features from Gradient Boosting
    gb_model = trained_models["Gradient Boosting"]
    top_indices = np.argsort(gb_model.feature_importances_)[::-1][:5]
    print("\nTop 5 Drivers for 7-Day Freight Forecast (Gradient Boosting):")
    for i, idx in enumerate(top_indices, 1):
        print(f"  {i}. {features[idx]:30s} -> Importance: {gb_model.feature_importances_[idx]:.4f}")

    # 5. Sample Predictions
    sample_preds = gb_model.predict(X_test.iloc[:5])
    sample_actual = y_test.iloc[:5].values
    sample_dates = test_df["date"].iloc[:5].values
    sample_current_bci = test_df["bci_index"].iloc[:5].values

    print("\nSample Forecast vs Actual (Next 7 Days Ahead):")
    print(f"{'Date':12s} | {'Current BCI':12s} | {'Predicted (7d)':15s} | {'Actual (7d)':12s} | {'Abs Error':10s}")
    print("-" * 70)
    for dt, curr, p, a in zip(sample_dates, sample_current_bci, sample_preds, sample_actual):
        print(f"{dt:12s} | {curr:12.1f} | {p:15.1f} | {a:12.1f} | {abs(p - a):10.1f}")

if __name__ == "__main__":
    main()
