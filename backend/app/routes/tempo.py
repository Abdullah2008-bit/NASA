"""
NASA TEMPO Data Route
Fetches satellite air quality data (NO2, O3, HCHO, PM, Aerosols)
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime
import asyncio
from app.services.tempo_service import tempo_service

router = APIRouter()

@router.get("/")
async def get_tempo_data(
    lat: float = Query(..., description="Latitude (-90 to 90)", ge=-90, le=90),
    lon: float = Query(..., description="Longitude (-180 to 180)", ge=-180, le=180),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    parameters: Optional[str] = Query("no2,o3,hcho,pm,aerosol", description="Comma-separated parameters")
):
    """
    Fetch NASA TEMPO satellite data for a specific location
    
    Parameters:
    - NO2: Nitrogen Dioxide
    - O3: Ozone
    - HCHO: Formaldehyde
    - PM: Particulate Matter
    - Aerosol: Aerosol Index
    """
    try:
        param_list = parameters.split(',') if parameters else None
        data = await tempo_service.fetch_tempo_data(lat, lon, date, param_list)
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_tempo():
    """Get latest available TEMPO data across North America"""
    try:
        # Sample locations for demo
        locations = [
            {"name": "New York", "lat": 40.7128, "lon": -74.0060},
            {"name": "Los Angeles", "lat": 34.0522, "lon": -118.2437},
            {"name": "Chicago", "lat": 41.8781, "lon": -87.6298},
        ]
        
        results = []
        for loc in locations:
            data = await tempo_service.fetch_tempo_data(loc["lat"], loc["lon"])
            results.append({
                "location": loc["name"],
                "data": data
            })
        
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
