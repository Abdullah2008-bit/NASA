"use client";
import React from "react";
import { AggregatedAirQuality } from "@/types/air-quality";

interface FusionStatsProps {
  data?: AggregatedAirQuality;
  className?: string;
}

export function FusionStats({ data, className = "" }: FusionStatsProps) {
  if (!data?.fusion) return null;
  const f = data.fusion;
  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 text-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          Fusion Metrics
        </h4>
        <span className="text-[10px] text-white/40">
          attempts: {f.attempts}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Stat label="Stations Used" value={f.stationsUsed} />
        <Stat label="Radius (km)" value={f.radiusUsedKm} />
        <Stat
          label="Weighted"
          value={f.pollutantsWeighted.length}
          tooltip={f.pollutantsWeighted.join(", ")}
        />
        <Stat
          label="Method"
          value={f.weighting.split(" ")[0]}
          tooltip={f.weighting}
        />
      </div>
      {data.aqi?.subindices && (
        <div className="mt-3">
          <p className="text-[10px] uppercase text-white/40 tracking-wider mb-1">
            Subindices
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.aqi.subindices).map(([k, v]) => (
              <span
                key={k}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/70"
              >
                {k.toUpperCase()}: {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: number | string;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[70px]" title={tooltip}>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-white/80 font-medium">{value}</span>
    </div>
  );
}
