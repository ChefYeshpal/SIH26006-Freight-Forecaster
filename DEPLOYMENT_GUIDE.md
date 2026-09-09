# 🚀 Deployment Guide — SIH26006 Freight Forecaster

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Vercel (Free)     │  HTTP   │   Render (Free)     │
│   React Frontend    │ ──────► │   FastAPI Backend    │
│   Port: 443 (HTTPS) │  JSON   │   Port: 443 (HTTPS) │
└─────────────────────┘         └─────────────────────┘
  yourapp.vercel.app              sih26006-freight-api.onrender.com
```

---

## Step 1: Deploy Backend on Render

### 1.1 Create Render Account
1. Go to **[https://render.com](https://render.com)** and sign up (free).
2. Connect your **GitHub account**.

### 1.2 Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repo: **`ashmitsingh-ai/SIH26006-Freight-Forecaster`**
3. Fill in the settings:

| Setting | Value |
|:--|:--|
| **Name** | `sih26006-freight-api` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty — use repo root)* |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn api.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

4. Under **Environment Variables**, add:
   - `PYTHON_VERSION` = `3.12.0`

5. Click **"Create Web Service"**.

### 1.3 Wait for Build
- First deploy takes **5–10 minutes** (PyTorch + XGBoost are large).
- Once deployed, your API will be live at:
  ```
  https://sih26006-freight-api.onrender.com
  ```
- Test it by visiting:
  ```
  https://sih26006-freight-api.onrender.com/health
  https://sih26006-freight-api.onrender.com/docs
  ```

> ⚠️ **Free Tier Note:** Render free services spin down after 15 minutes of inactivity. First request after idle takes ~30–60 seconds to cold-start. This is normal for demos.

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Install Vercel CLI (Optional but Fastest)
```powershell
npm install -g vercel
```

### 2.2 Deploy via CLI
```powershell
cd frontend
vercel
```

When prompted:
| Prompt | Answer |
|:--|:--|
| Set up and deploy? | **Y** |
| Which scope? | *(your Vercel account)* |
| Link to existing project? | **N** |
| Project name? | `sih26006-freight-forecaster` |
| Directory with source code? | `./` |
| Build Command? | `vite build` |
| Output Directory? | `dist` |
| Development Command? | `vite` |

### 2.3 Set the Backend URL Environment Variable
After the first deploy, set the production API URL:
```powershell
vercel env add VITE_API_BASE production
```
When prompted, paste your Render backend URL:
```
https://sih26006-freight-api.onrender.com
```

Then redeploy for the env variable to take effect:
```powershell
vercel --prod
```

### 2.4 Alternative: Deploy via Vercel Dashboard
1. Go to **[https://vercel.com](https://vercel.com)** and sign up (free with GitHub).
2. Click **"Add New Project"** → Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Set **Framework Preset** to `Vite`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE` = `https://sih26006-freight-api.onrender.com`
6. Click **"Deploy"**.

Your frontend will be live at:
```
https://sih26006-freight-forecaster.vercel.app
```

---

## Step 3: Update CORS (If Needed)

Your backend already has `allow_origins=["*"]` in `api/main.py`, so all origins are allowed. For production security, you can restrict it to your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sih26006-freight-forecaster.vercel.app",
        "http://localhost:3000",  # Keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Step 4: Verify Deployment

| Check | URL | Expected |
|:--|:--|:--|
| Backend Health | `https://sih26006-freight-api.onrender.com/health` | `{"status": "healthy", ...}` |
| API Docs | `https://sih26006-freight-api.onrender.com/docs` | Swagger UI |
| Frontend | `https://sih26006-freight-forecaster.vercel.app` | Login page |
| End-to-End | Login → Forecast → Run prediction | Prediction result appears |

---

## Quick Reference

| Component | Platform | URL Pattern | Cost |
|:--|:--|:--|:--|
| **Backend API** | Render | `https://sih26006-freight-api.onrender.com` | Free |
| **Frontend App** | Vercel | `https://sih26006-freight-forecaster.vercel.app` | Free |
| **API Docs** | Render | `.../docs` | — |
| **GitHub Repo** | GitHub | `github.com/ashmitsingh-ai/SIH26006-Freight-Forecaster` | Free |

---

## Troubleshooting

### Backend won't start on Render
- Check **Logs** tab in Render dashboard.
- Most common issue: PyTorch is large (~2GB). Render free tier has 512MB RAM — if it OOMs, switch to `torch-cpu` in requirements: `torch==2.14.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu`
- Ensure `data/processed/freight_dataset_cleaned.csv` and `models/` files are committed to git.

### Frontend shows "Backend offline"
- The Render free tier spins down after 15 min idle. Wait 30–60s for cold start.
- Check that `VITE_API_BASE` env variable is set correctly in Vercel (no trailing slash).

### "CORS error" in browser console
- Verify `allow_origins` in `api/main.py` includes your Vercel domain.
- Currently set to `["*"]` which allows all origins.

### Model files too large for Git
- If `.pt` or `.json` model files exceed GitHub's 100MB limit, use [Git LFS](https://git-lfs.github.com/):
  ```bash
  git lfs install
  git lfs track "*.pt"
  git lfs track "models/*.json"
  git add .gitattributes
  ```
