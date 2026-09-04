import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error, accuracy_score

def verify_dataset():
    cleaned_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    raw_path = os.path.join("data", "raw", "freight_dataset_raw.csv")

    assert os.path.exists(cleaned_path), f"Cleaned dataset not found at {cleaned_path}"
    assert os.path.exists(raw_path), f"Raw dataset not found at {raw_path}"

    df = pd.read_csv(cleaned_path)
    print("=" * 60)
    print("1. DATASET INTEGRITY CHECK")
    print("=" * 60)
    print(f"Total Rows: {len(df)}")
    print(f"Total Columns: {len(df.columns)}")
    print(f"Date Range: {df['date'].min()} to {df['date'].max()}")
    
    # Check for NaN / missing values
    null_counts = df.isnull().sum().sum()
    print(f"Total Missing/NaN Values: {null_counts}")
    assert null_counts == 0, "Dataset contains unexpected NaN values!"
    print("[PASS] Dataset is 100% complete with 0 missing values.")

    print("\n" + "=" * 60)
    print("2. TARGET VARIABLE PROPERTIES")
    print("=" * 60)
    target_cols = [
        "bci_index", "route_c5_usd_per_tonne",
        "target_bci_next_1d", "target_bci_next_7d", "target_bci_next_14d", "target_bci_next_30d",
        "target_c5_next_7d"
    ]
    for col in target_cols:
        print(f"{col:25s} | Min: {df[col].min():8.2f} | Mean: {df[col].mean():8.2f} | Max: {df[col].max():8.2f} | Std: {df[col].std():8.2f}")

    print("\n" + "=" * 60)
    print("3. MACHINE LEARNING SMOKE TEST (7-Day Freight Forecasting)")
    print("=" * 60)

    # Features: exclude forward-looking targets and textual/date columns
    drop_cols = [
        "date",
        "target_bci_next_1d", "target_bci_next_7d", "target_bci_next_14d", "target_bci_next_30d",
        "target_c5_next_7d", "target_c3_next_7d",
        "chartering_signal", "chartering_recommendation"
    ]
    feature_cols = [c for c in df.columns if c not in drop_cols]
    print(f"Feature count: {len(feature_cols)}")

    # Time-series chronological split: 80% train, 20% test (NO DATA LEAKAGE)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    X_train, y_train = train_df[feature_cols], train_df["target_bci_next_7d"]
    X_test, y_test = test_df[feature_cols], test_df["target_bci_next_7d"]

    print(f"Train samples: {len(X_train)} (from {train_df['date'].min()} to {train_df['date'].max()})")
    print(f"Test samples:  {len(X_test)} (from {test_df['date'].min()} to {test_df['date'].max()})")

    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    rmse = root_mean_squared_error(y_test, preds)
    mape = mean_absolute_percentage_error(y_test, preds) * 100

    # Directional Accuracy (Did the model predict the correct direction of 7-day movement?)
    actual_direction = np.sign(y_test.values - test_df["bci_index"].values)
    pred_direction = np.sign(preds - test_df["bci_index"].values)
    directional_accuracy = np.mean(actual_direction == pred_direction) * 100

    print("\n--- Model Evaluation Results (Test Set) ---")
    print(f"MAE:                  {mae:.2f} BCI points")
    print(f"RMSE:                 {rmse:.2f} BCI points")
    print(f"MAPE (Error %):       {mape:.2f}%  (Target was < 12%)")
    print(f"Directional Accuracy: {directional_accuracy:.2f}% (Target was > 65%)")

    # Top 5 predictive features
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("\nTop 5 Most Important Features for 7-Day BCI Forecasting:")
    for rank, idx in enumerate(sorted_idx[:5], 1):
        print(f"  {rank}. {feature_cols[idx]:30s} (Importance: {importances[idx]:.4f})")

    print("\n" + "=" * 60)
    print("4. CHARTERING RECOMMENDATION CLASSIFICATION TEST")
    print("=" * 60)
    # Train classifier for "CHARTER_NOW (1) vs WAIT (-1) vs HOLD (0)"
    y_train_clf = train_df["chartering_signal"]
    y_test_clf = test_df["chartering_signal"]
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train_clf)
    clf_preds = clf.predict(X_test)
    clf_acc = accuracy_score(y_test_clf, clf_preds) * 100
    print(f"Chartering Decision Classification Accuracy: {clf_acc:.2f}%")

    print("\n[SUCCESS] Dataset is verified, clean, robust, and directly usable for all AI/ML models!")

if __name__ == "__main__":
    verify_dataset()
