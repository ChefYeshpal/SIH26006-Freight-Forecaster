import os
import math
import datetime
import numpy as np
import pandas as pd

def generate_synthetic_freight_data():
    np.random.seed(42)

    # 1. Date range: Business days from 2019-01-02 to 2024-08-30
    date_range = pd.date_range(start="2019-01-02", end="2024-08-30", freq="B")
    n_days = len(date_range)
    print(f"Generating realistic synthetic freight dataset for {n_days} business days...")

    # 2. Time progression & Macro cycle regimes
    # Regimes:
    # 2019: Baseline pre-covid
    # 2020: Covid crash (Feb-May) then steep recovery (June-Dec)
    # 2021: Historic commodity & dry bulk boom (BDI > 5000)
    # 2022: Inflation / Ukraine energy shock & high volatility
    # 2023: Post-boom normalization
    # 2024: Steady demand, Red Sea rerouting effects
    
    time_idx = np.arange(n_days)
    
    # Base macroeconomic trends
    # Brent Crude Oil ($/bbl)
    brent_base = 65.0
    oil_trend = np.zeros(n_days)
    for i, dt in enumerate(date_range):
        yr = dt.year + (dt.dayofyear / 365.25)
        if yr < 2020.15:
            oil_trend[i] = 60 + 5 * np.sin(i / 60)
        elif yr < 2020.4:  # Covid crash
            oil_trend[i] = 25 + 15 * ((yr - 2020.15) / 0.25)
        elif yr < 2021.0:  # 2020 recovery
            oil_trend[i] = 40 + 12 * ((yr - 2020.4) / 0.6)
        elif yr < 2022.2:  # 2021-2022 surge
            oil_trend[i] = 52 + 55 * ((yr - 2021.0) / 1.2)
        elif yr < 2022.6:  # Peak 2022
            oil_trend[i] = 110 - 25 * ((yr - 2022.2) / 0.4)
        else:  # 2023-2024 steady 75-88
            oil_trend[i] = 80 + 7 * np.sin(i / 45)

    oil_noise = np.random.normal(0, 1.8, n_days)
    brent_crude = np.clip(oil_trend + oil_noise, 20.0, 135.0)

    # Bunker Fuel VLSFO ($/tonne) - tightly correlated with crude oil
    vlsfo_fuel = np.clip(brent_crude * 6.8 + np.random.normal(0, 12, n_days) + 80, 280.0, 1150.0)

    # Iron Ore 62% Fe CFR China ($/tonne) - core steel raw material
    iron_ore_base = np.zeros(n_days)
    for i, dt in enumerate(date_range):
        yr = dt.year + (dt.dayofyear / 365.25)
        if yr < 2019.5:  # Vale dam disaster surge in 2019
            iron_ore_base[i] = 75 + 40 * ((yr - 2019.0) / 0.5)
        elif yr < 2020.2:
            iron_ore_base[i] = 95 - 10 * ((yr - 2019.5) / 0.7)
        elif yr < 2021.5:  # 2021 massive rally to >220
            iron_ore_base[i] = 85 + 135 * ((yr - 2020.2) / 1.3)
        elif yr < 2022.0:  # China steel curbs crash
            iron_ore_base[i] = 220 - 125 * ((yr - 2021.5) / 0.5)
        elif yr < 2023.0:
            iron_ore_base[i] = 100 + 40 * np.sin(i / 70)
        else:  # 2023-2024 steady range 100-135
            iron_ore_base[i] = 115 + 15 * np.cos(i / 50)
            
    iron_ore_price = np.clip(iron_ore_base + np.random.normal(0, 2.5, n_days), 65.0, 240.0)

    # Coking Coal ($/tonne)
    coking_coal = np.clip(iron_ore_price * 1.6 + 0.5 * brent_crude + np.random.normal(0, 8, n_days), 110.0, 480.0)

    # Macro indices
    # S&P 500 proxy
    sp500_trend = 2500 + 2800 * (time_idx / n_days) + 200 * np.sin(time_idx / 80) + np.random.normal(0, 25, n_days)
    sp500 = np.clip(sp500_trend, 2400.0, 5600.0)

    # Currencies: USD/CNY (6.3 - 7.35) and USD/INR (69.5 - 83.9)
    usd_cny = np.clip(6.70 + 0.45 * np.sin(time_idx / 120) + 0.0003 * time_idx + np.random.normal(0, 0.015, n_days), 6.30, 7.35)
    usd_inr = np.clip(70.0 + 13.5 * (time_idx / n_days) + np.random.normal(0, 0.12, n_days), 69.5, 84.0)

    # China Manufacturing PMI (47 - 53)
    china_pmi = np.clip(50.2 + 1.8 * np.sin(time_idx / 40) + np.random.normal(0, 0.4, n_days), 46.5, 54.0)

    # India Monthly Steel Production proxy (in Million Tonnes, daily smoothed equivalent 9.5 - 13.0 MT/mo)
    india_steel_prod_mt = np.clip(9.2 + 3.6 * (time_idx / n_days) + 0.4 * np.sin(time_idx / 60) + np.random.normal(0, 0.1, n_days), 8.8, 14.0)

    # Fleet & Logistics:
    # Global Capesize Fleet Capacity (Million DWT, growing slowly ~360M to 415M DWT)
    capesize_fleet_dwt_m = 360.0 + 55.0 * (time_idx / n_days) + np.random.normal(0, 0.2, n_days)
    
    # Capesize Orderbook % of fleet (historic lows 5% to 12%)
    vessel_orderbook_pct = np.clip(11.5 - 4.5 * (time_idx / n_days) + np.random.normal(0, 0.15, n_days), 5.0, 13.0)

    # Seasonal indicators
    is_chinese_new_year = []
    is_monsoon_season = []
    for dt in date_range:
        # CNY generally spans 3 weeks in late Jan / mid Feb
        is_cny = 1 if ((dt.month == 1 and dt.day >= 20) or (dt.month == 2 and dt.day <= 18)) else 0
        # Indian monsoon: June to mid-September
        is_monsoon = 1 if (dt.month in [6, 7, 8] or (dt.month == 9 and dt.day <= 15)) else 0
        is_chinese_new_year.append(is_cny)
        is_monsoon_season.append(is_monsoon)
        
    is_chinese_new_year = np.array(is_chinese_new_year)
    is_monsoon_season = np.array(is_monsoon_season)

    # Port Congestion Index East Coast India (Paradip, Vizag, Haldia wait times in days: 1.5 - 12 days)
    # Higher during monsoons & high import periods
    port_congestion_east_india = np.clip(
        3.5 + 2.5 * is_monsoon_season + 0.015 * (iron_ore_price - 80) + np.random.normal(0, 0.8, n_days),
        1.5, 14.0
    )
    # Port Congestion China (days)
    port_congestion_china = np.clip(
        4.0 + 3.0 * np.sin(time_idx / 55) + 0.02 * (iron_ore_price - 70) + np.random.normal(0, 0.9, n_days),
        2.0, 16.0
    )

    # 3. BALTIC DRY INDEX (BDI) and BALTIC CAPESIZE INDEX (BCI) Generation
    # Real dynamics:
    # BCI strongly driven by:
    # + Iron ore price demand
    # + China manufacturing PMI
    # + Port congestion (ties up vessels)
    # + Fuel cost pass-through
    # - Fleet capacity expansion
    # - Chinese New Year slump
    # Autoregressive momentum (AR(1) ~ 0.96)
    
    bci = np.zeros(n_days)
    # Initial 2019 level
    bci[0] = 1850.0

    for t in range(1, n_days):
        # Base drift driven by economic fundamentals
        macro_driver = (
            0.45 * (iron_ore_price[t] - 110) * 18.0 +
            0.25 * (brent_crude[t] - 70) * 15.0 +
            0.20 * (china_pmi[t] - 50) * 350.0 +
            0.15 * (port_congestion_east_india[t] - 3.5) * 120.0 +
            0.10 * (port_congestion_china[t] - 4.0) * 80.0 -
            1.20 * (capesize_fleet_dwt_m[t] - 380) * 12.0 -
            450.0 * is_chinese_new_year[t] -
            180.0 * is_monsoon_season[t]
        )
        
        # 2021 supercycle kicker
        yr = date_range[t].year + (date_range[t].dayofyear / 365.25)
        if 2021.3 <= yr <= 2021.85:
            macro_driver += 3200.0 * np.sin((yr - 2021.3) / 0.55 * np.pi)
        elif 2020.15 <= yr <= 2020.4:
            macro_driver -= 1200.0
            
        target_equilibrium = 2200.0 + macro_driver
        # Mean reversion + persistent momentum + noise
        bci[t] = 0.93 * bci[t-1] + 0.07 * target_equilibrium + np.random.normal(0, 95.0)
        
    bci = np.clip(bci, 450.0, 10500.0)

    # Baltic Dry Index (BDI) - typically correlated with BCI (approx 0.65 * BCI component + other ship classes)
    bdi = np.clip(0.55 * bci + 600.0 + 8.0 * (brent_crude - 60) + np.random.normal(0, 60.0, n_days), 380.0, 5600.0)

    # Route C3: Tubarão (Brazil) to Qingdao / East Coast India ($/tonne)
    # Typically $14 - $42 / tonne
    c3_rate_usd_tonne = np.clip(
        11.0 + (bci / 320.0) + (vlsfo_fuel / 95.0) + 0.3 * port_congestion_east_india + np.random.normal(0, 0.45, n_days),
        10.5, 46.0
    )

    # Route C5: Port Hedland (W. Australia) to Qingdao / East Coast India ($/tonne)
    # Shorter voyage: typically $6 - $21 / tonne
    c5_rate_usd_tonne = np.clip(
        5.2 + (bci / 680.0) + (vlsfo_fuel / 170.0) + 0.2 * port_congestion_east_india + np.random.normal(0, 0.28, n_days),
        4.8, 24.5
    )

    # 4. Construct Raw DataFrame
    df_raw = pd.DataFrame({
        "date": date_range.strftime("%Y-%m-%d"),
        "bdi_index": np.round(bdi, 1),
        "bci_index": np.round(bci, 1),
        "route_c3_usd_per_tonne": np.round(c3_rate_usd_tonne, 2),
        "route_c5_usd_per_tonne": np.round(c5_rate_usd_tonne, 2),
        "iron_ore_price_usd": np.round(iron_ore_price, 2),
        "coking_coal_price_usd": np.round(coking_coal, 2),
        "brent_crude_usd": np.round(brent_crude, 2),
        "bunker_fuel_vlsfo_usd": np.round(vlsfo_fuel, 2),
        "sp500_index": np.round(sp500, 1),
        "usd_cny": np.round(usd_cny, 4),
        "usd_inr": np.round(usd_inr, 4),
        "china_manufacturing_pmi": np.round(china_pmi, 2),
        "india_steel_production_mt": np.round(india_steel_prod_mt, 2),
        "capesize_fleet_dwt_m": np.round(capesize_fleet_dwt_m, 2),
        "vessel_orderbook_pct": np.round(vessel_orderbook_pct, 2),
        "port_congestion_east_india_days": np.round(port_congestion_east_india, 1),
        "port_congestion_china_days": np.round(port_congestion_china, 1),
        "is_chinese_new_year": is_chinese_new_year,
        "is_monsoon_season": is_monsoon_season
    })

    # 5. Feature Engineering for ML Readiness (Lags, Rolling Means, Ratios, Targets)
    df_feat = df_raw.copy()
    df_feat["date_dt"] = pd.to_datetime(df_feat["date"])

    # Calendar & Cyclical Features
    df_feat["day_of_week"] = df_feat["date_dt"].dt.dayofweek
    df_feat["month"] = df_feat["date_dt"].dt.month
    df_feat["quarter"] = df_feat["date_dt"].dt.quarter
    day_of_year = df_feat["date_dt"].dt.dayofyear
    df_feat["sin_day_of_year"] = np.round(np.sin(2 * np.pi * day_of_year / 365.25), 4)
    df_feat["cos_day_of_year"] = np.round(np.cos(2 * np.pi * day_of_year / 365.25), 4)

    # Lags for target indices
    for lag in [1, 2, 3, 7, 14, 30]:
        df_feat[f"bci_lag_{lag}"] = df_feat["bci_index"].shift(lag)
        df_feat[f"bdi_lag_{lag}"] = df_feat["bdi_index"].shift(lag)
        df_feat[f"c5_lag_{lag}"] = df_feat["route_c5_usd_per_tonne"].shift(lag)
        df_feat[f"c3_lag_{lag}"] = df_feat["route_c3_usd_per_tonne"].shift(lag)

    # Moving Averages & Rolling Standard Deviations
    for window in [7, 14, 30, 60]:
        df_feat[f"bci_ma_{window}"] = np.round(df_feat["bci_index"].rolling(window=window).mean(), 2)
        df_feat[f"bci_std_{window}"] = np.round(df_feat["bci_index"].rolling(window=window).std(), 2)
        df_feat[f"c5_ma_{window}"] = np.round(df_feat["route_c5_usd_per_tonne"].rolling(window=window).mean(), 2)

    # Rate of Change (Momentum)
    df_feat["bci_roc_7"] = np.round((df_feat["bci_index"] - df_feat["bci_lag_7"]) / (df_feat["bci_lag_7"] + 1e-5), 4)
    df_feat["bci_roc_14"] = np.round((df_feat["bci_index"] - df_feat["bci_lag_14"]) / (df_feat["bci_lag_14"] + 1e-5), 4)
    df_feat["c5_roc_7"] = np.round((df_feat["route_c5_usd_per_tonne"] - df_feat["c5_lag_7"]) / (df_feat["c5_lag_7"] + 1e-5), 4)

    # Economic Ratios
    df_feat["fuel_to_c5_ratio"] = np.round(df_feat["bunker_fuel_vlsfo_usd"] / (df_feat["route_c5_usd_per_tonne"] * 1000 + 1e-5), 4)
    df_feat["iron_ore_to_bci_ratio"] = np.round(df_feat["iron_ore_price_usd"] / (df_feat["bci_index"] + 1e-5), 4)
    df_feat["bci_to_bdi_ratio"] = np.round(df_feat["bci_index"] / (df_feat["bdi_index"] + 1e-5), 4)

    # 6. Prediction Targets (Future Forecast Horizons)
    # Forward-looking targets: what will the rate be in 1 day, 7 days, 14 days, 30 days?
    df_feat["target_bci_next_1d"] = df_feat["bci_index"].shift(-1)
    df_feat["target_bci_next_7d"] = df_feat["bci_index"].shift(-7)
    df_feat["target_bci_next_14d"] = df_feat["bci_index"].shift(-14)
    df_feat["target_bci_next_30d"] = df_feat["bci_index"].shift(-30)

    df_feat["target_c5_next_7d"] = df_feat["route_c5_usd_per_tonne"].shift(-7)
    df_feat["target_c3_next_7d"] = df_feat["route_c3_usd_per_tonne"].shift(-7)

    # Decision Support Recommendation Signal for Ministry Procurement:
    # If 7-day predicted BCI increases by > 4.0% -> CHARTER_NOW (1)
    # If 7-day predicted BCI decreases by > 4.0% -> WAIT (-1)
    # Otherwise -> HOLD / NEUTRAL (0)
    pct_change_7d = (df_feat["target_bci_next_7d"] - df_feat["bci_index"]) / df_feat["bci_index"]
    df_feat["chartering_signal"] = np.where(pct_change_7d >= 0.04, 1, np.where(pct_change_7d <= -0.04, -1, 0))
    df_feat["chartering_recommendation"] = np.where(pct_change_7d >= 0.04, "CHARTER_NOW", np.where(pct_change_7d <= -0.04, "WAIT", "HOLD_NEUTRAL"))

    # 7. Create Cleaned, Model-Ready Dataset
    # Drop rows where lag features are NaN (first 60 rows) and where 30d future targets are NaN (last 30 rows)
    # This guarantees 100% complete, non-null, model-ready data without lookahead leaks!
    df_cleaned = df_feat.iloc[60:-30].copy().reset_index(drop=True)
    df_cleaned = df_cleaned.drop(columns=["date_dt"])

    # Also make a pure numerical feature subset version for instant scikit-learn / XGBoost training
    print(f"Raw dataset shape: {df_raw.shape}")
    print(f"Cleaned model-ready dataset shape: {df_cleaned.shape}")
    print(f"Null values in cleaned dataset: {df_cleaned.isnull().sum().sum()}")

    # Ensure output directories exist
    os.makedirs("data/raw", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

    raw_path = os.path.join("data", "raw", "freight_dataset_raw.csv")
    cleaned_path = os.path.join("data", "processed", "freight_dataset_cleaned.csv")

    df_raw.to_csv(raw_path, index=False)
    df_cleaned.to_csv(cleaned_path, index=False)

    print(f"Saved raw dataset to: {raw_path}")
    print(f"Saved cleaned dataset to: {cleaned_path}")

    # Generate summary stats
    print("\nTarget Statistics (BCI and Route C5):")
    print(df_cleaned[["bci_index", "route_c5_usd_per_tonne", "target_bci_next_7d", "target_c5_next_7d"]].describe())

    return df_raw, df_cleaned

if __name__ == "__main__":
    generate_synthetic_freight_data()
