"""
Deep Learning BiLSTM Sequential Freight Forecasting Model for SIH26006
Captures multi-week temporal dependencies and regime shifts using recurrent neural networks.
"""

import os
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error

class TimeSeriesDataset(Dataset):
    def __init__(self, X_sequences, y_targets):
        self.X = torch.tensor(X_sequences, dtype=torch.float32)
        self.y = torch.tensor(y_targets, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class BiLSTMFreightNet(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=True
        )
        self.fc1 = nn.Linear(hidden_dim * 2, 32)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(32, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        # Take the output of the final time step
        last_step = lstm_out[:, -1, :]
        out = self.dropout(self.relu(self.fc1(last_step)))
        return self.fc2(out).squeeze(-1)

class LSTMFreightForecaster:
    def __init__(self, target_col="target_bci_next_7d", lookback=30, hidden_dim=64, num_layers=2, lr=0.003, epochs=45):
        self.target_col = target_col
        self.lookback = lookback
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.lr = lr
        self.epochs = epochs
        self.model = None
        self.feature_scaler = StandardScaler()
        self.target_scaler = StandardScaler()
        self.feature_names = []
        self.metrics = {}

    def create_sequences(self, X_scaled, y_scaled):
        X_seq, y_seq = [], []
        for i in range(len(X_scaled) - self.lookback):
            X_seq.append(X_scaled[i : i + self.lookback])
            y_seq.append(y_scaled[i + self.lookback])
        return np.array(X_seq), np.array(y_seq)

    def train(self, df, train_ratio=0.8, val_ratio=0.1):
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

        # Split
        train_raw = df.iloc[:train_end]
        val_raw = df.iloc[train_end:val_end]
        test_raw = df.iloc[val_end:]

        # Scale features and target based on train data only
        X_train_scaled = self.feature_scaler.fit_transform(train_raw[self.feature_names])
        y_train_scaled = self.target_scaler.fit_transform(train_raw[[self.target_col]]).ravel()

        X_val_scaled = self.feature_scaler.transform(val_raw[self.feature_names])
        y_val_scaled = self.target_scaler.transform(val_raw[[self.target_col]]).ravel()

        X_test_scaled = self.feature_scaler.transform(test_raw[self.feature_names])
        y_test_scaled = self.target_scaler.transform(test_raw[[self.target_col]]).ravel()

        # Build rolling 30-day sequences
        X_train_seq, y_train_seq = self.create_sequences(X_train_scaled, y_train_scaled)
        X_val_seq, y_val_seq = self.create_sequences(X_val_scaled, y_val_scaled)
        X_test_seq, y_test_seq = self.create_sequences(X_test_scaled, y_test_scaled)

        print(f"[LSTM] Created sequences (Lookback={self.lookback} days):")
        print(f"       Train: {X_train_seq.shape[0]} | Val: {X_val_seq.shape[0]} | Test: {X_test_seq.shape[0]}")

        train_loader = DataLoader(TimeSeriesDataset(X_train_seq, y_train_seq), batch_size=32, shuffle=True)
        val_loader = DataLoader(TimeSeriesDataset(X_val_seq, y_val_seq), batch_size=32, shuffle=False)

        input_dim = len(self.feature_names)
        self.model = BiLSTMFreightNet(input_dim, self.hidden_dim, self.num_layers)
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.lr, weight_decay=1e-4)

        best_val_loss = float("inf")
        best_state = None

        for epoch in range(1, self.epochs + 1):
            self.model.train()
            train_loss = 0.0
            for bx, by in train_loader:
                optimizer.zero_grad()
                pred = self.model(bx)
                loss = criterion(pred, by)
                loss.backward()
                nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()
                train_loss += loss.item() * len(bx)
            train_loss /= len(X_train_seq)

            self.model.eval()
            val_loss = 0.0
            with torch.no_grad():
                for bx, by in val_loader:
                    pred = self.model(bx)
                    loss = criterion(pred, by)
                    val_loss += loss.item() * len(bx)
            val_loss /= len(X_val_seq)

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_state = self.model.state_dict().copy()

        if best_state is not None:
            self.model.load_state_dict(best_state)

        # Test evaluation
        self.model.eval()
        with torch.no_grad():
            test_x_tensor = torch.tensor(X_test_seq, dtype=torch.float32)
            scaled_preds = self.model(test_x_tensor).numpy()

        # Inverse transform to original BCI scale
        test_preds = self.target_scaler.inverse_transform(scaled_preds.reshape(-1, 1)).ravel()
        actual_test_y = self.target_scaler.inverse_transform(y_test_seq.reshape(-1, 1)).ravel()

        mae = mean_absolute_error(actual_test_y, test_preds)
        rmse = root_mean_squared_error(actual_test_y, test_preds)
        mape = mean_absolute_percentage_error(actual_test_y, test_preds) * 100

        # Evaluate directional accuracy
        eval_df = test_raw.iloc[self.lookback:].reset_index(drop=True)
        current_bci = eval_df["bci_index"].values
        actual_dir = np.sign(actual_test_y - current_bci)
        pred_dir = np.sign(test_preds - current_bci)
        dir_acc = np.mean(actual_dir == pred_dir) * 100

        self.metrics = {
            "model_type": "BiLSTM_DeepLearning",
            "target": self.target_col,
            "lookback_days": self.lookback,
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape": round(float(mape), 2),
            "directional_accuracy": round(float(dir_acc), 2),
            "test_samples": len(test_preds)
        }

        print(f"[LSTM Results] Test MAE: {mae:.2f} | RMSE: {rmse:.2f} | MAPE: {mape:.2f}% | Directional Acc: {dir_acc:.2f}%")
        return self.metrics, test_preds, actual_test_y, eval_df

    def save(self, output_dir="models"):
        os.makedirs(output_dir, exist_ok=True)
        model_path = os.path.join(output_dir, "bilstm_freight_net.pt")
        meta_path = os.path.join(output_dir, "bilstm_metadata.json")

        torch.save(self.model.state_dict(), model_path)
        with open(meta_path, "w") as f:
            json.dump({
                "feature_names": self.feature_names,
                "target_col": self.target_col,
                "lookback": self.lookback,
                "hidden_dim": self.hidden_dim,
                "num_layers": self.num_layers,
                "metrics": self.metrics
            }, f, indent=2)

        print(f"[LSTM] Weights saved to {model_path} and metadata to {meta_path}")

if __name__ == "__main__":
    data_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")
    df = pd.read_csv(data_path)
    lstm_forecaster = LSTM出FreightForecaster()
    lstm_forecaster.train(df)
    lstm_forecaster.save()
