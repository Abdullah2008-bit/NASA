"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AQIData {
  country: string;
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  no2: number;
  o3: number;
  timestamp: string;
  x: number; // For 2D projection
  y: number;
}

// Global cities with real-time AQI simulation and 2D coordinates
const GLOBAL_CITIES: Omit<AQIData, "timestamp">[] = [
  // Asia
  {
    country: "China",
    city: "Beijing",
    lat: 39.9042,
    lon: 116.4074,
    aqi: 152,
    pm25: 68.5,
    no2: 45.2,
    o3: 32.1,
    x: 70,
    y: 35,
  },
  {
    country: "China",
    city: "Shanghai",
    lat: 31.2304,
    lon: 121.4737,
    aqi: 134,
    pm25: 58.3,
    no2: 42.1,
    o3: 28.5,
    x: 72,
    y: 40,
  },
  {
    country: "India",
    city: "New Delhi",
    lat: 28.6139,
    lon: 77.209,
    aqi: 189,
    pm25: 95.2,
    no2: 62.8,
    o3: 38.4,
    x: 60,
    y: 42,
  },
  {
    country: "India",
    city: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    aqi: 165,
    pm25: 78.4,
    no2: 51.3,
    o3: 34.2,
    x: 59,
    y: 47,
  },
  {
    country: "Japan",
    city: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    aqi: 45,
    pm25: 12.3,
    no2: 18.5,
    o3: 42.1,
    x: 78,
    y: 37,
  },
  {
    country: "South Korea",
    city: "Seoul",
    lat: 37.5665,
    lon: 126.978,
    aqi: 72,
    pm25: 28.5,
    no2: 32.4,
    o3: 38.2,
    x: 73,
    y: 36,
  },
  {
    country: "Thailand",
    city: "Bangkok",
    lat: 13.7563,
    lon: 100.5018,
    aqi: 98,
    pm25: 42.1,
    no2: 35.6,
    o3: 31.8,
    x: 67,
    y: 50,
  },
  {
    country: "Singapore",
    city: "Singapore",
    lat: 1.3521,
    lon: 103.8198,
    aqi: 52,
    pm25: 18.2,
    no2: 22.4,
    o3: 35.1,
    x: 68,
    y: 55,
  },

  // Europe
  {
    country: "UK",
    city: "London",
    lat: 51.5074,
    lon: -0.1278,
    aqi: 58,
    pm25: 21.3,
    no2: 28.5,
    o3: 36.2,
    x: 45,
    y: 25,
  },
  {
    country: "France",
    city: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    aqi: 62,
    pm25: 24.1,
    no2: 31.2,
    o3: 34.5,
    x: 46,
    y: 27,
  },
  {
    country: "Germany",
    city: "Berlin",
    lat: 52.52,
    lon: 13.405,
    aqi: 48,
    pm25: 16.5,
    no2: 24.3,
    o3: 38.1,
    x: 48,
    y: 25,
  },
  {
    country: "Italy",
    city: "Rome",
    lat: 41.9028,
    lon: 12.4964,
    aqi: 65,
    pm25: 26.8,
    no2: 33.1,
    o3: 32.8,
    x: 48,
    y: 31,
  },
  {
    country: "Spain",
    city: "Madrid",
    lat: 40.4168,
    lon: -3.7038,
    aqi: 54,
    pm25: 19.2,
    no2: 26.5,
    o3: 37.4,
    x: 43,
    y: 32,
  },

  // Americas
  {
    country: "USA",
    city: "New York",
    lat: 40.7128,
    lon: -74.006,
    aqi: 68,
    pm25: 28.2,
    no2: 35.1,
    o3: 42.5,
    x: 20,
    y: 32,
  },
  {
    country: "USA",
    city: "Los Angeles",
    lat: 34.0522,
    lon: -118.2437,
    aqi: 85,
    pm25: 38.5,
    no2: 41.2,
    o3: 52.3,
    x: 12,
    y: 36,
  },
  {
    country: "USA",
    city: "Chicago",
    lat: 41.8781,
    lon: -87.6298,
    aqi: 55,
    pm25: 21.5,
    no2: 28.4,
    o3: 38.2,
    x: 18,
    y: 30,
  },
  {
    country: "Canada",
    city: "Toronto",
    lat: 43.6532,
    lon: -79.3832,
    aqi: 42,
    pm25: 14.2,
    no2: 22.1,
    o3: 36.5,
    x: 19,
    y: 28,
  },
  {
    country: "Mexico",
    city: "Mexico City",
    lat: 19.4326,
    lon: -99.1332,
    aqi: 112,
    pm25: 48.5,
    no2: 45.3,
    o3: 48.2,
    x: 15,
    y: 46,
  },
  {
    country: "Brazil",
    city: "São Paulo",
    lat: -23.5505,
    lon: -46.6333,
    aqi: 72,
    pm25: 31.2,
    no2: 36.8,
    o3: 35.1,
    x: 27,
    y: 65,
  },
  {
    country: "Argentina",
    city: "Buenos Aires",
    lat: -34.6037,
    lon: -58.3816,
    aqi: 58,
    pm25: 22.4,
    no2: 28.5,
    o3: 34.2,
    x: 25,
    y: 72,
  },

  // Oceania
  {
    country: "Australia",
    city: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    aqi: 38,
    pm25: 11.2,
    no2: 18.5,
    o3: 38.2,
    x: 82,
    y: 72,
  },
  {
    country: "Australia",
    city: "Melbourne",
    lat: -37.8136,
    lon: 144.9631,
    aqi: 42,
    pm25: 14.5,
    no2: 21.2,
    o3: 36.8,
    x: 80,
    y: 74,
  },

  // Africa
  {
    country: "South Africa",
    city: "Johannesburg",
    lat: -26.2041,
    lon: 28.0473,
    aqi: 78,
    pm25: 32.5,
    no2: 38.2,
    o3: 31.5,
    x: 50,
    y: 68,
  },
  {
    country: "Egypt",
    city: "Cairo",
    lat: 30.0444,
    lon: 31.2357,
    aqi: 142,
    pm25: 65.3,
    no2: 52.1,
    o3: 35.8,
    x: 51,
    y: 40,
  },
  {
    country: "Kenya",
    city: "Nairobi",
    lat: -1.2921,
    lon: 36.8219,
    aqi: 88,
    pm25: 38.2,
    no2: 35.5,
    o3: 32.1,
    x: 53,
    y: 56,
  },

  // Middle East
  {
    country: "UAE",
    city: "Dubai",
    lat: 25.2048,
    lon: 55.2708,
    aqi: 95,
    pm25: 42.8,
    no2: 38.5,
    o3: 45.2,
    x: 56,
    y: 43,
  },
  {
    country: "Saudi Arabia",
    city: "Riyadh",
    lat: 24.7136,
    lon: 46.6753,
    aqi: 118,
    pm25: 52.3,
    no2: 42.1,
    o3: 38.5,
    x: 54,
    y: 43,
  },
  {
    country: "Turkey",
    city: "Istanbul",
    lat: 41.0082,
    lon: 28.9784,
    aqi: 82,
    pm25: 35.2,
    no2: 38.8,
    o3: 34.2,
    x: 50,
    y: 31,
  },
];

export default function InteractiveWorldMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<AQIData | null>(null);
  const [filteredCities, setFilteredCities] = useState<AQIData[]>([]);
  const [liveData, setLiveData] = useState<AQIData[]>(
    GLOBAL_CITIES.map((city) => ({
      ...city,
      timestamp: new Date().toISOString(),
    }))
  );

  // Simulate live AQI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prevData) =>
        prevData.map((city) => ({
          ...city,
          aqi: Math.max(
            20,
            Math.min(300, city.aqi + Math.floor(Math.random() * 10 - 5))
          ),
          timestamp: new Date().toISOString(),
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter cities based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCities(liveData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = liveData.filter(
        (city) =>
          city.city.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query)
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, liveData]);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"; // Green - Good
    if (aqi <= 100) return "#f59e0b"; // Yellow - Moderate
    if (aqi <= 150) return "#f97316"; // Orange - Unhealthy for Sensitive
    if (aqi <= 200) return "#ef4444"; // Red - Unhealthy
    if (aqi <= 300) return "#a855f7"; // Purple - Very Unhealthy
    return "#7f1d1d"; // Maroon - Hazardous
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden py-20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-20 px-8 mb-12"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-2">
            Global Air Quality Monitor
          </h2>
          <p className="text-blue-300 text-lg mb-6">
            Real-time AQI data from {GLOBAL_CITIES.length} cities worldwide 🌍
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any city or country... (e.g., Tokyo, India, Paris)"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
              🔍
            </div>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-blue-300"
            >
              {filteredCities.length === 0 ? (
                <span className="text-orange-400">
                  ⚠️ No data available for "{searchQuery}". Try another
                  location!
                </span>
              ) : (
                <span>
                  ✅ Found {filteredCities.length} location
                  {filteredCities.length !== 1 ? "s" : ""}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 2D World Map Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-8"
      >
        <div className="relative w-full aspect-[2/1] bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
          {/* Simplified World Map Background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
          >
            {/* Continents (simplified shapes) */}
            <path
              d="M10,30 Q15,28 20,30 L25,35 L20,40 L10,38 Z" //  North America
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="0.2"
            />
            <path
              d="M20,45 L28,42 L30,50 L22,55 Z" // South America
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="0.2"
            />
            <path
              d="M40,20 Q50,18 55,22 L58,35 L50,38 L42,32 Z" // Europe + Africa
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="0.2"
            />
            <path
              d="M55,30 Q65,28 75,32 L78,45 L70,50 L60,45 Z" // Asia
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="0.2"
            />
            <path
              d="M75,65 L85,68 L83,75 L75,73 Z" // Australia
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="0.2"
            />
          </svg>

          {/* City Markers */}
          {filteredCities.map((city) => (
            <motion.div
              key={`${city.country}-${city.city}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.5 }}
              onClick={() => setSelectedCity(city)}
              className="absolute cursor-pointer group"
              style={{
                left: `${city.x}%`,
                top: `${city.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulsing Ring */}
              <div
                className="absolute w-8 h-8 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: getAQIColor(city.aqi) }}
              />
              {/* Main Dot */}
              <div
                className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getAQIColor(city.aqi) }}
              />
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <div className="bg-black/90 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                  <div className="text-white font-semibold text-sm">
                    {city.city}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: getAQIColor(city.aqi) }}
                  >
                    AQI: {city.aqi}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">AQI Scale</h3>
        <div className="space-y-2">
          {[
            { range: "0-50", label: "Good", color: "#10b981" },
            { range: "51-100", label: "Moderate", color: "#f59e0b" },
            {
              range: "101-150",
              label: "Unhealthy (Sensitive)",
              color: "#f97316",
            },
            { range: "151-200", label: "Unhealthy", color: "#ef4444" },
            { range: "201-300", label: "Very Unhealthy", color: "#a855f7" },
            { range: "300+", label: "Hazardous", color: "#7f1d1d" },
          ].map((item) => (
            <div key={item.range} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs">
                <div className="text-white font-medium">{item.range}</div>
                <div className="text-gray-400">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Selected City Details */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4"
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {selectedCity.city}
                  </h3>
                  <p className="text-blue-300">{selectedCity.country}</p>
                </div>
                <div className="text-right">
                  <div
                    className="text-5xl font-black mb-1"
                    style={{ color: getAQIColor(selectedCity.aqi) }}
                  >
                    {selectedCity.aqi}
                  </div>
                  <div className="text-sm text-gray-400">
                    {getAQILabel(selectedCity.aqi)}
                  </div>
                </div>
              </div>

              {/* Pollutant Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">PM2.5</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCity.pm25.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">μg/m³</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">NO₂</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCity.no2.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">ppb</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">O₃</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCity.o3.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">ppb</div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                Last updated:{" "}
                {new Date(selectedCity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Update Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-8 right-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-green-500/30 rounded-full px-4 py-2"
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        <span className="text-xs text-green-400 font-medium">Live Updates</span>
      </motion.div>
    </div>
  );
}
