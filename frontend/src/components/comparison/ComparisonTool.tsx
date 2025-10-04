import React, { useState } from "react";
import { motion } from "framer-motion";

interface ComparisonLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number;
  no2: number;
  o3: number;
  pm25: number;
}

const PRESET_LOCATIONS: ComparisonLocation[] = [
  {
    id: "1",
    name: "New York City",
    lat: 40.7128,
    lon: -74.006,
    aqi: 68,
    no2: 25,
    o3: 45,
    pm25: 15,
  },
  {
    id: "2",
    name: "Los Angeles",
    lat: 34.0522,
    lon: -118.2437,
    aqi: 95,
    no2: 35,
    o3: 75,
    pm25: 32,
  },
  {
    id: "3",
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
    aqi: 58,
    no2: 22,
    o3: 38,
    pm25: 12,
  },
  {
    id: "4",
    name: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    aqi: 72,
    no2: 28,
    o3: 52,
    pm25: 18,
  },
  {
    id: "5",
    name: "Beijing",
    lat: 39.9042,
    lon: 116.4074,
    aqi: 152,
    no2: 45,
    o3: 65,
    pm25: 85,
  },
  {
    id: "6",
    name: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    aqi: 189,
    no2: 52,
    o3: 72,
    pm25: 125,
  },
];

export function ComparisonTool() {
  const [selectedLocations, setSelectedLocations] = useState<
    ComparisonLocation[]
  >([PRESET_LOCATIONS[0], PRESET_LOCATIONS[1]]);

  const [availableLocations] = useState(PRESET_LOCATIONS);

  const addLocation = (location: ComparisonLocation) => {
    if (
      selectedLocations.length < 4 &&
      !selectedLocations.find((l) => l.id === location.id)
    ) {
      setSelectedLocations((prev) => [...prev, location]);
    }
  };

  const removeLocation = (id: string) => {
    if (selectedLocations.length > 1) {
      setSelectedLocations((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981";
    if (aqi <= 100) return "#fbbf24";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    if (aqi <= 300) return "#a855f7";
    return "#7f1d1d";
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const maxValues = {
    aqi: Math.max(...selectedLocations.map((l) => l.aqi)),
    no2: Math.max(...selectedLocations.map((l) => l.no2)),
    o3: Math.max(...selectedLocations.map((l) => l.o3)),
    pm25: Math.max(...selectedLocations.map((l) => l.pm25)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          🔄 Location Comparison
        </h2>
        <p className="text-white/60">
          Compare air quality across multiple cities side-by-side
        </p>
      </div>

      {/* Location Selector */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">
            Select Locations ({selectedLocations.length}/4)
          </h3>
          <span className="text-xs text-white/50">
            Click to add, max 4 locations
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableLocations.map((location) => {
            const isSelected = selectedLocations.find(
              (l) => l.id === location.id
            );
            const canAdd = selectedLocations.length < 4;

            return (
              <button
                key={location.id}
                onClick={() =>
                  isSelected
                    ? removeLocation(location.id)
                    : addLocation(location)
                }
                disabled={!isSelected && !canAdd}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : canAdd
                    ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                    : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                }`}
              >
                {isSelected && "✓ "}
                {location.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {selectedLocations.map((location, idx) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-xl p-6 relative"
          >
            {/* Remove Button */}
            {selectedLocations.length > 1 && (
              <button
                onClick={() => removeLocation(location.id)}
                className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-red-500/20 rounded-lg transition-colors group"
                aria-label={`Remove ${location.name}`}
              >
                <svg
                  className="w-4 h-4 text-white/60 group-hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Location Name */}
            <h3 className="text-lg font-bold text-white mb-1 pr-8">
              {location.name}
            </h3>
            <p className="text-xs text-white/50 mb-4">
              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
            </p>

            {/* AQI Badge */}
            <div className="mb-4">
              <div
                className="inline-flex items-center px-4 py-2 rounded-lg font-bold text-white text-2xl shadow-lg"
                style={{ backgroundColor: getAQIColor(location.aqi) }}
              >
                {location.aqi}
              </div>
              <div
                className="mt-2 text-sm"
                style={{ color: getAQIColor(location.aqi) }}
              >
                {getAQILabel(location.aqi)}
              </div>
            </div>

            {/* Pollutants */}
            <div className="space-y-3">
              {[
                {
                  label: "NO₂",
                  value: location.no2,
                  max: maxValues.no2,
                  unit: "ppb",
                  color: "#ef4444",
                },
                {
                  label: "O₃",
                  value: location.o3,
                  max: maxValues.o3,
                  unit: "ppb",
                  color: "#f59e0b",
                },
                {
                  label: "PM2.5",
                  value: location.pm25,
                  max: maxValues.pm25,
                  unit: "μg/m³",
                  color: "#8b5cf6",
                },
              ].map((pollutant) => (
                <div key={pollutant.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">
                      {pollutant.label}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {pollutant.value} {pollutant.unit}
                    </span>
                  </div>
                  <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(pollutant.value / pollutant.max) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: pollutant.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Best/Worst Indicator */}
            {location.aqi ===
              Math.min(...selectedLocations.map((l) => l.aqi)) && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                <span className="text-green-400">🏆</span>
                <span className="text-xs text-green-400 font-semibold">
                  Best Air Quality
                </span>
              </div>
            )}
            {location.aqi ===
              Math.max(...selectedLocations.map((l) => l.aqi)) &&
              selectedLocations.length > 1 && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-xs text-red-400 font-semibold">
                    Worst Air Quality
                  </span>
                </div>
              )}
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-indigo-400 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-2">
              Comparison Insights
            </h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                • <strong className="text-white">AQI Range:</strong>{" "}
                {Math.min(...selectedLocations.map((l) => l.aqi))} to{" "}
                {Math.max(...selectedLocations.map((l) => l.aqi))}(
                {Math.max(...selectedLocations.map((l) => l.aqi)) -
                  Math.min(...selectedLocations.map((l) => l.aqi))}{" "}
                point difference)
              </li>
              <li>
                • <strong className="text-white">Average AQI:</strong>{" "}
                {(
                  selectedLocations.reduce((sum, l) => sum + l.aqi, 0) /
                  selectedLocations.length
                ).toFixed(0)}
              </li>
              <li>
                • <strong className="text-white">Cleanest Air:</strong>{" "}
                {
                  selectedLocations.reduce((min, l) =>
                    l.aqi < min.aqi ? l : min
                  ).name
                }{" "}
                (AQI {Math.min(...selectedLocations.map((l) => l.aqi))})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
