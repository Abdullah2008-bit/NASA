import useSWR from 'swr'
import apiClient from '@/lib/api-client'
import { TEMPOData, GroundStationData, WeatherData, ForecastData } from '@/types/air-quality'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

/**
 * Hook to fetch NASA TEMPO satellite data
 */
export function useTEMPOData(lat?: number, lon?: number, date?: string) {
  const url = lat && lon ? `/api/tempo?lat=${lat}&lon=${lon}${date ? `&date=${date}` : ''}` : null
  
  const { data, error, isLoading, mutate } = useSWR<TEMPOData[]>(url, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false,
  })
  
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}

/**
 * Hook to fetch ground station data (OpenAQ, Pandora, TOLNet)
 */
export function useGroundStationData(lat?: number, lon?: number, radius?: number) {
  const url = lat && lon ? `/api/openaq?lat=${lat}&lon=${lon}&radius=${radius || 10}` : null
  
  const { data, error, isLoading, mutate } = useSWR<GroundStationData[]>(url, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })
  
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}

/**
 * Hook to fetch weather data (NOAA, MERRA-2)
 */
export function useWeatherData(lat?: number, lon?: number) {
  const url = lat && lon ? `/api/weather?lat=${lat}&lon=${lon}` : null
  
  const { data, error, isLoading, mutate } = useSWR<WeatherData>(url, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  })
  
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}

/**
 * Hook to fetch AI-powered AQI forecast
 */
export function useForecast(lat?: number, lon?: number) {
  const url = lat && lon ? `/api/forecast?lat=${lat}&lon=${lon}` : null
  
  const { data, error, isLoading, mutate } = useSWR<ForecastData>(url, fetcher, {
    refreshInterval: 600000, // Refresh every 10 minutes
  })
  
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}
