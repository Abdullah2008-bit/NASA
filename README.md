# SkyCast – Fused Satellite + Ground Air Quality Intelligence (NASA Space Apps 2025)

[![NASA Space Apps 2025](https://img.shields.io/badge/NASA-Space%20Apps%202025-0B3D91?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/2025/challenges/)
[![TEMPO (Mock Integration)](https://img.shields.io/badge/TEMPO-Integration_Ready-E03C31?style=for-the-badge)](https://tempo.si.edu/)
[![OpenAQ](https://img.shields.io/badge/OpenAQ-Live_Data-00A8E0?style=for-the-badge)](https://openaq.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)

**From Raw Observations to Actionable AQI: A unified, globally-neutral air quality intelligence layer.**

`SkyCast` fuses (currently) live ground station data with a satellite placeholder to deliver dynamic AQI, pollutant breakdowns, health guidance, provenance, and alerting—built for the NASA Space Apps 2025 challenge.

[Live Demo](https://skycast-nasa.vercel.app) · [Data Provenance (modal)](#data-provenance--methodology) · [Implementation Status](./IMPLEMENTATION_STATUS.md) · [Challenge Page](https://www.spaceappschallenge.org/2025/challenges/)

---

## Challenge Context & Scope

The goal: leverage Earth observation + ground networks to deliver actionable, globally-fair air quality intelligence. Many demos hard‑code regional bias, rely on static CSVs, or simulate AQI—SkyCast instead:

1. Provides a neutral global experience (dynamic country + city selection from live APIs)
2. Computes AQI deterministically using EPA breakpoints (not random noise)
3. Fuses heterogeneous sources (satellite placeholder + ground) with explicit precedence
4. Surfaces provenance & limitations transparently (modal + README section)
5. Exposes typed, extensible service layer for rapid addition of real NASA ingestion

> Current state (Hackathon submission): Ground data (OpenAQ) is live. Satellite (TEMPO) portion is a placeholder awaiting authenticated earthaccess ingestion (see Roadmap). Forecasting & advanced ML are scaffolded but not yet training real models in‑repo (fast simulation for UI continuity).

![SkyCast Banner](docs/screenshots/banner.png)

---

## Implemented Highlights (Hackathon Build)

| Area                 | Delivered                                                  | Notes                                                        |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| AQI Computation      | ✅ EPA breakpoint interpolation (PM2.5, O₃(8h proxy), NO₂) | In `backend/app/utils/aqi.py`; returns dominant + subindices |
| Data Fusion Endpoint | ✅ `/api/airquality`                                       | Merges ground (priority) + satellite placeholder             |
| Ground Integration   | ✅ OpenAQ nearest stations, countries, cities              | Caching & radius filtering implemented                       |
| Satellite Layer      | 🟡 Placeholder (mocked measurements)                       | Real TEMPO ingestion staged (earthaccess already added)      |
| Health Advisor       | ✅ Uses dominant pollutant + weighted risk                 | Adaptive guidance via subindices                             |
| Deterministic Alerts | ✅ Category transition + rapid delta detection             | Toast surfaced (no randomization)                            |
| Provenance Modal     | ✅ In‑app modal with transparency                          | Triggered via header/footer buttons                          |
| Legend UI            | ✅ Compact, bottom‑right overlay                           | Improves 3D globe clarity                                    |
| Location Selector    | ✅ Dynamic country + city search (OpenAQ)                  | Fallback resilience                                          |
| Forecast Scaffold    | 🟡 UI + API route simulating model                         | Real model training deferred                                 |
| Tests                | ✅ AQI unit tests                                          | Boundary coverage in `backend/tests/test_aqi.py`             |
| Types                | ✅ Strong TS typing (removed loose `any`)                  | Except legacy forecast stub                                  |

### UX & Interface Features

- 3D globe (pollutant points + location focus)
- Keyboard navigation (Ctrl/Cmd+1‑8) for major views
- Animated pollutant metric cards & transitions
- Responsive layout + accessible semantic regions
- Modular SWR hooks with typed envelopes

### Engineering Principles

- Separation: `routes/` vs `services/` vs `utils/`
- Graceful fallback (missing satellite → still returns AQI from ground)
- Extensibility: Add new pollutant by extending breakpoints + fusion mapping
- Transparency: Provenance modal + roadmap

---

## Quick Launch

### Requirements

- Node.js 20+
- Python 3.11+
- (Optional) Docker & Docker Compose
- (Planned) NASA Earthdata Account for real TEMPO ingestion

### 1. Clone & Install

```
git clone https://github.com/Abdullah2008-bit/NASA.git
cd NASA/skycast
```

Frontend:

```
cd frontend
pnpm install # or npm install / yarn
pnpm dev
```

Backend:

```
cd ../backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:3000 (frontend) and http://localhost:8000/docs (API docs if enabled).

### 2. Environment Variables

Copy `.env.example` to `.env.local` (frontend) / `.env` (backend) and set at minimum:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
BACKEND_API_BASE=http://localhost:8000
```

Optional future ingestion (not yet required):

```
EARTHDATA_USERNAME=...
EARTHDATA_PASSWORD=...
```

### 3. Run Tests (Backend AQI)

```
cd backend
pytest -q
```

Docker (optional one-command orchestration): See `DEPLOYMENT.md`.

---

## Roadmap (Post-Submission)

| Phase | Focus              | Key Deliverables                                      |
| ----- | ------------------ | ----------------------------------------------------- |
| 1     | Real Satellite     | Earthaccess auth, granule search, spatial aggregation |
| 2     | Historical Store   | Persist fused hourly frames (TSDB or parquet)         |
| 3     | Forecast Models    | Train + version XGBoost/LSTM ensemble                 |
| 4     | Validation Layer   | Multi-station weighting + uncertainty bands           |
| 5     | Advanced Analytics | Source contribution decomposition, drift detection    |
| 6     | Public API Tier    | Rate limiting, API keys, usage metrics                |

Stretch: wildfire smoke plume integration (VIIRS), health burden estimation, personal exposure mode.

---

## Data Provenance & Methodology

See in‑app “Data Provenance” modal for user‑friendly summary. Technical points:

- Subindex formula: linear interpolation within EPA breakpoint interval: `I = (I_hi - I_lo)/(C_hi - C_lo) * (C - C_lo) + I_lo`.
- Dominant pollutant = max subindex (integer AQI value).
- Fusion precedence: ground > satellite per pollutant; missing values fallback gracefully.
- Satellite placeholder is swappable (service boundary already defined).
- Validation roadmap: cross-source consistency scoring + anomaly detection.

Limitations (current build):

- No real TEMPO retrieval yet (mock values).
- O₃ 8‑hour average uses instantaneous proxy.
- Single-station dominance (multi-station weighting forthcoming).
- Forecast not model-backed yet.

Ethical / Fair Use:

- No regional prioritization or hard-coded bias.
- Explicit attribution for each upstream network.
- Open design encourages environmental transparency.

## Data Sources

| Source           | Mode              | Current Use                              | Planned Enhancement                             |
| ---------------- | ----------------- | ---------------------------------------- | ----------------------------------------------- |
| OpenAQ           | Live              | Nearest station pollutant baselines      | Expand to multiple station weighting            |
| TEMPO            | Placeholder       | Mock values for o₃/no₂/hcho/aerosolIndex | Real product ingestion + spatial binning        |
| NOAA / Weather   | Placeholder label | UI reference only                        | Integrate meteorology for forecast + dispersion |
| MERRA‑2          | Not yet           | —                                        | Backfill historical series consistency          |
| IMERG            | Not yet           | —                                        | Rain scavenging impact modeling                 |
| Pandora / TOLNet | Not yet           | —                                        | Column/profile validation layer                 |

---

## Use Cases

- 🏃 **Athletes & Outdoor Enthusiasts** - Plan activities based on air quality
- 🏫 **Schools & Universities** - Protect student health during poor AQI
- 🏥 **Healthcare Providers** - Alert vulnerable patients (asthma, COPD)
- 🏭 **Industrial Zones** - Monitor pollution exposure
- 🌳 **Urban Planners** - Data-driven clean air policies
- 🔥 **Emergency Response** - Wildfire smoke tracking
- 🚗 **Transportation Authorities** - Traffic & emissions management

---

## Keyboard Shortcuts

Navigate like a pro with keyboard shortcuts:

| Shortcut | Action                        |
| -------- | ----------------------------- |
| `Ctrl+1` | Dashboard (3D Globe)          |
| `Ctrl+2` | Forecast (6h-72h predictions) |
| `Ctrl+3` | Alerts (Health warnings)      |
| `Ctrl+4` | History (Time series)         |
| `Ctrl+5` | Validation (Data quality)     |
| `Ctrl+6` | Analytics (AI insights)       |
| `Ctrl+7` | Compare (Multi-city)          |

> **Tip:** On Mac, use `⌘` instead of `Ctrl`. All shortcuts show instant toast feedback!

See [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) for full details.

---

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### 3D Globe with Pollutant Overlay

![3D Globe](docs/screenshots/globe.png)

### Real-Time Alerts

![Alerts](docs/screenshots/alerts.png)

### Historical Trends

![History](docs/screenshots/history.png)

---

## Core API (Implemented)

Base: `http://localhost:8000`

| Endpoint                | Method | Purpose                      | Notes                                   |
| ----------------------- | ------ | ---------------------------- | --------------------------------------- |
| `/api/airquality`       | GET    | Fused AQI + pollutant set    | Returns subindices + provenance sources |
| `/api/openaq/countries` | GET    | Country list (cached)        | Drives selector                         |
| `/api/openaq/cities`    | GET    | Cities for country           | Pagination-ready                        |
| `/api/openaq/nearest`   | GET    | Nearby stations              | Radius + limit params                   |
| `/api/tempo`            | GET    | Satellite placeholder sample | Will become real ingestion              |
| `/api/forecast`         | GET    | Simulated forecast envelope  | Shape stable for later model swap       |

Example:

```bash
curl "http://localhost:8000/api/airquality?lat=40.7128&lon=-74.0060"
```

---

## Forecasting Status

The UI + API contract are in place; current responses are deterministic scaffolds. Upcoming steps:

1. Ingest historical fused dataset (persist to time-series store)
2. Train baseline regression (XGBoost) → residual LSTM refinement
3. Add rolling ozone compliance metrics
4. Store model metadata + version in response envelope

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Team Credits

**Team SkyCast** - NASA Space Apps Challenge 2025

- **Muhammad Abdullah Atif** - Full-Stack Developer & ML Engineer
- [Add your team members here]

---

## Contact

- GitHub: [@Abdullah2008-bit](https://github.com/Abdullah2008-bit)
- Repository: [NASA SkyCast](https://github.com/Abdullah2008-bit/NASA)
- Email: add contact

---

Built for NASA Space Apps Challenge 2025 – Transparent, extensible, globally fair air quality intelligence.
