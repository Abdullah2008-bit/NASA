"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import AQICard from "@/components/ui/AQICard";
import { PrismaHero } from "@/components/hero/PrismaHero";
import { DataSourcesPanel } from "@/components/data/DataSourcesPanel";
import { RealTimeDataGrid } from "@/components/data/RealTimeDataGrid";
import { AlertsSystem } from "@/components/alerts/AlertsSystem";
import { ForecastingEngine } from "@/components/forecasting/ForecastingEngine";
import { HistoricalTrends } from "@/components/analytics/HistoricalTrends";
import { DataValidation } from "@/components/validation/DataValidation";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { ComparisonTool } from "@/components/comparison/ComparisonTool";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import FloatingSatellite from "@/components/scroll/FloatingSatellite";
import InteractiveWorldMap from "@/components/scroll/InteractiveWorldMap";
import ScrollSection from "@/components/scroll/ScrollSection";
import {
  useTEMPOData,
  useGroundStationData,
  useForecast,
} from "@/hooks/use-air-quality-data";
import { AlertData } from "@/types/air-quality"; // retained for mock alert typing

// Lazy load 3D Globe for better performance
const FunctionalEarth3D = dynamic(
  () => import("@/components/globe/FunctionalEarth3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-white text-xl">
            Loading Interactive Earth Globe...
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  // selectedLocation setter used by future global search & map interactions
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 40.7128,
    lon: -74.006,
    name: "New York City",
  });
  // Track only recent mock alerts internally (used for toast logic) – not rendered directly
  const [recentAlerts, setRecentAlerts] = useState<AlertData[]>([]);
  const [currentTab, setCurrentTab] = useState<
    | "dashboard"
    | "forecast"
    | "alerts"
    | "history"
    | "validation"
    | "analytics"
    | "comparison"
  >("dashboard");
  const [currentPollutants, setCurrentPollutants] = useState({
    aqi: 68,
    no2: 15.2,
    o3: 45.8,
    pm25: 12.3,
    hcho: 2.1,
  });
  const [showSatelliteLayer, setShowSatelliteLayer] = useState(true);

  // Lightweight mock pollutant data for 3D layer toggle (replace with real TEMPO fusion soon)
  const pollutantData = showSatelliteLayer
    ? (Array.from({ length: 180 }, (_, i) => {
        const lat = -60 + Math.random() * 120; // focus mid-latitudes
        const lon = -180 + Math.random() * 360;
        const types = ["no2", "o3", "pm25", "hcho"] as const;
        const type = types[i % types.length];
        return {
          type,
          intensity: Math.random() * (type === "pm25" ? 60 : 80),
          lat,
          lon,
        };
      }) satisfies {
        type: "no2" | "o3" | "pm25" | "hcho";
        intensity: number;
        lat: number;
        lon: number;
      }[])
    : [];

  // Future dynamic updates will use setters; temporary reference to avoid lint removal
  void setSelectedLocation;
  void setRecentAlerts;
  void setCurrentPollutants;

  // Auto scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab]);

  // Toast notifications for user feedback
  const toast = useToast();

  // Fetch data with SWR (automatic caching & revalidation) - ALWAYS call hooks unconditionally
  const { data: tempoData, isLoading: tempoLoading } = useTEMPOData(
    selectedLocation.lat,
    selectedLocation.lon
  );
  // Future: integrate real ground & forecast usage
  useGroundStationData(selectedLocation.lat, selectedLocation.lon);
  useForecast(selectedLocation.lat, selectedLocation.lon);

  // Simulate real-time alerts - useEffect MUST be called unconditionally
  useEffect(() => {
    if (!showDashboard) return; // Early return inside effect is OK

    const interval = setInterval(() => {
      const mockAlert: AlertData = {
        id: Date.now().toString(),
        level: Math.random() > 0.5 ? "warning" : "info",
        aqi: Math.floor(Math.random() * 100) + 50,
        location: selectedLocation.name,
        message: "Air quality has changed. Check the latest forecast.",
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10000),
      };
      setRecentAlerts((prev) => [mockAlert, ...prev.slice(0, 2)]);

      // Show toast notification for high AQI alerts
      if (mockAlert.aqi > 100) {
        toast.warning(
          "High AQI Alert",
          `Air quality in ${mockAlert.location} has deteriorated (AQI: ${mockAlert.aqi})`
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedLocation, showDashboard, toast]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setCurrentTab("dashboard");
            toast.info("Navigation", "Switched to Dashboard");
            break;
          case "2":
            e.preventDefault();
            setCurrentTab("forecast");
            toast.info("Navigation", "Switched to Forecast");
            break;
          case "3":
            e.preventDefault();
            setCurrentTab("alerts");
            toast.info("Navigation", "Switched to Alerts");
            break;
          case "4":
            e.preventDefault();
            setCurrentTab("history");
            toast.info("Navigation", "Switched to History");
            break;
          case "5":
            e.preventDefault();
            setCurrentTab("validation");
            toast.info("Navigation", "Switched to Validation");
            break;
          case "6":
            e.preventDefault();
            setCurrentTab("analytics");
            toast.info("Navigation", "Switched to Analytics");
            break;
          case "7":
            e.preventDefault();
            setCurrentTab("comparison");
            toast.info("Navigation", "Switched to Compare");
            break;
          // Removed Pakistan shortcut (was Ctrl/Cmd+8)
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toast]);

  // Show success toast when data is loaded (only once on mount)
  useEffect(() => {
    if (tempoData && !tempoLoading) {
      toast.success(
        "Data Updated",
        "Latest NASA TEMPO data loaded successfully"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoData, tempoLoading]);

  // Show hero section first, then dashboard
  if (!showDashboard) {
    return <PrismaHero onEnter={() => setShowDashboard(true)} />;
  }

  // NOTE: location selection via future global search component will call setSelectedLocation directly

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🌍" },
    { id: "forecast", label: "Forecast", icon: "📈" },
    { id: "alerts", label: "Alerts", icon: "🚨" },
    { id: "history", label: "History", icon: "📊" },
    { id: "validation", label: "Validation", icon: "✅" },
    { id: "analytics", label: "Analytics", icon: "🔍" },
    { id: "comparison", label: "Compare", icon: "🔄" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-slate-700 flex items-center justify-center ring-1 ring-blue-300/20 shadow shadow-blue-600/30">
                <span className="text-white font-bold text-xl">🌍</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-600">
                  SkyCast
                </h1>
                <p className="text-xs text-gray-400 tracking-wide">
                  NASA Space Apps 2025
                </p>
              </div>
            </div>

            <nav className="flex gap-6">
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`font-medium transition-all ${
                    currentTab === tab.id
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats */}
                <div className="space-y-6">
                  {/* Current AQI */}
                  <AQICard
                    aqi={currentPollutants.aqi}
                    location={selectedLocation.name}
                    timestamp={new Date()}
                    className="bg-gray-900/50 backdrop-blur-xl"
                  />
                  {/* Hidden meta hook usage to acknowledge alert stream */}
                  {recentAlerts.length > 0 && (
                    <span className="sr-only" aria-live="polite">
                      {recentAlerts.length} active alerts processed
                    </span>
                  )}

                  {/* Pollutant Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Pollutants
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          name: "NO₂",
                          value: currentPollutants.no2,
                          unit: "ppb",
                          color: "from-yellow-400 to-orange-500",
                        },
                        {
                          name: "O₃",
                          value: currentPollutants.o3,
                          unit: "ppb",
                          color: "from-blue-400 to-cyan-500",
                        },
                        {
                          name: "PM2.5",
                          value: currentPollutants.pm25,
                          unit: "μg/m³",
                          color: "from-red-400 to-pink-500",
                        },
                        {
                          name: "HCHO",
                          value: currentPollutants.hcho,
                          unit: "ppb",
                          color: "from-green-400 to-emerald-500",
                        },
                      ].map((pollutant, i) => (
                        <motion.div
                          key={pollutant.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-400 font-medium">
                            {pollutant.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${pollutant.color}`}
                            >
                              {pollutant.value}
                            </span>
                            <span className="text-xs text-gray-500">
                              {pollutant.unit}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Data Sources */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Data Sources
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">NASA TEMPO</span>
                        <span className="text-green-500">● Live</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">OpenAQ</span>
                        <span className="text-green-500">● Live</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">NOAA Weather</span>
                        <span className="text-green-500">● Live</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Center Column - 3D Globe */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800"
                  style={{ height: "600px" }}
                >
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showSatelliteLayer}
                        onChange={() => setShowSatelliteLayer((s) => !s)}
                        className="accent-blue-500"
                      />
                      <span>Satellite Layer</span>
                    </label>
                  </div>
                  <Suspense
                    fallback={<div className="w-full h-full bg-black" />}
                  >
                    <FunctionalEarth3D pollutantData={pollutantData} />
                  </Suspense>
                </motion.div>
              </div>

              {/* Data Sources Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
              >
                <DataSourcesPanel />
              </motion.div>

              {/* Real-Time Global Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8"
              >
                <RealTimeDataGrid />
              </motion.div>
            </motion.div>
          )}

          {currentTab === "forecast" && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ForecastingEngine
                location={selectedLocation}
                currentData={currentPollutants}
              />
            </motion.div>
          )}

          {currentTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertsSystem
                location={selectedLocation}
                currentAQI={currentPollutants.aqi}
                pollutants={currentPollutants}
              />
            </motion.div>
          )}

          {currentTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoricalTrends location={selectedLocation} />
            </motion.div>
          )}

          {currentTab === "validation" && (
            <motion.div
              key="validation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DataValidation location={selectedLocation} />
            </motion.div>
          )}

          {currentTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdvancedAnalytics location={selectedLocation} />
            </motion.div>
          )}

          {currentTab === "comparison" && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonTool />
            </motion.div>
          )}
          {/* Pakistan tab removed; cities integrated into globe markers */}
        </AnimatePresence>
      </main>

      {/* Floating Satellite (Scroll Effect) */}
      <FloatingSatellite />

      {/* Interactive World Map Section (Scroll Triggered) */}
      <ScrollSection className="min-h-screen">
        <InteractiveWorldMap />
      </ScrollSection>

      {/* Additional Insights Section (Scroll Triggered) */}
      <ScrollSection className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Real-Time Global Air Quality Insights
            </h2>
            <p className="text-xl text-blue-300 text-center mb-16 max-w-3xl mx-auto">
              Monitor air quality across the world in real-time. Search any city
              or country to see live AQI data, pollutant levels, and health
              recommendations.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌍",
                  title: "Global Coverage",
                  description:
                    "27+ major cities across 6 continents with real-time updates every 5 seconds",
                },
                {
                  icon: "📊",
                  title: "Live Data",
                  description:
                    "Real-time AQI, PM2.5, NO₂, and O₃ measurements from trusted sources",
                },
                {
                  icon: "🔍",
                  title: "Smart Search",
                  description:
                    "Search any city or country - if data is available, we'll show it instantly",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { value: "27+", label: "Cities Monitored" },
                { value: "6", label: "Continents" },
                { value: "5s", label: "Update Frequency" },
                { value: "24/7", label: "Live Monitoring" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6"
                >
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-white mb-3">About SkyCast</h4>
              <p className="text-gray-400 leading-relaxed">
                Professional air quality forecasting platform powered by NASA
                Earth observation data and advanced machine learning models for
                the NASA Space Apps Challenge 2025.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Data Sources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>→ NASA TEMPO Satellite</li>
                <li>→ MERRA-2 Reanalysis</li>
                <li>→ GOES-R Geostationary</li>
                <li>→ OpenAQ Ground Stations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="https://tempo.si.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    → TEMPO Mission
                  </a>
                </li>
                <li>
                  <a
                    href="https://earthdata.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    → NASA Earthdata
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.spaceappschallenge.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    → Space Apps Challenge
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Abdullah2008-bit/NASA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    → GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>
              Built with ❤️ for NASA Space Apps Challenge 2025 | Predicting
              Cleaner, Safer Skies
            </p>
            <p className="mt-2">
              Data provided by NASA Earth Science Division • All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
