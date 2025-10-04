import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalDataPoint {
  timestamp: Date;
  aqi: number;
  no2: number;
  o3: number;
  pm25: number;
  hcho: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

interface HistoricalTrendsProps {
  location: { lat: number; lon: number; name: string };
}

const TIME_RANGES = [
  { days: 7, label: "7 Days" },
  { days: 30, label: "30 Days" },
  { days: 90, label: "3 Months" },
  { days: 365, label: "1 Year" },
];

// Generate realistic historical data with seasonal patterns
function generateHistoricalData(
  days: number,
  location: string
): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now - i * 24 * 3600000);
    const dayOfYear = Math.floor(
      (timestamp.getTime() -
        new Date(timestamp.getFullYear(), 0, 0).getTime()) /
        86400000
    );

    // Seasonal factors
    const winterPollution = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 15 + 15; // Higher in winter
    const summerOzone = Math.cos((dayOfYear / 365) * 2 * Math.PI) * 20 + 20; // Higher in summer

    // Weekly patterns (higher on weekdays)
    const dayOfWeek = timestamp.getDay();
    const weekdayFactor = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.2 : 0.8;

    // Random events (wildfires, inversions)
    const randomEvent = Math.random() > 0.95 ? 1.5 : 1.0;

    const baseAQI =
      50 +
      winterPollution * weekdayFactor * randomEvent +
      (Math.random() - 0.5) * 10;

    data.push({
      timestamp,
      aqi: Math.max(0, Math.min(300, baseAQI)),
      no2: 20 + winterPollution * weekdayFactor + Math.random() * 10,
      o3: 30 + summerOzone + Math.random() * 20,
      pm25: 10 + winterPollution * randomEvent + Math.random() * 15,
      hcho: 5 + Math.random() * 10,
      temperature: 15 + Math.sin((dayOfYear / 365) * 2 * Math.PI) * 15,
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
    });
  }

  return data;
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
}

export function HistoricalTrends({ location }: HistoricalTrendsProps) {
  const [selectedRange, setSelectedRange] = useState(30);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(
    []
  );
  const [viewMode, setViewMode] = useState<
    "trends" | "comparison" | "correlation"
  >("trends");
  const [selectedPollutants, setSelectedPollutants] = useState<string[]>([
    "aqi",
    "no2",
    "o3",
    "pm25",
  ]);

  useEffect(() => {
    const data = generateHistoricalData(selectedRange, location.name);
    setHistoricalData(data);
  }, [selectedRange, location]);

  // Calculate statistics
  const avgAQI =
    historicalData.reduce((sum, d) => sum + d.aqi, 0) / historicalData.length;
  const maxAQI = Math.max(...historicalData.map((d) => d.aqi));
  const minAQI = Math.min(...historicalData.map((d) => d.aqi));
  const unhealthyDays = historicalData.filter((d) => d.aqi > 100).length;

  // Prepare chart labels
  const labels = historicalData.map((d) => {
    if (selectedRange <= 7) {
      return d.timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (selectedRange <= 30) {
      return d.timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return d.timestamp.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }
  });

  // Trends Chart Data
  const trendsChartData = {
    labels,
    datasets: [
      selectedPollutants.includes("aqi") && {
        label: "AQI",
        data: historicalData.map((d) => d.aqi),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f620",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      selectedPollutants.includes("no2") && {
        label: "NO₂ (ppb)",
        data: historicalData.map((d) => d.no2),
        borderColor: "#ef4444",
        backgroundColor: "#ef444420",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
      selectedPollutants.includes("o3") && {
        label: "O₃ (ppb)",
        data: historicalData.map((d) => d.o3),
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b20",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
      selectedPollutants.includes("pm25") && {
        label: "PM2.5 (μg/m³)",
        data: historicalData.map((d) => d.pm25),
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf620",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
    ].filter(Boolean) as any[],
  };

  // Comparison Chart Data (Average by Day of Week)
  const dayOfWeekData = Array(7)
    .fill(0)
    .map(() => ({ sum: 0, count: 0 }));
  historicalData.forEach((d) => {
    const day = d.timestamp.getDay();
    dayOfWeekData[day].sum += d.aqi;
    dayOfWeekData[day].count += 1;
  });

  const comparisonChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Average AQI by Day",
        data: dayOfWeekData.map((d) => (d.count > 0 ? d.sum / d.count : 0)),
        backgroundColor: dayOfWeekData.map((d) => {
          const avg = d.count > 0 ? d.sum / d.count : 0;
          return getAQIColor(avg) + "80";
        }),
        borderColor: dayOfWeekData.map((d) => {
          const avg = d.count > 0 ? d.sum / d.count : 0;
          return getAQIColor(avg);
        }),
        borderWidth: 2,
      },
    ],
  };

  const commonChartOptions = {
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
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        title: {
          display: true,
          text: "AQI",
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      y1: {
        type: "linear" as const,
        display: selectedPollutants.length > 1,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        title: {
          display: true,
          text: "Pollutant Levels",
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
  };

  const togglePollutant = (pollutant: string) => {
    setSelectedPollutants((prev) =>
      prev.includes(pollutant)
        ? prev.filter((p) => p !== pollutant)
        : [...prev, pollutant]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Historical Trends Analysis
        </h2>
        <p className="text-white/60">
          Air quality patterns and insights for {location.name}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        {TIME_RANGES.map((range) => (
          <button
            key={range.days}
            onClick={() => setSelectedRange(range.days)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRange === range.days
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2">
        {[
          { mode: "trends" as const, label: "Time Series", icon: "📈" },
          { mode: "comparison" as const, label: "Day Comparison", icon: "📊" },
          { mode: "correlation" as const, label: "Weather Impact", icon: "🌤️" },
        ].map((view) => (
          <button
            key={view.mode}
            onClick={() => setViewMode(view.mode)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === view.mode
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            }`}
          >
            <span className="mr-2">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30 rounded-xl p-4"
        >
          <div className="text-xs text-white/60 mb-1">Average AQI</div>
          <div className="text-2xl font-bold text-white">
            {avgAQI.toFixed(0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-400/30 rounded-xl p-4"
        >
          <div className="text-xs text-white/60 mb-1">Peak AQI</div>
          <div className="text-2xl font-bold text-white">
            {maxAQI.toFixed(0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-xl p-4"
        >
          <div className="text-xs text-white/60 mb-1">Best AQI</div>
          <div className="text-2xl font-bold text-white">
            {minAQI.toFixed(0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-4"
        >
          <div className="text-xs text-white/60 mb-1">Unhealthy Days</div>
          <div className="text-2xl font-bold text-white">
            {unhealthyDays}{" "}
            <span className="text-sm text-white/60">
              ({((unhealthyDays / historicalData.length) * 100).toFixed(0)}%)
            </span>
          </div>
        </motion.div>
      </div>

      {/* Pollutant Filter (for Trends view) */}
      {viewMode === "trends" && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: "aqi", label: "AQI", color: "#3b82f6" },
            { key: "no2", label: "NO₂", color: "#ef4444" },
            { key: "o3", label: "O₃", color: "#f59e0b" },
            { key: "pm25", label: "PM2.5", color: "#8b5cf6" },
          ].map((pollutant) => (
            <button
              key={pollutant.key}
              onClick={() => togglePollutant(pollutant.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedPollutants.includes(pollutant.key)
                  ? "text-white border-2"
                  : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
              }`}
              style={{
                borderColor: selectedPollutants.includes(pollutant.key)
                  ? pollutant.color
                  : undefined,
                backgroundColor: selectedPollutants.includes(pollutant.key)
                  ? `${pollutant.color}20`
                  : undefined,
              }}
            >
              {pollutant.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6"
      >
        <div className="h-96">
          {viewMode === "trends" && (
            <Line data={trendsChartData} options={commonChartOptions} />
          )}
          {viewMode === "comparison" && (
            <Bar
              data={comparisonChartData}
              options={{
                ...commonChartOptions,
                scales: {
                  x: commonChartOptions.scales.x,
                  y: {
                    ...commonChartOptions.scales.y,
                    beginAtZero: true,
                  },
                },
              }}
            />
          )}
          {viewMode === "correlation" && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🌤️</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Weather Correlation Analysis
                </h3>
                <p className="text-white/60 max-w-md">
                  Temperature, humidity, and wind speed impact on air quality.
                  Higher temperatures increase ozone formation. Low wind speeds
                  trap pollutants.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-white/60">Avg Temp</div>
                    <div className="text-xl font-bold text-white">
                      {(
                        historicalData.reduce((s, d) => s + d.temperature, 0) /
                        historicalData.length
                      ).toFixed(1)}
                      °C
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-white/60">Avg Humidity</div>
                    <div className="text-xl font-bold text-white">
                      {(
                        historicalData.reduce((s, d) => s + d.humidity, 0) /
                        historicalData.length
                      ).toFixed(0)}
                      %
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-white/60">Avg Wind</div>
                    <div className="text-xl font-bold text-white">
                      {(
                        historicalData.reduce((s, d) => s + d.windSpeed, 0) /
                        historicalData.length
                      ).toFixed(1)}{" "}
                      m/s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Insights */}
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">Key Insights</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                • Air quality tends to be{" "}
                {dayOfWeekData[1].sum / dayOfWeekData[1].count >
                dayOfWeekData[0].sum / dayOfWeekData[0].count
                  ? "worse on weekdays"
                  : "better on weekdays"}{" "}
                due to traffic patterns
              </li>
              <li>
                • {unhealthyDays} days (
                {((unhealthyDays / historicalData.length) * 100).toFixed(0)}%)
                exceeded healthy AQI levels in this period
              </li>
              <li>
                • Peak pollution typically occurs during{" "}
                {maxAQI > avgAQI * 1.5
                  ? "extreme weather events or wildfires"
                  : "rush hour traffic"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
