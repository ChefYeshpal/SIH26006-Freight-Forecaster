"""
Convenience launcher for SIH26006 Maritime Freight Forecasting API
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 70)
    print("🚢 Starting SIH26006 Freight Forecasting API Server...")
    print("   Open interactive documentation at: http://localhost:8000/docs")
    print("   Health Check at:                   http://localhost:8000/health")
    print("=" * 70)
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
