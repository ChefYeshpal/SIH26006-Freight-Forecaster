# 📘 SIH26006 — Complete Codebase Documentation

> **National Maritime Freight Intelligence System (NMFIS)**
> Ministry of Steel, Government of India — East Coast Bulk Cargo Imports
> Problem Statement ID: SIH26006 (Smart India Hackathon)

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Backend — FastAPI Application (`api/`)](#3-backend--fastapi-application-api)
   - 3.1 [Entry Point: `api/main.py`](#31-entry-point-apimainpy)
   - 3.2 [Pydantic Schemas: `api/schemas.py`](#32-pydantic-schemas-apischemaspy)
   - 3.3 [API Routes](#33-api-routes)
   - 3.4 [Backend Services](#34-backend-services)
4. [Machine Learning Models (`src/models/`)](#4-machine-learning-models-srcmodels)
   - 4.1 [XGBoost Forecaster](#41-xgboost-forecaster)
   - 4.2 [BiLSTM Deep Learning Forecaster](#42-bilstm-deep-learning-forecaster)
   - 4.3 [Hybrid Ensemble Forecaster](#43-hybrid-ensemble-forecaster)
   - 4.4 [SHAP Explainability Engine](#44-shap-explainability-engine)
5. [Training Pipelines](#5-training-pipelines)
   - 5.1 [Advanced Pipeline: `train_advanced.py`](#51-advanced-pipeline-train_advancedpy)
   - 5.2 [Baseline Pipeline: `train_model.py`](#52-baseline-pipeline-train_modelpy)
6. [Frontend — React/Vite Application (`frontend/`)](#6-frontend--reactvite-application-frontend)
   - 6.1 [Entry Point & App Shell](#61-entry-point--app-shell)
   - 6.2 [Constants & Configuration: `constants.js`](#62-constants--configuration-constantsjs)
   - 6.3 [React Components](#63-react-components)
   - 6.4 [Custom Hooks](#64-custom-hooks)
   - 6.5 [Icons Library](#65-icons-library)
7. [Data Pipeline & Dataset](#7-data-pipeline--dataset)
8. [Saved Model Artifacts (`models/`)](#8-saved-model-artifacts-models)
9. [Reports & Explainability Outputs (`reports/`)](#9-reports--explainability-outputs-reports)
10. [Test Suites (`tests/`)](#10-test-suites-tests)
11. [API Endpoint Reference (Complete)](#11-api-endpoint-reference-complete)
12. [Environment & Dependencies](#12-environment--dependencies)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER / BROWSER                              │
│         React Frontend (Vite, Port 3000)                           │
│   ┌──────────┬──────────┬───────────┬──────────┬────────────┐      │
│   │ Landing  │ Forecast │ SHAP/XAI  │ Market   │ AI Chatbot │      │
│   │  Page    │ Engine   │ Analysis  │  Intel   │  Widget    │      │
│   └──────────┴──────────┴───────────┴──────────┴────────────┘      │
│         ↕ HTTP REST (JSON) ↕                                       │
├─────────────────────────────────────────────────────────────────────┤
│                     FastAPI Backend (Port 8000)                     │
│   ┌──────────┬──────────┬───────────┬──────────┬──────────┐        │
│   │ /predict │ /recom-  │ /explain- │ /market/ │ /chat    │        │
│   │          │ mendation│ ability   │ snapshot │          │        │
│   └──────────┴──────────┴───────────┴──────────┴──────────┘        │
│         ↕ Services ↕                                                │
│   ┌──────────────────────┬──────────────────────┐                   │
│   │  ForecasterService   │    ChatService       │                   │
│   │  (Singleton)         │    (Singleton)       │                   │
│   └──────────────────────┴──────────────────────┘                   │
│         ↕ Model Inference ↕                                         │
│   ┌──────────┬──────────┬───────────┬──────────┐                    │
│   │ XGBoost  │ BiLSTM   │ Ensemble  │ SHAP     │                    │
│   │ Regressor│ Net      │ Blender   │ Engine   │                    │
│   └──────────┴──────────┴───────────┴──────────┘                    │
│         ↕ Data ↕                                                    │
│   ┌──────────────────────────────────────────────┐                  │
│   │ data/processed/freight_dataset_cleaned.csv   │                  │
│   │ 1,388 rows × 75 engineered features         │                  │
│   └──────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```  
SIH26002/
├── api/                          # FastAPI REST Backend
│   ├── main.py                   # App factory, CORS, router mounting, health check
│   ├── schemas.py                # Pydantic request/response models (10 schemas)
│   ├── routes/                   # API endpoint routers
│   │   ├── predict.py            # POST /api/v1/predict
│   │   ├── explainability.py     # GET  /api/v1/recommendation, /explainability
│   │   ├── market.py             # GET  /api/v1/market/snapshot, /history
│   │   └── chat.py               # POST /api/v1/chat, GET /suggestions
│   └── services/                 # Business logic singletons
│       ├── forecaster_service.py # Model loading, inference, what-if simulation
│       └── chat_service.py       # NLP chatbot, glossary, decision support
│
├── src/models/                   # ML model architectures (source code)
│   ├── xgboost_forecaster.py     # XGBoostFreightForecaster class
│   ├── lstm_forecaster.py        # BiLSTMFreightNet + LSTMFreightForecaster classes
│   ├── ensemble_forecaster.py    # HybridEnsembleForecaster class
│   └── explainability_shap.py    # FreightExplainabilityEngine class
│
├── frontend/                     # React + Vite frontend
│   ├── package.json              # Node dependencies (React 18, Vite 5)
│   ├── vite.config.js            # Vite dev server config (port 3000)
│   └── src/
│       ├── main.jsx              # React DOM entry point
│       ├── App.jsx               # Root component, routing, auth shell
│       ├── index.css             # Global design system (~72KB)
│       ├── constants.js          # Feature labels, auth, nav, API base, notifications
│       ├── hooks/
│       │   └── useScrollAnimation.js  # IntersectionObserver scroll-reveal hook
│       └── components/
│           ├── LandingPage.jsx        # Dashboard home with metrics & capabilities
│           ├── Forecast.jsx           # Interactive rate prediction & scenario UI
│           ├── Explainability.jsx      # SHAP driver visualization page
│           ├── MarketIntelligence.jsx  # Live commodity/freight rate cards
│           ├── Settings.jsx           # Profile, API config, about page
│           ├── LoginPage.jsx          # Authentication gate with ocean animation
│           ├── ChatWidget.jsx         # Floating AI copilot chat panel
│           ├── Sidebar.jsx            # Collapsible navigation sidebar
│           ├── Topbar.jsx             # Header with search, notifications, profile
│           ├── AnimatedCounter.jsx    # Count-up number animation component
│           ├── LoadingSkeleton.jsx    # Shimmer placeholder component
│           └── Icons.jsx             # 25+ SVG icon components
│
├── data/
│   ├── raw/freight_dataset_raw.csv        # Raw simulated time-series
│   ├── processed/freight_dataset_cleaned.csv  # Feature-engineered dataset
│   └── DATA_DICTIONARY.md                 # Column documentation
│
├── models/                       # Saved trained model weights & metadata
│   ├── xgboost_forecaster.json   # XGBoost serialized model (~317KB)
│   ├── xgboost_metadata.json     # Feature names, target, metrics
│   ├── bilstm_freight_net.pt     # PyTorch BiLSTM weights (~116KB)
│   ├── bilstm_metadata.json      # LSTM architecture & metrics
│   └── ensemble_summary.json     # Ensemble weights, scorecard, decision
│
├── reports/                      # Generated explainability outputs
│   ├── shap_summary.png          # Global SHAP feature importance chart
│   ├── shap_latest_waterfall.png # Single-instance waterfall breakdown
│   └── executive_briefing.json   # Plain-English Ministry briefing
│
├── scripts/
│   └── generate_dataset.py       # Vectorized synthetic dataset generator
│
├── tests/
│   ├── test_api.py               # FastAPI endpoint integration tests
│   └── verify_dataset.py         # Dataset integrity & ML smoke tests
│
├── test_interface/
│   └── index.html                # Disposable HTML test console
│
├── train_advanced.py             # Master AI pipeline (XGBoost + BiLSTM + Ensemble + SHAP)
├── train_model.py                # Baseline ML pipeline (Ridge, RF, GBR)
├── run_api.py                    # API server launcher
├── requirements.txt              # Python dependencies
└── .gitignore                    # Security & cache exclusions
```

---

## 3. Backend — FastAPI Application (`api/`)

### 3.1 Entry Point: `api/main.py`

**File:** `api/main.py`

The application factory that creates and configures the FastAPI instance.

| Item | Type | Description |
|:--|:--|:--|
| `app` | `FastAPI` instance | The main application object with title, description, versioning, and Swagger docs at `/docs` |
| `CORSMiddleware` | Middleware | Enables cross-origin requests for the React frontend (`allow_origins=["*"]`) |
| `serve_web_dashboard()` | Route handler | Serves `test_interface/index.html` on both `/` and `/test` paths |
| `on_startup()` | Startup event | Pre-loads `ForecasterService` singleton and ML models into memory on server boot |
| `api_info()` | `GET /api/info` | Returns system metadata and available endpoint documentation |
| `health_check()` | `GET /health` | Returns model health status, loaded model names, and test MAPE |

**Mounted Routers:**
- `predict.router` → `/api/v1/predict`
- `explainability.router` → `/api/v1/recommendation`, `/api/v1/explainability`
- `market.router` → `/api/v1/market/snapshot`, `/api/v1/market/history`
- `chat.router` → `/api/v1/chat`, `/api/v1/chat/suggestions`

**Static File Mounts:**
- `/reports` → Serves SHAP plot images from the `reports/` directory

---

### 3.2 Pydantic Schemas: `api/schemas.py`

All request and response data validation models using Pydantic `BaseModel`.

#### Request Schemas

| Schema | Used By | Fields | Description |
|:--|:--|:--|:--|
| `MarketOverride` | `ForecastRequest` | `iron_ore_price_usd`, `brent_crude_usd`, `port_congestion_east_india_days`, `bunker_fuel_vlsfo_usd`, `china_manufacturing_pmi` (all `Optional[float]`) | What-if scenario parameter overrides for stress-testing |
| `ForecastRequest` | `POST /predict` | `horizon_days` (int, 1–30, default 7), `route` (str: "BCI"/"C5"/"C3", default "C5"), `scenario_overrides` (Optional `MarketOverride`) | Primary prediction request body |
| `ChatRequest` | `POST /chat` | `message` (str), `history` (Optional list of `ChatMessage`), `cargo_tonnes` (Optional float, default 170000), `route` (Optional str, default "C5") | Chat assistant request body |
| `ChatMessage` | `ChatRequest` | `role` (str: "user"/"assistant"), `content` (str) | Single chat conversation turn |

#### Response Schemas

| Schema | Used By | Fields | Description |
|:--|:--|:--|:--|
| `ForecastResponse` | `POST /predict` | `status`, `date_evaluated`, `target_metric`, `current_spot_rate`, `predicted_rate`, `expected_change_pct`, `confidence_interval_95pct` (dict with lower/upper), `recommendation` (`ProcurementDecision`), `route_details` (dict) | Complete prediction result with recommendation |
| `ProcurementDecision` | Multiple endpoints | `action` ("CHARTER_NOW"/"WAIT"/"HOLD_NEUTRAL"), `urgency` ("HIGH"/"MEDIUM"/"LOW"), `color` ("green"/"red"/"gray"), `rationale` (str), `expected_change_pct` (float) | Automated chartering decision signal |
| `ShapDriver` | `ExecutiveBriefingResponse` | `feature` (str), `current_value` (float), `shap_impact` (float) | Single SHAP feature contribution entry |
| `ExecutiveBriefingResponse` | `GET /explainability` | `latest_date`, `current_spot_bci`, `forecast_7d_bci`, `net_rate_change`, `procurement_decision`, `bullish_drivers_raising_freight` (list of `ShapDriver`), `bearish_drivers_lowering_freight`, `top_overall_factors`, `summary_chart_url`, `waterfall_chart_url` | Full SHAP + decision executive briefing |
| `MarketSnapshotResponse` | `GET /market/snapshot` | `latest_date`, `bci_index`, `bdi_index`, `route_c5_usd_per_tonne`, `route_c3_usd_per_tonne`, `iron_ore_price_usd`, `coking_coal_price_usd`, `brent_crude_usd`, `bunker_fuel_vlsfo_usd`, `port_congestion_east_india_days`, `china_manufacturing_pmi`, `usd_inr` | Current market snapshot with all key indicators |
| `HealthResponse` | `GET /health` | `status`, `service`, `version`, `model_loaded`, `models_available` (list), `model_test_mape` (str) | System health status |
| `ChatResponse` | `POST /chat` | `reply` (str), `category` ("glossary"/"decision_support"/"market_insight"/"general"), `action_signal` (Optional str), `estimated_savings_usd` (Optional float), `estimated_savings_inr_cr` (Optional float), `follow_up_suggestions` (list of str) | Chat response with signals and follow-ups |

---

### 3.3 API Routes

#### 3.3.1 `api/routes/predict.py` — Forecasting Engine

| Method | Path | Handler | Request Body | Response Model | Description |
|:--|:--|:--|:--|:--|:--|
| `POST` | `/api/v1/predict` | `predict_freight()` | `ForecastRequest` | `ForecastResponse` | Generates AI freight rate forecasts for C5, C3, or BCI with configurable horizon and What-If overrides |

**Exports:** `router` (APIRouter, prefix `/api/v1`, tag "Forecasting")

---

#### 3.3.2 `api/routes/explainability.py` — Decision Support & Explainability

| Method | Path | Handler | Response Model | Description |
|:--|:--|:--|:--|:--|
| `GET` | `/api/v1/recommendation` | `get_recommendation()` | `ProcurementDecision` | Returns the latest automated chartering action signal |
| `GET` | `/api/v1/explainability` | `get_explainability()` | `ExecutiveBriefingResponse` | Full SHAP breakdown with bullish/bearish drivers and charts |

**Exports:** `router` (APIRouter, prefix `/api/v1`, tag "Decision Support & Explainability")

---

#### 3.3.3 `api/routes/market.py` — Market Intelligence

| Method | Path | Handler | Parameters | Response | Description |
|:--|:--|:--|:--|:--|:--|
| `GET` | `/api/v1/market/snapshot` | `get_market_snapshot()` | — | `MarketSnapshotResponse` | Latest spot prices for BCI, BDI, C5, C3, Iron Ore, Coal, Fuel, PMI, FX |
| `GET` | `/api/v1/market/history` | `get_market_history()` | `limit` (query, int, 7–365, default 90) | List of dicts | Historical daily time-series records for charting |

**Exports:** `router` (APIRouter, prefix `/api/v1/market`, tag "Market Intelligence")

---

#### 3.3.4 `api/routes/chat.py` — Maritime AI Assistant

| Method | Path | Handler | Request Body | Response | Description |
|:--|:--|:--|:--|:--|:--|
| `POST` | `/api/v1/chat` | `ask_chat_assistant()` | `ChatRequest` | `ChatResponse` | Interactive AI copilot for terminology, decisions, savings |
| `GET` | `/api/v1/chat/suggestions` | `get_chat_suggestions()` | — | JSON (categories array) | Curated quick-prompt suggestions in 3 groups: Terminology, Procurement, Market Intelligence |

**Exports:** `router` (APIRouter, prefix `/api/v1/chat`, tag "Maritime AI Assistant & Decision Support")

---

### 3.4 Backend Services

#### 3.4.1 `api/services/forecaster_service.py` — ForecasterService

**Pattern:** Singleton (only one instance ever created via `__new__`)

| Method | Returns | Description |
|:--|:--|:--|
| `_initialize()` | `None` | Loads XGBoost model from `models/xgboost_forecaster.json`, reads feature metadata from `models/xgboost_metadata.json`, reads cleaned dataset, caches latest row |
| `get_market_snapshot()` | `MarketSnapshotResponse` | Returns the most recent day's spot prices from the dataset |
| `predict_freight(req: ForecastRequest)` | `ForecastResponse` | Core prediction engine — applies What-If overrides, runs XGBoost inference, calculates horizon-adjusted BCI forecast, translates BCI to C5/C3 voyage rates via empirical conversion formulas, computes 95% confidence intervals, generates automated `ProcurementDecision` |
| `get_executive_briefing()` | `ExecutiveBriefingResponse` | Loads pre-computed SHAP briefing from `reports/executive_briefing.json`, constructs `ProcurementDecision`, returns bullish/bearish driver lists and chart URLs |
| `get_history(limit)` | `list[dict]` | Returns the last `limit` rows from the dataset (date, BCI, BDI, C5, C3, Iron Ore, Fuel, Port Wait) |

**Key Business Logic in `predict_freight()`:**
- **Horizon Scaling:** `delta_BCI = (raw_prediction − current_BCI) × √(horizon / 7)`
- **C5 Conversion:** `C5 = 5.2 + (BCI / 680) + (VLSFO / 170)`
- **C3 Conversion:** `C3 = 11.0 + (BCI / 320) + (VLSFO / 95)`
- **Decision Matrix:** `≥ +4% → CHARTER_NOW` | `≤ −4% → WAIT` | `else → HOLD_NEUTRAL`

---

#### 3.4.2 `api/services/chat_service.py` — ChatService

**Pattern:** Singleton

| Method | Returns | Description |
|:--|:--|:--|
| `_initialize()` | `None` | Gets ForecasterService instance, initializes glossary dictionary |
| `_init_glossary()` | `None` | Populates `self.glossary` dict with 15 maritime term entries (BCI, BDI, Route C5, Route C3, Demurrage, Laytime, Despatch, Capesize, Panamax, Supramax, DWT, VLSFO, CFR vs FOB, SHAP, Confidence Interval). Each has `title`, `summary`, `explanation` (markdown-formatted), and `follow_ups` |
| `generate_response(req: ChatRequest)` | `ChatResponse` | Main NLP dispatcher using keyword pattern matching. Routes to 5 handlers in priority order |
| `_match_glossary(text)` | `Optional[str]` | Regex-based longest-match glossary term finder with fuzzy fallback for C5/C3/CFR patterns |
| `_handle_decision_query(req)` | `ChatResponse` | Runs a 7-day forecast, builds markdown response table with spot vs predicted rates, calculates USD/INR savings, generates step-by-step action items |
| `_handle_savings_query(req)` | `ChatResponse` | Calculates per-tonne and total voyage financial impact for given cargo tonnage |
| `_handle_congestion_query(req)` | `ChatResponse` | Analyzes current port wait times, computes demurrage exposure at $28,000/day benchmark |
| `_handle_market_query(req)` | `ChatResponse` | Formats a markdown table with all current market indicators |

**Intent Detection Priority:**
1. Decision/chartering queries (keyword match for "should i", "charter now", "wait or charter", etc.)
2. Glossary/terminology matches (regex against 15 terms)
3. General decision keywords ("charter", "tender", "book", "recommend")
4. Savings/cost calculation keywords ("saving", "calculate", "cost", "tonnes")
5. Port congestion keywords ("congestion", "paradip", "vizag", "demurrage")
6. Market/trend keywords ("market", "trend", "current", "forecast")
7. Default: greeting with capabilities overview

**Glossary Terms (15 Entries):**
`bci`, `bdi`, `route c5`, `route c3`, `demurrage`, `laytime`, `despatch`, `capesize`, `panamax`, `supramax`, `dwt`, `vlsfo`, `cfr vs fob`, `shap`, `confidence interval`

---

## 4. Machine Learning Models (`src/models/`)

### 4.1 XGBoost Forecaster

**File:** `src/models/xgboost_forecaster.py`

**Class:** `XGBoostFreightForecaster`

| Parameter | Default | Description |
|:--|:--|:--|
| `target_col` | `"target_bci_next_7d"` | Target variable column name |
| `n_estimators` | `200` | Number of boosting rounds |
| `max_depth` | `4` | Maximum tree depth |
| `learning_rate` | `0.04` | Step size shrinkage |

| Method | Returns | Description |
|:--|:--|:--|
| `prepare_data(df, train_ratio, val_ratio)` | Tuple of (X, y) splits + dataframes | Splits data chronologically into 80/10/10 train/val/test. Excludes target columns and non-feature columns from feature set |
| `cross_validate(X_train, y_train, n_splits, gap)` | `dict` (cv_mae_mean, cv_mae_std, cv_mape_mean, fold_maes) | 5-fold `TimeSeriesSplit` expanding-window cross-validation with a 7-day gap to prevent leakage |
| `train(df, run_cv)` | `(metrics, predictions, actuals, test_df)` | Full training pipeline: prepares data → runs CV → fits final model with early stopping (35 rounds) → evaluates MAE, RMSE, MAPE, directional accuracy on test set |
| `predict(X)` | `np.array` | Runs inference on a feature DataFrame |
| `save(output_dir)` | `None` | Serializes model to JSON and metadata to JSON |

**Hyperparameters:** `subsample=0.85`, `colsample_bytree=0.85`, `reg_alpha=0.5`, `reg_lambda=2.0`, `eval_metric="rmse"`, `early_stopping_rounds=35`

**Instance Attributes:** `model`, `feature_names`, `metrics`, `best_params`

---

### 4.2 BiLSTM Deep Learning Forecaster

**File:** `src/models/lstm_forecaster.py`

**Classes:**

#### `TimeSeriesDataset(Dataset)`
A PyTorch Dataset wrapper for rolling-window time-series sequences.

| Method | Description |
|:--|:--|
| `__init__(X_sequences, y_targets)` | Converts NumPy arrays to `float32` tensors |
| `__len__()` | Returns number of sequences |
| `__getitem__(idx)` | Returns (X_sequence, y_target) pair at index |

#### `BiLSTMFreightNet(nn.Module)`
The neural network architecture itself.

| Parameter | Default | Description |
|:--|:--|:--|
| `input_dim` | — | Number of input features per timestep |
| `hidden_dim` | `32` | LSTM hidden state dimension |
| `num_layers` | `1` | Number of stacked LSTM layers |
| `dropout` | `0.15` | Dropout probability |

**Architecture:**
```
Input (batch, lookback=20, features=67)
  → Bidirectional LSTM (hidden=32, bidirectional → 64 output)
  → Take final timestep output
  → Linear(64 → 32) → ReLU → Dropout(0.15)
  → Linear(32 → 1) → Squeeze
Output: scalar BCI prediction
```

| Method | Description |
|:--|:--|
| `forward(x)` | Forward pass through BiLSTM → FC layers |

#### `LSTMFreightForecaster`
The training wrapper/manager class.

| Parameter | Default | Description |
|:--|:--|:--|
| `target_col` | `"target_bci_next_7d"` | Forecast target column |
| `lookback` | `20` | Rolling window size (business days) |
| `hidden_dim` | `32` | LSTM hidden dimension |
| `num_layers` | `1` | Number of LSTM layers |
| `lr` | `0.003` | Learning rate |
| `epochs` | `40` | Training epochs |

| Method | Returns | Description |
|:--|:--|:--|
| `create_sequences(X_scaled, y_scaled)` | `(X_seq, y_seq)` numpy arrays | Creates rolling `lookback`-length input sequences |
| `train(df, train_ratio, val_ratio)` | `(metrics, test_preds, actuals, eval_df, val_preds, val_actuals)` | Full pipeline: feature scaling (StandardScaler fitted on train only) → sequence creation with lookback buffer prepended to val/test → training with SmoothL1Loss, AdamW optimizer, CosineAnnealing LR schedule, gradient clipping (max_norm=1.0) → best-model checkpoint → inverse-scaled test evaluation |
| `save(output_dir)` | `None` | Saves PyTorch `state_dict` and metadata JSON |

**Instance Attributes:** `model`, `feature_scaler` (StandardScaler), `target_scaler` (StandardScaler), `feature_names`, `metrics`

---

### 4.3 Hybrid Ensemble Forecaster

**File:** `src/models/ensemble_forecaster.py`

**Class:** `HybridEnsembleForecaster`

| Parameter | Default | Description |
|:--|:--|:--|
| `weights` | `{"xgboost": 0.60, "ridge": 0.30, "lstm": 0.10}` | Initial ensemble blending weights |

| Method | Returns | Description |
|:--|:--|:--|
| `optimize_weights(val_preds_dict, y_val)` | `dict` | Uses `scipy.optimize.minimize` with SLSQP to find non-negative weights summing to 1.0 that minimize MAE on validation predictions. Falls back to inverse-MAE weighting if optimization fails |
| `blend_predictions(preds_dict)` | `np.array` | Produces weighted-average prediction from multiple model outputs |
| `compute_confidence_intervals(preds, std, confidence_level)` | `(lower, upper)` | Computes z-score–based prediction intervals (z=1.96 for 95%) |
| `generate_procurement_decision(current_rate, forecast_rate, threshold_pct)` | `dict` | Decision matrix: `≥ +4% → CHARTER_NOW`, `≤ −4% → WAIT`, else `HOLD_NEUTRAL` |
| `evaluate_ensemble(preds_dict, y_true, current_bci)` | `(ensemble_preds, lower, upper, metrics)` | End-to-end ensemble evaluation: blending → MAE/RMSE/MAPE/directional accuracy → confidence intervals |

**Instance Attributes:** `weights`, `metrics`

---

### 4.4 SHAP Explainability Engine

**File:** `src/models/explainability_shap.py`

**Class:** `FreightExplainabilityEngine`

| Parameter | Description |
|:--|:--|
| `model` | Trained XGBoost model object |
| `feature_names` | List of feature column names |

| Method | Returns | Description |
|:--|:--|:--|
| `fit_explainer(X_background)` | `shap.TreeExplainer` | Initializes SHAP TreeExplainer on background feature distribution |
| `compute_shap_values(X_sample)` | `shap.Explanation` | Computes Shapley values for each instance in the sample |
| `generate_visual_reports(X_test, output_dir)` | `(summary_path, waterfall_path)` | Saves two plots: (1) Global SHAP Summary Bar Plot (top 12 features) and (2) Local Waterfall Plot for the most recent prediction day |
| `generate_ministry_briefing(sample_idx, feature_row)` | `dict` | Translates SHAP values into plain-English briefing: base value, predicted value, net change, top 3 bullish drivers, top 3 bearish drivers, top 6 overall factors. Sorted by absolute SHAP impact |

**Instance Attributes:** `model`, `feature_names`, `explainer`, `shap_values`

---

## 5. Training Pipelines

### 5.1 Advanced Pipeline: `train_advanced.py`

**Function:** `run_pipeline()`

Orchestrates the complete AI training workflow in 5 sequential stages:

| Stage | Description | Output |
|:--|:--|:--|
| **[1/5] Load Data** | Reads `data/processed/freight_dataset_cleaned.csv` | DataFrame (1,388 × 75) |
| **[2/5] XGBoost + CV** | Trains `XGBoostFreightForecaster` with 5-fold walk-forward TimeSeriesSplit cross-validation (gap=7 days) | `models/xgboost_forecaster.json`, `models/xgboost_metadata.json` |
| **[3/5] BiLSTM** | Trains `LSTMFreightForecaster` with 20-day lookback, 35 epochs, AdamW + CosineAnnealing | `models/bilstm_freight_net.pt`, `models/bilstm_metadata.json` |
| **[4/5] Ensemble** | Trains Ridge baseline → Optimizes ensemble weights via SLSQP on validation set → Evaluates blended predictions on test set | Optimal weights dict |
| **[5/5] SHAP** | Computes SHAP values on last 80 test instances → Generates summary/waterfall plots → Builds executive briefing with procurement decision | `reports/shap_summary.png`, `reports/shap_latest_waterfall.png`, `reports/executive_briefing.json`, `models/ensemble_summary.json` |

**Usage:** `python train_advanced.py`

---

### 5.2 Baseline Pipeline: `train_model.py`

**Function:** `main()`

A simpler comparison pipeline for quick experimentation.

| Models Trained | Hyperparameters |
|:--|:--|
| Ridge Regression | `alpha=100.0` |
| Random Forest | `n_estimators=100`, `max_depth=10` |
| Gradient Boosting | `n_estimators=150`, `lr=0.05`, `max_depth=5` |

Evaluates MAE, RMSE, MAPE, directional accuracy. Prints top-5 Gradient Boosting feature importances and sample predictions.

**Usage:** `python train_model.py`

---

## 6. Frontend — React/Vite Application (`frontend/`)

**Stack:** React 18.2 + Vite 5.0 + Vanilla CSS

### 6.1 Entry Point & App Shell

#### `frontend/src/main.jsx`

| Export | Description |
|:--|:--|
| (default entry) | Renders `<App />` inside `<React.StrictMode>` into DOM element `#root` |

**Imports:** `React`, `ReactDOM`, `App`, `./index.css`

---

#### `frontend/src/App.jsx`

**Default Export:** `App` component

| State Variable | Type | Default | Description |
|:--|:--|:--|:--|
| `isLoggedIn` | `boolean` | `localStorage.getItem('ff_auth') === 'true'` | Authentication gate |
| `currentPage` | `string` | `'landing'` | Active page ID ("landing"/"forecast"/"explainability"/"market"/"settings") |
| `sidebarCollapsed` | `boolean` | `false` | Sidebar expand/collapse state |
| `backendStatus` | `string` | `'Checking backend microservice...'` | Health check result string |

| Function | Description |
|:--|:--|
| `checkHealth()` | Calls `GET /health`, updates `backendStatus` with model names or offline message |
| `handleLogin()` | Sets `isLoggedIn = true` |
| `handleLogout()` | Clears `localStorage`, resets state |

**Rendering Logic:**
- If not logged in → renders `<LoginPage>`
- If logged in → renders shell: `<Sidebar>` + `<Topbar>` + content area (conditionally renders page component based on `currentPage`) + `<ChatWidget>` (always floating)

**Imports Used:** `LoginPage`, `Sidebar`, `Topbar`, `LandingPage`, `Forecast`, `Explainability`, `MarketIntelligence`, `Settings`, `ChatWidget`, `API_BASE`

---

### 6.2 Constants & Configuration: `constants.js`

| Export | Type | Description |
|:--|:--|:--|
| `FEATURE_LABELS` | `Object<string, string>` | Maps 42 raw feature names (e.g. `"bci_index"`) to human-readable labels (e.g. `"Baltic Capesize Index (BCI)"`). Used by the Explainability page to display SHAP driver names |
| `DEMO_CREDENTIALS` | `Object` | `{ email: 'admin@freight.gov.in', password: 'SIH26006' }` — Demo login credentials |
| `DEFAULT_USER_PROFILE` | `Object` | `{ name, email, role, department, avatarInitials }` — Default user profile shown in sidebar/topbar |
| `ANIMATION_DURATION` | `Object` | `{ fast: 200, normal: 400, slow: 600, countUp: 2000 }` — Timing constants for animations |
| `NAV_ITEMS` | `Array<Object>` | 5 navigation items: Dashboard (compass), Forecast Engine (ship), SHAP Analysis (cpu), Market Intel (barchart), Settings (settings) |
| `API_BASE` | `string` | `'http://localhost:8000'` — Backend API base URL |
| `NOTIFICATIONS` | `Array<Object>` | 3 default notification items (BCI Surge Alert, Forecast Complete, Port Congestion Update) with id, title, message, time, read status, type |

---

### 6.3 React Components

#### 6.3.1 `LoginPage.jsx`

**Default Export:** `LoginPage({ onLogin })`

| Prop | Type | Description |
|:--|:--|:--|
| `onLogin` | `function` | Callback invoked on successful authentication |

| State | Type | Description |
|:--|:--|:--|
| `email` | `string` | Email input value |
| `password` | `string` | Password input value |
| `error` | `string` | Error message for invalid credentials |
| `loading` | `boolean` | Submit button loading state |
| `shake` | `boolean` | CSS shake animation trigger on failed login |
| `rememberMe` | `boolean` | Remember-me checkbox state |

**Features:** Animated ocean background with CSS waves and floating particles, glassmorphic login card, simulated 1.2s network delay, credential validation against `DEMO_CREDENTIALS`, localStorage persistence.

**Imports:** `ShipIcon`, `DEMO_CREDENTIALS`

---

#### 6.3.2 `Sidebar.jsx`

**Default Export:** `Sidebar({ currentPage, onNavigate, collapsed, onToggle, onLogout, backendStatus })`

| Prop | Type | Description |
|:--|:--|:--|
| `currentPage` | `string` | Currently active page ID |
| `onNavigate` | `function(id)` | Navigation callback |
| `collapsed` | `boolean` | Whether sidebar is in collapsed (icon-only) state |
| `onToggle` | `function` | Toggle collapsed state |
| `onLogout` | `function` | Sign-out callback |
| `backendStatus` | `string` | API health status string |

**Features:** User profile avatar section, icon-mapped navigation from `NAV_ITEMS`, active page indicator bar, API online/offline status dot, collapse/expand toggle, sign-out button.

**Internal:** `ICON_MAP` object maps icon string IDs to icon components: `compass → CompassIcon`, `ship → ShipIcon`, `cpu → CpuIcon`, `barchart → BarChart3Icon`, `settings → SettingsIcon`.

**Imports:** `CompassIcon`, `ShipIcon`, `CpuIcon`, `BarChart3Icon`, `SettingsIcon`, `LogoutIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ActivityIcon`, `NAV_ITEMS`, `DEFAULT_USER_PROFILE`

---

#### 6.3.3 `Topbar.jsx`

**Default Export:** `Topbar({ currentPage, onToggleSidebar, onLogout, onNavigate })`

| Prop | Type | Description |
|:--|:--|:--|
| `currentPage` | `string` | Current page ID for breadcrumb display |
| `onToggleSidebar` | `function` | Sidebar toggle callback |
| `onLogout` | `function` | Sign-out callback |
| `onNavigate` | `function(id)` | Page navigation callback |

| State | Description |
|:--|:--|
| `searchFocused` | Search bar focus styling |
| `searchQuery` | Search input value |
| `showNotifications` | Notification dropdown visibility |
| `showProfile` | Profile dropdown visibility |
| `notifications` | Array of notification objects (initialized from `NOTIFICATIONS` constant) |

**Features:** Hamburger menu button, breadcrumb trail (Ship icon / page name), search bar with ⌘K hint, notification bell with unread badge and dropdown panel with "Mark all read", profile dropdown with avatar, name/email, "My Profile" link, "API Documentation" link (→ `/docs`), sign-out button. All dropdowns close on outside click (via `useRef` + `useEffect`).

**Imports:** `SearchIcon`, `BellIcon`, `ChevronDownIcon`, `UserIcon`, `LogoutIcon`, `MenuIcon`, `ShipIcon`, `NOTIFICATIONS`, `DEFAULT_USER_PROFILE`, `NAV_ITEMS`

---

#### 6.3.4 `LandingPage.jsx`

**Default Export:** `LandingPage({ onNavigate, backendStatus })`

The main dashboard home page. A large, scrollable page with multiple animated sections.

| Section | Content |
|:--|:--|
| **Hero** | System title, tagline, API health badge, "Launch Forecast Engine" CTA button |
| **Metrics Strip** | 4 animated counters: 130M+ tonnes handled, $2.5B+ trade optimized, 9.43% MAPE, 4 Indian ports monitored |
| **Voyage Tracker** | Visual pipeline showing 4 stages: Origin Port → Ocean Transit → Port Queue → Delivered |
| **Ports Grid** | 4 Indian East Coast port cards (Paradip, Visakhapatnam, Kamarajar, Haldia) with draft depth, capacity bar, cargo types |
| **Platform Timeline** | 6 steps: Data Ingestion → Feature Engineering → Model Training → SHAP Explainability → Live API → Dashboard |
| **Capabilities Grid** | 6 feature cards with icons: Multi-Horizon Forecasting, Hybrid Ensemble, SHAP, Charter Signals, What-If Simulator, REST API |
| **CTA Banner** | Action banner linking to Forecast Engine, SHAP Analysis, and Market Intel pages |

**Scroll Animations:** Uses `useScrollAnimation` hook with 7 refs (hero, metrics, voyage, ports, timeline, capabilities, banner).

**Imports:** `useScrollAnimation`, `AnimatedCounter`, 16 Icon components

---

#### 6.3.5 `Forecast.jsx`

**Default Export:** `Forecast()`

The interactive prediction interface.

| State | Type | Default | Description |
|:--|:--|:--|:--|
| `route` | `string` | `'C5'` | Selected shipping route (C5/C3/BCI) |
| `horizon` | `string` | `'7'` | Forecast horizon (7/14/30 days) |
| `ironOre` | `string` | `'104'` | Iron ore what-if price override |
| `portWait` | `string` | `'4.5'` | Port congestion what-if override |
| `error` | `string` | `''` | API error message |
| `result` | `object` | `null` | `ForecastResponse` from API |
| `loading` | `boolean` | `false` | Prediction in progress |
| `showRaw` | `boolean` | `false` | Toggle raw JSON display |

**Constants:**
- `DEFAULT_IRON_ORE = 104` — Baseline iron ore price
- `DEFAULT_PORT_WAIT = 4.5` — Baseline port wait days

| Function | Description |
|:--|:--|
| `runForecast()` | Builds `ForecastRequest`, only includes scenario overrides if values differ from defaults, POSTs to `/api/v1/predict` |
| `getSignalColor(action)` | Maps decision action to CSS class (`signal-green`/`signal-red`/`signal-gray`) |

**UI Sections:** Route selector pills (🇦🇺 C5, 🇧🇷 C3, 🌐 BCI), Horizon selector (7/14/30d), What-If overrides (iron ore slider, port wait slider), Run Prediction button, Results card with spot vs predicted rates, ±% change, confidence interval, procurement decision badge with rationale, route details grid, raw JSON toggle.

**Imports:** `ShipIcon`, `TrendingUpIcon`, `SlidersIcon`, `ArrowRightIcon`, `ActivityIcon`, `LoadingSkeleton`, `API_BASE`

---

#### 6.3.6 `Explainability.jsx`

**Default Export:** `Explainability()`

| State | Type | Description |
|:--|:--|:--|
| `loading` | `boolean` | Data fetching state |
| `error` | `string` | API error message |
| `data` | `object` | `ExecutiveBriefingResponse` from API |

| Function | Description |
|:--|:--|
| `fetchExplainability()` | Calls `GET /api/v1/explainability` on mount |
| `getFeatureLabel(feature)` | Looks up human-readable name from `FEATURE_LABELS` constant |

**UI Sections:**
1. **Decision Banner** — Procurement decision action badge (CHARTER_NOW/WAIT/HOLD), urgency level, rationale text
2. **SHAP Charts** — Embeds SHAP summary plot and waterfall plot images from `/reports/` endpoint
3. **Animated SHAP Bars** — Custom horizontal bar chart for bullish drivers (green, pushing rates up) and bearish drivers (red, pushing rates down). Bars animate on scroll using `useScrollAnimation` hook with staggered CSS delays. Bar width scaled to `abs(shap_impact) / maxShap * 100%`

**Imports:** `FEATURE_LABELS`, `API_BASE`, `CpuIcon`, `TrendingUpIcon`, `SearchCheckIcon`, `LoadingSkeleton`, `useScrollAnimation`

---

#### 6.3.7 `MarketIntelligence.jsx`

**Default Export:** `MarketIntelligence()`

| State | Type | Description |
|:--|:--|:--|
| `snapshot` | `object` | `MarketSnapshotResponse` from API |
| `history` | `array` | Array of historical records from `/market/history` |
| `loading` | `boolean` | Data fetching state |
| `error` | `string` | Error message |
| `refreshCountdown` | `number` | Auto-refresh countdown (60s cycle) |

| Function | Description |
|:--|:--|
| `fetchData()` | Parallel-fetches `/market/snapshot` and `/market/history?limit=30` |
| `getTrend(current, field)` | Computes day-over-day percentage change from history |

**Internal Components:**
- `TrendBadge({ value })` — Renders ▲/▼ with percentage change, colored green/red
- `MiniSparkline({ data, field })` — CSS-only mini bar chart using last 14 data points, height-proportional bars with progressive opacity

**UI Sections:**
1. **Header** — Title, subtitle, circular SVG countdown ring (auto-refreshes every 60s), manual "Refresh Now" button
2. **Primary Rate Cards** (6 cards) — BCI Index (cyan), Route C5 (emerald), Route C3 (amber), Iron Ore (rose), Brent Crude (blue), VLSFO Fuel (purple). Each shows value, unit, trend badge, and mini sparkline
3. **Supporting Indicators** (6 cards) — Coking Coal, Port Wait, China PMI, USD/INR, BDI, Latest Date

**Imports:** `API_BASE`, `TrendingUpIcon`, `ActivityIcon`, `AnchorIcon`, `ShipIcon`, `GlobeIcon`, `LoadingSkeleton`, `AnimatedCounter`, `useScrollAnimation`

---

#### 6.3.8 `Settings.jsx`

**Default Export:** `Settings()`

| State | Type | Description |
|:--|:--|:--|
| `user` | `object` | User profile object (from localStorage or `DEFAULT_USER_PROFILE`) |
| `apiUrl` | `string` | API base URL (default `API_BASE`) |
| `apiTestStatus` | `object|null` | `{ ok: boolean, message: string }` API test result |
| `apiTesting` | `boolean` | API test in progress |
| `saved` | `boolean` | Profile save confirmation flash |
| `activeSection` | `string` | Active settings tab: "profile"/"api"/"about" |

| Function | Description |
|:--|:--|
| `saveProfile()` | Saves user profile to localStorage, flashes success message |
| `testApiConnection()` | Calls `GET /health` on the configured API URL, reports connection status |

**Tabs:**
1. **Profile** — Avatar display, editable name/email/role/department/avatar initials fields, save button
2. **API Config** — API URL input, "Test Connection" button with status indicator, endpoint reference table
3. **About** — System info (version, team, problem statement, tech stack table: FastAPI, XGBoost, PyTorch BiLSTM, SHAP, Pandas, React + Vite)

**Imports:** `DEFAULT_USER_PROFILE`, `API_BASE`, `UserIcon`, `DatabaseIcon`, `ShipIcon`, `ActivityIcon`

---

#### 6.3.9 `ChatWidget.jsx`

**Default Export:** `ChatWidget()`

| State | Type | Description |
|:--|:--|:--|
| `isOpen` | `boolean` | Chat panel visibility |
| `messages` | `array` | Array of `{ role, content, data? }` message objects |
| `input` | `string` | User input value |
| `loading` | `boolean` | Waiting for API response |
| `suggestions` | `array` | Quick-prompt suggestion strings (fetched once) |

| Function | Description |
|:--|:--|
| `fetchSuggestions()` | Calls `GET /api/v1/chat/suggestions`, flattens all prompts, takes first 6 |
| `sendMessage(text?)` | Appends user message → POSTs to `/api/v1/chat` with last 6 messages as history → Appends assistant reply |
| `handleKeyDown(e)` | Sends message on Enter (without Shift) |

**UI Elements:**
- **FAB Button** — Floating action button (bottom-right) with `BotIcon` and pulsing animation ring
- **Chat Panel** — Slide-in panel with header (avatar, "Maritime AI Copilot", online status, close button), scrollable message list, typing indicator (3 bouncing dots), suggestion chips (shown when ≤ 2 messages), input field with send button
- **Message Bubbles** — User messages (right-aligned) and assistant messages (left-aligned). Assistant messages can include: action signal badge (CHARTER_NOW/WAIT, green/amber/gray), estimated savings display, clickable follow-up suggestion chips

**Imports:** `BotIcon`, `SendIcon`, `XIcon`, `API_BASE`

---

#### 6.3.10 `AnimatedCounter.jsx`

**Default Export:** `AnimatedCounter({ end, duration, prefix, suffix, decimals, className })`

| Prop | Type | Default | Description |
|:--|:--|:--|:--|
| `end` | `number` | `0` | Target number to count to |
| `duration` | `number` | `2000` | Animation duration in ms |
| `prefix` | `string` | `''` | Text before number (e.g. "$") |
| `suffix` | `string` | `''` | Text after number (e.g. "%", "M+") |
| `decimals` | `number` | `0` | Decimal places |
| `className` | `string` | `''` | CSS class |

**Behavior:** Uses `IntersectionObserver` (threshold 0.3) to detect when element scrolls into view. On first visibility, starts `requestAnimationFrame` count-up animation from 0 to `end` using `easeOutExpo` easing function. Only triggers once.

**Imports:** `useState`, `useEffect`, `useRef`, `useCallback` from React

---

#### 6.3.11 `LoadingSkeleton.jsx`

**Default Export:** `LoadingSkeleton({ variant, count, className })`

| Prop | Type | Default | Description |
|:--|:--|:--|:--|
| `variant` | `string` | `'text'` | Skeleton type: `'text'` / `'card'` / `'stat'` / `'chart'` / `'circle'` |
| `count` | `number` | `1` | Number of skeleton items to render |
| `className` | `string` | `''` | Additional CSS class |

**Variants:**
- `card` — Grid of cards with shimmer header, body, and two text lines
- `stat` — Row of stat blocks with badge, number, and label placeholders
- `chart` — Single large chart-area shimmer block
- `circle` — Row of circular shimmer blocks
- `text` (default) — Stacked text lines with decreasing widths (90%, 78%, 66%…)

---

### 6.4 Custom Hooks

#### `frontend/src/hooks/useScrollAnimation.js`

**Default Export:** `useScrollAnimation({ threshold, rootMargin, triggerOnce })`

| Parameter | Type | Default | Description |
|:--|:--|:--|:--|
| `threshold` | `number` | `0.2` | Visibility ratio (0–1) required to trigger |
| `rootMargin` | `string` | `'0px 0px -60px 0px'` | Root margin for IntersectionObserver |
| `triggerOnce` | `boolean` | `true` | Whether to unobserve after first trigger |

**Returns:** `{ ref, isVisible }` — A React ref to attach to the target element and a boolean state indicating visibility.

**Usage Pattern:**
```jsx
const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
// ...
<div ref={ref} className={`section ${isVisible ? 'visible' : ''}`}>
```

---

### 6.5 Icons Library

**File:** `frontend/src/components/Icons.jsx`

All icons are SVG-based React components accepting `{ className, size }` props. Default `size = 20`.

| Export Name | Visual Description |
|:--|:--|
| `ShipIcon` | Cargo ship with waves |
| `AnchorIcon` | Ship anchor |
| `TrendingUpIcon` | Upward trend arrow |
| `CpuIcon` | Processor chip (AI/ML) |
| `SearchCheckIcon` | Magnifying glass with checkmark |
| `ShieldAlertIcon` | Shield with alert |
| `SlidersIcon` | Adjustment sliders |
| `DatabaseIcon` | Database cylinder |
| `ArrowRightIcon` | Right arrow |
| `ActivityIcon` | Activity/heartbeat line |
| `CompassIcon` | Navigation compass |
| `BarChart3Icon` | Bar chart |
| `SettingsIcon` | Gear/cog |
| `LogoutIcon` | Logout/sign-out |
| `ChevronLeftIcon` | Left chevron |
| `ChevronRightIcon` | Right chevron |
| `ChevronDownIcon` | Down chevron |
| `SearchIcon` | Magnifying glass |
| `BellIcon` | Notification bell |
| `UserIcon` | User silhouette |
| `MenuIcon` | Hamburger menu |
| `BotIcon` | Robot/AI bot |
| `SendIcon` | Paper airplane (send) |
| `XIcon` | Close/X mark |
| `PackageIcon` | Package box |
| `FactoryIcon` | Industrial factory |
| `TruckIcon` | Delivery truck |
| `CraneIcon` | Port crane |
| `WavesIcon` | Ocean waves |
| `GlobeIcon` | World globe |

---

## 7. Data Pipeline & Dataset

### Dataset Generator: `scripts/generate_dataset.py`

**Function:** `generate_vectorized_freight_data(start_date, end_date, seed)`

Generates realistic simulated maritime freight time-series data using **100% vectorized NumPy/Pandas operations** (zero Python for-loops).

**Generated Features (Raw):**
- Brent Crude Oil ($/bbl) — with COVID crash, supercycle, Ukraine spike regimes
- VLSFO Bunker Fuel ($/tonne) — derived from crude with noise
- Iron Ore 62% Fe CFR ($/tonne) — Vale dam disaster, $230 peak, China curtailment
- Coking Coal ($/tonne) — Queensland floods, Ukraine shortage peak
- BCI Index — with seasonal cycles, regime-switching
- BDI Index — correlated with BCI at ~75%
- Route C5 and C3 rates — derived from BCI with empirical formulas
- China Manufacturing PMI, S&P 500, USD/INR, USD/CNY
- Port congestion (East India and China)
- Capesize fleet size, vessel orderbook percentage
- Indian steel production

**Engineered Features (75 total):**
- Lag features: BCI, BDI, C5, C3 at lags 1, 2, 3, 7, 14, 30 days
- Moving averages: BCI and C5 at 7, 14, 30, 60 day windows
- Rolling volatility: BCI standard deviation at 7, 14, 30, 60 day windows
- Rate of change: BCI and C5 at 7 and 14 day periods
- Cross-feature ratios: fuel-to-C5, iron-ore-to-BCI, BCI-to-BDI
- Seasonal signals: `sin(day_of_year)`, `cos(day_of_year)`
- Calendar: `day_of_week`, `month`, `quarter`
- Binary events: `is_chinese_new_year`, `is_monsoon_season`
- Forward targets: `target_bci_next_1d`, `target_bci_next_7d`, `target_bci_next_14d`, `target_bci_next_30d`, `target_c5_next_7d`, `target_c3_next_7d`
- Decision labels: `chartering_signal`, `chartering_recommendation`

**Date Range:** Jan 2, 2019 — Aug 30, 2024 (business days only)
**Output:** 1,388 rows × 75 columns, 0 NaN values

---

## 8. Saved Model Artifacts (`models/`)

| File | Size | Contents |
|:--|:--|:--|
| `xgboost_forecaster.json` | ~317 KB | Serialized XGBoost model (200 trees, max_depth=4) |
| `xgboost_metadata.json` | ~2 KB | 67 feature names, target column, test metrics (MAE=161.6, MAPE=10.67%, Dir Acc=64.75%), 5-fold CV results |
| `bilstm_freight_net.pt` | ~116 KB | PyTorch state_dict for BiLSTMFreightNet (hidden=32, bidirectional, 1 layer) |
| `bilstm_metadata.json` | ~2 KB | Feature names, lookback=20, hidden=32, test metrics (MAE=383.1, MAPE=28.36%) |
| `ensemble_summary.json` | ~2 KB | Per-model metrics, optimal weights (XGBoost=0.02, LSTM=0.01, Ridge=0.97), ensemble metrics (MAE=156.04, MAPE=9.43%, Dir Acc=67.63%), latest procurement decision |

---

## 9. Reports & Explainability Outputs (`reports/`)

| File | Size | Description |
|:--|:--|:--|
| `shap_summary.png` | ~139 KB | Global SHAP feature importance bar/beeswarm plot (top 12 features) |
| `shap_latest_waterfall.png` | ~137 KB | Single-prediction waterfall decomposition for the most recent trading day |
| `executive_briefing.json` | ~2 KB | JSON briefing with baseline market level, predicted rate, net rate change, procurement decision (action/urgency/rationale), top 3 bullish drivers, top 3 bearish drivers, top 6 overall factors, confidence range |

---

## 10. Test Suites (`tests/`)

### `tests/test_api.py` — API Integration Tests

Uses `fastapi.testclient.TestClient` for in-process endpoint testing.

| Test Function | Endpoint | Assertions |
|:--|:--|:--|
| `test_root_endpoint()` | `GET /`, `GET /api/info` | Status 200, HTML contains "National Maritime Freight Intelligence System", JSON has beneficiary field |
| `test_health_endpoint()` | `GET /health` | Status healthy, model loaded, XGBoost in available models |
| `test_market_snapshot()` | `GET /api/v1/market/snapshot` | Has `bci_index`, `route_c5_usd_per_tonne`, `iron_ore_price_usd`, BCI > 0 |
| `test_market_history()` | `GET /api/v1/market/history` | Returns ≥ 30 records, each with `date` and `bci_index` fields |
| `test_recommendation()` | `GET /api/v1/recommendation` | Has `action`, `urgency`, `rationale` fields |
| `test_explainability()` | `GET /api/v1/explainability` | Has `procurement_decision`, `bullish_drivers_raising_freight`, chart URLs |
| `test_predict_c5()` | `POST /api/v1/predict` (C5, 7d) | Has `predicted_rate`, `recommendation`, `confidence_interval_95pct` |
| `test_predict_whatif()` | `POST /api/v1/predict` (with overrides) | Prediction reflects scenario overrides, has recommendation |
| `test_chat_glossary()` | `POST /api/v1/chat` (BCI query) | Category = glossary |
| `test_chat_decision()` | `POST /api/v1/chat` (charter decision) | Has action_signal = CHARTER_NOW or WAIT |
| `test_chat_suggestions()` | `GET /api/v1/chat/suggestions` | Returns 3 category groups |

**Usage:** `python tests/test_api.py`

---

### `tests/verify_dataset.py` — Dataset Integrity Tests

| Test Section | Checks |
|:--|:--|
| **Dataset Integrity** | File exists, row count, column count, date range, zero NaN values |
| **Target Variables** | Min/mean/max/std for BCI, C5, and all forward-target columns |
| **ML Smoke Test** | Trains a RandomForest on 80/20 split, asserts MAE < 800, MAPE < 40%, directional accuracy > 45% |
| **Classification** | Trains RandomForest classifier on `chartering_signal`, asserts accuracy > 55% |

**Usage:** `python tests/verify_dataset.py`

---

## 11. API Endpoint Reference (Complete)

| Method | Path | Tag | Request | Response | Description |
|:--|:--|:--|:--|:--|:--|
| `GET` | `/` | — | — | HTML | Dashboard web interface |
| `GET` | `/test` | — | — | HTML | Alias for dashboard |
| `GET` | `/api/info` | System | — | JSON | System metadata & endpoints |
| `GET` | `/health` | System | — | `HealthResponse` | Model status & MAPE |
| `POST` | `/api/v1/predict` | Forecasting | `ForecastRequest` | `ForecastResponse` | AI freight rate forecast |
| `GET` | `/api/v1/recommendation` | Decision Support | — | `ProcurementDecision` | Charter NOW/WAIT signal |
| `GET` | `/api/v1/explainability` | Decision Support | — | `ExecutiveBriefingResponse` | SHAP breakdown + briefing |
| `GET` | `/api/v1/market/snapshot` | Market Intel | — | `MarketSnapshotResponse` | Latest spot prices |
| `GET` | `/api/v1/market/history` | Market Intel | `?limit=90` | `list[dict]` | Historical time-series |
| `POST` | `/api/v1/chat` | AI Assistant | `ChatRequest` | `ChatResponse` | Maritime AI copilot |
| `GET` | `/api/v1/chat/suggestions` | AI Assistant | — | JSON | Quick-prompt suggestions |

**Interactive Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 12. Environment & Dependencies

### Python (Backend + ML)

| Package | Version | Purpose |
|:--|:--|:--|
| `fastapi` | ≥1.0 | REST API framework |
| `uvicorn` | — | ASGI server |
| `pydantic` | v2 | Data validation |
| `xgboost` | ≥3.4 | Gradient boosted trees |
| `torch` (PyTorch) | ≥2.14 | Deep learning (BiLSTM) |
| `shap` | — | Explainable AI |
| `scikit-learn` | — | Preprocessing, metrics, Ridge, TimeSeriesSplit |
| `scipy` | — | SLSQP optimization for ensemble weights |
| `pandas` | — | Data manipulation |
| `numpy` | — | Numerical computing |
| `matplotlib` | — | SHAP plot generation |

### Node.js (Frontend)

| Package | Version | Purpose |
|:--|:--|:--|
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `vite` | ^5.0.0 | Dev server & bundler |
| `@vitejs/plugin-react` | ^4.2.1 | Vite React integration |

### Quickstart

```powershell
# Backend
pip install -r requirements.txt
python train_advanced.py     # Train models (one-time)
python run_api.py            # Start API on port 8000

# Frontend
cd frontend
npm install
npm run dev                  # Start dev server on port 3000
```

---

> *Document generated from source code analysis of the SIH26006 repository.*
> *Last updated: September 2026*
