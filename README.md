# SkyCast

## NASA Space Apps 2025 Submission
Real‑time fused air quality (ground + satellite placeholder) with transparent provenance and extensible NASA data ingestion path.

Live: [App](https://nasaspacelahore.vercel.app) · [Backend Health](https://nasa.up.railway.app/health) · [License](LICENSE)


## 1. What It Does
SkyCast delivers a single Air Quality Intelligence layer:
- Fuses nearest ground station measurements (OpenAQ) with a swappable satellite layer (TEMPO placeholder now).
- Computes EPA‑style AQI + per‑pollutant subindices and health category.
- Exposes transparent fusion metadata (sources used, weighting radius, uniqueness mode).
- Provides deterministic uniqueness (time of day + lat band + urban bias) instead of random noise.

## 2. Why It Matters
Many demos show static or region‑biased AQI. SkyCast focuses on:
- Global neutrality (any lat/lon query).
- Explainability (provenance object + UI fusion stats).
- Extensibility (clear service boundaries to plug real NASA TEMPO granules).
- Reliability (graceful fallback if satellite or station data missing).

## 3. Current State (Hackathon Build)

| Component | Status | Notes |
|----------|--------|-------|
| Ground data (OpenAQ) | Live | Nearest station lookup + adaptive radius |
| Satellite layer | Placeholder | Deterministic synthetic; real ingestion scaffolded |
| AQI engine | Implemented | EPA breakpoint interpolation (PM2.5, O3 proxy, NO2) |
| Fusion endpoint | Implemented | `/api/airquality` returns AQI + subindices + fusion meta |
| Forecast | Simulated | Contract ready for future model swap |
| Provenance & stats UI | Implemented | Frontend `FusionStats` component |
| Deployment | Live | Frontend (Vercel) + Backend (Railway) |

## 4. Real TEMPO Integration Path
1. Add deps: `earthaccess xarray netcdf4`.
2. Auth with Earthdata (username/password env vars).
3. Query CMR for latest TEMPO granule bounding the request lat/lon.
4. Download & open NetCDF (xarray), interpolate target pollutants.
5. Convert units -> ppb / µg/m³, apply QC flags.
6. Populate measurements; fallback to synthetic if failure.
7. Cache granule in memory (TTL ~10 min) for performance.

## 5. Quick Start (Local)
Backend:
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Frontend:
```
cd frontend
npm install
npm run dev
```
Visit: http://localhost:3000 (UI) • http://localhost:8000/docs (API docs)

Minimum env vars:
Backend `.env`:
```
ENV=production
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=dev_change_me
```
Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```

## 6. Key Endpoint
```
GET /api/airquality?lat=40.7128&lon=-74.0060
```
Returns:
```
{
  aqi: 63,
  category: "Moderate",
  dominantPollutant: "pm25",
  subIndices: { pm25: 63, o3: 51, no2: 42 },
  fusion: { stationsUsed: 1, radiusUsedKm: 25, uniqueness: {...} }
}
```

## 7. Architecture Snapshot
- FastAPI backend: `routes/` (API), `services/` (OpenAQ, TEMPO), `utils/` (AQI math)
- Next.js frontend: SWR hooks, typed models, `FusionStats` transparency panel
- Deterministic synthetic TEMPO layer isolated → easy real swap

## 8. Roadmap (Condensed)

| Next | Goal |
|------|------|
| Real TEMPO granules | Earthaccess + NetCDF ingestion |
| Multi-station fusion | Inverse-distance weighting across >1 station |
| Historical store | Persist fused hourly frames |
| Forecast models | XGBoost baseline + temporal refinement |
| Uncertainty bands | Confidence + QC propagation |

## 9. Limitations (Honest List)
- Satellite data still simulated; no real TEMPO numbers yet.
- O3 proxy not 8‑hour averaged.
- Single-station dominance (no multi-station blending yet).
- Forecast output deterministic placeholder.

## 10. Team
Muhammad Abdullah Atif • Mohid Khan • Shehroze Bilal

## 11. License
[MIT](LICENSE)

---
Built for NASA Space Apps 2025 – transparent, extensible air quality intelligence.
### 3. Run Tests (Backend AQI)
