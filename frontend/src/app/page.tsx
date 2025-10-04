"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import AQICard from "@/components/ui/AQICard";
import AlertBanner from "@/components/alerts/AlertBanner";
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
import { LoadingSkeleton } from "@/components/ui/Loading";
import {
  useTEMPOData,
  useGroundStationData,
  useForecast,
} from "@/hooks/use-air-quality-data";
import { AlertData } from "@/types/air-quality";

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
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 40.7128,
    lon: -74.006,
    name: "New York City",
  });
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [currentTab, setCurrentTab] = useState<
    "dashboard" | "forecast" | "alerts" | "history" | "validation" | "analytics" | "comparison"
  >("dashboard");
  const [currentPollutants, setCurrentPollutants] = useState({
    aqi: 68,
    no2: 15.2,
    o3: 45.8,
    pm25: 12.3,
    hcho: 2.1,
  });

  // Toast notifications for user feedback
  const toast = useToast();

  // Fetch data with SWR (automatic caching & revalidation) - ALWAYS call hooks unconditionally
  const { data: tempoData, isLoading: tempoLoading } = useTEMPOData(
    selectedLocation.lat,
    selectedLocation.lon
  );
  const { data: groundData, isLoading: groundLoading } = useGroundStationData(
    selectedLocation.lat,
    selectedLocation.lon
  );
  const { data: forecastData, isLoading: forecastLoading } = useForecast(
    selectedLocation.lat,
    selectedLocation.lon
  );

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
      setAlerts((prev) => [mockAlert, ...prev.slice(0, 2)]);
      
      // Show toast notification for high AQI alerts
      if (mockAlert.aqi > 100) {
        toast.warning("High AQI Alert", `Air quality in ${mockAlert.location} has deteriorated (AQI: ${mockAlert.aqi})`);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedLocation, showDashboard, toast]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentTab('dashboard');
            toast.info('Navigation', 'Switched to Dashboard');
            break;
          case '2':
            e.preventDefault();
            setCurrentTab('forecast');
            toast.info('Navigation', 'Switched to Forecast');
            break;
          case '3':
            e.preventDefault();
            setCurrentTab('alerts');
            toast.info('Navigation', 'Switched to Alerts');
            break;
          case '4':
            e.preventDefault();
            setCurrentTab('history');
            toast.info('Navigation', 'Switched to History');
            break;
          case '5':
            e.preventDefault();
            setCurrentTab('validation');
            toast.info('Navigation', 'Switched to Validation');
            break;
          case '6':
            e.preventDefault();
            setCurrentTab('analytics');
            toast.info('Navigation', 'Switched to Analytics');
            break;
          case '7':
            e.preventDefault();
            setCurrentTab('comparison');
            toast.info('Navigation', 'Switched to Compare');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toast]);

  // Show success toast when data is loaded
  useEffect(() => {
    if (tempoData && !tempoLoading) {
      toast.success('Data Updated', 'Latest NASA TEMPO data loaded successfully');
    }
  }, [tempoData, tempoLoading, toast]);

  // Show hero section first, then dashboard
  if (!showDashboard) {
    return <PrismaHero onEnter={() => setShowDashboard(true)} />;
  }

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    setSelectedLocation({ lat, lon, name });
    toast.success('Location Changed', `Now showing data for ${name}`);
  };

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
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌍</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  SkyCast
                </h1>
                <p className="text-xs text-gray-400">NASA Space Apps 2025</p>
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
                  <Suspense
                    fallback={<div className="w-full h-full bg-black" />}
                  >
                    <FunctionalEarth3D />
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
        </AnimatePresence>
      </main>

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
