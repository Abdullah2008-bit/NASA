"""AQI Calculation Utilities

Implements US EPA AQI breakpoint-based subindex calculation for common pollutants.
Currently supports PM2.5 (24h), O3 (8h), NO2 (1h approximate), and can be extended.

Returns both overall AQI and dominant pollutant.
"""
from __future__ import annotations
from typing import Dict, Optional, Tuple

# Breakpoints: (C_low, C_high, I_low, I_high)
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

O3_8H_BREAKPOINTS_PPb = [  # Using ppb for simplicity
    (0, 54, 0, 50),
    (55, 70, 51, 100),
    (71, 85, 101, 150),
    (86, 105, 151, 200),
    (106, 200, 201, 300),  # Extended
]

NO2_1H_BREAKPOINTS_PPb = [
    (0, 53, 0, 50),
    (54, 100, 51, 100),
    (101, 360, 101, 150),
    (361, 649, 151, 200),
    (650, 1249, 201, 300),
]

def _calc_subindex(conc: float, breakpoints) -> Optional[float]:
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= conc <= c_high:
            return ( (i_high - i_low) / (c_high - c_low) ) * (conc - c_low) + i_low
    return None

def compute_aqi(pollutants: Dict[str, float]) -> Dict[str, Optional[str] | int | Dict[str, float]]:
    """Compute AQI and dominant pollutant.

    pollutants keys expected (optional): pm25 (µg/m3), o3 (ppb), no2 (ppb)
    """
    subindices: Dict[str, float] = {}

    pm25 = pollutants.get("pm25")
    if pm25 is not None:
        si = _calc_subindex(pm25, PM25_BREAKPOINTS)
        if si is not None:
            subindices["pm25"] = si

    o3 = pollutants.get("o3")
    if o3 is not None:
        si = _calc_subindex(o3, O3_8H_BREAKPOINTS_PPb)
        if si is not None:
            subindices["o3"] = si

    no2 = pollutants.get("no2")
    if no2 is not None:
        si = _calc_subindex(no2, NO2_1H_BREAKPOINTS_PPb)
        if si is not None:
            subindices["no2"] = si

    if not subindices:
        return {"value": 0, "dominant": None, "category": "Unknown", "subindices": {}}

    dominant, value = max(subindices.items(), key=lambda kv: kv[1])
    aqi_value = round(value)
    category = _aqi_category(aqi_value)
    return {"value": aqi_value, "dominant": dominant, "category": category, "subindices": {k: round(v, 1) for k, v in subindices.items()}}

def _aqi_category(aqi: int) -> str:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"
