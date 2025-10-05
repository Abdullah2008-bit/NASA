"""Aggregated Air Quality Route
Combines satellite (TEMPO) + ground (OpenAQ) sources and computes AQI.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime
from app.services.tempo_service import tempo_service
from app.services.openaq_service import openaq_service
from app.utils.aqi import compute_aqi

router = APIRouter()

@router.get("/")
async def get_aggregated_air_quality(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius: int = Query(10, ge=1, le=200),
):
    try:
        tempo = await tempo_service.fetch_tempo_data(lat, lon)
        ground = await openaq_service.get_nearby_stations(lat, lon, radius, None, 3)

        # Derive pollutant set prioritizing ground measurements where available
        pollutants = {}
        # Flatten first station measurements for quick mapping
        if ground and ground.get("stations"):
            first = ground["stations"][0]
            for m in first.get("measurements", []):
                name = m.get("parameter")
                val = m.get("value")
                if name == "pm25":
                    pollutants["pm25"] = val
                elif name == "o3":
                    pollutants["o3"] = val
                elif name == "no2":
                    pollutants["no2"] = val

        # Fallback to satellite for missing pollutants (note TEMPO naming differences)
        meas = tempo.get("measurements", {}) if tempo else {}
        if "pm25" not in pollutants and meas.get("pm25") is not None:
            pollutants["pm25"] = meas.get("pm25")
        if "o3" not in pollutants and meas.get("o3") is not None:
            pollutants["o3"] = meas.get("o3")
        if "no2" not in pollutants and meas.get("no2") is not None:
            pollutants["no2"] = meas.get("no2")

        aqi = compute_aqi(pollutants)

        unified = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow().isoformat(),
            "sources": {
                "tempo": tempo,
                "openaq": ground,
            },
            "pollutants": {
                **pollutants,
                "hcho": meas.get("hcho"),
                "aerosolIndex": meas.get("aerosolIndex"),
            },
            "aqi": aqi,
        }
        return {"success": True, "data": unified}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
