import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { SpaceBackground } from "../backgrounds/SpaceBackground";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function CountUp({
  end,
  duration = 2,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

interface PrismaHeroProps {
  onEnter: () => void;
}

// Hoist initial streams so the activation effect doesn't depend on mutable state
const INITIAL_STREAMS = [
  { id: 1, source: "TEMPO", value: 0, max: 2500, unit: "km²", active: false },
  { id: 2, source: "MERRA-2", value: 0, max: 10000, unit: "stations", active: false },
  { id: 3, source: "GOES-R", value: 0, max: 15, unit: "min", active: false },
  { id: 4, source: "OpenAQ", value: 0, max: 96, unit: "% accuracy", active: false },
];

export function PrismaHero({ onEnter }: PrismaHeroProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const [dataStreams, setDataStreams] = useState(INITIAL_STREAMS);

  useEffect(() => {
    // Activate data streams one by one (no dependency on dataStreams state itself)
    const timeouts = INITIAL_STREAMS.map((stream, index) =>
      setTimeout(() => {
        setDataStreams((prev) =>
          prev.map((s) =>
            s.id === stream.id ? { ...s, active: true, value: s.max } : s
          )
        );
      }, index * 300)
    );
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Space Background */}
      <SpaceBackground />

      {/* Main Content */}
      <motion.div style={{ opacity, scale }} className="relative z-10">
        {/* Top Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center shadow-lg shadow-blue-600/40 ring-1 ring-blue-300/20">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <div className="text-white font-bold text-xl tracking-tight">
                    Sky
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-500">
                      Cast
                    </span>
                  </div>
                  <div className="text-xs text-blue-200/60">
                    NASA Space Apps 2025
                  </div>
                </div>
              </motion.div>

              {/* Nav Links - GitHub style */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center gap-8"
              >
                {["Features", "Data Sources", "Documentation", "GitHub"].map(
                  (item, i) => (
                    <motion.a
                      key={item}
                      href="#"
                      className="text-sm text-white/80 hover:text-white transition-colors font-medium"
                      whileHover={{ y: -2 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      {item}
                    </motion.a>
                  )
                )}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onEnter}
                className="px-6 py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg shadow-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch App →
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge - Prisma style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-xl"
            >
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
              </div>
              <span className="text-sm text-white/90 font-medium">
                Live Data • NASA TEMPO Satellite
              </span>
            </motion.div>

            {/* Main Heading - Prisma gradient style */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold mb-6 leading-none"
            >
              <span className="text-white">Predicting</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-700 animate-gradient">
                Cleaner, Safer Skies
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Professional air quality forecasting powered by{" "}
              <span className="text-white font-semibold">
                NASA&apos;s Earth observation satellites
              </span>
              , advanced machine learning, and cloud computing
            </motion.p>

            {/* CTA Buttons - GitHub style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.button
                onClick={onEnter}
                className="group px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  Start Forecasting
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
                href="https://github.com/Abdullah2008-bit/NASA"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  View on GitHub
                </span>
              </motion.a>
            </motion.div>

            {/* Live Data Streams - Zory.ai style */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="relative"
            >
              {/* Glassmorphism Card */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {dataStreams.map((stream, index) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      className="relative group"
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        <div className="text-sm text-white/50 mb-2 font-medium tracking-wide">
                          {stream.source}
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                          <AnimatePresence mode="wait">
                            {stream.active && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <CountUp end={stream.value} duration={2} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="text-xs text-white/40">
                          {stream.unit}
                        </div>

                        {/* Live Indicator */}
                        {stream.active && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-0 right-0"
                          >
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-xs text-green-400">
                                LIVE
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
            </motion.div>

            {/* Trusted By - GitHub style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-20 pt-12 border-t border-white/10"
            >
              <div className="text-sm text-white/40 mb-6">
                POWERED BY NASA EARTH SCIENCE DATA
              </div>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
                {["NASA TEMPO", "MERRA-2", "GOES-R", "OpenAQ", "AWS Cloud"].map(
                  (partner) => (
                    <motion.div
                      key={partner}
                      className="text-white/60 hover:text-white transition-colors font-semibold cursor-default"
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      {partner}
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs">Scroll to explore</span>
          <svg
            className="w-6 h-6 text-white/40"
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
      </motion.div>
    </div>
  );
}
