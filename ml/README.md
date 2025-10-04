<!-- # SkyCast ML Pipeline

This directory contains the machine learning pipeline for air quality forecasting.

## Structure

- `notebooks/` - Jupyter notebooks for data exploration and model development
- `scripts/` - Python scripts for training and evaluation
- `models/` - Saved trained models (.pkl, .pt files)
- `data/` - Downloaded and processed datasets

## Notebooks

1. **01_data_exploration.ipynb** - Explore NASA TEMPO, OpenAQ, and weather data
2. **02_feature_engineering.ipynb** - Create features for ML models
3. **03_model_training.ipynb** - Train LSTM and XGBoost models
4. **04_validation.ipynb** - Validate satellite vs ground station accuracy

## Training Models

### LSTM Model
```bash
python scripts/train_lstm.py --epochs 100 --batch-size 32
```

### XGBoost Model
```bash
python scripts/train_xgboost.py --n-estimators 500
```

## Model Performance

Target metrics:
- MAE < 8.0
- RMSE < 12.0
- R² > 0.90

## Data Sources

- NASA TEMPO (satellite NO2, O3, HCHO, PM)
- OpenAQ (ground sensors)
- NOAA/MERRA-2 (weather data)
- Historical AQI records -->
