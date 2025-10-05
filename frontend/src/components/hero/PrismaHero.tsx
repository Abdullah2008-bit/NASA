import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { SpaceBackground } from "../backgrounds/SpaceBackground";
import { HeroGlobe } from "./HeroGlobe";

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
  {
    id: 2,
    source: "MERRA-2",
    value: 0,
    max: 10000,
    unit: "stations",
    active: false,
  },
  { id: 3, source: "GOES-R", value: 0, max: 15, unit: "min", active: false },
  {
    id: 4,
    source: "OpenAQ",
    value: 0,
    max: 96,
    unit: "% accuracy",
    active: false,
  },
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
      {/* Layered Backgrounds: space field + subtle rotating globe */}
      <SpaceBackground />
      <HeroGlobe />

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
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg tracking-tight">
                    SkyCast
                  </span>
                  <span className="text-[10px] uppercase text-white/40 tracking-wider">
                    NASA Space Apps 2025
                  </span>
                </div>
              </motion.div>

              {/* Nav Links - GitHub style */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center gap-6"
              >
                {["Features", "Sources", "Docs", "GitHub"].map((item, i) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-xs font-medium tracking-wide text-white/70 hover:text-white transition-colors"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onEnter}
                className="px-5 py-2 rounded-md bg-white/10 border border-white/15 text-white text-xs font-medium tracking-wide hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Launch App
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-5xl md:text-6xl font-semibold mb-6 tracking-tight text-white"
            >
              Cleaner, Safer Skies
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-base md:text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed font-normal"
            >
              Professional air quality intelligence powered by NASA Earth
              observation data and pragmatic machine learning.
            </motion.p>

            {/* Single Prominent Launch App CTA (replaces Start Forecasting + GitHub) */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
              className="mb-20 flex justify-center"
            >
              <motion.button
                onClick={onEnter}
                aria-label="Launch SkyCast Application"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center
                           rounded-2xl px-14 py-6 text-2xl font-semibold tracking-wide
                           bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-500
                           text-white shadow-[0_8px_34px_-4px_rgba(0,200,255,0.55)]
                           hover:shadow-[0_10px_40px_-4px_rgba(0,255,200,0.55)]
                           transition-all duration-300 focus:outline-none
                           focus-visible:ring-4 focus-visible:ring-cyan-300/60
                           border border-white/10 backdrop-blur-xl"
              >
                <span className="mr-4 text-[15px] font-medium uppercase tracking-widest text-white/80">
                  SkyCast
                </span>
                Launch App
                <span className="ml-5 text-3xl leading-none transition-transform group-hover:translate-x-1">
                  →
                </span>
                {/* Subtle overlay / glow */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
                <span className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-400/0 via-white/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
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
          <div className="w-5 h-5 border border-white/30 rounded-full flex items-center justify-center text-white/40 text-[10px] tracking-wider">
            ↓
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
