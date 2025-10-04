"""OpenAQ Ground Station Data Route
Provides real measurements from nearby ground-based monitoring stations.

This endpoint complements satellite (TEMPO) data enabling:
 - Validation (ground vs satellite)
 - Bias correction / calibration workflows
 - Multi-source fusion on the frontend
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.openaq_service import openaq_service

router = APIRouter()

@router.get("/")
async def get_openaq_data(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(10, description="Search radius in km", ge=1, le=200),
    parameters: Optional[str] = Query(
        "pm25,pm10,o3,no2", description="Comma-separated pollutant parameters (pm25,pm10,o3,no2,so2,co,bc)"
    ),
    limit: int = Query(5, description="Max stations to return", ge=1, le=25),
):
    """Fetch ground station air quality data from OpenAQ network.

    Returns an array of nearby stations with latest measurements plus a stats summary.
    """
    try:
        param_list = [p.strip() for p in parameters.split(",")] if parameters else None
        data = await openaq_service.get_nearby_stations(lat, lon, radius, param_list, limit)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

