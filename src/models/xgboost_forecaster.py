"""
XGBoost Freight Rate Forecasting Model for SIH26006
Handles multi-feature gradient boosting regression with time-series evaluation.
"""

import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error

class XGBoostFreightForecaster:
    def __init__(self, target_col="target_bci_next_7d", n_estimators=300, max_depth=6, learning_rate=0.03):
        self.target_col = target_col
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.model = None
        self.feature_names = []
        self.metrics = {}

    def prepare_data(self, df, train_ratio=0.8, val_ratio=0.1):
        exclude_cols = [
            "date",
            "target_bci_next_1d", "target_bci_next_7d", "target_bci_next_14d", "target_bci_next_30d",
            "target_c5_next_7d", "target_c3_next_7d",
            "chartering_signal", "chartering_recommendation"
        ]
        self.feature_names = [col for col in df.columns if col not in exclude_cols]

        n = len(df)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))

        train_df = df.iloc[:train_end]
        val_df = df.iloc[train_end:val_end]
        test_df = df.iloc[val_end:]

        X_train, y_train = train_df[self.feature_names], train_df[self.target_col]
        X_val, y_val = val_df[self.feature_names], val_df[self.target_col]
        X_test, y_test = test_df[self.feature_names], test_df[self.target_col]

        return (X_train, y_train), (X_val, y_val), (X_test, y_test), (train_df, val_df, test_df)

    def train(self, df):
        (X_train, y_train), (X_val, y_val), (X_test, y_test), (train_df, val_df, test_df) = self.prepare_data(df)

        print(f"[XGBoost] Training on {len(X_train)} samples with {len(self.feature_names)} features...")
        print(f"[XGBoost] Validation on {len(X_val)} samples | Test on {len(X_test)} samples")

        self.model = xgb.XGBRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            n_jobs=-1,
            early_stopping_rounds=35,
            eval_metric="rmse"
        )

        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )

        # Test set evaluation
        test_preds = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, test_preds)
        rmse = root_mean_squared_error(y_test, test_preds)
        mape = mean_absolute_percentage_error(y_test, test_preds) * 100

        # Directional accuracy vs current BCI
        current_bci = test_df["bci_index"].values
        actual_dir = np.sign(y_test.values - current_bci)
        pred_dir = np.sign(test_preds - current_bci)
        dir_acc = np.mean(actual_dir == pred_dir) * 100

        self.metrics = {
            "model_type": "XGBoost",
            "target": self.target_col,
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape": round(float(mape), 2),
            "directional_accuracy": round(float(dir_acc), 2),
            "test_samples": len(test_preds)
        }

        print(f"[XGBoost Results] Test MAE: {mae:.2f} | RMSE: {rmse:.2f} | MAPE: {mape:.2f}% | Directional Acc: {dir_acc:.2f}%")
        return self.metrics, test_preds, y_test.values, test_df

    def predict(self, X):
        if self.model is None:
            raise ValueError("Model has not been trained yet.")
        if isinstance(X, pd.DataFrame):
            X = X[self.feature_names]
        return self.model.predict(X)

    def save(self, output_dir="models"):
        os.makedirs(output_dir, exist_ok=True)
        model_path = os.path.join(output_dir, "xgboost_forecaster.json")
        meta_path = os.path.join(output_dir, "xgboost_metadata.json")

        self.model.save_model(model_path)
        with open(meta_path, "w") as f:
            json.dump({
                "feature_names": self.feature_names,
                "target_col": self.target_col,
                "metrics": self.metrics
            }, f, indent=2)

        print(f"[XGBoost] Model saved to {model_path} and metadata to {meta_path}")

if __name__ == "__main__":
    data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    df = pd.read_csv(data_path)
    forecaster = XGBoostFreightForecaster()
    forecaster.train(df)
    forecaster.save()
