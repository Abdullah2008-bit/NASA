"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, Info } from "lucide-react";
import { AlertData } from "@/types/air-quality";

interface AlertBannerProps {
  alert: AlertData;
  onDismiss?: () => void;
}

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    danger: XCircle,
  };

  const colors = {
    info: "from-blue-500 to-blue-600",
    warning: "from-yellow-500 to-orange-600",
    danger: "from-red-500 to-red-700",
  };

  const Icon = icons[alert.level];
  const gradient = colors[alert.level];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="relative overflow-hidden"
      >
        {/* Animated background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 100%" }}
        />

        <div className="relative z-10 flex items-center gap-4 p-4 backdrop-blur-sm bg-black/20">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{alert.location}</h3>
            <p className="text-white/90 text-sm">{alert.message}</p>
            <p className="text-white/70 text-xs mt-1">
              AQI: {alert.aqi} • {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>

          {onDismiss && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <XCircle className="w-5 h-5 text-white" />
            </motion.button>
          )}
        </div>

        {/* Animated progress bar */}
        <motion.div
          className="h-1 bg-white/40"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: 10,
            ease: "linear",
          }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
