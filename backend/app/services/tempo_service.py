"""NASA TEMPO Data Service

Provides (optionally) real TEMPO L2 data access using the earthaccess library
when credentials & flag are present, otherwise returns deterministic synthetic
data shaped like the real response. This lets the frontend show non-zero,
unique values immediately while enabling a seamless upgrade path to actual
NASA data.

Environment Variables:
    USE_REAL_TEMPO=1                -> attempt real Earthdata access
    EARTHDATA_USERNAME / _PASSWORD  -> used by earthaccess (strategy="environment")

Datasets (indicative short names – adjust when final TEMPO products are confirmed):
    TEMPO_L2_NO2, TEMPO_L2_O3, TEMPO_L2_HCHO, TEMPO_L2_AEROSOL (example names)

If real retrieval fails for any reason, we transparently fall back to the
synthetic deterministic model so the API remains responsive.
"""
import asyncio
from typing import Optional, Dict, List
from datetime import datetime
import math
import httpx
import os

try:  # earthaccess may be heavy; import lazily
        import earthaccess  # type: ignore
except Exception:  # pragma: no cover
        earthaccess = None  # Fallback if not available

class TEMPOService:
    """Service for fetching NASA TEMPO satellite data"""
    
    def __init__(self):
        self.base_url = "https://asdc.larc.nasa.gov/data/TEMPO"  # informational
        self.client = httpx.AsyncClient(timeout=30.0)
        self.use_real = os.getenv("USE_REAL_TEMPO") == "1" and earthaccess is not None
        self._logged_in = False
        # Simple in-memory cache (lat,lon,date,paramset) -> data (times out quickly)
        self._cache: Dict[str, Dict] = {}
        self._cache_ttl_seconds = 300

    def _cache_key(self, lat: float, lon: float, date: Optional[str], params: List[str]):
        return f"{round(lat,3)}:{round(lon,3)}:{date or 'latest'}:{','.join(sorted(params))}"

    async def _ensure_login(self):  # pragma: no cover (network side-effect)
        if not self.use_real or self._logged_in:
            return
        try:
            # Use environment strategy to avoid interactive prompts
            earthaccess.login(strategy="environment")
            self._logged_in = True
        except Exception:
            # Disable real mode on failure to avoid repeated attempts
            self.use_real = False
    
    async def fetch_tempo_data(
        self,
        lat: float,
        lon: float,
        date: Optional[str] = None,
        parameters: List[str] = None,
    ) -> Dict:
        """
        Fetch TEMPO data for a specific location
        
        Parameters:
        - NO2: Nitrogen Dioxide (ppb)
        - O3: Ozone (ppb)
        - HCHO: Formaldehyde (ppb)
        - PM: Particulate Matter (μg/m³)
        - Aerosol: Aerosol Index
        """
        if parameters is None:
            parameters = ["no2", "o3", "hcho", "pm", "aerosol"]

        # Check cache
        key = self._cache_key(lat, lon, date, parameters)
        cached = self._cache.get(key)
        if cached and (datetime.utcnow().timestamp() - cached["_cached_at"]) < self._cache_ttl_seconds:
            return cached["data"]

        if self.use_real:
            try:  # pragma: no cover
                await self._ensure_login()
                # Build small bounding box around location (~0.25 deg box)
                d = 0.125
                bbox = (lon - d, lat - d, lon + d, lat + d)
                # Example product short names (adjust to actual TEMPO collection IDs)
                product_map = {
                    "no2": "TEMPO_L2_NO2",
                    "o3": "TEMPO_L2_O3",
                    "hcho": "TEMPO_L2_HCHO",
                    "aerosol": "TEMPO_L2_AEROSOL",
                    # PM not directly; would be derived—keep synthetic for now
                }
                temporal = None
                if date:
                    temporal = (f"{date}T00:00:00", f"{date}T23:59:59")
                # Search only for one representative product to reduce latency
                search_short_name = product_map.get("no2")
                if search_short_name and earthaccess:
                    results = earthaccess.search_data(
                        short_name=search_short_name,
                        bounding_box=bbox,
                        temporal=temporal,
                        count=1,
                    )
                    # (Optional) Download & parse NetCDF/HDF dataset here; placeholder extraction
                    # For MVP we only acknowledge successful search
                    if results:
                        # In a real implementation you'd open the granule with xarray & sample nearest pixel
                        pass
                # Fall through to build mixed response (real parsing TBD)
            except Exception:
                # Revert to synthetic path if anything fails
                self.use_real = False

        # Synthetic / fallback path (deterministic, location-specific)
        await asyncio.sleep(0.05)
        data = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": date or datetime.utcnow().isoformat(),
            "measurements": {
                "no2": self._get_realistic_no2(lat, lon),
                "o3": self._get_realistic_o3(lat, lon),
                "hcho": self._get_realistic_hcho(lat, lon),
                "pm25": self._get_realistic_pm25(lat, lon),
                "aerosolIndex": self._get_realistic_aerosol(lat, lon),
            },
            "quality": "mixed" if not self.use_real else "provisional",
            "source": "NASA TEMPO (synthetic fallback)" if not self.use_real else "NASA TEMPO (Search OK, sampled synthetic)",
            "satellite": "TEMPO",
            "resolution": "~5km (synthetic)" if not self.use_real else "2.1 km x 4.7 km",
        }

        self._cache[key] = {"_cached_at": datetime.utcnow().timestamp(), "data": data}
        return data
    
    # ---------- Internal modulation helpers ----------
    def _stable_hash(self, lat: float, lon: float) -> float:
        """Stable fractional hash in [0,1) for a lat/lon pair."""
        h = hash((round(lat, 4), round(lon, 4))) & 0xFFFFFFFF
        return (h / 0xFFFFFFFF)

    def _diurnal(self, amplitude: float = 1.0, phase_shift: float = 0.0) -> float:
        """Smooth diurnal cycle (0..amplitude) based on UTC hour."""
        hour = datetime.utcnow().hour + phase_shift
        return (math.sin((hour / 24.0) * 2 * math.pi) * 0.5 + 0.5) * amplitude

    def _lat_band(self, lat: float, center: float, width: float, scale: float) -> float:
        """Gaussian-like latitudinal modulation (|lat-center|) with max=scale."""
        d = (lat - center) / max(width, 1e-6)
        return math.exp(-d * d) * scale

    def _urban_bias(self, lat: float, lon: float) -> float:
        """Additive bias for a few known metro regions (simplified)."""
        metros = [
            (40.7128, -74.0060, 6.0),   # NYC
            (34.0522, -118.2437, 7.5),  # LA
            (51.5074, -0.1278, 5.0),    # London
            (28.6139, 77.2090, 5.5),    # Delhi
            (35.6762, 139.6503, 5.0),   # Tokyo
        ]
        for mlat, mlon, bias in metros:
            if abs(lat - mlat) < 1 and abs(lon - mlon) < 1:
                return bias
        return 0.0

    def _apply_formula(self, base: float, lat: float, lon: float, *,
                        diurnal_amp: float, lat_center: float, lat_width: float,
                        lat_scale: float, hash_amp: float, phase: float = 0.0,
                        urban: bool = False) -> float:
        frac = self._stable_hash(lat, lon)
        diurnal = self._diurnal(diurnal_amp, phase)
        lat_mod = self._lat_band(lat, lat_center, lat_width, lat_scale)
        hash_mod = (frac - 0.5) * 2 * hash_amp  # symmetric around 0
        urban_bias = self._urban_bias(lat, lon) if urban else 0.0
        return base + diurnal + lat_mod + hash_mod + urban_bias

    def _get_realistic_no2(self, lat: float, lon: float) -> float:
        """Deterministic NO2 with diurnal + latitude + urban modulation."""
        val = self._apply_formula(
            base=14.0,
            lat=lat,
            lon=lon,
            diurnal_amp=4.0,
            lat_center=30.0,
            lat_width=25.0,
            lat_scale=3.0,
            hash_amp=2.5,
            phase=1.0,
            urban=True,
        )
        return round(max(val, 1.0), 2)
    
    def _get_realistic_o3(self, lat: float, lon: float) -> float:
        """Deterministic O3 with subtropical enhancement and broad diurnal."""
        val = self._apply_formula(
            base=42.0,
            lat=lat,
            lon=lon,
            diurnal_amp=6.0,
            lat_center=25.0,
            lat_width=30.0,
            lat_scale=5.0,
            hash_amp=3.5,
            phase=0.0,
            urban=False,
        )
        return round(max(val, 5.0), 2)
    
    def _get_realistic_hcho(self, lat: float, lon: float) -> float:
        """Formaldehyde higher in tropical latitudes; mild day modulation."""
        val = self._apply_formula(
            base=1.6,
            lat=lat,
            lon=lon,
            diurnal_amp=0.6,
            lat_center=5.0,
            lat_width=25.0,
            lat_scale=1.2,
            hash_amp=0.5,
            phase=2.0,
            urban=False,
        )
        return round(max(val, 0.2), 2)
    
    def _get_realistic_pm25(self, lat: float, lon: float) -> float:
        """PM2.5 with modest urban + weak diurnal + hash variability."""
        val = self._apply_formula(
            base=10.0,
            lat=lat,
            lon=lon,
            diurnal_amp=2.0,
            lat_center=23.0,
            lat_width=40.0,
            lat_scale=2.5,
            hash_amp=5.0,
            phase=1.5,
            urban=True,
        )
        return round(max(val, 2.0), 2)
    
    def _get_realistic_aerosol(self, lat: float, lon: float) -> float:
        """Aerosol index with slight tropical + hash modulation."""
        val = self._apply_formula(
            base=0.7,
            lat=lat,
            lon=lon,
            diurnal_amp=0.15,
            lat_center=10.0,
            lat_width=35.0,
            lat_scale=0.25,
            hash_amp=0.25,
            phase=0.3,
            urban=False,
        )
        return round(max(val, 0.05), 2)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Singleton instance
tempo_service = TEMPOService()
