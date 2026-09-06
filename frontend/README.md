# Freight Forecast React App

This is a React conversion of the original HTML/CSS/JS frontend (In base folder). All API logic has been ported as it is with no changes to endpoints or field names.

## Project Structure

- **Forecast page**: Form inputs (route, horizon, iron ore price, port wait days) + results display
- **Explainability page**: Placeholder for SHAP charts (yet be implemented)
- Simple tab-based navigation between pages

## Getting Started

### Prerequisites (check)
- Node.js 18+ and npm 9+

### Installation

From the `react-app` directory:

```bash
npm install
```

### Development Server

Start the development server (opens automatically on http://localhost:3000):

```bash
npm run dev
```

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Backend Requirements

The backend API server must be running at `http://localhost:8000`. 

Make sure to start the backend first:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_api.py
```

Then start the React dev server in another terminal.

## API Endpoints Used

- `GET /health` - Backend health check (runs on app load)
- `POST /api/v1/predict` - Forecast prediction endpoint
