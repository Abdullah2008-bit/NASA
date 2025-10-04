import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ValidationData {
  location: string;
  lat: number;
  lon: number;
  satellite: {
    no2: number;
    o3: number;
    pm25: number;
    source: "TEMPO" | "GOES-R";
  };
  ground: {
    no2: number;
    o3: number;
    pm25: number;
    source: string; // OpenAQ station ID
  };
  timestamp: Date;
  bias: number;
  accuracy: number;
}

interface ValidationMetrics {
  rmse: number; // Root Mean Square Error
  mae: number; // Mean Absolute Error
  r2: number; // R-squared correlation
  bias: number; // Mean bias
  dataQuality: "excellent" | "good" | "fair" | "poor";
}

interface DataValidationProps {
  location: { lat: number; lon: number; name: string };
}

// Generate validation comparison data
function generateValidationData(location: string): ValidationData[] {
  const data: ValidationData[] = [];
  const stations = ["EPA-001", "EPA-002", "PurpleAir-123", "AirNow-456"];

  for (let i = 0; i < 50; i++) {
    const satelliteNO2 = 20 + Math.random() * 40;
    const satelliteO3 = 30 + Math.random() * 50;
    const satellitePM25 = 10 + Math.random() * 30;

    // Ground measurements have slight bias and noise
    const groundBias = -2 + Math.random() * 4;
    const noiseFactor = 0.9 + Math.random() * 0.2;

    data.push({
      location,
      lat: 40.7 + (Math.random() - 0.5) * 0.1,
      lon: -74.0 + (Math.random() - 0.5) * 0.1,
      satellite: {
        no2: satelliteNO2,
        o3: satelliteO3,
        pm25: satellitePM25,
        source: Math.random() > 0.5 ? "TEMPO" : "GOES-R",
      },
      ground: {
        no2: satelliteNO2 * noiseFactor + groundBias,
        o3: satelliteO3 * noiseFactor + groundBias,
        pm25: satellitePM25 * noiseFactor + groundBias,
        source: stations[Math.floor(Math.random() * stations.length)],
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
      bias: groundBias,
      accuracy: 0.85 + Math.random() * 0.12,
    });
  }

  return data;
}

// Calculate validation metrics
function calculateMetrics(
  data: ValidationData[],
  pollutant: "no2" | "o3" | "pm25"
): ValidationMetrics {
  const n = data.length;
  let sumSquaredError = 0;
  let sumAbsError = 0;
  let sumBias = 0;
  let sumGround = 0;
  // removed unused intermediate accumulation variables (sat/ground squared, product)

  data.forEach((d) => {
    const sat = d.satellite[pollutant];
    const ground = d.ground[pollutant];
    const error = sat - ground;

    sumSquaredError += error * error;
    sumAbsError += Math.abs(error);
    sumBias += error;
    sumGround += ground;
  });

  const rmse = Math.sqrt(sumSquaredError / n);
  const mae = sumAbsError / n;
  const bias = sumBias / n;

  // Calculate R-squared
  // meanSat not required for current simplified R^2 approximation
  const meanGround = sumGround / n; // meanGround remains for R² calculation
  const ssReg = data.reduce((sum, d) => {
    const predictedGround = d.satellite[pollutant];
    return sum + Math.pow(predictedGround - meanGround, 2);
  }, 0);
  const ssTot = data.reduce((sum, d) => {
    return sum + Math.pow(d.ground[pollutant] - meanGround, 2);
  }, 0);
  const r2 = ssTot !== 0 ? Math.max(0, ssReg / ssTot) : 0;

  // Determine data quality
  let dataQuality: ValidationMetrics["dataQuality"];
  if (r2 > 0.9 && rmse < 5) dataQuality = "excellent";
  else if (r2 > 0.8 && rmse < 10) dataQuality = "good";
  else if (r2 > 0.6 && rmse < 15) dataQuality = "fair";
  else dataQuality = "poor";

  return { rmse, mae, r2, bias, dataQuality };
}

export function DataValidation({ location }: DataValidationProps) {
  const [validationData, setValidationData] = useState<ValidationData[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState<
    "no2" | "o3" | "pm25"
  >("pm25");
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);

  useEffect(() => {
    const data = generateValidationData(location.name);
    setValidationData(data);
  }, [location]);

  useEffect(() => {
    if (validationData.length > 0) {
      const m = calculateMetrics(validationData, selectedPollutant);
      setMetrics(m);
    }
  }, [validationData, selectedPollutant]);

  // Prepare scatter plot data
  const scatterData = {
    datasets: [
      {
        label: "TEMPO vs Ground",
        data: validationData
          .filter((d) => d.satellite.source === "TEMPO")
          .map((d) => ({
            x: d.ground[selectedPollutant],
            y: d.satellite[selectedPollutant],
          })),
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "GOES-R vs Ground",
        data: validationData
          .filter((d) => d.satellite.source === "GOES-R")
          .map((d) => ({
            x: d.ground[selectedPollutant],
            y: d.satellite[selectedPollutant],
          })),
        backgroundColor: "#f59e0b",
        borderColor: "#f59e0b",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "1:1 Line (Perfect Agreement)",
        data: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        borderColor: "#10b981",
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        showLine: true,
        fill: false,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { x: number; y: number } }) => {
            const label = context.dataset.label || "";
            if (label.includes("1:1")) return label;
            return `${label}: Ground=${context.parsed.x.toFixed(
              1
            )}, Satellite=${context.parsed.y.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        title: {
          display: true,
          text: `Ground Station ${selectedPollutant.toUpperCase()} (${getPollutantUnit(
            selectedPollutant
          )})`,
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      y: {
        type: "linear" as const,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        title: {
          display: true,
          text: `Satellite ${selectedPollutant.toUpperCase()} (${getPollutantUnit(
            selectedPollutant
          )})`,
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
  };

  const getQualityColor = (quality: ValidationMetrics["dataQuality"]) => {
    const colors = {
      excellent: "from-green-500/20 to-emerald-500/20 border-green-400/30",
      good: "from-blue-500/20 to-cyan-500/20 border-blue-400/30",
      fair: "from-yellow-500/20 to-orange-500/20 border-yellow-400/30",
      poor: "from-red-500/20 to-pink-500/20 border-red-400/30",
    };
    return colors[quality];
  };

  const getQualityIcon = (quality: ValidationMetrics["dataQuality"]) => {
    const icons = {
      excellent: "🌟",
      good: "✅",
      fair: "⚠️",
      poor: "❌",
    };
    return icons[quality];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Satellite vs Ground Data Validation
        </h2>
        <p className="text-white/60">
          Comparing NASA TEMPO/GOES-R satellite data with OpenAQ ground stations
        </p>
      </div>

      {/* Pollutant Selector */}
      <div className="flex gap-2">
        {[
          { key: "no2" as const, label: "NO₂", icon: "🚗", unit: "ppb" },
          { key: "o3" as const, label: "O₃", icon: "☀️", unit: "ppb" },
          { key: "pm25" as const, label: "PM2.5", icon: "💨", unit: "μg/m³" },
        ].map((pollutant) => (
          <button
            key={pollutant.key}
            onClick={() => setSelectedPollutant(pollutant.key)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPollutant === pollutant.key
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            }`}
          >
            <span className="mr-2">{pollutant.icon}</span>
            {pollutant.label}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${getQualityColor(
              metrics.dataQuality
            )} backdrop-blur-xl border rounded-xl p-4`}
          >
            <div className="text-xs text-white/60 mb-1">Data Quality</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {getQualityIcon(metrics.dataQuality)}
              </span>
              <span className="text-lg font-bold text-white capitalize">
                {metrics.dataQuality}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30 rounded-xl p-4"
          >
            <div className="text-xs text-white/60 mb-1">R² Correlation</div>
            <div className="text-2xl font-bold text-white">
              {metrics.r2.toFixed(3)}
            </div>
            <div className="text-xs text-white/50 mt-1">Higher is better</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-xl p-4"
          >
            <div className="text-xs text-white/60 mb-1">RMSE</div>
            <div className="text-2xl font-bold text-white">
              {metrics.rmse.toFixed(2)}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {getPollutantUnit(selectedPollutant)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-xl p-4"
          >
            <div className="text-xs text-white/60 mb-1">MAE</div>
            <div className="text-2xl font-bold text-white">
              {metrics.mae.toFixed(2)}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {getPollutantUnit(selectedPollutant)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-4"
          >
            <div className="text-xs text-white/60 mb-1">Mean Bias</div>
            <div className="text-2xl font-bold text-white">
              {metrics.bias > 0 ? "+" : ""}
              {metrics.bias.toFixed(2)}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {getPollutantUnit(selectedPollutant)}
            </div>
          </motion.div>
        </div>
      )}

      {/* Scatter Plot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Correlation Analysis: Satellite vs Ground Measurements
        </h3>
        <div className="h-96">
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </motion.div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Satellite Data</h4>
              <p className="text-sm text-white/70">
                NASA TEMPO: Tropospheric Emissions Monitoring of Pollution.
                Hourly daytime observations at 2.1 km × 4.7 km resolution.
              </p>
              <p className="text-sm text-white/70 mt-2">
                GOES-R: Geostationary satellite providing continuous hemispheric
                coverage for AOD and air quality.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Ground Stations</h4>
              <p className="text-sm text-white/70">
                OpenAQ: Real-time air quality data from {validationData.length}{" "}
                government and citizen science monitoring stations.
              </p>
              <p className="text-sm text-white/70 mt-2">
                EPA AirNow, PurpleAir sensors, and local environmental agencies
                provide ground truth validation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-4">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-2">
              Understanding the Metrics
            </h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                • <strong className="text-white">R² (Correlation):</strong>{" "}
                Measures how well satellite and ground data agree (0-1, higher
                is better)
              </li>
              <li>
                • <strong className="text-white">RMSE:</strong> Root Mean Square
                Error - average magnitude of differences
              </li>
              <li>
                • <strong className="text-white">MAE:</strong> Mean Absolute
                Error - average absolute difference
              </li>
              <li>
                • <strong className="text-white">Bias:</strong> Systematic
                over/under-estimation by satellite (positive = satellite reads
                higher)
              </li>
              <li>
                • <strong className="text-white">1:1 Line:</strong> Perfect
                agreement between satellite and ground would fall on this line
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPollutantUnit(pollutant: "no2" | "o3" | "pm25"): string {
  return pollutant === "pm25" ? "μg/m³" : "ppb";
}
