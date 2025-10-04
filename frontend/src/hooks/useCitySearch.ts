import useSWR from "swr";

interface CityResult {
  id: number | string;
  name: string;
  country: string;
  city?: string;
  lat: number;
  lon: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCitySearch(query: string, country?: string) {
  const enabled = query.trim().length > 1 || (country && country.length === 2);
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (country) params.set("country", country);
  params.set("limit", "25");

  const { data, error, isLoading } = useSWR(
    enabled ? `/api/openaq/cities?${params.toString()}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    cities: (data?.results as CityResult[]) || [],
    isLoading,
    isError: !!error,
  };
}
