"""
SkyCast FastAPI Backend
Ultra-optimized API for air quality forecasting
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

# Import routes
from app.routes import tempo, openaq, weather, forecast, airquality

app = FastAPI(
    title="SkyCast API",
    description="AI-Powered Air Quality Forecasting with NASA TEMPO Data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tempo.router, prefix="/api/tempo", tags=["TEMPO"])
app.include_router(openaq.router, prefix="/api/openaq", tags=["OpenAQ"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(airquality.router, prefix="/api/airquality", tags=["Aggregated"])

@app.get("/")
async def root():
    return {
        "message": "SkyCast API - AI-Powered Air Quality Forecasting",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "skycast-api"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
