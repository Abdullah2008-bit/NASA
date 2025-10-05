import useSWR from "swr";
import apiClient from "../lib/api-client";

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data);

interface CountriesEnvelope {
  success: boolean;
  results: { code: string; name: string }[];
}
interface CitiesEnvelope {
  success: boolean;
  results: {
    id: number;
    name: string;
    country: string;
    city?: string;
    lat: number;
    lon: number;
  }[];
}
interface StationMeasurement {
  parameter: string;
  value: number;
  unit: string;
  lastUpdated?: string;
}
interface NearestStation {
  stationId?: string;
  name?: string;
  lat?: number;
  lon?: number;
  distance?: number;
  country?: string;
  city?: string;
  measurements?: StationMeasurement[];
}
interface NearestEnvelope {
  success: boolean;
  station?: NearestStation;
}

export function useOpenAQCountries() {
  const { data, error, isLoading } = useSWR<CountriesEnvelope>(
    "/api/openaq/countries",
    fetcher,
    { refreshInterval: 3600_000 }
  );
  return { countries: data?.results || [], error, isLoading };
}

export function useOpenAQCities(country?: string, query?: string) {
  const params: string[] = [];
  if (country) params.push(`country=${country}`);
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  const url = `/api/openaq/cities${
    params.length ? `?${params.join("&")}` : ""
  }`;
  const { data, error, isLoading } = useSWR<CitiesEnvelope>(url, fetcher, {
    keepPreviousData: true,
  });
  return { cities: data?.results || [], error, isLoading };
}

export function useNearestStation(lat?: number, lon?: number) {
  const url =
    lat != null && lon != null
      ? `/api/openaq/nearest?lat=${lat}&lon=${lon}`
      : null;
  const { data, error, isLoading } = useSWR<NearestEnvelope>(url, fetcher, {
    refreshInterval: 300_000,
  });
  return { station: data?.station, error, isLoading };
}
