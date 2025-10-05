"use client";
import { useState, useMemo } from "react";
import { CITIES, COUNTRIES, CityMeta } from "@/data/cities";
import { useOpenAQCountries, useOpenAQCities } from "@/hooks/use-openaq";

interface LocationSelectorProps {
  value: { lat: number; lon: number; name: string };
  onChange: (loc: { lat: number; lon: number; name: string }) => void;
  compact?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  compact = false,
}: LocationSelectorProps) {
  const [country, setCountry] = useState<string>("");
  const [query, setQuery] = useState("");
  const { countries: apiCountries } = useOpenAQCountries();
  const { cities: apiCities, isLoading } = useOpenAQCities(
    country || undefined,
    query || undefined
  );

  // Fallback to static cities if API provides none
  const filteredCities = useMemo<CityMeta[]>(() => {
    if (apiCities.length) {
      return apiCities.map((c) => ({
        name: c.name,
        country: c.country,
        lat: c.lat,
        lon: c.lon,
      }));
    }
    // Static fallback
    const base = country ? CITIES.filter((c) => c.country === country) : CITIES;
    return query
      ? base.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      : base;
  }, [apiCities, country, query]);

  const countryOptions = useMemo(() => {
    if (apiCountries.length) return apiCountries.map((c) => c.name).sort();
    return COUNTRIES;
  }, [apiCountries]);

  return (
    <div className={`flex flex-col gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1"
        >
          <option value="">All Countries</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={value.name}
          onChange={(e) => {
            const city = CITIES.find((c) => c.name === e.target.value);
            if (city)
              onChange({
                lat: city.lat,
                lon: city.lon,
                name: `${city.name}, ${city.country}`,
              });
          }}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1"
        >
          {filteredCities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <input
        placeholder="Search city"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-2 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-label="Search city"
      />
      <div className="text-[10px] text-white/40 flex justify-between">
        <span>
          {filteredCities.length} cities{" "}
          {apiCities.length ? "(live OpenAQ)" : "(fallback static)"}
        </span>
        {isLoading && <span className="text-blue-400">Loading…</span>}
      </div>
    </div>
  );
}
