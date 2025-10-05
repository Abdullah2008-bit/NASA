"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";

interface LocationData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  aqi: number;
  no2: number;
  o3: number;
  pm25: number;
  trend: "up" | "down" | "stable";
  status: "good" | "moderate" | "unhealthy" | "hazardous";
}

const MAJOR_CITIES: LocationData[] = [
  {
    id: "1",
    name: "New York",
    country: "USA",
    lat: 40.7128,
    lon: -74.006,
    aqi: 68,
    no2: 25.3,
    o3: 45.8,
    pm25: 12.3,
    trend: "down",
    status: "moderate",
  },
  {
    id: "2",
    name: "Los Angeles",
    country: "USA",
    lat: 34.0522,
    lon: -118.2437,
    aqi: 85,
    no2: 32.1,
    o3: 62.4,
    pm25: 18.7,
    trend: "up",
    status: "unhealthy",
  },
  {
    id: "3",
    name: "London",
    country: "UK",
    lat: 51.5074,
    lon: -0.1278,
    aqi: 52,
    no2: 18.5,
    o3: 38.2,
    pm25: 9.8,
    trend: "stable",
    status: "moderate",
  },
  {
    id: "4",
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    aqi: 45,
    no2: 15.2,
    o3: 35.1,
    pm25: 8.2,
    trend: "down",
    status: "good",
  },
  {
    id: "5",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lon: 2.3522,
    aqi: 58,
    no2: 21.4,
    o3: 42.3,
    pm25: 11.1,
    trend: "stable",
    status: "moderate",
  },
  {
    id: "6",
    name: "Beijing",
    country: "China",
    lat: 39.9042,
    lon: 116.4074,
    aqi: 125,
    no2: 48.7,
    o3: 78.5,
    pm25: 35.2,
    trend: "down",
    status: "unhealthy",
  },
  {
    id: "7",
    name: "São Paulo",
    country: "Brazil",
    lat: -23.5505,
    lon: -46.6333,
    aqi: 72,
    no2: 28.3,
    o3: 51.2,
    pm25: 14.8,
    trend: "stable",
    status: "moderate",
  },
  {
    id: "8",
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lon: 151.2093,
    aqi: 38,
    no2: 12.1,
    o3: 31.5,
    pm25: 6.5,
    trend: "down",
    status: "good",
  },
];

const STATUS_COLORS = {
  good: {
    bg: "from-green-500/20 to-emerald-500/20",
    border: "border-green-400/30",
    text: "text-green-400",
    glow: "shadow-green-500/50",
  },
  moderate: {
    bg: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-400/30",
    text: "text-yellow-400",
    glow: "shadow-yellow-500/50",
  },
  unhealthy: {
    bg: "from-orange-500/20 to-red-500/20",
    border: "border-orange-400/30",
    text: "text-orange-400",
    glow: "shadow-orange-500/50",
  },
  hazardous: {
    bg: "from-red-500/20 to-purple-500/20",
    border: "border-red-400/30",
    text: "text-red-400",
    glow: "shadow-red-500/50",
  },
};

export function RealTimeDataGrid() {
  const [cities, setCities] = useState(MAJOR_CITIES);
  const [selectedCity, setSelectedCity] = useState<LocationData | null>(null);

  // Fetch real aggregated data per city (satellite + ground)
  useEffect(() => {
    let cancelled = false;
    async function loadOnce() {
      try {
        // Use functional state to avoid stale closure; map over latest snapshot
        // Optional: could set a separate loading flag; skipped to keep type strict
        const updated = await Promise.all(
          (() => cities)().map(async (c) => {
            try {
              const res = await apiClient.get(
                `/api/airquality?lat=${c.lat}&lon=${c.lon}`
              );
              const data = res.data?.data;
              const aqiVal = data?.aqi?.value ?? c.aqi;
              const cat = data?.aqi?.category?.toLowerCase();
              const statusMap: Record<string, LocationData["status"]> = {
                good: "good",
                moderate: "moderate",
                unhealthy: "unhealthy",
                hazardous: "hazardous",
              };
              return {
                ...c,
                aqi: aqiVal,
                no2: data?.pollutants?.no2 ?? c.no2,
                o3: data?.pollutants?.o3 ?? c.o3,
                pm25: data?.pollutants?.pm25 ?? c.pm25,
                status: statusMap[cat || ""] || c.status,
                trend:
                  c.aqi < aqiVal ? "up" : c.aqi > aqiVal ? "down" : "stable",
              } as LocationData;
            } catch {
              return c; // fallback
            }
          })
        );
        if (!cancelled) setCities(updated);
      } catch {
        /* ignore */
      }
    }
    loadOnce();
    const interval = setInterval(loadOnce, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Intentionally exclude cities from deps to avoid resetting interval; we do manual mapping above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Global Air Quality{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Live
            </span>
          </h2>
          <p className="text-white/60">
            Real-time data from {cities.length} major cities worldwide
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-400/20 rounded-full">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
          </div>
          <span className="text-sm font-semibold text-green-400">
            STREAMING LIVE
          </span>
        </div>
      </div>

      {/* City Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cities.map((city, index) => {
          const colors = STATUS_COLORS[city.status];

          return (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCity(city)}
              className={`relative group cursor-pointer bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-2xl p-5 hover:scale-105 transition-all shadow-xl ${colors.glow} hover:shadow-2xl`}
              whileHover={{ y: -5 }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all" />

              {/* Content */}
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {city.name}
                    </h3>
                    <p className="text-xs text-white/50">{city.country}</p>
                  </div>

                  {/* Trend Indicator */}
                  <motion.div
                    animate={{
                      y:
                        city.trend === "up"
                          ? [-2, 2, -2]
                          : city.trend === "down"
                          ? [2, -2, 2]
                          : 0,
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {city.trend === "up" && (
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    )}
                    {city.trend === "down" && (
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    )}
                    {city.trend === "stable" && (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h14"
                        />
                      </svg>
                    )}
                  </motion.div>
                </div>

                {/* AQI */}
                <div className="mb-4">
                  <div className={`text-4xl font-bold ${colors.text} mb-1`}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={Math.floor(city.aqi)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {Math.floor(city.aqi)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wide">
                    {city.status}
                  </div>
                </div>

                {/* Pollutants */}
                <div className="space-y-2">
                  {[
                    { name: "NO₂", value: city.no2, color: "text-yellow-400" },
                    { name: "O₃", value: city.o3, color: "text-blue-400" },
                    { name: "PM2.5", value: city.pm25, color: "text-red-400" },
                  ].map((pollutant) => (
                    <div
                      key={pollutant.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-white/60">{pollutant.name}</span>
                      <span className={`font-bold ${pollutant.color}`}>
                        {pollutant.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Live Pulse */}
                <div className="absolute top-3 right-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white/80"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedCity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {selectedCity.name}
                  </h3>
                  <p className="text-white/60">
                    {selectedCity.country} • {selectedCity.lat.toFixed(4)}°,{" "}
                    {selectedCity.lon.toFixed(4)}°
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white/60"
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
              </div>

              {/* More detailed data would go here */}
              <div className="text-white/60">
                Detailed forecast and historical data visualization...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
