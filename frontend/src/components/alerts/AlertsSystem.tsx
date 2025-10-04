import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: "health" | "forecast" | "wildfire" | "emergency";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  location: string;
  aqi: number;
  pollutant: string;
  recommendations: string[];
  timestamp: Date;
  expiresAt?: Date;
  affectedGroups?: string[];
}

interface AlertsSystemProps {
  location: { lat: number; lon: number; name: string };
  currentAQI: number;
  pollutants: {
    no2: number;
    o3: number;
    pm25: number;
    hcho: number;
  };
  onDismiss?: (id: string) => void;
}

const HEALTH_SENSITIVE_GROUPS = [
  "Children",
  "Elderly (65+)",
  "People with asthma",
  "Heart disease patients",
  "Outdoor workers",
  "Athletes",
];

const AQI_THRESHOLDS = {
  good: { max: 50, color: "green", label: "Good" },
  moderate: { max: 100, color: "yellow", label: "Moderate" },
  unhealthySensitive: {
    max: 150,
    color: "orange",
    label: "Unhealthy for Sensitive Groups",
  },
  unhealthy: { max: 200, color: "red", label: "Unhealthy" },
  veryUnhealthy: { max: 300, color: "purple", label: "Very Unhealthy" },
  hazardous: { max: 500, color: "maroon", label: "Hazardous" },
};

function getAQILevel(aqi: number) {
  if (aqi <= 50) return AQI_THRESHOLDS.good;
  if (aqi <= 100) return AQI_THRESHOLDS.moderate;
  if (aqi <= 150) return AQI_THRESHOLDS.unhealthySensitive;
  if (aqi <= 200) return AQI_THRESHOLDS.unhealthy;
  if (aqi <= 300) return AQI_THRESHOLDS.veryUnhealthy;
  return AQI_THRESHOLDS.hazardous;
}

function generateRecommendations(aqi: number, pollutant: string): string[] {
  const level = getAQILevel(aqi);

  const recommendations: { [key: string]: string[] } = {
    good: [
      "Air quality is satisfactory",
      "Ideal for outdoor activities",
      "No health precautions needed",
    ],
    moderate: [
      "Sensitive individuals should limit prolonged outdoor exertion",
      "Consider reducing intense outdoor activities",
      "Keep windows open for ventilation",
    ],
    unhealthySensitive: [
      "Sensitive groups should avoid outdoor exertion",
      "Everyone else should limit prolonged outdoor activities",
      "Keep windows closed during peak pollution hours",
      "Use air purifiers indoors",
    ],
    unhealthy: [
      "Everyone should avoid outdoor exertion",
      "Sensitive groups should stay indoors",
      "Wear N95 masks if going outside",
      "Keep windows closed and use air purifiers",
      "Postpone outdoor events",
    ],
    veryUnhealthy: [
      "Everyone should stay indoors",
      "Avoid all outdoor activities",
      "Emergency indoor air filtration recommended",
      "Seek medical attention if experiencing symptoms",
      "Schools should cancel outdoor activities",
    ],
    hazardous: [
      "Health emergency - stay indoors",
      "Seal windows and doors",
      "Run air purifiers continuously",
      "Seek emergency care if experiencing difficulty breathing",
      "All outdoor activities must be cancelled",
    ],
  };

  return (
    recommendations[level.label.toLowerCase().replace(/ /g, "")] ||
    recommendations.good
  );
}

export function AlertsSystem({
  location,
  currentAQI,
  pollutants,
  onDismiss,
}: AlertsSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Generate alerts based on AQI and pollutant levels
  useEffect(() => {
    const newAlerts: Alert[] = [];

    // High AQI Alert
    if (currentAQI > 100) {
      const severity: "info" | "warning" | "critical" =
        currentAQI > 200 ? "critical" : currentAQI > 150 ? "warning" : "info";

      newAlerts.push({
        id: `aqi-${Date.now()}`,
        type: "health",
        severity,
        title: `${getAQILevel(currentAQI).label} Air Quality`,
        message: `Current AQI is ${currentAQI} in ${location.name}. Health-sensitive groups should take precautions.`,
        location: location.name,
        aqi: currentAQI,
        pollutant: "Multiple",
        recommendations: generateRecommendations(currentAQI, "general"),
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        affectedGroups:
          currentAQI > 150
            ? HEALTH_SENSITIVE_GROUPS
            : HEALTH_SENSITIVE_GROUPS.slice(0, 3),
      });
    }

    // High NO2 Alert
    if (pollutants.no2 > 40) {
      newAlerts.push({
        id: `no2-${Date.now()}`,
        type: "health",
        severity: pollutants.no2 > 100 ? "critical" : "warning",
        title: "Elevated Nitrogen Dioxide Levels",
        message: `NO₂ concentration is ${pollutants.no2.toFixed(
          1
        )} ppb. Respiratory irritation possible.`,
        location: location.name,
        aqi: currentAQI,
        pollutant: "NO₂",
        recommendations: [
          "Avoid busy roads and highways",
          "Reduce vehicle use",
          "Sensitive groups should stay indoors",
        ],
        timestamp: new Date(),
        affectedGroups: ["People with asthma", "Children", "Elderly (65+)"],
      });
    }

    // High O3 Alert
    if (pollutants.o3 > 70) {
      newAlerts.push({
        id: `o3-${Date.now()}`,
        type: "health",
        severity: pollutants.o3 > 150 ? "critical" : "warning",
        title: "High Ozone Levels Detected",
        message: `Ground-level ozone is ${pollutants.o3.toFixed(
          1
        )} ppb. Limit outdoor activities.`,
        location: location.name,
        aqi: currentAQI,
        pollutant: "O₃",
        recommendations: [
          "Avoid outdoor exercise between 2-8 PM",
          "Stay indoors during peak sunlight hours",
          "Sensitive groups should minimize outdoor time",
        ],
        timestamp: new Date(),
        affectedGroups: ["Athletes", "Outdoor workers", "Children"],
      });
    }

    // High PM2.5 Alert
    if (pollutants.pm25 > 35) {
      newAlerts.push({
        id: `pm25-${Date.now()}`,
        type: pollutants.pm25 > 150 ? "emergency" : "health",
        severity: pollutants.pm25 > 150 ? "critical" : "warning",
        title: "Particulate Matter Alert",
        message: `PM2.5 is ${pollutants.pm25.toFixed(
          1
        )} μg/m³. Fine particles pose health risks.`,
        location: location.name,
        aqi: currentAQI,
        pollutant: "PM2.5",
        recommendations: [
          "Wear N95 or KN95 masks outdoors",
          "Use HEPA air purifiers indoors",
          "Keep windows closed",
          "Avoid strenuous outdoor activities",
        ],
        timestamp: new Date(),
        affectedGroups: HEALTH_SENSITIVE_GROUPS,
      });
    }

    // Only add new unique alerts
    setAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id.split("-")[0]));
      const uniqueNew = newAlerts.filter(
        (a) => !existingIds.has(a.id.split("-")[0])
      );
      return [...uniqueNew, ...prev].slice(0, 5); // Keep max 5 alerts
    });
  }, [currentAQI, pollutants, location]);

  // Request notification permission
  const enableNotifications = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  const getSeverityStyles = (severity: Alert["severity"]) => {
    const styles = {
      info: {
        bg: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-400/30",
        text: "text-blue-400",
        icon: "💡",
      },
      warning: {
        bg: "from-yellow-500/20 to-orange-500/20",
        border: "border-yellow-400/30",
        text: "text-yellow-400",
        icon: "⚠️",
      },
      critical: {
        bg: "from-red-500/20 to-pink-500/20",
        border: "border-red-400/30",
        text: "text-red-400",
        icon: "🚨",
      },
    };
    return styles[severity];
  };

  return (
    <div className="space-y-4">
      {/* Notification Settings */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-xl p-4">
        <div>
          <h3 className="text-white font-semibold">Real-Time Alerts</h3>
          <p className="text-sm text-white/60">
            Get notified about air quality changes
          </p>
        </div>
        <button
          onClick={enableNotifications}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            notificationsEnabled
              ? "bg-green-500/20 text-green-400 border border-green-400/30"
              : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
          }`}
        >
          {notificationsEnabled ? "🔔 Enabled" : "Enable Alerts"}
        </button>
      </div>

      {/* Active Alerts */}
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`relative bg-gradient-to-br ${styles.bg} backdrop-blur-xl border ${styles.border} rounded-2xl p-6 shadow-2xl overflow-hidden`}
            >
              {/* Animated Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer" />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{styles.icon}</span>
                    <div>
                      <h4 className={`text-lg font-bold ${styles.text}`}>
                        {alert.title}
                      </h4>
                      <p className="text-sm text-white/50">
                        {alert.location} •{" "}
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDismiss?.(alert.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-white/60"
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

                {/* Message */}
                <p className="text-white/80 mb-4">{alert.message}</p>

                {/* AQI Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full mb-4">
                  <span className="text-sm text-white/60">Current AQI:</span>
                  <span className={`text-lg font-bold ${styles.text}`}>
                    {alert.aqi}
                  </span>
                </div>

                {/* Affected Groups */}
                {alert.affectedGroups && alert.affectedGroups.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                      Affected Groups:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.affectedGroups.map((group) => (
                        <span
                          key={group}
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/80"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <div className="text-xs text-white/50 mb-2 uppercase tracking-wide font-semibold">
                    Health Recommendations:
                  </div>
                  <ul className="space-y-1">
                    {alert.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-white/70"
                      >
                        <svg
                          className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-2xl"
        >
          <span className="text-5xl mb-4 block">✅</span>
          <h3 className="text-xl font-bold text-green-400 mb-2">
            Air Quality is Good!
          </h3>
          <p className="text-white/60">No health alerts for {location.name}</p>
        </motion.div>
      )}
    </div>
  );
}
