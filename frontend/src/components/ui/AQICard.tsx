"use client";

import { motion } from "framer-motion";
import { getAQILevel, getAQIGradient } from "../../lib/utils";

interface AQICardProps {
  aqi: number;
  location: string;
  timestamp?: Date;
  className?: string;
}

export default function AQICard({
  aqi,
  location,
  timestamp,
  className = "",
}: AQICardProps) {
  const level = getAQILevel(aqi);
  const gradient = getAQIGradient(aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-15`} />

      <div className="relative z-10">
        {/* Location */}
        <p className="text-sm font-medium text-gray-400 mb-2">{location}</p>

        {/* AQI Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-6xl font-extrabold tracking-tight text-white">
            {aqi}
          </span>
          <span className="text-xl text-gray-400 font-medium">AQI</span>
        </div>

        {/* Level Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-semibold`}
        >
          {level}
        </motion.div>

        {/* Timestamp */}
        {timestamp && (
          <p className="text-xs text-gray-500 mt-3">
            Updated: {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Decorative effects removed for cleaner professional look */}
    </motion.div>
  );
}
