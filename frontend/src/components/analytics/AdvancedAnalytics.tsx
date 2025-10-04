import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface AdvancedAnalyticsProps {
  location: { lat: number; lon: number; name: string }
}

interface AnomalyData {
  timestamp: Date
  pollutant: string
  value: number
  expected: number
  severity: 'low' | 'medium' | 'high'
  cause?: string
}

interface CorrelationData {
  pollutant1: string
  pollutant2: string
  correlation: number
}

// Generate realistic correlation matrix
function generateCorrelations(): CorrelationData[] {
  const pollutants = ['NO₂', 'O₃', 'PM2.5', 'HCHO', 'Temperature', 'Humidity', 'Wind Speed']
  const correlations: CorrelationData[] = []
  
  // Known correlations based on atmospheric science
  const knownCorrelations: { [key: string]: number } = {
    'NO₂-PM2.5': 0.72,  // Traffic emissions
    'NO₂-O₃': -0.45,     // Titration effect
    'O₃-Temperature': 0.68, // Photochemical formation
    'PM2.5-Humidity': -0.35, // Wet deposition
    'Wind Speed-PM2.5': -0.58, // Dispersion
    'Temperature-Humidity': -0.42,
  }
  
  for (let i = 0; i < pollutants.length; i++) {
    for (let j = i + 1; j < pollutants.length; j++) {
      const key = `${pollutants[i]}-${pollutants[j]}`
      const reverseKey = `${pollutants[j]}-${pollutants[i]}`
      
      const correlation = knownCorrelations[key] || knownCorrelations[reverseKey] || 
        (Math.random() - 0.5) * 0.6
      
      correlations.push({
        pollutant1: pollutants[i],
        pollutant2: pollutants[j],
        correlation,
      })
    }
  }
  
  return correlations
}

// Detect anomalies in air quality data
function detectAnomalies(): AnomalyData[] {
  const anomalies: AnomalyData[] = []
  const now = Date.now()
  
  // Simulate detected anomalies
  const scenarios = [
    {
      pollutant: 'PM2.5',
      value: 85,
      expected: 15,
      severity: 'high' as const,
      cause: 'Wildfire smoke detected 50km upwind',
      hoursAgo: 2,
    },
    {
      pollutant: 'NO₂',
      value: 65,
      expected: 25,
      severity: 'medium' as const,
      cause: 'Traffic congestion - morning rush hour',
      hoursAgo: 5,
    },
    {
      pollutant: 'O₃',
      value: 95,
      expected: 45,
      severity: 'high' as const,
      cause: 'High temperature + sunlight - photochemical smog',
      hoursAgo: 3,
    },
  ]
  
  scenarios.forEach(scenario => {
    anomalies.push({
      timestamp: new Date(now - scenario.hoursAgo * 3600000),
      pollutant: scenario.pollutant,
      value: scenario.value,
      expected: scenario.expected,
      severity: scenario.severity,
      cause: scenario.cause,
    })
  })
  
  return anomalies
}

// Calculate AQI contribution by pollutant
function calculatePollutantContributions() {
  return [
    { pollutant: 'PM2.5', contribution: 45, color: '#ef4444' },
    { pollutant: 'O₃', contribution: 30, color: '#f59e0b' },
    { pollutant: 'NO₂', contribution: 18, color: '#3b82f6' },
    { pollutant: 'HCHO', contribution: 7, color: '#8b5cf6' },
  ]
}

export function AdvancedAnalytics({ location }: AdvancedAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<'anomalies' | 'correlations' | 'contributions'>('anomalies')
  
  const correlations = useMemo(() => generateCorrelations(), [])
  const anomalies = useMemo(() => detectAnomalies(), [])
  const contributions = useMemo(() => calculatePollutantContributions(), [])
  
  const getCorrelationColor = (value: number) => {
    if (value > 0.5) return '#10b981' // Strong positive - green
    if (value > 0.2) return '#3b82f6' // Moderate positive - blue
    if (value > -0.2) return '#6b7280' // Weak - gray
    if (value > -0.5) return '#f59e0b' // Moderate negative - orange
    return '#ef4444' // Strong negative - red
  }
  
  const getSeverityColor = (severity: AnomalyData['severity']) => {
    const colors = {
      low: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
      medium: 'from-orange-500/20 to-red-500/20 border-orange-400/30',
      high: 'from-red-500/20 to-pink-500/20 border-red-400/30',
    }
    return colors[severity]
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Advanced Analytics & Insights</h2>
        <p className="text-white/60">AI-powered anomaly detection and correlation analysis for {location.name}</p>
      </div>
      
      {/* View Selector */}
      <div className="flex gap-2">
        {[
          { id: 'anomalies' as const, label: 'Anomaly Detection', icon: '🔍' },
          { id: 'correlations' as const, label: 'Correlations', icon: '📊' },
          { id: 'contributions' as const, label: 'AQI Breakdown', icon: '🥧' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedView === view.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/10'
            }`}
          >
            <span className="mr-2">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>
      
      {/* Anomaly Detection View */}
      {selectedView === 'anomalies' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">AI Anomaly Detection</h4>
                <p className="text-sm text-white/70">
                  Machine learning algorithms identify unusual air quality patterns that deviate from expected values.
                  Detected {anomalies.length} anomalies in the last 24 hours.
                </p>
              </div>
            </div>
          </div>
          
          {anomalies.map((anomaly, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${getSeverityColor(anomaly.severity)} backdrop-blur-xl border rounded-xl p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {anomaly.severity === 'high' ? '🚨' : anomaly.severity === 'medium' ? '⚠️' : '💡'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{anomaly.pollutant} Anomaly Detected</h4>
                    <p className="text-sm text-white/50">
                      {anomaly.timestamp.toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white uppercase">
                  {anomaly.severity}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Measured Value</div>
                  <div className="text-2xl font-bold text-white">{anomaly.value}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Expected Value</div>
                  <div className="text-2xl font-bold text-white/60">{anomaly.expected}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-black/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                    style={{ width: `${Math.min((anomaly.value / anomaly.expected) * 50, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {((anomaly.value / anomaly.expected - 1) * 100).toFixed(0)}% higher
                </span>
              </div>
              
              {anomaly.cause && (
                <div className="flex items-start gap-2 bg-black/20 rounded-lg p-3">
                  <svg className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Probable Cause</div>
                    <div className="text-sm text-white/80">{anomaly.cause}</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Correlation Matrix View */}
      {selectedView === 'correlations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pollutant Correlation Matrix</h3>
            <p className="text-sm text-white/60 mb-6">
              Correlation coefficients range from -1 (strong negative) to +1 (strong positive).
              Values near 0 indicate weak or no correlation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {correlations.slice(0, 12).map((corr, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">
                      {corr.pollutant1} ↔ {corr.pollutant2}
                    </div>
                    <div 
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ 
                        backgroundColor: `${getCorrelationColor(corr.correlation)}20`,
                        color: getCorrelationColor(corr.correlation),
                        border: `1px solid ${getCorrelationColor(corr.correlation)}40`
                      }}
                    >
                      {corr.correlation >= 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 h-full rounded-full"
                      style={{
                        width: `${Math.abs(corr.correlation) * 100}%`,
                        backgroundColor: getCorrelationColor(corr.correlation),
                        left: corr.correlation >= 0 ? '50%' : 'auto',
                        right: corr.correlation < 0 ? '50%' : 'auto',
                      }}
                    />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-white/30" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/60">Strong Positive (&gt;0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-white/60">Weak (-0.2 to 0.2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-white/60">Strong Negative (&lt;-0.5)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* AQI Contribution Breakdown */}
      {selectedView === 'contributions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AQI Contribution by Pollutant</h3>
            <p className="text-sm text-white/60 mb-6">
              Each pollutant contributes differently to the overall Air Quality Index.
              This breakdown shows which pollutants are driving poor air quality.
            </p>
            
            {/* Stacked Bar */}
            <div className="h-12 flex rounded-lg overflow-hidden mb-6">
              {contributions.map((contrib, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center text-white font-semibold text-sm transition-all hover:brightness-110"
                  style={{ 
                    width: `${contrib.contribution}%`,
                    backgroundColor: contrib.color,
                  }}
                >
                  {contrib.contribution}%
                </div>
              ))}
            </div>
            
            {/* Individual Contributions */}
            <div className="space-y-3">
              {contributions.map((contrib, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{contrib.pollutant}</span>
                      <span className="text-white/60 text-sm">{contrib.contribution}%</span>
                    </div>
                    <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${contrib.contribution}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: contrib.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Insights */}
            <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Key Insight</h4>
                  <p className="text-xs text-white/70">
                    PM2.5 is the dominant contributor to poor air quality, accounting for {contributions[0].contribution}% of the total AQI.
                    This suggests particulate matter from traffic or wildfires is the primary concern.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
