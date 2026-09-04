# 🧪 Disposable AI Test Interface
### *Temporary playground for testing the ML models & FastAPI backend*

This folder contains a lightweight, self-contained test interface created solely for manual inspection and verification during development.

---

## 🚀 How to Use It

### Option A: Direct in Browser (No Server Required)
Simply double-click `test_interface/index.html` in your file explorer, or open it in Google Chrome or Microsoft Edge.
It includes built-in fallback simulation if the API server isn't running yet.

### Option B: Via FastAPI Server
1. Start the API server:
   ```powershell
   python run_api.py
   ```
2. In your browser, open:
   [http://localhost:8000/test](http://localhost:8000/test)

---

## 🎯 What You Can Test

1. **Market Snapshot Feed:** View live Baltic Capesize (BCI), Dry Bulk (BDI), and Route C5/C3 spot freight rates.
2. **Interactive Route & Horizon Selection:** Test predictions for 1, 7, 14, or 30 days ahead.
3. **What-If Simulation Sliders:**
   - Adjust Iron Ore prices ($70 - $220/tonne)
   - Adjust Paradip/Vizag port delays (1 - 15 days)
4. **Chartering Recommendation Badge:**
   - Green `CHARTER NOW` (urgent procurement signal)
   - Red `WAIT` (expected market softening signal)
   - Gray `HOLD NEUTRAL`
5. **SHAP Explainability Visualizations:**
   - Summary feature importance ranking
   - Waterfall attribution plot for latest prediction
6. **Raw JSON Payload:** View the full API response for debugging.

---

## 🗑️ How to Delete When Done

When you are ready to build the final UI or wrap up the project, you can safely delete this directory:
```powershell
Remove-Item -Recurse -Force test_interface
```
*(Deleting this folder will not break the AI models, pipeline, or backend API).*
