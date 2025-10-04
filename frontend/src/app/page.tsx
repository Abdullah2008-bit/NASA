'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import AQICard from '@/components/ui/AQICard'
import AlertBanner from '@/components/alerts/AlertBanner'
import { PrismaHero } from '@/components/hero/PrismaHero'
import { DataSourcesPanel } from '@/components/data/DataSourcesPanel'
import { RealTimeDataGrid } from '@/components/data/RealTimeDataGrid'
import { useTEMPOData, useGroundStationData, useForecast } from '@/hooks/use-air-quality-data'
import { AlertData } from '@/types/air-quality'

// Lazy load 3D Globe for better performance
const Earth3DGlobe = dynamic(() => import('@/components/globe/Earth3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white text-xl">Loading 3D Globe...</div>
    </div>
  ),
})

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lon: -74.0060, name: 'New York City' })
  const [alerts, setAlerts] = useState<AlertData[]>([])

  // Fetch data with SWR (automatic caching & revalidation)
  const { data: tempoData, isLoading: tempoLoading } = useTEMPOData(selectedLocation.lat, selectedLocation.lon)
  const { data: groundData, isLoading: groundLoading } = useGroundStationData(selectedLocation.lat, selectedLocation.lon)
  const { data: forecastData, isLoading: forecastLoading } = useForecast(selectedLocation.lat, selectedLocation.lon)

  // Show hero section first, then dashboard
  if (!showDashboard) {
    return <PrismaHero onEnter={() => setShowDashboard(true)} />
  }

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const mockAlert: AlertData = {
        id: Date.now().toString(),
        level: Math.random() > 0.5 ? 'warning' : 'info',
        aqi: Math.floor(Math.random() * 100) + 50,
        location: selectedLocation.name,
        message: 'Air quality has changed. Check the latest forecast.',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10000),
      }
      setAlerts(prev => [mockAlert, ...prev.slice(0, 2)])
    }, 15000)

    return () => clearInterval(interval)
  }, [selectedLocation])

  const currentAQI = 68 // TODO: Calculate from real data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
              {['Dashboard', 'Forecast', 'Alerts', 'History'].map((item, i) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        </div>
      </header>

      {/* Alerts */}
      <div className="container mx-auto px-4 py-4 space-y-2">
        {alerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            alert={alert}
            onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Current AQI */}
            <AQICard
              aqi={currentAQI}
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
              <h3 className="text-lg font-semibold text-white mb-4">Pollutants</h3>
              <div className="space-y-3">
                {[
                  { name: 'NO₂', value: 15.2, unit: 'ppb', color: 'from-yellow-400 to-orange-500' },
                  { name: 'O₃', value: 45.8, unit: 'ppb', color: 'from-blue-400 to-cyan-500' },
                  { name: 'PM2.5', value: 12.3, unit: 'μg/m³', color: 'from-red-400 to-pink-500' },
                  { name: 'HCHO', value: 2.1, unit: 'ppb', color: 'from-green-400 to-emerald-500' },
                ].map((pollutant, i) => (
                  <motion.div
                    key={pollutant.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-400 font-medium">{pollutant.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${pollutant.color}`}>
                        {pollutant.value}
                      </span>
                      <span className="text-xs text-gray-500">{pollutant.unit}</span>
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
              <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
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
            style={{ height: '600px' }}
          >
            <Suspense fallback={<div className="w-full h-full bg-black" />}>
              <Earth3DGlobe
                pollutantData={[
                  { type: 'no2', intensity: 35, lat: 40.7128, lon: -74.0060 },
                  { type: 'o3', intensity: 65, lat: 34.0522, lon: -118.2437 },
                  { type: 'pm25', intensity: 45, lat: 51.5074, lon: -0.1278 },
                ]}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* Forecast Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-2xl font-bold text-white mb-6">24-Hour Forecast</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => {
              const hour = (new Date().getHours() + i * 3) % 24
              const aqi = 50 + Math.floor(Math.random() * 30)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700"
                >
                  <p className="text-gray-400 text-sm mb-2">{hour}:00</p>
                  <p className="text-2xl font-bold text-white mb-1">{aqi}</p>
                  <p className="text-xs text-gray-500">AQI</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

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
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-white mb-3">About SkyCast</h4>
              <p className="text-gray-400 leading-relaxed">
                Professional air quality forecasting platform powered by NASA Earth observation data 
                and advanced machine learning models for the NASA Space Apps Challenge 2025.
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
                <li><a href="https://tempo.si.edu/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">→ TEMPO Mission</a></li>
                <li><a href="https://earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">→ NASA Earthdata</a></li>
                <li><a href="https://www.spaceappschallenge.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">→ Space Apps Challenge</a></li>
                <li><a href="https://github.com/Abdullah2008-bit/NASA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">→ GitHub Repository</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>Built with ❤️ for NASA Space Apps Challenge 2025 | Predicting Cleaner, Safer Skies</p>
            <p className="mt-2">Data provided by NASA Earth Science Division • All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

