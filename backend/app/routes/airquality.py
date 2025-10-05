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

        # Adaptive search: expand radius until we have at least one station with measurements or hit cap
        search_radius = radius
        ground = await openaq_service.get_nearby_stations(lat, lon, search_radius, None, 10)
        attempts = 0
        while attempts < 3 and (
            not ground.get("stations")
            or all(not s.get("measurements") for s in ground.get("stations", []))
        ):
            search_radius = min(int(search_radius * 2), 200)
            ground = await openaq_service.get_nearby_stations(
                lat, lon, search_radius, None, 10
            )
            attempts += 1

        # Derive pollutant set using inverse-distance weighting across stations for each pollutant
        pollutants = {}
        stations = ground.get("stations") if ground else []
        if stations:
            # For each pollutant, collect (value, distance)
            from math import isfinite
            target_params = ("pm25", "o3", "no2")
            for param in target_params:
                values = []
                for s in stations:
                    dist = s.get("distance") or 0.1  # avoid zero
                    for m in s.get("measurements", []):
                        if m.get("parameter") == param and m.get("value") is not None:
                            val = m.get("value")
                            if isinstance(val, (int, float)) and isfinite(val):
                                values.append((val, dist))
                if values:
                    # Inverse distance weights: w = 1/(d+epsilon)
                    eps = 0.01
                    weighted_sum = sum(v / (d + eps) for v, d in values)
                    weight_total = sum(1 / (d + eps) for _, d in values)
                    pollutants[param] = round(weighted_sum / weight_total, 2)
            # Fallback: if still missing a param, take first station measurement
            for param in ("pm25", "o3", "no2"):
                if param not in pollutants:
                    for s in stations:
                        for m in s.get("measurements", []):
                            if m.get("parameter") == param and m.get("value") is not None:
                                pollutants[param] = m.get("value")
                                break
                        if param in pollutants:
                            break

        # Fallback to satellite for missing pollutants (note TEMPO naming differences)
        meas = tempo.get("measurements", {}) if tempo else {}
        if "pm25" not in pollutants and meas.get("pm25") is not None:
            pollutants["pm25"] = meas.get("pm25")
        if "o3" not in pollutants and meas.get("o3") is not None:
            pollutants["o3"] = meas.get("o3")
        if "no2" not in pollutants and meas.get("no2") is not None:
            pollutants["no2"] = meas.get("no2")

        aqi = compute_aqi(pollutants)

        # Build fusion metadata for transparency
        stations_used = len(stations) if 'stations' in ground else 0
        fusion_meta = {
            "stationsUsed": stations_used,
            "radiusUsedKm": search_radius,
            "weighting": "inverse-distance (1/(d+0.01))",
            "pollutantsWeighted": list(pollutants.keys()),
            "attempts": attempts + 1,
        }

        unified = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow().isoformat(),
            "sources": {"tempo": tempo, "openaq": ground},
            "pollutants": {
                **pollutants,
                "hcho": meas.get("hcho"),
                "aerosolIndex": meas.get("aerosolIndex"),
            },
            "aqi": aqi,
            "fusion": fusion_meta,
        }
        return {"success": True, "data": unified}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
