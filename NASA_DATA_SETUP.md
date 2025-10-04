# 🚀 Real NASA Data Integration Guide

## Quick Setup (5 minutes)

### Step 1: Get NASA Earthdata Credentials (FREE)

1. **Visit**: https://urs.earthdata.nasa.gov/users/new
2. **Create Account**:

   - Username: Choose a username (e.g., yourname_nasa)
   - Email: Your email address
   - Password: Create a secure password
   - Affiliation: Select "Student" or "Other"
   - Study Area: Select "Atmospheric Composition"

3. **Verify Email**: Check your inbox and click verification link

4. **Approve Applications** (Important!):
   - Go to: https://urs.earthdata.nasa.gov/profile
   - Click "Applications" → "Authorized Apps"
   - Search for and approve:
     - "NASA GESDISC DATA ARCHIVE"
     - "LAADS DAAC"
     - "ASDC DAAC"

### Step 2: Configure Environment Variables

Create `.env` file in the backend directory:

```bash
cd /Users/muhammadabdullahatif/Desktop/NASA/skycast/backend
touch .env
```

Add the following to `.env`:

```bash
# NASA Earthdata Credentials
NASA_EARTHDATA_USERNAME=your_username_here
NASA_EARTHDATA_PASSWORD=your_password_here

# API Configuration
TEMPO_DATA_URL=https://disc.gsfc.nasa.gov/datasets/TEMPO_NO2_L2_V03
MERRA2_DATA_URL=https://goldsmr4.gesdisc.eosdis.nasa.gov/data/MERRA2
OPENAQ_API_URL=https://api.openaq.org/v2
```

### Step 3: Update Frontend Environment

Create `.env.local` file in the frontend directory:

```bash
cd /Users/muhammadabdullahatif/Desktop/NASA/skycast/frontend
touch .env.local
```

Add the following:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Install NASA Data Library

The `earthaccess` library is already in requirements.txt. If not installed:

```bash
cd /Users/muhammadabdullahatif/Desktop/NASA/skycast/backend
source venv/bin/activate
pip install earthaccess
```

### Step 5: Test Connection

Run this test script to verify NASA credentials:

```bash
cd /Users/muhammadabdullahatif/Desktop/NASA/skycast/backend
source venv/bin/activate
python -c "
import earthaccess
import os

# Set credentials
username = 'YOUR_USERNAME'  # Replace with your username
password = 'YOUR_PASSWORD'  # Replace with your password

try:
    auth = earthaccess.login(strategy='environment')
    print('✅ NASA Earthdata authentication successful!')

    # Test TEMPO data search
    results = earthaccess.search_data(
        short_name='TEMPO_NO2_L2',
        temporal=('2024-01-01', '2024-12-31'),
        count=1
    )

    if results:
        print(f'✅ Found {len(results)} TEMPO datasets')
        print(f'📊 Dataset: {results[0]}')
    else:
        print('⚠️  No TEMPO data found (may not be available yet)')

except Exception as e:
    print(f'❌ Error: {e}')
    print('Please check your credentials and internet connection')
"
```

## Available NASA Data Sources

### 🛰️ TEMPO (Tropospheric Emissions: Monitoring of Pollution)

**What it measures**:

- NO₂ (Nitrogen Dioxide) - Traffic & industrial pollution
- O₃ (Ozone) - Photochemical smog
- HCHO (Formaldehyde) - VOC indicator
- SO₂ (Sulfur Dioxide) - Industrial emissions
- Aerosol Optical Depth (AOD)

**Coverage**: North America
**Resolution**: 2.1 km × 4.7 km at nadir
**Update Frequency**: Hourly (daytime only)
**Data Format**: NetCDF4, HDF5

**API Access**:

```python
import earthaccess

# Search TEMPO NO2 data
results = earthaccess.search_data(
    short_name='TEMPO_NO2_L2',
    temporal=('2024-01-01', '2024-12-31'),
    bounding_box=(-74.5, 40.5, -73.5, 41.0)  # NYC
)

# Download files
files = earthaccess.download(results, './data/tempo/')
```

### 🌍 MERRA-2 (Modern-Era Retrospective analysis for Research and Applications)

**What it measures**:

- PM2.5 and PM10
- Dust, Sea Salt, Black Carbon
- Temperature, Wind Speed, Humidity
- Surface Pressure

**Coverage**: Global
**Resolution**: 0.5° × 0.625° (~50 km)
**Update Frequency**: Every 3 hours
**Data Format**: NetCDF4

### 🛰️ GOES-R (Geostationary Operational Environmental Satellite)

**What it measures**:

- Aerosol Optical Depth (AOD)
- Cloud coverage
- Smoke detection
- Fire monitoring

**Coverage**: Western Hemisphere
**Resolution**: 2-10 km
**Update Frequency**: Every 5-15 minutes

## OpenAQ Ground Station Data

**FREE** - No API key required!

```bash
# Get air quality for NYC
curl "https://api.openaq.org/v2/latest?coordinates=40.7128,-74.0060&radius=10000"
```

**Response includes**:

- PM2.5, PM10
- NO₂, O₃, SO₂, CO
- Real-time measurements from government stations
- PurpleAir citizen science sensors

## Using Real Data in SkyCast

Once configured, the app will automatically:

1. **Fetch TEMPO satellite data** every hour
2. **Pull OpenAQ ground stations** every 5 minutes
3. **Get MERRA-2 weather** every 3 hours
4. **Display real measurements** on the 3D Earth globe
5. **Generate AI forecasts** using actual historical patterns

## Troubleshooting

### "401 Unauthorized" Error

- Check your NASA Earthdata credentials
- Ensure you approved the required applications
- Try logging in at https://urs.earthdata.nasa.gov

### "No data found" Error

- TEMPO data may not be available for your time range
- Try a more recent date (TEMPO launched in 2023)
- Check if you're querying North America (TEMPO coverage area)

### "Rate limit exceeded"

- OpenAQ has rate limits on the free tier
- Add delays between requests
- Consider getting an API key

### Connection Timeout

- NASA servers can be slow during peak hours
- Try again in a few minutes
- Check your internet connection

## Data Citation

When using this data, please cite:

**TEMPO**:

> NASA (2023). TEMPO Level 2 Nitrogen Dioxide Product.
> https://disc.gsfc.nasa.gov/datasets/TEMPO_NO2_L2_V03

**MERRA-2**:

> GMAO (2015). MERRA-2 tavg1_2d_aer_Nx: 2d,1-Hourly,Time-Averaged,Single-Level,Assimilation,Aerosol Diagnostics V5.12.4.
> https://doi.org/10.5067/KLICLTZ8EM9D

**OpenAQ**:

> OpenAQ (2024). Open Air Quality Data.
> https://openaq.org

## Support

- **NASA Earthdata Help**: https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/earthdata-login
- **TEMPO Documentation**: https://tempo.si.edu/data.html
- **OpenAQ Docs**: https://docs.openaq.org/

---

**Ready to launch?** 🚀

Run:

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 and see **REAL NASA AIR QUALITY DATA**! 🌍✨
