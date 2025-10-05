import math

from app.utils.aqi import compute_aqi


def test_empty_pollutants_returns_unknown():
    result = compute_aqi({})
    assert result["value"] == 0
    assert result["category"] == "Unknown"
    assert result["subindices"] == {}


def test_pm25_good_boundary():
    # 12.0 µg/m3 is top of Good -> AQI ~50
    result = compute_aqi({"pm25": 12.0})
    assert result["value"] == 50
    assert result["category"] == "Good"
    assert result["dominant"] == "pm25"


def test_pm25_moderate_boundary():
    # 35.4 µg/m3 should round to AQI 100 (top of Moderate)
    result = compute_aqi({"pm25": 35.4})
    assert result["value"] == 100
    assert result["category"] == "Moderate"


def test_dominant_pollutant_selection():
    # Choose pollutant with higher subindex; craft values so NO2 dominates
    r = compute_aqi({"pm25": 15.0, "no2": 180})
    assert r["dominant"] == "no2"
    assert r["value"] >= r["subindices"]["no2"] - 1  # rounding tolerance


def test_category_progression_unhealthy():
    r = compute_aqi({"pm25": 80.0})  # within 151-200 range
    assert r["category"] in {"Unhealthy", "Unhealthy for Sensitive Groups"}  # ensure not lower tiers
