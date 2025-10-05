"use client";
import { useState, useMemo, useEffect } from "react";
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
      const mapped = apiCities.map((c) => ({
        name: c.name,
        country: c.country,
        lat: c.lat,
        lon: c.lon,
      }));
      return query
        ? mapped.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase())
          )
        : mapped.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Static fallback
    const base = country ? CITIES.filter((c) => c.country === country) : CITIES;
    return (
      query
        ? base.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        : base
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [apiCities, country, query]);

  const countryOptions = useMemo(() => {
    if (apiCountries.length) {
      return apiCountries
        .map((c) => ({ label: c.name, value: c.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return COUNTRIES.map((c) => ({ label: c, value: c })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [apiCountries]);

  // Auto-select a sensible default city if current selection not in filtered list
  useEffect(() => {
    if (filteredCities.length) {
      const currentCityName = value.name.split(",")[0];
      const exists = filteredCities.some((c) => c.name === currentCityName);
      if (!exists) {
        const first = filteredCities[0];
        onChange({
          lat: first.lat,
          lon: first.lon,
          name: `${first.name}, ${first.country}`,
        });
      }
    }
  }, [filteredCities, onChange, value.name]);

  return (
    <div className={`flex flex-col gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setQuery("");
          }}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1"
        >
          <option value="">All Countries</option>
          {countryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={value.name.split(",")[0]}
          onChange={(e) => {
            const city = filteredCities.find((c) => c.name === e.target.value);
            if (city) {
              onChange({
                lat: city.lat,
                lon: city.lon,
                name: `${city.name}, ${city.country}`,
              });
            }
          }}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1"
        >
          {!filteredCities.length && <option value="">No cities found</option>}
          {filteredCities.length > 0 && (
            <>
              {filteredCities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </>
          )}
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
