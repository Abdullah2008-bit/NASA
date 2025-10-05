// Air Quality Types
export interface AQIData {
  aqi: number;
  level: string;
  color: string;
  timestamp: Date;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  pollutants: {
    no2?: number;
    o3?: number;
    pm25?: number;
    pm10?: number;
    hcho?: number;
  };
}

// TEMPO Satellite Data
export interface TEMPOData {
  timestamp: Date;
  lat: number;
  lon: number;
  no2: number; // Nitrogen Dioxide
  o3: number; // Ozone
  hcho: number; // Formaldehyde
  aerosolIndex: number;
  pm: number; // Particulate Matter
}

// Aggregated Air Quality (satellite + ground fusion)
export interface AggregatedAirQuality {
  location: { lat: number; lon: number; name?: string };
  timestamp: Date;
  pollutants: {
    pm25?: number;
    o3?: number;
    no2?: number;
    hcho?: number;
    aerosolIndex?: number;
  };
  aqi: {
    value: number;
    dominant: string | null;
    category: string;
    subindices: Record<string, number>;
  };
  sources: {
    tempo: unknown;
    openaq: unknown;
  };
  fusion?: {
    stationsUsed: number;
    radiusUsedKm: number;
    weighting: string;
    pollutantsWeighted: string[];
    attempts: number;
  };
}

// Ground Station Data
export interface GroundStationData {
  stationId: string;
  name: string;
  lat: number;
  lon: number;
  measurements: {
    parameter: string;
    value: number;
    unit: string;
    lastUpdated: Date;
  }[];
}

// Weather Data
export interface WeatherData {
  lat: number;
  lon: number;
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // m/s
  windDirection: number; // degrees
  pressure: number; // hPa
  precipitation: number; // mm
  timestamp: Date;
}

// Forecast Data
export interface ForecastData {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  predictions: {
    timestamp: Date;
    aqi: number;
    confidence: number;
  }[];
  model: string; // "LSTM" | "XGBoost" | "Ensemble"
}

// Alert Data
export interface AlertData {
  id: string;
  level: "info" | "warning" | "danger";
  aqi: number;
  location: string;
  message: string;
  timestamp: Date;
  expiresAt: Date;
}
