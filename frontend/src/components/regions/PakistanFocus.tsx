"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CityAQI {
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  no2: number;
  o3: number;
  lastUpdated: string;
}

// Initial key Pakistani cities (can be expanded)
const BASE_CITIES: Omit<CityAQI, "aqi" | "pm25" | "no2" | "o3" | "lastUpdated">[] = [
  { city: "Karachi", lat: 24.8607, lon: 67.0011 },
  { city: "Lahore", lat: 31.5204, lon: 74.3587 },
  { city: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { city: "Faisalabad", lat: 31.418, lon: 73.0791 },
  { city: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { city: "Quetta", lat: 30.1798, lon: 66.975 },
  { city: "Multan", lat: 30.1575, lon: 71.5249 },
];

function aqiColor(aqi: number) {
  if (aqi <= 50) return "bg-green-500/80 text-white";
  if (aqi <= 100) return "bg-yellow-500/80 text-black";
  if (aqi <= 150) return "bg-orange-500/80 text-white";
  if (aqi <= 200) return "bg-red-500/80 text-white";
  if (aqi <= 300) return "bg-purple-600/80 text-white";
  return "bg-rose-900/80 text-white";
}

export function PakistanFocus() {
  const [cities, setCities] = useState<CityAQI[]>([]);
  const [smogMode, setSmogMode] = useState(true); // toggle for smog visualization overlay

  // Simulate dynamic data until backend aggregation endpoint is ready
  useEffect(() => {
    const seed = BASE_CITIES.map((c) => ({
      ...c,
      aqi: 90 + Math.random() * 120, // Lahore often higher baseline
      pm25: 40 + Math.random() * 80,
      no2: 20 + Math.random() * 40,
      o3: 10 + Math.random() * 40,
      lastUpdated: new Date().toISOString(),
    }));
    setCities(seed);

    const interval = setInterval(() => {
      setCities((prev) =>
        prev.map((c) => ({
          ...c,
          aqi: Math.max(40, Math.min(350, c.aqi + (Math.random() * 30 - 15))),
          pm25: Math.max(10, c.pm25 + (Math.random() * 10 - 5)),
          no2: Math.max(5, c.no2 + (Math.random() * 8 - 4)),
          o3: Math.max(5, c.o3 + (Math.random() * 8 - 4)),
          lastUpdated: new Date().toISOString(),
        }))
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const avgAQI = cities.reduce((s, c) => s + c.aqi, 0) / (cities.length || 1);
  const worst = [...cities].sort((a, b) => b.aqi - a.aqi)[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400">
            Pakistan Regional Air Quality
          </h2>
          <p className="text-white/60 max-w-2xl mt-1">
            Focused monitoring of key Pakistani urban centers. Live (simulated) updates every 12s. Backend integration will replace simulation with fused TEMPO + OpenAQ data.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSmogMode((s) => !s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              smogMode
                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                : "bg-white/10 border-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {smogMode ? "Smog Overlay: On" : "Smog Overlay: Off"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-cyan-400/20 rounded-xl p-4">
          <div className="text-xs text-white/60 mb-1">Avg Regional AQI</div>
          <div className="text-2xl font-bold text-white">{avgAQI.toFixed(0)}</div>
        </div>
        {worst && (
          <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-400/30 rounded-xl p-4">
            <div className="text-xs text-white/60 mb-1">Worst City</div>
            <div className="text-lg font-semibold text-white">{worst.city}</div>
            <div className="text-xs text-white/50">AQI {worst.aqi.toFixed(0)}</div>
          </div>
        )}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-4">
            <div className="text-xs text-white/60 mb-1">Cities Tracked</div>
            <div className="text-2xl font-bold text-white">{cities.length}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-xl p-4">
            <div className="text-xs text-white/60 mb-1">Smog Mode</div>
            <div className="text-lg font-semibold text-amber-300">{smogMode ? "Active" : "Disabled"}</div>
        </div>
      </div>

      {/* Map / Grid Hybrid */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 overflow-hidden">
        {smogMode && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-amber-500/10 via-amber-600/5 to-transparent animate-pulse" />
        )}
        <div className="grid md:grid-cols-3 gap-4 relative z-10">
          {cities.map((c, i) => (
            <motion.div
              key={c.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">{c.city}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide ${aqiColor(c.aqi)}`}>
                  AQI {c.aqi.toFixed(0)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-white/60">
                <div>
                  <div className="text-white font-medium">{c.pm25.toFixed(0)}</div>
                  <div>PM2.5</div>
                </div>
                <div>
                  <div className="text-white font-medium">{c.no2.toFixed(0)}</div>
                  <div>NO₂</div>
                </div>
                <div>
                  <div className="text-white font-medium">{c.o3.toFixed(0)}</div>
                  <div>O₃</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (c.aqi / 300) * 100)}%`,
                    background:
                      c.aqi > 200
                        ? "linear-gradient(to right,#4f46e5,#7c3aed,#9333ea)"
                        : c.aqi > 150
                        ? "linear-gradient(to right,#dc2626,#f97316)"
                        : c.aqi > 100
                        ? "linear-gradient(to right,#f59e0b,#fbbf24)"
                        : "linear-gradient(to right,#059669,#10b981)",
                  }}
                />
              </div>
              <div className="mt-2 text-[10px] text-white/40">
                Updated {new Date(c.lastUpdated).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-xs text-white/50">
          NOTE: Values are simulated placeholders. Upcoming backend endpoint will merge OpenAQ ground readings with NASA TEMPO-derived pollutant columns for authoritative values.
        </div>
      </div>

      {/* Advisory */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-400/20 rounded-xl p-5">
        <h4 className="text-white font-semibold mb-2">Seasonal Smog Advisory</h4>
        <p className="text-sm text-white/70 leading-relaxed">
          Winter inversion layers and crop residue burning can sharply elevate particulate concentrations (PM2.5) across the Punjab region. Smog mode visually emphasizes elevated aerosol loading. Future integration: satellite AOD, boundary layer height, and machine learning risk classification.
        </p>
      </div>
    </div>
  );
}
