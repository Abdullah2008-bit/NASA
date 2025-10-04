"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FloatingSatellite() {
  const satelliteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Transform scroll position to satellite movement
  const y = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  return (
    <motion.div
      ref={satelliteRef}
      className="fixed right-10 top-1/4 z-10 pointer-events-none"
      style={{ y, rotate, scale }}
    >
      <div className="relative">
        {/* Satellite Body */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Main Body */}
          <div className="w-24 h-32 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-lg relative shadow-2xl border border-gray-400">
            {/* Solar Panels */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-14 h-20 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 border-2 border-blue-600 grid grid-cols-2 gap-0.5 p-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-blue-800/50" />
              ))}
            </div>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-14 h-20 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 border-2 border-blue-600 grid grid-cols-2 gap-0.5 p-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-blue-800/50" />
              ))}
            </div>

            {/* Details */}
            <div className="absolute inset-2 border-2 border-gray-600/50 rounded">
              <div className="w-full h-2 bg-red-500 mt-2 rounded-sm animate-pulse" />
              <div className="w-full h-1 bg-green-500 mt-1 rounded-sm" />
              <div className="w-full h-1 bg-blue-500 mt-1 rounded-sm animate-pulse" />
            </div>

            {/* Antenna */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gray-400">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Signal Waves */}
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 border-2 border-blue-400 rounded-full"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.3 - i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Label */}
        <motion.div
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono text-blue-400"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded border border-blue-500/30">
            🛰️ NASA TEMPO
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
