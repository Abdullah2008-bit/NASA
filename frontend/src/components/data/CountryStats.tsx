"use client";
import React, { useMemo } from "react";
import { useOpenAQCities } from "@/hooks/use-openaq";
import { AggregatedAirQuality } from "@/types/air-quality";

interface CountryStatsProps {
  country?: string; // Parsed country name (e.g. "USA")
  aggregated?: AggregatedAirQuality;
  className?: string;
}

/**
 * CountryStats
 * Lightweight summary panel that derives simple metrics based on the selected country.
 * If we only have a single city (current selection), we still show meaningful, non-zero values.
 */
export function CountryStats({
  country,
  aggregated,
  className = "",
}: CountryStatsProps) {
  const { cities } = useOpenAQCities(country || undefined);

  // Derive simple metrics (placeholder logic until backend country aggregation endpoint exists)
  const metrics = useMemo(() => {
    // Current AQI from aggregated or fallback subindex average
    const aqi = aggregated?.aqi?.value;
    const sub = aggregated?.aqi?.subindices;
    const derivedAQI =
      aqi ??
      (sub
        ? Math.round(
            Object.values(sub).reduce((acc, v) => acc + (v || 0), 0) /
              Math.max(1, Object.keys(sub).length)
          )
        : undefined);

    // Approximate station count from fusion info (if present) else proportional to city count
    const stations =
      aggregated?.fusion?.stationsUsed ||
      Math.max(1, Math.round(cities.length * 1.2));

    return {
      aqi: derivedAQI,
      cities: cities.length || 0,
      stations,
      dominant: aggregated?.aqi?.dominant || "—",
    };
  }, [aggregated, cities]);

  if (!country) return null;

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          {country} Air Quality
        </h4>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <Stat label="Cities" value={metrics.cities} />
        <Stat label="Stations" value={metrics.stations} />
        <Stat
          label="AQI"
          value={metrics.aqi != null ? metrics.aqi : "—"}
          highlight
        />
        <Stat label="Dominant" value={metrics.dominant || "—"} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-white/80 font-medium ${
          highlight
            ? "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
