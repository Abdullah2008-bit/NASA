"""OpenAQ Ground Station Data Service
Fetches real-time air quality measurements from ground sensors using OpenAQ API.

Data Source: https://api.openaq.org/v2

Features:
 - Nearest stations by lat/lon & radius
 - Parameter filtering (pm25, pm10, o3, no2, so2, co, bc)
 - Consolidated measurements with basic statistics
 - Graceful degradation on partial failures
"""
from __future__ import annotations

import os
from typing import List, Dict, Any, Optional
import httpx
from math import radians, sin, cos, acos

SUPPORTED_PARAMETERS = {"pm25", "pm10", "o3", "no2", "so2", "co", "bc"}


class OpenAQService:
    def __init__(self):
        self.base_url = os.getenv("OPENAQ_BASE_URL", "https://api.openaq.org/v2")
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            headers = {"User-Agent": "SkyCast/1.0 (https://github.com/skycast)"}
            self._client = httpx.AsyncClient(base_url=self.base_url, timeout=15.0, headers=headers)
        return self._client

    async def get_nearby_stations(
        self,
        lat: float,
        lon: float,
        radius_km: int = 10,
        parameters: Optional[List[str]] = None,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """Fetch nearest stations with latest measurements.

        Uses the OpenAQ locations endpoint to retrieve stations & related parameters.
        A second query (latest) can fetch freshest datapoints if needed.
        """
        if parameters:
            # Sanitize & filter
            param_set = [p.lower() for p in parameters if p.lower() in SUPPORTED_PARAMETERS]
        else:
            param_set = ["pm25", "pm10", "o3", "no2"]

        params = {
            "coordinates": f"{lat},{lon}",
            "radius": radius_km * 1000,  # meters
            "order_by": "distance",
            "sort": "asc",
            "limit": limit,
            "entity": "government",  # prefer higher quality where possible
            "parameters": ",".join(param_set),
        }

        try:
            resp = await self.client.get("/locations", params=params)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            return {"stations": [], "error": f"OpenAQ fetch failed: {e}"}

        payload = resp.json()
        results = payload.get("results", [])

        stations = []
        parameter_stats: Dict[str, Dict[str, float]] = {}

        for r in results:
            coords = r.get("coordinates") or {}
            measurements = []
            parameters_meta = r.get("parameters", [])
            for m in parameters_meta:
                param_name = m.get("parameter")
                value = m.get("lastValue")
                if value is None:
                    continue
                unit = m.get("unit")
                last_updated = m.get("lastUpdated")

                measurements.append({
                    "parameter": param_name,
                    "value": value,
                    "unit": unit,
                    "lastUpdated": last_updated,
                })

                # Aggregate stats
                stats = parameter_stats.setdefault(param_name, {"sum": 0.0, "count": 0, "max": value, "min": value})
                stats["sum"] += value
                stats["count"] += 1
                stats["max"] = max(stats["max"], value)
                stats["min"] = min(stats["min"], value)

            # Distance is provided by API ordering; compute fallback distance if not present
            distance_km = self._haversine(lat, lon, coords.get("latitude"), coords.get("longitude")) if coords else None
            stations.append({
                "stationId": r.get("id"),
                "name": r.get("name"),
                "lat": coords.get("latitude"),
                "lon": coords.get("longitude"),
                "distance": round(distance_km, 2) if distance_km else r.get("distance"),
                "measurements": measurements,
                "country": r.get("country"),
                "city": r.get("city"),
                "sources": r.get("sources"),
            })

        # Convert stats to avg structure
        summary = {p: {
            "avg": round(v["sum"] / v["count"], 2) if v["count"] else None,
            "max": v["max"],
            "min": v["min"],
            "count": v["count"],
        } for p, v in parameter_stats.items()}

        return {
            "stations": stations,
            "summary": summary,
            "parameters": param_set,
            "source": "OpenAQ",
        }

    async def search_cities(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Search available locations (cities/stations) via OpenAQ.

        Filters:
          - query: part of location name (case-insensitive)
          - country: 2-letter ISO code
        Returns simplified list for UI selection.
        """
        params = {
            "limit": limit,
            "sort": "desc",
            "order_by": "lastUpdated",
        }
        if country:
            params["country"] = country.upper()
        if query:
            params["location"] = query  # OpenAQ matches location names

        try:
            resp = await self.client.get("/locations", params=params)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            return []
        data = resp.json().get("results", [])
        results = []
        for r in data:
            coords = r.get("coordinates") or {}
            results.append({
                "id": r.get("id"),
                "name": r.get("name"),
                "country": r.get("country"),
                "city": r.get("city"),
                "lat": coords.get("latitude"),
                "lon": coords.get("longitude"),
            })
        # De-duplicate by name + country keeping first
        seen = set()
        unique = []
        for item in results:
            key = (item["name"], item["country"])
            if key not in seen and item["lat"] is not None and item["lon"] is not None:
                seen.add(key)
                unique.append(item)
        return unique

    def _haversine(self, lat1, lon1, lat2, lon2) -> float:
        if None in (lat1, lon1, lat2, lon2):
            return 0.0
        # Radius of Earth in km
        R = 6371
        lat1_r, lon1_r, lat2_r, lon2_r = map(radians, [lat1, lon1, lat2, lon2])
        return acos(min(1, sin(lat1_r) * sin(lat2_r) + cos(lat1_r) * cos(lat2_r) * cos(lon2_r - lon1_r))) * R

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


openaq_service = OpenAQService()
