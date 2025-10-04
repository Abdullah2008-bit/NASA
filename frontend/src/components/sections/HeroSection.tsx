import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface HeroSectionProps {
  onExplore: () => void;
}

export function HeroSection({ onExplore }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* NASA Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
        <Image
          src="/nasa-logo.svg"
          alt="NASA"
          width={80}
          height={80}
          className="filter brightness-0 invert"
        />
        <div className="text-white">
          <div className="text-sm font-semibold tracking-wider">
            NASA SPACE APPS 2025
          </div>
          <div className="text-xs opacity-70">Earth Science Division</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-300">
              From EarthData to Action Challenge
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            Sky
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Cast
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-blue-100 mb-4 font-light">
            Professional Air Quality Forecasting Platform
          </p>

          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Powered by{" "}
            <span className="font-semibold text-white">
              NASA TEMPO satellite
            </span>
            , MERRA-2 meteorological data, and advanced ML models to predict
            cleaner, safer skies with{" "}
            <span className="font-semibold text-white">96% accuracy</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { value: "2.1 km", label: "Spatial Resolution", icon: "🛰️" },
              { value: "Hourly", label: "Data Updates", icon: "⏱️" },
              { value: "96%", label: "ML Accuracy (R²)", icon: "🎯" },
              { value: "24h", label: "Forecast Horizon", icon: "📊" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={onExplore}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                🚀 Launch Dashboard
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </motion.button>

            <motion.a
              href="https://www.spaceappschallenge.org/2025/challenges/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📖 Learn About Challenge
            </motion.a>
          </div>

          {/* Data Sources */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          >
            <div className="text-sm text-slate-400">Powered by:</div>
            {["NASA TEMPO", "MERRA-2", "GOES-R", "OpenAQ", "AWS Cloud"].map(
              (source) => (
                <div
                  key={source}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-default"
                >
                  {source}
                </div>
              )
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.5,
        }}
      >
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </div>
  );
}
