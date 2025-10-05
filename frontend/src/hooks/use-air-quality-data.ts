import useSWR from "swr";
// Relative imports to avoid alias resolution issue on Vercel
// Proper relative path: hooks -> src -> lib
import apiClient from "../lib/api-client";
import {
  TEMPOData,
  GroundStationData,
  WeatherData,
  ForecastData,
  AggregatedAirQuality,
} from "../types/air-quality";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

/**
 * Hook to fetch NASA TEMPO satellite data
 */
interface TempoMeasurements {
  no2: number;
  o3: number;
  hcho: number;
  aerosolIndex: number;
  pm?: number;
  pm25?: number;
}
interface TempoEnvelope {
  success: boolean;
  data: {
    location: { lat: number; lon: number };
    timestamp: string;
    measurements: TempoMeasurements;
    [k: string]: unknown;
  };
}
export function useTEMPOData(lat?: number, lon?: number, date?: string) {
  const url =
    lat && lon
      ? `/api/tempo?lat=${lat}&lon=${lon}${date ? `&date=${date}` : ""}`
      : null;
  // Backend returns { success: true, data: {...} }
  const { data, error, isLoading, mutate } = useSWR<TempoEnvelope>(
    url,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  let tempo: TEMPOData | undefined;
  if (data?.data?.measurements) {
    const m = data.data.measurements;
    tempo = {
      timestamp: new Date(data.data.timestamp),
      lat: data.data.location.lat,
      lon: data.data.location.lon,
      no2: m.no2,
      o3: m.o3,
      hcho: m.hcho,
      aerosolIndex: m.aerosolIndex,
      pm: m.pm25 ?? m.pm ?? 0,
    };
  }

  return { data: tempo, raw: data, error, isLoading, refresh: mutate };
}

// Aggregated Air Quality Hook
interface AggregatedEnvelope {
  success: boolean;
  data: {
    location: { lat: number; lon: number; name?: string };
    timestamp: string;
    pollutants: Record<string, number | undefined>;
    aqi: {
      value: number;
      dominant: string | null;
      category: string;
      subindices: Record<string, number>;
    };
    sources: { tempo: unknown; openaq: unknown };
  };
}
export function useAggregatedAirQuality(lat?: number, lon?: number) {
  const url = lat && lon ? `/api/airquality?lat=${lat}&lon=${lon}` : null;
  const { data, error, isLoading, mutate } = useSWR<AggregatedEnvelope>(
    url,
    fetcher,
    { refreshInterval: 60000 }
  );

  let aggregated: AggregatedAirQuality | undefined;
  if (data?.data) {
    const d = data.data;
    aggregated = {
      location: { ...d.location },
      timestamp: new Date(d.timestamp),
      pollutants: d.pollutants,
      aqi: d.aqi,
      sources: d.sources,
    };
  }
  return { data: aggregated, raw: data, error, isLoading, refresh: mutate };
}

/**
 * Hook to fetch ground station data (OpenAQ, Pandora, TOLNet)
 */
export function useGroundStationData(
  lat?: number,
  lon?: number,
  radius?: number
) {
  const url =
    lat && lon
      ? `/api/openaq?lat=${lat}&lon=${lon}&radius=${radius || 10}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<GroundStationData[]>(
    url,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch weather data (NOAA, MERRA-2)
 */
export function useWeatherData(lat?: number, lon?: number) {
  const url = lat && lon ? `/api/weather?lat=${lat}&lon=${lon}` : null;

  const { data, error, isLoading, mutate } = useSWR<WeatherData>(url, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch AI-powered AQI forecast
 */
export function useForecast(lat?: number, lon?: number) {
  const url = lat && lon ? `/api/forecast?lat=${lat}&lon=${lon}` : null;

  const { data, error, isLoading, mutate } = useSWR<ForecastData>(
    url,
    fetcher,
    {
      refreshInterval: 600000, // Refresh every 10 minutes
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
