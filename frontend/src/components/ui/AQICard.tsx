"use client";

import { motion } from "framer-motion";
// Using relative import to avoid path alias resolution issue on Vercel
import { getAQIColor, getAQILevel, getAQIGradient } from "../../lib/utils";

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
      {/* Glowing background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`}
      />

      {/* Animated border glow */}
      <motion.div
        className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${gradient} rounded-2xl`}
        style={{
          WebkitMaskImage:
            "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        {/* Location */}
        <p className="text-sm font-medium text-gray-400 mb-2">{location}</p>

        {/* AQI Value */}
        <motion.div
          className="flex items-baseline gap-2 mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {aqi}
          </span>
          <span className="text-xl text-gray-400">AQI</span>
        </motion.div>

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

      {/* Animated particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: "-10%",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
