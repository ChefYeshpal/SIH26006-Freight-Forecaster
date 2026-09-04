# 📘 SIH26006 Maritime Freight Dataset Dictionary
### *Intelligent Freight Forecasting Model for Ministry of Steel Bulk Cargo Procurement*

---

## 📌 Dataset Overview

This dataset simulates historical daily maritime freight dynamics, economic drivers, logistics indicators, and forward-looking prediction targets specifically configured for bulk cargo transport (iron ore, coking coal) to the **East Coast of India (Paradip, Visakhapatnam, Kamarajar/Ennore, Haldia)**.

- **Temporal Coverage:** January 2, 2019 to August 30, 2024 (Business / Trading Days)
- **Total Rows (Cleaned):** 1,388 trading days (completely null-free and pre-aligned)
- **Primary Beneficiary:** Ministry of Steel, Government of India (for vessel chartering & procurement optimization)
- **Files:**
  - `data/raw/freight_dataset_raw.csv`: Raw time-series market variables without lag transformations.
  - `data/processed/freight_dataset_cleaned.csv`: Fully cleaned, feature-engineered, null-free dataset ready for direct input into Scikit-Learn, XGBoost, LightGBM, PyTorch, or TensorFlow.

---

## 🎯 Target Variables (What the AI Models Predict)

| Variable Name | Type | Unit | Description | Why It Matters to Ministry of Steel |
|---|---|---|---|---|
| `target_bci_next_1d` | Continuous | Index Points | Capesize Index value 1 business day ahead | High-frequency day-to-day chartering decisions |
| `target_bci_next_7d` | Continuous | Index Points | Capesize Index value 7 business days ahead | **Primary operational target**: optimal spot chartering window |
| `target_bci_next_14d` | Continuous | Index Points | Capesize Index value 14 business days ahead | Tactical vessel booking before vessel supply tightens |
| `target_bci_next_30d` | Continuous | Index Points | Capesize Index value 30 business days ahead | Strategic monthly cargo procurement & quarterly budget planning |
| `target_c5_next_7d` | Continuous | USD / metric tonne | Freight rate on C5 Route (Port Hedland, Australia → East Coast India/Asia) 7 days ahead | Direct voyage freight cost estimation for Australian iron ore/coal |
| `target_c3_next_7d` | Continuous | USD / metric tonne | Freight rate on C3 Route (Tubarão, Brazil → East Coast India/Asia) 7 days ahead | Long-haul bulk shipping rate estimation for Brazilian iron ore |
| `chartering_signal` | Categorical (-1, 0, 1) | Signal | `1` = CHARTER_NOW, `-1` = WAIT, `0` = HOLD | Automated decision engine signal (>4% expected rate rise or fall) |
| `chartering_recommendation` | String | Recommendation | Human-readable chartering recommendation | Non-technical interface display for procurement officers |

---

## 📈 Core Market & Maritime Features (Input Variables)

### 1. Shipping Indices
| Variable Name | Unit | Description |
|---|---|---|
| `bci_index` | Points (typically 1,000 – 10,000) | **Baltic Capesize Index**: The benchmark for large bulk carriers (>150k DWT) carrying iron ore and coal. |
| `bdi_index` | Points (typically 400 – 5,500) | **Baltic Dry Index**: Composite benchmark for overall global dry bulk shipping freight. |
| `route_c5_usd_per_tonne` | USD / MT (typically $5 – $24) | Freight cost per tonne for shipping iron ore from Australia to Asia/India. |
| `route_c3_usd_per_tonne` | USD / MT (typically $11 – $45) | Freight cost per tonne for long-haul shipping from Brazil to Asia/India. |

### 2. Commodity Prices & Energy Costs
| Variable Name | Unit | Description |
|---|---|---|
| `iron_ore_price_usd` | USD / MT | Iron Ore Fines 62% Fe CFR China benchmark. Higher prices signal strong steel demand, boosting shipping rates. |
| `coking_coal_price_usd` | USD / MT | Premium hard coking coal (Australia/Global). Key raw material for blast furnace steelmaking. |
| `brent_crude_usd` | USD / barrel | Global crude oil benchmark; drives operating costs across all shipping sectors. |
| `bunker_fuel_vlsfo_usd` | USD / MT | Very Low Sulphur Fuel Oil (VLSFO); fuel accounts for 40–60% of total vessel voyage operating expenses. |

### 3. Macroeconomic & Currency Indicators
| Variable Name | Unit | Description |
|---|---|---|
| `china_manufacturing_pmi` | Index (46 – 54) | China Manufacturing Purchasing Managers' Index (>50 = expansion, <50 = contraction). China consumes ~70% of seaborne iron ore. |
| `sp500_index` | Points | S&P 500 Index; global economic sentiment and liquidity proxy. |
| `usd_cny` | Ratio | US Dollar to Chinese Yuan exchange rate. |
| `usd_inr` | Ratio | US Dollar to Indian Rupee exchange rate; determines landed INR cost of imported raw materials. |
| `india_steel_production_mt` | Million Tonnes / month | Monthly domestic crude steel production in India. |

### 4. Fleet & Port Supply-Chain Conditions
| Variable Name | Unit | Description |
|---|---|---|
| `capesize_fleet_dwt_m` | Million DWT | Total active global Capesize deadweight tonnage. High fleet growth creates oversupply and depresses rates. |
| `vessel_orderbook_pct` | Percentage (%) | Capesize orderbook as percentage of existing fleet (future vessel delivery pipeline). |
| `port_congestion_east_india_days` | Days wait | Average vessel berthing delay and queue duration at East Coast Indian ports (Paradip, Vizag). High wait times tie up ship supply. |
| `port_congestion_china_days` | Days wait | Average queue days at major Chinese iron ore discharge ports (Qingdao, Caofeidian). |

### 5. Calendar & Seasonality Encodings
| Variable Name | Unit | Description |
|---|---|---|
| `is_chinese_new_year` | Binary (0 or 1) | Indicator for late Jan / Feb Chinese Spring Festival slowdown (annual freight seasonal low). |
| `is_monsoon_season` | Binary (0 or 1) | Indicator for Indian Southwest Monsoon (June–Sept) affecting port discharge operations. |
| `day_of_week` | Integer (0–4) | Monday = 0, Friday = 4. Captures trading day patterns. |
| `month` | Integer (1–12) | Calendar month. |
| `quarter` | Integer (1–4) | Calendar quarter. |
| `sin_day_of_year` | Sine float (-1 to 1) | Continuous cyclical sine encoding of annual cycle. |
| `cos_day_of_year` | Cosine float (-1 to 1) | Continuous cyclical cosine encoding of annual cycle. |

---

## 🛠️ Engineered Features (Ready for Machine Learning)

### Lag Features (Captures Historical Momentum)
- `bci_lag_1`, `bci_lag_2`, `bci_lag_3`, `bci_lag_7`, `bci_lag_14`, `bci_lag_30`: BCI values from 1, 2, 3, 7, 14, and 30 trading days prior.
- `bdi_lag_1`, `bdi_lag_2`, `bdi_lag_3`, `bdi_lag_7`, `bdi_lag_14`, `bdi_lag_30`: BDI historical values.
- `c5_lag_1`, `c5_lag_2`, `c5_lag_3`, `c5_lag_7`, `c5_lag_14`, `c5_lag_30`: C5 route rate lags.
- `c3_lag_1`, `c3_lag_7`, `c3_lag_14`: C3 route rate lags.

### Moving Averages & Rolling Volatilities
- `bci_ma_7`, `bci_ma_14`, `bci_ma_30`, `bci_ma_60`: 7-day, 14-day, 30-day, and 60-day moving averages (smoothing short and medium-term trends).
- `bci_std_7`, `bci_std_14`, `bci_std_30`, `bci_std_60`: Rolling standard deviation capturing market turbulence and volatility.
- `c5_ma_7`, `c5_ma_14`, `c5_ma_30`, `c5_ma_60`: Rolling moving averages for C5 route.

### Rates of Change (ROC)
- `bci_roc_7`: 7-day percentage rate of change in BCI: `(BCI_today - BCI_7d_ago) / BCI_7d_ago`
- `bci_roc_14`: 14-day percentage rate of change in BCI.
- `c5_roc_7`: 7-day percentage rate of change on route C5.

### Economic Ratios
- `fuel_to_c5_ratio`: Bunker fuel cost relative to freight earned per voyage.
- `iron_ore_to_bci_ratio`: Commodity value to shipping cost ratio.
- `bci_to_bdi_ratio`: Capesize strength relative to general dry bulk market.

---

## 🚀 How to Load and Train Immediately

```python
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# 1. Load the cleaned dataset
df = pd.read_csv("data/processed/freight_dataset_cleaned.csv")

# 2. Separate features (X) and target (y)
target_column = "target_bci_next_7d"  # or 'target_c5_next_7d'
exclude_columns = [
    "date",
    "target_bci_next_1d", "target_bci_next_7d", "target_bci_next_14d", "target_bci_next_30d",
    "target_c5_next_7d", "target_c3_next_7d",
    "chartering_signal", "chartering_recommendation"
]

feature_columns = [col for col in df.columns if col not in exclude_columns]

# 3. Time-ordered train/test split (NEVER shuffle time-series data)
split_point = int(len(df) * 0.8)
X_train, y_train = df[feature_columns].iloc[:split_point], df[target_column].iloc[:split_point]
X_test, y_test = df[feature_columns].iloc[split_point:], df[target_column].iloc[split_point:]

# 4. Fit model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Predict
predictions = model.predict(X_test)
print("Sample predictions:", predictions[:5])
```
