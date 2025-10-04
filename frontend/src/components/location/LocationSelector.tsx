"use client";
import { useState, useMemo } from "react";
import { CITIES, COUNTRIES, CityMeta } from "@/data/cities";

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
  const filteredCities = useMemo<CityMeta[]>(() => {
    return country ? CITIES.filter((c) => c.country === country) : CITIES;
  }, [country]);

  return (
    <div className={`flex flex-col gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => (
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
      <div className="text-[10px] text-white/40">
        {filteredCities.length} cities • Pakistan cities included in global
        list.
      </div>
    </div>
  );
}
